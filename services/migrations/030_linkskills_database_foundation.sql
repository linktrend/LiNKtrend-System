-- WP-075: LinkSkills database foundation (additive, contract-aligned)
-- Adds packet-required structures without breaking existing 024/028/029 LinkSkills schema.

CREATE SCHEMA IF NOT EXISTS linkskills;

-- ---------------------------------------------------------------------------
-- Capability catalog foundation (global registry with contract fields)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS linkskills.capabilities (
  capability_id text PRIMARY KEY,
  plugin_kind text NOT NULL DEFAULT 'capability' CHECK (plugin_kind = 'capability'),
  target_software text NOT NULL,
  allowed_operations jsonb NOT NULL DEFAULT '[]'::jsonb,
  auth_requirements jsonb NOT NULL DEFAULT '{}'::jsonb,
  mode_flags text[] NOT NULL DEFAULT ARRAY['development', 'shadow']::text[],
  lease_requirements text[] NOT NULL DEFAULT ARRAY[]::text[],
  idempotency_rules text NOT NULL DEFAULT '',
  audit_events text[] NOT NULL DEFAULT ARRAY[]::text[],
  allowed_callers text[] NOT NULL DEFAULT ARRAY[]::text[],
  failure_mapping jsonb NOT NULL DEFAULT '{}'::jsonb,
  not_configured text[] NOT NULL DEFAULT ARRAY[]::text[],
  version int NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT capabilities_allowed_operations_array CHECK (jsonb_typeof(allowed_operations) = 'array')
);

CREATE INDEX IF NOT EXISTS idx_capabilities_target_software ON linkskills.capabilities (target_software);

-- ---------------------------------------------------------------------------
-- Lease request lifecycle table (requested/granted/denied/etc.)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS linkskills.lease_requests (
  lease_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES linkaios_kernel.tenants (tenant_id) ON DELETE CASCADE,
  run_id uuid NOT NULL REFERENCES linkaios_kernel.runs (run_id) ON DELETE CASCADE,
  stage_id text NOT NULL,
  capability text NOT NULL REFERENCES linkskills.capabilities (capability_id),
  arguments jsonb NOT NULL DEFAULT '{}'::jsonb,
  idempotency_key text NOT NULL,
  status text NOT NULL DEFAULT 'requested'
    CHECK (status IN ('requested', 'granted', 'denied', 'requires_approval', 'executed', 'expired', 'revoked')),
  requested_at timestamptz NOT NULL DEFAULT now(),
  granted_at timestamptz,
  executed_at timestamptz,
  expires_at timestamptz,
  denial_reason text,
  kill_switch_state_at_request text NOT NULL DEFAULT 'open'
    CHECK (kill_switch_state_at_request IN ('open', 'tripped')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, idempotency_key)
);

