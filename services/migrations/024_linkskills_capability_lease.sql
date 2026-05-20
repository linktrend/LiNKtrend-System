-- LinkSkills capability catalog and lease lifecycle (CONTRACTS_MVO.md §6.2, §7).
-- Canonical lease ledger: request → (granted | denied | requires_approval) → (executed | expired | revoked).

CREATE SCHEMA IF NOT EXISTS linkskills;

-- ---------------------------------------------------------------------------
-- §7 Capability catalog — MVO capabilities + extensible registry
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS linkskills.capability_catalog (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  capability_id text NOT NULL UNIQUE,  -- canonical slug: "crm.upsert", "plane.project.create"
  display_name text NOT NULL,
  description text NOT NULL DEFAULT '',
  version int NOT NULL DEFAULT 1,
  policy_mode text NOT NULL DEFAULT 'require_approval'  -- §7 policy: require_approval | auto_grant | deny_all
    CHECK (policy_mode IN ('require_approval', 'auto_grant', 'deny_all')),
  args_schema jsonb NOT NULL DEFAULT '{}'::jsonb,        -- Zod/JSON Schema for validation
  result_schema jsonb NOT NULL DEFAULT '{}'::jsonb,     -- Zod/JSON Schema for validation
  tenant_scoped boolean NOT NULL DEFAULT true,         -- false = global capability
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE linkskills.capability_catalog IS
  'LinkSkills capability catalog (§7). All capabilities referenced in PluginManifest.required_capabilities must exist here.';

-- MVO capability seed data (§7)
INSERT INTO linkskills.capability_catalog (capability_id, display_name, description, policy_mode, args_schema, result_schema)
VALUES
  ('crm.upsert', 'CRM Upsert', 'Create or update a CRM record for a lead', 'require_approval',
   '{"tenant_id":"string","lead_id":"string","business_name":"string","industry":"string","contact_email":"string?","contact_phone":"string?","external_ids":"object?"}'::jsonb,
   '{"crm_record_id":"string","created":"boolean"}'::jsonb),
  ('plane.project.create', 'Plane Project Create', 'Create a project in Plane (or stub backend)', 'require_approval',
   '{"tenant_id":"string","lead_id":"string","project_name":"string","owner_actor_id":"string"}'::jsonb,
   '{"project_id":"string","created":"boolean"}'::jsonb),
  ('plane.task.create', 'Plane Task Create', 'Create a task in a Plane project', 'require_approval',
   '{"tenant_id":"string","project_id":"string","title":"string","description":"string?","assignee_actor_id":"string?"}'::jsonb,
   '{"task_id":"string","created":"boolean"}'::jsonb),
  ('preview.publish', 'Preview Publish', 'Publish a preview site from render spec', 'require_approval',
   '{"tenant_id":"string","run_id":"string","render_spec":"object","preview_route_prefix":"string"}'::jsonb,
   '{"preview_url":"string","preview_artifact_ref":"string","expires_at":"string?"}'::jsonb)
ON CONFLICT (capability_id) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description,
  policy_mode = EXCLUDED.policy_mode,
  args_schema = EXCLUDED.args_schema,
  result_schema = EXCLUDED.result_schema,
  updated_at = now();

-- ---------------------------------------------------------------------------
-- Kill switches — per-tenant or global circuit breakers
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS linkskills.capability_kill_switches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  capability_id text NOT NULL REFERENCES linkskills.capability_catalog (capability_id) ON DELETE CASCADE,
  tenant_id uuid,  -- NULL = global kill switch affecting all tenants
  state text NOT NULL DEFAULT 'open' CHECK (state IN ('open', 'tripped')),
  reason text NOT NULL DEFAULT '',
  tripped_by text,  -- actor_id who tripped the switch
  tripped_at timestamptz,
  reset_by text,    -- actor_id who reset the switch
  reset_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (capability_id, tenant_id)
);

COMMENT ON TABLE linkskills.capability_kill_switches IS
  'Kill switches per §6.2: tripped switches deny all lease requests for the capability without state mutation.';