CREATE INDEX IF NOT EXISTS idx_lease_requests_tenant_run ON linkskills.lease_requests (tenant_id, run_id);
CREATE INDEX IF NOT EXISTS idx_lease_requests_tenant_status ON linkskills.lease_requests (tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_lease_requests_expires_at ON linkskills.lease_requests (expires_at);

-- ---------------------------------------------------------------------------
-- Lease execution ledger entries (immutable append log)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS linkskills.lease_ledger_entries (
  ledger_entry_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES linkaios_kernel.tenants (tenant_id) ON DELETE CASCADE,
  lease_id uuid NOT NULL REFERENCES linkskills.lease_requests (lease_id) ON DELETE CASCADE,
  run_id uuid NOT NULL REFERENCES linkaios_kernel.runs (run_id) ON DELETE CASCADE,
  stage_id text NOT NULL,
  capability text NOT NULL REFERENCES linkskills.capabilities (capability_id),
  arguments jsonb NOT NULL DEFAULT '{}'::jsonb,
  result jsonb NOT NULL DEFAULT '{}'::jsonb,
  idempotency_key text NOT NULL,
  executed_at timestamptz NOT NULL DEFAULT now(),
  ledger_hash text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_lease_ledger_entries_tenant_run ON linkskills.lease_ledger_entries (tenant_id, run_id);
CREATE INDEX IF NOT EXISTS idx_lease_ledger_entries_tenant_capability ON linkskills.lease_ledger_entries (tenant_id, capability);
CREATE INDEX IF NOT EXISTS idx_lease_ledger_entries_executed_at ON linkskills.lease_ledger_entries (executed_at);

-- ---------------------------------------------------------------------------
-- Idempotency replay cache (24-hour TTL)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS linkskills.idempotency_cache (
  cache_key text PRIMARY KEY,
  tenant_id uuid NOT NULL REFERENCES linkaios_kernel.tenants (tenant_id) ON DELETE CASCADE,
  idempotency_key text NOT NULL,
  capability text NOT NULL REFERENCES linkskills.capabilities (capability_id),
  payload_hash text NOT NULL,
  result jsonb NOT NULL DEFAULT '{}'::jsonb,
  ledger_entry_id uuid REFERENCES linkskills.lease_ledger_entries (ledger_entry_id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '24 hours')
);

CREATE INDEX IF NOT EXISTS idx_idempotency_cache_lookup ON linkskills.idempotency_cache (tenant_id, idempotency_key, capability);
CREATE INDEX IF NOT EXISTS idx_idempotency_cache_expires_at ON linkskills.idempotency_cache (expires_at);

-- ---------------------------------------------------------------------------
-- Kill switches (tenant or global)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS linkskills.kill_switches (
  switch_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES linkaios_kernel.tenants (tenant_id) ON DELETE CASCADE,
  capability text REFERENCES linkskills.capabilities (capability_id) ON DELETE CASCADE,
  switch_level int NOT NULL DEFAULT 1 CHECK (switch_level IN (1, 2, 3)),
  state text NOT NULL DEFAULT 'open' CHECK (state IN ('open', 'tripped')),
  trigger_reason text,
  triggered_at timestamptz NOT NULL DEFAULT now(),
  triggered_by text,
  reset_at timestamptz,
  reset_by text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, capability, switch_level)
);

CREATE INDEX IF NOT EXISTS idx_kill_switches_tenant ON linkskills.kill_switches (tenant_id);
CREATE INDEX IF NOT EXISTS idx_kill_switches_capability ON linkskills.kill_switches (capability);
CREATE INDEX IF NOT EXISTS idx_kill_switches_state ON linkskills.kill_switches (state);

-- ---------------------------------------------------------------------------
-- Retention sweep support
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS linkskills.lease_ledger_archive (
  ledger_entry_id uuid PRIMARY KEY,
  tenant_id uuid NOT NULL,
  lease_id uuid NOT NULL,
  run_id uuid NOT NULL,
  stage_id text NOT NULL,
  capability text NOT NULL,
  arguments jsonb NOT NULL,
  result jsonb NOT NULL,
  idempotency_key text NOT NULL,
  executed_at timestamptz NOT NULL,
  ledger_hash text NOT NULL,
  archived_at timestamptz NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION linkskills.retention_sweep(
  p_now timestamptz DEFAULT now(),
  p_archive_before interval DEFAULT interval '180 days'
)
RETURNS TABLE (deleted_idempotency_rows integer, archived_ledger_rows integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = linkskills, public
AS $$
DECLARE
  v_deleted integer := 0;
  v_archived integer := 0;
BEGIN
  DELETE FROM linkskills.idempotency_cache
  WHERE expires_at <= p_now;
  GET DIAGNOSTICS v_deleted = ROW_COUNT;

  WITH moved AS (
    INSERT INTO linkskills.lease_ledger_archive (
      ledger_entry_id, tenant_id, lease_id, run_id, stage_id, capability,
      arguments, result, idempotency_key, executed_at, ledger_hash
    )
    SELECT
      lle.ledger_entry_id, lle.tenant_id, lle.lease_id, lle.run_id, lle.stage_id, lle.capability,
      lle.arguments, lle.result, lle.idempotency_key, lle.executed_at, lle.ledger_hash
    FROM linkskills.lease_ledger_entries lle
    WHERE lle.executed_at < (p_now - p_archive_before)
    ON CONFLICT (ledger_entry_id) DO NOTHING
    RETURNING ledger_entry_id
  )
  SELECT COUNT(*)::int INTO v_archived FROM moved;

  DELETE FROM linkskills.lease_ledger_entries lle
  USING linkskills.lease_ledger_archive lla
  WHERE lle.ledger_entry_id = lla.ledger_entry_id
    AND lle.executed_at < (p_now - p_archive_before);

  RETURN QUERY SELECT v_deleted, v_archived;
END;
$$;

REVOKE ALL ON FUNCTION linkskills.retention_sweep(timestamptz, interval) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION linkskills.retention_sweep(timestamptz, interval) TO service_role;

-- ---------------------------------------------------------------------------
-- RLS + grants
-- ---------------------------------------------------------------------------
ALTER TABLE linkskills.capabilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE linkskills.lease_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE linkskills.lease_ledger_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE linkskills.idempotency_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE linkskills.kill_switches ENABLE ROW LEVEL SECURITY;
ALTER TABLE linkskills.lease_ledger_archive ENABLE ROW LEVEL SECURITY;

GRANT USAGE ON SCHEMA linkskills TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON linkskills.capabilities TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON linkskills.lease_requests TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON linkskills.lease_ledger_entries TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON linkskills.idempotency_cache TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON linkskills.kill_switches TO service_role;
GRANT SELECT, INSERT, DELETE ON linkskills.lease_ledger_archive TO service_role;

GRANT USAGE ON SCHEMA linkskills TO authenticated;
GRANT SELECT ON linkskills.capabilities TO authenticated;
GRANT SELECT ON linkskills.lease_requests TO authenticated;
GRANT SELECT ON linkskills.lease_ledger_entries TO authenticated;
GRANT SELECT ON linkskills.idempotency_cache TO authenticated;
GRANT SELECT ON linkskills.kill_switches TO authenticated;
GRANT SELECT ON linkskills.lease_ledger_archive TO authenticated;

DROP POLICY IF EXISTS capabilities_select_all ON linkskills.capabilities;
DROP POLICY IF EXISTS lease_requests_select_all ON linkskills.lease_requests;
DROP POLICY IF EXISTS lease_requests_write_cc ON linkskills.lease_requests;
DROP POLICY IF EXISTS lease_ledger_entries_select_all ON linkskills.lease_ledger_entries;
DROP POLICY IF EXISTS lease_ledger_entries_write_cc ON linkskills.lease_ledger_entries;
DROP POLICY IF EXISTS idempotency_cache_select_all ON linkskills.idempotency_cache;
DROP POLICY IF EXISTS idempotency_cache_write_cc ON linkskills.idempotency_cache;
DROP POLICY IF EXISTS kill_switches_select_all ON linkskills.kill_switches;
DROP POLICY IF EXISTS kill_switches_write_cc ON linkskills.kill_switches;
DROP POLICY IF EXISTS lease_ledger_archive_select_all ON linkskills.lease_ledger_archive;
DROP POLICY IF EXISTS lease_ledger_archive_write_cc ON linkskills.lease_ledger_archive;

CREATE POLICY capabilities_select_all ON linkskills.capabilities
  FOR SELECT TO authenticated USING (true);

CREATE POLICY lease_requests_select_all ON linkskills.lease_requests
  FOR SELECT TO authenticated USING (true);
CREATE POLICY lease_requests_write_cc ON linkskills.lease_requests
  FOR ALL TO authenticated USING (linkaios.command_centre_write_allowed()) WITH CHECK (linkaios.command_centre_write_allowed());

CREATE POLICY lease_ledger_entries_select_all ON linkskills.lease_ledger_entries
  FOR SELECT TO authenticated USING (true);
CREATE POLICY lease_ledger_entries_write_cc ON linkskills.lease_ledger_entries
  FOR ALL TO authenticated USING (linkaios.command_centre_write_allowed()) WITH CHECK (linkaios.command_centre_write_allowed());

CREATE POLICY idempotency_cache_select_all ON linkskills.idempotency_cache
  FOR SELECT TO authenticated USING (true);
CREATE POLICY idempotency_cache_write_cc ON linkskills.idempotency_cache
  FOR ALL TO authenticated USING (linkaios.command_centre_write_allowed()) WITH CHECK (linkaios.command_centre_write_allowed());

CREATE POLICY kill_switches_select_all ON linkskills.kill_switches
  FOR SELECT TO authenticated USING (true);
CREATE POLICY kill_switches_write_cc ON linkskills.kill_switches
  FOR ALL TO authenticated USING (linkaios.command_centre_write_allowed()) WITH CHECK (linkaios.command_centre_write_allowed());

CREATE POLICY lease_ledger_archive_select_all ON linkskills.lease_ledger_archive
  FOR SELECT TO authenticated USING (true);
CREATE POLICY lease_ledger_archive_write_cc ON linkskills.lease_ledger_archive
  FOR ALL TO authenticated USING (linkaios.command_centre_write_allowed()) WITH CHECK (linkaios.command_centre_write_allowed());