CREATE INDEX IF NOT EXISTS idx_kill_switches_capability ON linkskills.capability_kill_switches (capability_id);
CREATE INDEX IF NOT EXISTS idx_kill_switches_tenant ON linkskills.capability_kill_switches (tenant_id) WHERE tenant_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_kill_switches_state ON linkskills.capability_kill_switches (state);

-- ---------------------------------------------------------------------------
-- Lease ledger — canonical record of all lease requests and lifecycle states
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS linkskills.lease_ledger (
  lease_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  run_id uuid NOT NULL,      -- LiNKaios kernel run reference
  stage_id text NOT NULL,    -- manifest stage reference
  capability_id text NOT NULL REFERENCES linkskills.capability_catalog (capability_id),
  arguments jsonb NOT NULL DEFAULT '{}'::jsonb,
  idempotency_key text NOT NULL,
  actor_kind text NOT NULL CHECK (actor_kind IN ('plugin', 'bot', 'user')),
  actor_id text NOT NULL,

  -- Lifecycle state per §6.2
  status text NOT NULL DEFAULT 'requested'
    CHECK (status IN ('requested', 'granted', 'denied', 'requires_approval', 'executed', 'expired', 'revoked')),

  -- Decision fields
  decision_reason text,
  expires_at timestamptz,    -- TTL for granted leases (default 5 minutes)

  -- Execution refs (populated on executed)
  execution_result jsonb,
  ledger_entry_id uuid,    -- self-reference for idempotent re-execute (points to lease_id)
  audit_event_id uuid,       -- LiNKbrain audit event reference

  -- Timestamps
  requested_at timestamptz NOT NULL DEFAULT now(),
  decided_at timestamptz,
  executed_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE linkskills.lease_ledger IS
  'Canonical lease ledger (§6.2). Records every capability lease request through its full lifecycle.';

-- Idempotency: unique constraint on (tenant_id, idempotency_key) for the lifecycle window
CREATE UNIQUE INDEX IF NOT EXISTS idx_lease_ledger_idempotency
  ON linkskills.lease_ledger (tenant_id, idempotency_key);

CREATE INDEX IF NOT EXISTS idx_lease_ledger_tenant ON linkskills.lease_ledger (tenant_id);
CREATE INDEX IF NOT EXISTS idx_lease_ledger_run ON linkskills.lease_ledger (run_id);
CREATE INDEX IF NOT EXISTS idx_lease_ledger_status ON linkskills.lease_ledger (status);
CREATE INDEX IF NOT EXISTS idx_lease_ledger_capability ON linkskills.lease_ledger (capability_id);
CREATE INDEX IF NOT EXISTS idx_lease_ledger_expires ON linkskills.lease_ledger (expires_at) WHERE status = 'granted';

-- ---------------------------------------------------------------------------
-- Lease execution results — separate table for idempotent re-execute results
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS linkskills.lease_execution_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lease_id uuid NOT NULL REFERENCES linkskills.lease_ledger (lease_id) ON DELETE CASCADE,
  result jsonb NOT NULL,
  audit_event_id uuid,       -- LiNKbrain lease.executed event
  executed_at timestamptz NOT NULL DEFAULT now(),
  idempotency_key text NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_execution_results_idempotency
  ON linkskills.lease_execution_results (idempotency_key);

CREATE INDEX IF NOT EXISTS idx_execution_results_lease ON linkskills.lease_execution_results (lease_id);

-- ---------------------------------------------------------------------------
-- RLS and grants
-- ---------------------------------------------------------------------------
ALTER TABLE linkskills.capability_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE linkskills.capability_kill_switches ENABLE ROW LEVEL SECURITY;
ALTER TABLE linkskills.lease_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE linkskills.lease_execution_results ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON linkskills.capability_catalog FROM anon;
REVOKE ALL ON linkskills.capability_kill_switches FROM anon;
REVOKE ALL ON linkskills.lease_ledger FROM anon;
REVOKE ALL ON linkskills.lease_execution_results FROM anon;

GRANT USAGE ON SCHEMA linkskills TO service_role;
GRANT SELECT, INSERT, UPDATE ON linkskills.capability_catalog TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON linkskills.capability_kill_switches TO service_role;
GRANT SELECT, INSERT, UPDATE ON linkskills.lease_ledger TO service_role;
GRANT SELECT, INSERT ON linkskills.lease_execution_results TO service_role;

-- SELECT-only for authenticated (trace views)
GRANT USAGE ON SCHEMA linkskills TO authenticated;
GRANT SELECT ON linkskills.capability_catalog TO authenticated;
GRANT SELECT ON linkskills.capability_kill_switches TO authenticated;
GRANT SELECT ON linkskills.lease_ledger TO authenticated;
GRANT SELECT ON linkskills.lease_execution_results TO authenticated;

-- Simple policies: service_role full access, authenticated read-only
DROP POLICY IF EXISTS lease_ledger_select ON linkskills.lease_ledger;
DROP POLICY IF EXISTS lease_ledger_insert ON linkskills.lease_ledger;
DROP POLICY IF EXISTS lease_ledger_update ON linkskills.lease_ledger;
DROP POLICY IF EXISTS capability_catalog_select ON linkskills.capability_catalog;
DROP POLICY IF EXISTS kill_switches_select ON linkskills.capability_kill_switches;
DROP POLICY IF EXISTS execution_results_select ON linkskills.lease_execution_results;

CREATE POLICY lease_ledger_select ON linkskills.lease_ledger FOR SELECT TO authenticated USING (true);
CREATE POLICY lease_ledger_insert ON linkskills.lease_ledger FOR INSERT TO authenticated WITH CHECK (linkaios.command_centre_write_allowed());
CREATE POLICY lease_ledger_update ON linkskills.lease_ledger FOR UPDATE TO authenticated USING (linkaios.command_centre_write_allowed()) WITH CHECK (linkaios.command_centre_write_allowed());

CREATE POLICY capability_catalog_select ON linkskills.capability_catalog FOR SELECT TO authenticated USING (true);
CREATE POLICY kill_switches_select ON linkskills.capability_kill_switches FOR SELECT TO authenticated USING (true);
CREATE POLICY execution_results_select ON linkskills.lease_execution_results FOR SELECT TO authenticated USING (true);

-- ---------------------------------------------------------------------------
-- Helper functions (SECURITY DEFINER)
-- ---------------------------------------------------------------------------

-- Check if a kill switch is tripped for capability/tenant (or global)
CREATE OR REPLACE FUNCTION linkskills.is_kill_switch_tripped(
  p_capability_id text,
  p_tenant_id uuid
)
RETURNS boolean
LANGUAGE sql
STABLE
SET search_path = linkskills, public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM linkskills.capability_kill_switches
    WHERE capability_id = p_capability_id
      AND state = 'tripped'
      AND (tenant_id IS NULL OR tenant_id = p_tenant_id)
    LIMIT 1
  );
$$;

-- Get effective policy mode for a capability (tenant-aware override possible)
CREATE OR REPLACE FUNCTION linkskills.get_capability_policy(
  p_capability_id text,
  p_tenant_id uuid
)
RETURNS text
LANGUAGE sql
STABLE
SET search_path = linkskills, public
AS $$
  SELECT policy_mode FROM linkskills.capability_catalog
  WHERE capability_id = p_capability_id
  LIMIT 1;
$$;

-- Request a lease: insert or return existing (idempotent)
CREATE OR REPLACE FUNCTION linkskills.request_lease(
  p_tenant_id uuid,
  p_run_id uuid,
  p_stage_id text,
  p_capability_id text,
  p_arguments jsonb,
  p_idempotency_key text,
  p_actor_kind text,
  p_actor_id text
)
RETURNS TABLE (
  lease_id uuid,
  status text,
  is_existing boolean,
  kill_switch_state text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = linkskills, public
AS $$
DECLARE
  v_lease_id uuid;
  v_status text;
  v_is_existing boolean := false;
  v_kill_tripped boolean;
BEGIN
  -- Check kill switch first (fail fast, no state mutation)
  v_kill_tripped := linkskills.is_kill_switch_tripped(p_capability_id, p_tenant_id);

  -- Try to find existing lease by idempotency key
  SELECT ll.lease_id, ll.status
  INTO v_lease_id, v_status
  FROM linkskills.lease_ledger ll
  WHERE ll.tenant_id = p_tenant_id
    AND ll.idempotency_key = p_idempotency_key
  LIMIT 1;

  IF FOUND THEN
    v_is_existing := true;
    -- Return existing lease (preserve original status)
    RETURN QUERY SELECT v_lease_id, v_status, v_is_existing,
      CASE WHEN v_kill_tripped THEN 'tripped'::text ELSE 'open'::text END;
    RETURN;
  END IF;

  -- Insert new lease request
  INSERT INTO linkskills.lease_ledger (
    tenant_id, run_id, stage_id, capability_id, arguments, idempotency_key,
    actor_kind, actor_id, status, requested_at
  ) VALUES (
    p_tenant_id, p_run_id, p_stage_id, p_capability_id, COALESCE(p_arguments, '{}'::jsonb),
    p_idempotency_key, p_actor_kind, p_actor_id,
    CASE WHEN v_kill_tripped THEN 'denied'::text ELSE 'requested'::text END,
    now()
  )
  RETURNING linkskills.lease_ledger.lease_id INTO v_lease_id;

  v_status := CASE WHEN v_kill_tripped THEN 'denied'::text ELSE 'requested'::text END;

  RETURN QUERY SELECT v_lease_id, v_status, v_is_existing,
    CASE WHEN v_kill_tripped THEN 'tripped'::text ELSE 'open'::text END;
END;
$$;

REVOKE ALL ON FUNCTION linkskills.request_lease(uuid, uuid, text, text, jsonb, text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION linkskills.request_lease(uuid, uuid, text, text, jsonb, text, text, text) TO service_role;

-- Grant lease: transition requested → granted (or requires_approval)
CREATE OR REPLACE FUNCTION linkskills.grant_lease(
  p_lease_id uuid,
  p_decision_status text,  -- 'granted' | 'requires_approval'
  p_reason text,
  p_ttl_seconds int DEFAULT 300  -- 5 minute default
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = linkskills, public
AS $$
DECLARE
  v_current text;
  v_capability text;
  v_tenant_id uuid;
BEGIN
  SELECT status, capability_id, tenant_id
  INTO v_current, v_capability, v_tenant_id
  FROM linkskills.lease_ledger
  WHERE lease_id = p_lease_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'LEASE_NOT_FOUND';
  END IF;

  IF v_current NOT IN ('requested', 'requires_approval') THEN
    RETURN false;  -- Invalid transition
  END IF;

  -- If kill switch tripped, deny regardless
  IF linkskills.is_kill_switch_tripped(v_capability, v_tenant_id) THEN
    UPDATE linkskills.lease_ledger
    SET status = 'denied',
        decision_reason = 'Kill switch tripped',
        decided_at = now(),
        updated_at = now()
    WHERE lease_id = p_lease_id;
    RETURN true;  -- Processed (as denial)
  END IF;

  IF p_decision_status = 'granted' THEN
    UPDATE linkskills.lease_ledger
    SET status = 'granted',
        decision_reason = p_reason,
        expires_at = now() + (p_ttl_seconds || ' seconds')::interval,
        decided_at = now(),
        updated_at = now()
    WHERE lease_id = p_lease_id;
  ELSIF p_decision_status = 'requires_approval' THEN
    UPDATE linkskills.lease_ledger
    SET status = 'requires_approval',
        decision_reason = p_reason,
        decided_at = now(),
        updated_at = now()
    WHERE lease_id = p_lease_id;
  ELSE
    RAISE EXCEPTION 'INVALID_DECISION_STATUS';
  END IF;

  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION linkskills.grant_lease(uuid, text, text, int) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION linkskills.grant_lease(uuid, text, text, int) TO service_role;

-- Deny lease: transition to denied
CREATE OR REPLACE FUNCTION linkskills.deny_lease(
  p_lease_id uuid,
  p_reason text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = linkskills, public
AS $$
BEGIN
  UPDATE linkskills.lease_ledger
  SET status = 'denied',
      decision_reason = p_reason,
      decided_at = now(),
      updated_at = now()
  WHERE lease_id = p_lease_id
    AND status IN ('requested', 'granted', 'requires_approval');

  RETURN FOUND;
END;
$$;

REVOKE ALL ON FUNCTION linkskills.deny_lease(uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION linkskills.deny_lease(uuid, text) TO service_role;

-- Record lease execution (idempotent): stores result and returns existing if duplicate
CREATE OR REPLACE FUNCTION linkskills.record_execution(
  p_lease_id uuid,
  p_idempotency_key text,
  p_result jsonb,
  p_audit_event_id uuid
)
RETURNS TABLE (
  execution_id uuid,
  is_duplicate boolean,
  result jsonb,
  audit_event_id uuid
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = linkskills, public
AS $$
DECLARE
  v_exec_id uuid;
  v_is_dup boolean := false;
  v_existing jsonb;
  v_existing_audit uuid;
BEGIN
  -- Check for existing execution with same idempotency key
  SELECT ler.id, ler.result, ler.audit_event_id
  INTO v_exec_id, v_existing, v_existing_audit
  FROM linkskills.lease_execution_results ler
  WHERE ler.idempotency_key = p_idempotency_key
  LIMIT 1;

  IF FOUND THEN
    v_is_dup := true;
    RETURN QUERY SELECT v_exec_id, v_is_dup, v_existing, v_existing_audit;
    RETURN;
  END IF;

  -- Insert new execution result
  INSERT INTO linkskills.lease_execution_results (
    lease_id, result, audit_event_id, idempotency_key
  ) VALUES (
    p_lease_id, p_result, p_audit_event_id, p_idempotency_key
  )
  RETURNING linkskills.lease_execution_results.id INTO v_exec_id;

  -- Update lease ledger to executed
  UPDATE linkskills.lease_ledger
  SET status = 'executed',
      execution_result = p_result,
      audit_event_id = p_audit_event_id,
      ledger_entry_id = p_lease_id,  -- Self-reference for idempotency
      executed_at = now(),
      updated_at = now()
  WHERE lease_id = p_lease_id;

  RETURN QUERY SELECT v_exec_id, v_is_dup, p_result, p_audit_event_id;
END;
$$;

REVOKE ALL ON FUNCTION linkskills.record_execution(uuid, text, jsonb, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION linkskills.record_execution(uuid, text, jsonb, uuid) TO service_role;

-- Trip kill switch for a capability
CREATE OR REPLACE FUNCTION linkskills.trip_kill_switch(
  p_capability_id text,
  p_tenant_id uuid,  -- NULL for global
  p_reason text,
  p_actor_id text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = linkskills, public
AS $$
BEGIN
  INSERT INTO linkskills.capability_kill_switches (
    capability_id, tenant_id, state, reason, tripped_by, tripped_at, updated_at
  ) VALUES (
    p_capability_id, p_tenant_id, 'tripped', COALESCE(p_reason, ''), p_actor_id, now(), now()
  )
  ON CONFLICT (capability_id, tenant_id) DO UPDATE SET
    state = 'tripped',
    reason = EXCLUDED.reason,
    tripped_by = EXCLUDED.tripped_by,
    tripped_at = now(),
    reset_by = NULL,
    reset_at = NULL,
    updated_at = now();

  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION linkskills.trip_kill_switch(text, uuid, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION linkskills.trip_kill_switch(text, uuid, text, text) TO service_role;

-- Reset kill switch
CREATE OR REPLACE FUNCTION linkskills.reset_kill_switch(
  p_capability_id text,
  p_tenant_id uuid,  -- NULL for global
  p_actor_id text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = linkskills, public
AS $$
BEGIN
  UPDATE linkskills.capability_kill_switches
  SET state = 'open',
      reset_by = p_actor_id,
      reset_at = now(),
      updated_at = now()
  WHERE capability_id = p_capability_id
    AND (tenant_id IS NOT DISTINCT FROM p_tenant_id);

  RETURN FOUND;
END;
$$;

REVOKE ALL ON FUNCTION linkskills.reset_kill_switch(text, uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION linkskills.reset_kill_switch(text, uuid, text) TO service_role;

-- Expire stale granted leases (cron or scheduled job)
CREATE OR REPLACE FUNCTION linkskills.expire_stale_leases()
RETURNS int
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = linkskills, public
AS $$
DECLARE
  v_count int;
BEGIN
  UPDATE linkskills.lease_ledger
  SET status = 'expired',
      updated_at = now()
  WHERE status = 'granted'
    AND expires_at < now();

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;

REVOKE ALL ON FUNCTION linkskills.expire_stale_leases() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION linkskills.expire_stale_leases() TO service_role;

COMMENT ON FUNCTION linkskills.request_lease IS 'Idempotent lease request (§6.2). Returns existing lease if idempotency key matches.';
COMMENT ON FUNCTION linkskills.grant_lease IS 'Grant or require_approval a lease (§6.2). Respects kill switches.';
COMMENT ON FUNCTION linkskills.deny_lease IS 'Deny a lease request (§6.2).';
COMMENT ON FUNCTION linkskills.record_execution IS 'Idempotent execution recording (§6.2). Returns existing result on duplicate idempotency key.';
COMMENT ON FUNCTION linkskills.trip_kill_switch IS 'Trip kill switch for capability (§6.2). Global if tenant_id is NULL.';
COMMENT ON FUNCTION linkskills.reset_kill_switch IS 'Reset kill switch for capability.';
COMMENT ON FUNCTION linkskills.expire_stale_leases IS 'Background job to expire TTL-expired granted leases.';

-- ---------------------------------------------------------------------------
-- Stub backend tables (INT-020, INT-021)
-- These are local Postgres tables that stand in for Chatwoot/Odoo/Plane
-- until real integrations are wired post-MVO.
-- ---------------------------------------------------------------------------

-- CRM stub tables (INT-020)
CREATE TABLE IF NOT EXISTS linkskills.mvo_crm_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  business_name text NOT NULL,
  email_hash text,  -- SHA256 with tenant salt (no plaintext PII)
  phone_hash text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, email_hash),
  UNIQUE (tenant_id, phone_hash)
);

CREATE INDEX IF NOT EXISTS idx_crm_contacts_tenant ON linkskills.mvo_crm_contacts (tenant_id);

CREATE TABLE IF NOT EXISTS linkskills.mvo_crm_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  lead_id text NOT NULL,
  contact_id uuid REFERENCES linkskills.mvo_crm_contacts (id),
  industry text NOT NULL DEFAULT '',
  external_ids jsonb NOT NULL DEFAULT '{}'::jsonb,
  lease_id uuid REFERENCES linkskills.lease_ledger (lease_id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, lead_id)
);

CREATE INDEX IF NOT EXISTS idx_crm_records_tenant ON linkskills.mvo_crm_records (tenant_id);
CREATE INDEX IF NOT EXISTS idx_crm_records_lead ON linkskills.mvo_crm_records (lead_id);

ALTER TABLE linkskills.mvo_crm_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE linkskills.mvo_crm_records ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE ON linkskills.mvo_crm_contacts TO service_role;
GRANT SELECT, INSERT, UPDATE ON linkskills.mvo_crm_records TO service_role;
GRANT SELECT ON linkskills.mvo_crm_contacts TO authenticated;
GRANT SELECT ON linkskills.mvo_crm_records TO authenticated;

-- Plane stub tables (INT-021)
CREATE TABLE IF NOT EXISTS linkskills.mvo_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  lead_id text NOT NULL,
  name text NOT NULL,
  owner_actor_id text NOT NULL,
  lease_id uuid REFERENCES linkskills.lease_ledger (lease_id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, lead_id)
);

CREATE INDEX IF NOT EXISTS idx_projects_tenant ON linkskills.mvo_projects (tenant_id);

CREATE TABLE IF NOT EXISTS linkskills.mvo_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES linkskills.mvo_projects (id) ON DELETE CASCADE,
  title text NOT NULL,
  title_normalized text NOT NULL,  -- normalized for idempotency
  description text,
  assignee_actor_id text,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'done')),
  lease_id uuid REFERENCES linkskills.lease_ledger (lease_id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (project_id, title_normalized)
);

CREATE INDEX IF NOT EXISTS idx_tasks_project ON linkskills.mvo_tasks (project_id);

ALTER TABLE linkskills.mvo_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE linkskills.mvo_tasks ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE ON linkskills.mvo_projects TO service_role;
GRANT SELECT, INSERT, UPDATE ON linkskills.mvo_tasks TO service_role;
GRANT SELECT ON linkskills.mvo_projects TO authenticated;
GRANT SELECT ON linkskills.mvo_tasks TO authenticated;

-- ---------------------------------------------------------------------------
-- Stub backend RPCs
-- ---------------------------------------------------------------------------

-- CRM upsert helper: insert or update contact
CREATE OR REPLACE FUNCTION linkskills.upsert_crm_contact(
  p_tenant_id uuid,
  p_business_name text,
  p_email_hash text,
  p_phone_hash text
)
RETURNS TABLE (contact_id uuid)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = linkskills, public
AS $$
DECLARE
  v_contact_id uuid;
BEGIN
  -- Try to find existing contact by email_hash or phone_hash
  SELECT c.id INTO v_contact_id
  FROM linkskills.mvo_crm_contacts c
  WHERE c.tenant_id = p_tenant_id
    AND ((p_email_hash IS NOT NULL AND c.email_hash = p_email_hash)
         OR (p_phone_hash IS NOT NULL AND c.phone_hash = p_phone_hash))
  LIMIT 1;

  IF v_contact_id IS NOT NULL THEN
    -- Update existing
    UPDATE linkskills.mvo_crm_contacts
    SET business_name = p_business_name,
        email_hash = COALESCE(p_email_hash, email_hash),
        phone_hash = COALESCE(p_phone_hash, phone_hash),
        updated_at = now()
    WHERE id = v_contact_id;
  ELSE
    -- Insert new
    INSERT INTO linkskills.mvo_crm_contacts (tenant_id, business_name, email_hash, phone_hash)
    VALUES (p_tenant_id, p_business_name, p_email_hash, p_phone_hash)
    RETURNING id INTO v_contact_id;
  END IF;

  RETURN QUERY SELECT v_contact_id;
END;
$$;

REVOKE ALL ON FUNCTION linkskills.upsert_crm_contact(uuid, text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION linkskills.upsert_crm_contact(uuid, text, text, text) TO service_role;

-- CRM record upsert helper
CREATE OR REPLACE FUNCTION linkskills.upsert_crm_record(
  p_tenant_id uuid,
  p_lead_id text,
  p_contact_id uuid,
  p_industry text,
  p_external_ids jsonb,
  p_lease_id uuid
)
RETURNS TABLE (crm_record_id uuid, created boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = linkskills, public
AS $$
DECLARE
  v_record_id uuid;
  v_created boolean := false;
BEGIN
  SELECT r.id INTO v_record_id
  FROM linkskills.mvo_crm_records r
  WHERE r.tenant_id = p_tenant_id AND r.lead_id = p_lead_id;

  IF v_record_id IS NOT NULL THEN
    -- Update
    UPDATE linkskills.mvo_crm_records
    SET contact_id = p_contact_id,
        industry = p_industry,
        external_ids = p_external_ids,
        lease_id = p_lease_id,
        updated_at = now()
    WHERE id = v_record_id;
    v_created := false;
  ELSE
    -- Insert
    INSERT INTO linkskills.mvo_crm_records (tenant_id, lead_id, contact_id, industry, external_ids, lease_id)
    VALUES (p_tenant_id, p_lead_id, p_contact_id, p_industry, p_external_ids, p_lease_id)
    RETURNING id INTO v_record_id;
    v_created := true;
  END IF;

  RETURN QUERY SELECT v_record_id, v_created;
END;
$$;

REVOKE ALL ON FUNCTION linkskills.upsert_crm_record(uuid, text, uuid, text, jsonb, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION linkskills.upsert_crm_record(uuid, text, uuid, text, jsonb, uuid) TO service_role;

-- Plane project create helper
CREATE OR REPLACE FUNCTION linkskills.create_plane_project(
  p_tenant_id uuid,
  p_lead_id text,
  p_project_name text,
  p_owner_actor_id text,
  p_lease_id uuid
)
RETURNS TABLE (project_id uuid, created boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = linkskills, public
AS $$
DECLARE
  v_project_id uuid;
  v_created boolean := false;
BEGIN
  SELECT p.id INTO v_project_id
  FROM linkskills.mvo_projects p
  WHERE p.tenant_id = p_tenant_id AND p.lead_id = p_lead_id;

  IF v_project_id IS NOT NULL THEN
    -- Update name/owner
    UPDATE linkskills.mvo_projects
    SET name = p_project_name,
        owner_actor_id = p_owner_actor_id,
        lease_id = p_lease_id,
        updated_at = now()
    WHERE id = v_project_id;
    v_created := false;
  ELSE
    INSERT INTO linkskills.mvo_projects (tenant_id, lead_id, name, owner_actor_id, lease_id)
    VALUES (p_tenant_id, p_lead_id, p_project_name, p_owner_actor_id, p_lease_id)
    RETURNING id INTO v_project_id;
    v_created := true;
  END IF;

  RETURN QUERY SELECT v_project_id, v_created;
END;
$$;

REVOKE ALL ON FUNCTION linkskills.create_plane_project(uuid, text, text, text, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION linkskills.create_plane_project(uuid, text, text, text, uuid) TO service_role;

-- Plane task create helper
CREATE OR REPLACE FUNCTION linkskills.create_plane_task(
  p_project_id uuid,
  p_title text,
  p_description text,
  p_assignee_actor_id text,
  p_lease_id uuid
)
RETURNS TABLE (task_id uuid, created boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = linkskills, public
AS $$
DECLARE
  v_task_id uuid;
  v_created boolean := false;
  v_title_normalized text;
BEGIN
  -- Normalize title for idempotency
  v_title_normalized := lower(regexp_replace(trim(p_title), '\s+', ' ', 'g'));

  SELECT t.id INTO v_task_id
  FROM linkskills.mvo_tasks t
  WHERE t.project_id = p_project_id AND t.title_normalized = v_title_normalized;

  IF v_task_id IS NOT NULL THEN
    -- Update
    UPDATE linkskills.mvo_tasks
    SET title = p_title,
        description = COALESCE(p_description, description),
        assignee_actor_id = COALESCE(p_assignee_actor_id, assignee_actor_id),
        lease_id = p_lease_id,
        updated_at = now()
    WHERE id = v_task_id;
    v_created := false;
  ELSE
    INSERT INTO linkskills.mvo_tasks (project_id, title, title_normalized, description, assignee_actor_id, lease_id)
    VALUES (p_project_id, p_title, v_title_normalized, p_description, p_assignee_actor_id, p_lease_id)
    RETURNING id INTO v_task_id;
    v_created := true;
  END IF;

  RETURN QUERY SELECT v_task_id, v_created;
END;
$$;

REVOKE ALL ON FUNCTION linkskills.create_plane_task(uuid, text, text, text, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION linkskills.create_plane_task(uuid, text, text, text, uuid) TO service_role;

COMMENT ON TABLE linkskills.mvo_crm_contacts IS 'Stub CRM contacts (INT-020). Email/phone are hashed, no plaintext PII.';
COMMENT ON TABLE linkskills.mvo_crm_records IS 'Stub CRM records (INT-020). Links to contacts, idempotent per (tenant, lead).';
COMMENT ON TABLE linkskills.mvo_projects IS 'Stub Plane projects (INT-021). Idempotent per (tenant, lead).';
COMMENT ON TABLE linkskills.mvo_tasks IS 'Stub Plane tasks (INT-021). Idempotent per (project, title_normalized).';
COMMENT ON FUNCTION linkskills.upsert_crm_contact IS 'Stub CRM: upsert contact by email/phone hash (INT-020).';
COMMENT ON FUNCTION linkskills.upsert_crm_record IS 'Stub CRM: upsert record by tenant+lead (INT-020).';
COMMENT ON FUNCTION linkskills.create_plane_project IS 'Stub Plane: create project (INT-021).';
COMMENT ON FUNCTION linkskills.create_plane_task IS 'Stub Plane: create task with normalized title (INT-021).';
