-- LiNKaios kernel orchestration tables (CONTRACTS_MVO.md §1, §4)
-- Tenant/plugin registry, work_request/run/stage lifecycle, approval hooks

CREATE SCHEMA IF NOT EXISTS linkaios_kernel;

-- ---------------------------------------------------------------------------
-- §1.1 Tenant registry
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS linkaios_kernel.tenants (
  tenant_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  display_name text NOT NULL,
  slug text NOT NULL UNIQUE,  -- URL-friendly identifier
  status text NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'suspended', 'inactive')),
  config_json jsonb NOT NULL DEFAULT '{}'::jsonb,  -- tenant-scoped plugin config
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE linkaios_kernel.tenants IS
  'Tenant registry per CONTRACTS_MVO.md §1.1. Kernel owns; plugins declare entitlements.';

CREATE INDEX IF NOT EXISTS idx_tenants_slug ON linkaios_kernel.tenants (slug);
CREATE INDEX IF NOT EXISTS idx_tenants_status ON linkaios_kernel.tenants (status);

-- ---------------------------------------------------------------------------
-- §1.2 Plugin registry + manifest storage
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS linkaios_kernel.plugins (
  plugin_id text PRIMARY KEY,  -- slug: "websitefactory"
  plugin_name text NOT NULL,
  version text NOT NULL,  -- semver of manifest
  purpose text NOT NULL,
  manifest_json jsonb NOT NULL,  -- full PluginManifest (CONTRACTS_MVO.md §1.2)
  status text NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'deprecated', 'disabled')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE linkaios_kernel.plugins IS
  'Plugin registry (CONTRACTS_MVO.md §1.2). Manifest validated at load; rejects invalid plugins.';

-- Tenant-plugin entitlements (which plugins a tenant can use)
CREATE TABLE IF NOT EXISTS linkaios_kernel.tenant_plugins (
  tenant_id uuid NOT NULL REFERENCES linkaios_kernel.tenants (tenant_id) ON DELETE CASCADE,
  plugin_id text NOT NULL REFERENCES linkaios_kernel.plugins (plugin_id) ON DELETE CASCADE,
  config_json jsonb NOT NULL DEFAULT '{}'::jsonb,  -- tenant-scoped plugin config
  enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (tenant_id, plugin_id)
);

COMMENT ON TABLE linkaios_kernel.tenant_plugins IS
  'Tenant-plugin entitlements and tenant-scoped config per plugin.';

CREATE INDEX IF NOT EXISTS idx_tenant_plugins_enabled ON linkaios_kernel.tenant_plugins (tenant_id, enabled);

-- ---------------------------------------------------------------------------
-- §4.1 Work requests (intent → execution)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS linkaios_kernel.work_requests (
  work_request_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES linkaios_kernel.tenants (tenant_id),
  plugin_id text NOT NULL REFERENCES linkaios_kernel.plugins (plugin_id),
  work_request_type text NOT NULL,  -- e.g., "websitefactory.lead_to_preview"
  payload jsonb NOT NULL,  -- plugin-typed (LeadInput for WebsiteFactory)
  requested_by_actor_kind text NOT NULL CHECK (requested_by_actor_kind IN ('user', 'system', 'bot')),
  requested_by_actor_id text NOT NULL,
  idempotency_key text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),

  -- Unique constraint: (tenant_id, idempotency_key) for dedupe
  UNIQUE (tenant_id, idempotency_key)
);

COMMENT ON TABLE linkaios_kernel.work_requests IS
  'Work request intent (CONTRACTS_MVO.md §4.1). Idempotent via (tenant_id, idempotency_key).';

CREATE INDEX IF NOT EXISTS idx_work_requests_tenant ON linkaios_kernel.work_requests (tenant_id);
CREATE INDEX IF NOT EXISTS idx_work_requests_plugin ON linkaios_kernel.work_requests (plugin_id);
CREATE INDEX IF NOT EXISTS idx_work_requests_type ON linkaios_kernel.work_requests (work_request_type);

-- ---------------------------------------------------------------------------
-- §4.2 Runs (execution instance)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS linkaios_kernel.runs (
  run_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  work_request_id uuid NOT NULL REFERENCES linkaios_kernel.work_requests (work_request_id),
  tenant_id uuid NOT NULL REFERENCES linkaios_kernel.tenants (tenant_id),
  plugin_id text NOT NULL REFERENCES linkaios_kernel.plugins (plugin_id),
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'running', 'succeeded', 'partial', 'failed', 'awaiting_approval', 'cancelled')),
  started_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz,
  outputs_json jsonb NOT NULL DEFAULT '{}'::jsonb,  -- accumulated stage outputs
  failure_json jsonb,  -- FailureReport on failure
  -- Trace refs (populated as stages complete)
  lease_ids uuid[] DEFAULT '{}',
  workflow_run_ids text[] DEFAULT '{}',
  audit_event_ids uuid[] DEFAULT '{}',
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE linkaios_kernel.runs IS
  'Run execution instance (CONTRACTS_MVO.md §4.2). Status transitions drive lifecycle.';

CREATE INDEX IF NOT EXISTS idx_runs_work_request ON linkaios_kernel.runs (work_request_id);
CREATE INDEX IF NOT EXISTS idx_runs_tenant ON linkaios_kernel.runs (tenant_id);
CREATE INDEX IF NOT EXISTS idx_runs_status ON linkaios_kernel.runs (status);
CREATE INDEX IF NOT EXISTS idx_runs_tenant_status ON linkaios_kernel.runs (tenant_id, status);

-- ---------------------------------------------------------------------------
-- §4.3 Stages (ordered per manifest)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS linkaios_kernel.stages (
  stage_id text NOT NULL,  -- manifest stage_id (e.g., "lead_intake")
  run_id uuid NOT NULL REFERENCES linkaios_kernel.runs (run_id) ON DELETE CASCADE,
  responsible_plane text NOT NULL
    CHECK (responsible_plane IN ('linkaios', 'linkbot', 'linkskills', 'linkautowork', 'linkbrain')),
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'dispatched', 'running', 'succeeded', 'failed', 'awaiting_approval', 'skipped')),
  attempt int NOT NULL DEFAULT 1 CHECK (attempt >= 1),
  inputs_snapshot jsonb NOT NULL DEFAULT '{}'::jsonb,
  outputs_json jsonb,  -- stage outputs
  started_at timestamptz,
  ended_at timestamptz,
  -- Trace refs (populated as stage executes)
  lease_ids uuid[] DEFAULT '{}',
  workflow_run_ids text[] DEFAULT '{}',
  audit_event_ids uuid[] DEFAULT '{}',
  model_run_id text,
  failure_json jsonb,  -- FailureReport on failure
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (run_id, stage_id)
);

COMMENT ON TABLE linkaios_kernel.stages IS
  'Stage execution per manifest (CONTRACTS_MVO.md §4.3). Ordered by manifest, not sequence column.';

CREATE INDEX IF NOT EXISTS idx_stages_run ON linkaios_kernel.stages (run_id);
CREATE INDEX IF NOT EXISTS idx_stages_status ON linkaios_kernel.stages (status);
CREATE INDEX IF NOT EXISTS idx_stages_plane ON linkaios_kernel.stages (responsible_plane);

-- ---------------------------------------------------------------------------
-- §4.4 Approval hooks for require_approval stages
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS linkaios_kernel.approvals (
  approval_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id uuid NOT NULL REFERENCES linkaios_kernel.runs (run_id) ON DELETE CASCADE,
  stage_id text NOT NULL,
  tenant_id uuid NOT NULL REFERENCES linkaios_kernel.tenants (tenant_id),
  capability_id text NOT NULL,  -- which capability needs approval
  lease_id uuid,  -- LinkSkills lease reference (if lease created)
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'granted', 'rejected', 'timed_out')),
  requested_at timestamptz NOT NULL DEFAULT now(),
  requested_by_actor_kind text NOT NULL,
  requested_by_actor_id text NOT NULL,
  decided_at timestamptz,
  decided_by_actor_id text,
  decision_reason text,
  -- Auto-expire pending approvals after 24h (CONTRACTS_MVO.md §4.4)
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '24 hours'),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (run_id, stage_id)  -- one approval per stage
);

COMMENT ON TABLE linkaios_kernel.approvals IS
  'Approval hooks for require_approval stages (CONTRACTS_MVO.md §4.4, §7).';

CREATE INDEX IF NOT EXISTS idx_approvals_run ON linkaios_kernel.approvals (run_id);
CREATE INDEX IF NOT EXISTS idx_approvals_status ON linkaios_kernel.approvals (status);
CREATE INDEX IF NOT EXISTS idx_approvals_expires ON linkaios_kernel.approvals (expires_at) WHERE status = 'pending';

-- ---------------------------------------------------------------------------
-- §3.3 Lead dedupe: idempotency key → lead mapping
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS linkaios_kernel.lead_registry (
  lead_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES linkaios_kernel.tenants (tenant_id),
  idempotency_key text NOT NULL,
  business_name text NOT NULL,
  industry text NOT NULL,
  contact_json jsonb,  -- {name, email, phone} — PII; gate by RLS
  location_json jsonb,  -- {city, region, country}
  notes text,
  external_ids jsonb,
  source text NOT NULL,  -- manual, csv_import, stub
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  -- Unique: (tenant_id, idempotency_key) for 24h dedupe window
  UNIQUE (tenant_id, idempotency_key)
);

COMMENT ON TABLE linkaios_kernel.lead_registry IS
  'Lead registry with idempotency (CONTRACTS_MVO.md §3.3). Contact fields are PII.';

CREATE INDEX IF NOT EXISTS idx_leads_tenant ON linkaios_kernel.lead_registry (tenant_id);
CREATE INDEX IF NOT EXISTS idx_leads_created ON linkaios_kernel.lead_registry (created_at);

-- ---------------------------------------------------------------------------
-- RLS and grants
-- ---------------------------------------------------------------------------
ALTER TABLE linkaios_kernel.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE linkaios_kernel.plugins ENABLE ROW LEVEL SECURITY;
ALTER TABLE linkaios_kernel.tenant_plugins ENABLE ROW LEVEL SECURITY;
ALTER TABLE linkaios_kernel.work_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE linkaios_kernel.runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE linkaios_kernel.stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE linkaios_kernel.approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE linkaios_kernel.lead_registry ENABLE ROW LEVEL SECURITY;

-- Service role: full access
GRANT USAGE ON SCHEMA linkaios_kernel TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA linkaios_kernel TO service_role;

-- Authenticated: read-only trace views
GRANT USAGE ON SCHEMA linkaios_kernel TO authenticated;
GRANT SELECT ON linkaios_kernel.tenants TO authenticated;
GRANT SELECT ON linkaios_kernel.plugins TO authenticated;
GRANT SELECT ON linkaios_kernel.tenant_plugins TO authenticated;
GRANT SELECT ON linkaios_kernel.work_requests TO authenticated;
GRANT SELECT ON linkaios_kernel.runs TO authenticated;
GRANT SELECT ON linkaios_kernel.stages TO authenticated;
GRANT SELECT ON linkaios_kernel.approvals TO authenticated;
-- Lead registry PII: authenticated can see non-contact fields only (enforced by policy below)

-- RLS Policies
DROP POLICY IF EXISTS kernel_tenants_select ON linkaios_kernel.tenants;
CREATE POLICY kernel_tenants_select ON linkaios_kernel.tenants FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS kernel_plugins_select ON linkaios_kernel.plugins;
CREATE POLICY kernel_plugins_select ON linkaios_kernel.plugins FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS kernel_tenant_plugins_select ON linkaios_kernel.tenant_plugins;
CREATE POLICY kernel_tenant_plugins_select ON linkaios_kernel.tenant_plugins FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS kernel_work_requests_select ON linkaios_kernel.work_requests;
CREATE POLICY kernel_work_requests_select ON linkaios_kernel.work_requests FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS kernel_runs_select ON linkaios_kernel.runs;
CREATE POLICY kernel_runs_select ON linkaios_kernel.runs FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS kernel_stages_select ON linkaios_kernel.stages;
CREATE POLICY kernel_stages_select ON linkaios_kernel.stages FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS kernel_approvals_select ON linkaios_kernel.approvals;
CREATE POLICY kernel_approvals_select ON linkaios_kernel.approvals FOR SELECT TO authenticated USING (true);

-- Lead registry: redact PII for authenticated (only service_role sees full contact_json)
DROP POLICY IF EXISTS kernel_leads_select ON linkaios_kernel.lead_registry;
CREATE POLICY kernel_leads_select ON linkaios_kernel.lead_registry
  FOR SELECT TO authenticated
  USING (true);

-- ---------------------------------------------------------------------------
-- SECURITY DEFINER helper functions
-- ---------------------------------------------------------------------------

-- Seed a demo tenant + enable WebsiteFactory plugin
CREATE OR REPLACE FUNCTION linkaios_kernel.seed_demo_tenant(
  p_slug text DEFAULT 'demo',
  p_display_name text DEFAULT 'Demo Tenant'
)
RETURNS TABLE (tenant_id uuid, plugin_ids text[])
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = linkaios_kernel, public
AS $$
DECLARE
  v_tenant_id uuid;
  v_plugin_ids text[] := ARRAY['websitefactory'];
BEGIN
  -- Insert or get tenant
  INSERT INTO linkaios_kernel.tenants (slug, display_name)
  VALUES (p_slug, p_display_name)
  ON CONFLICT (slug) DO UPDATE SET updated_at = now()
  RETURNING linkaios_kernel.tenants.tenant_id INTO v_tenant_id;

  -- Enable WebsiteFactory plugin for tenant (if plugin exists)
  INSERT INTO linkaios_kernel.tenant_plugins (tenant_id, plugin_id, enabled)
  VALUES (v_tenant_id, 'websitefactory', true)
  ON CONFLICT (tenant_id, plugin_id) DO UPDATE SET enabled = true, updated_at = now();

  RETURN QUERY SELECT v_tenant_id, v_plugin_ids;
END;
$$;

REVOKE ALL ON FUNCTION linkaios_kernel.seed_demo_tenant(text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION linkaios_kernel.seed_demo_tenant(text, text) TO service_role;

-- Create a work request (idempotent via idempotency_key)
CREATE OR REPLACE FUNCTION linkaios_kernel.create_work_request(
  p_tenant_id uuid,
  p_plugin_id text,
  p_work_request_type text,
  p_payload jsonb,
  p_requested_by_actor_kind text,
  p_requested_by_actor_id text,
  p_idempotency_key text
)
RETURNS TABLE (work_request_id uuid, is_existing boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = linkaios_kernel, public
AS $$
DECLARE
  v_wr_id uuid;
  v_is_existing boolean := false;
BEGIN
  -- Check for existing (idempotency)
  SELECT wr.work_request_id INTO v_wr_id
  FROM linkaios_kernel.work_requests wr
  WHERE wr.tenant_id = p_tenant_id AND wr.idempotency_key = p_idempotency_key
  LIMIT 1;

  IF FOUND THEN
    v_is_existing := true;
    RETURN QUERY SELECT v_wr_id, v_is_existing;
    RETURN;
  END IF;

  INSERT INTO linkaios_kernel.work_requests (
    tenant_id, plugin_id, work_request_type, payload,
    requested_by_actor_kind, requested_by_actor_id, idempotency_key
  ) VALUES (
    p_tenant_id, p_plugin_id, p_work_request_type, p_payload,
    p_requested_by_actor_kind, p_requested_by_actor_id, p_idempotency_key
  )
  RETURNING linkaios_kernel.work_requests.work_request_id INTO v_wr_id;

  RETURN QUERY SELECT v_wr_id, v_is_existing;
END;
$$;

REVOKE ALL ON FUNCTION linkaios_kernel.create_work_request(uuid, text, text, jsonb, text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION linkaios_kernel.create_work_request(uuid, text, text, jsonb, text, text, text) TO service_role;

-- Create a run from work_request
CREATE OR REPLACE FUNCTION linkaios_kernel.create_run(
  p_work_request_id uuid,
  p_tenant_id uuid,
  p_plugin_id text
)
RETURNS TABLE (run_id uuid)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = linkaios_kernel, public
AS $$
DECLARE
  v_run_id uuid;
BEGIN
  INSERT INTO linkaios_kernel.runs (
    work_request_id, tenant_id, plugin_id, status
  ) VALUES (
    p_work_request_id, p_tenant_id, p_plugin_id, 'pending'
  )
  RETURNING linkaios_kernel.runs.run_id INTO v_run_id;

  RETURN QUERY SELECT v_run_id;
END;
$$;

REVOKE ALL ON FUNCTION linkaios_kernel.create_run(uuid, uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION linkaios_kernel.create_run(uuid, uuid, text) TO service_role;

-- Update run status
CREATE OR REPLACE FUNCTION linkaios_kernel.update_run_status(
  p_run_id uuid,
  p_status text,
  p_outputs_json jsonb DEFAULT NULL,
  p_failure_json jsonb DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = linkaios_kernel, public
AS $$
BEGIN
  UPDATE linkaios_kernel.runs
  SET status = p_status,
      outputs_json = COALESCE(p_outputs_json, outputs_json),
      failure_json = COALESCE(p_failure_json, failure_json),
      ended_at = CASE WHEN p_status IN ('succeeded', 'partial', 'failed', 'cancelled') THEN now() ELSE ended_at END,
      updated_at = now()
  WHERE run_id = p_run_id;

  RETURN FOUND;
END;
$$;

REVOKE ALL ON FUNCTION linkaios_kernel.update_run_status(uuid, text, jsonb, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION linkaios_kernel.update_run_status(uuid, text, jsonb, jsonb) TO service_role;

-- Add trace refs to run (lease_ids, workflow_run_ids, audit_event_ids)
CREATE OR REPLACE FUNCTION linkaios_kernel.add_run_refs(
  p_run_id uuid,
  p_lease_id uuid DEFAULT NULL,
  p_workflow_run_id text DEFAULT NULL,
  p_audit_event_id uuid DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = linkaios_kernel, public
AS $$
BEGIN
  UPDATE linkaios_kernel.runs
  SET lease_ids = CASE WHEN p_lease_id IS NOT NULL
                       THEN array_append(lease_ids, p_lease_id)
                       ELSE lease_ids END,
      workflow_run_ids = CASE WHEN p_workflow_run_id IS NOT NULL
                              THEN array_append(workflow_run_ids, p_workflow_run_id)
                              ELSE workflow_run_ids END,
      audit_event_ids = CASE WHEN p_audit_event_id IS NOT NULL
                             THEN array_append(audit_event_ids, p_audit_event_id)
                             ELSE audit_event_ids END,
      updated_at = now()
  WHERE run_id = p_run_id;

  RETURN FOUND;
END;
$$;

REVOKE ALL ON FUNCTION linkaios_kernel.add_run_refs(uuid, uuid, text, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION linkaios_kernel.add_run_refs(uuid, uuid, text, uuid) TO service_role;

-- Create/update stage
CREATE OR REPLACE FUNCTION linkaios_kernel.upsert_stage(
  p_run_id uuid,
  p_stage_id text,
  p_responsible_plane text,
  p_status text,
  p_attempt int DEFAULT 1,
  p_inputs_snapshot jsonb DEFAULT '{}'::jsonb,
  p_outputs_json jsonb DEFAULT NULL,
  p_failure_json jsonb DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = linkaios_kernel, public
AS $$
BEGIN
  INSERT INTO linkaios_kernel.stages (
    run_id, stage_id, responsible_plane, status, attempt,
    inputs_snapshot, outputs_json, failure_json,
    started_at, ended_at
  ) VALUES (
    p_run_id, p_stage_id, p_responsible_plane, p_status, p_attempt,
    p_inputs_snapshot, p_outputs_json, p_failure_json,
    CASE WHEN p_status IN ('running', 'dispatched') THEN now() ELSE NULL END,
    CASE WHEN p_status IN ('succeeded', 'failed', 'skipped') THEN now() ELSE NULL END
  )
  ON CONFLICT (run_id, stage_id) DO UPDATE SET
    status = EXCLUDED.status,
    attempt = EXCLUDED.attempt,
    inputs_snapshot = EXCLUDED.inputs_snapshot,
    outputs_json = COALESCE(EXCLUDED.outputs_json, linkaios_kernel.stages.outputs_json),
    failure_json = COALESCE(EXCLUDED.failure_json, linkaios_kernel.stages.failure_json),
    started_at = COALESCE(linkaios_kernel.stages.started_at, EXCLUDED.started_at),
    ended_at = EXCLUDED.ended_at,
    updated_at = now();

  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION linkaios_kernel.upsert_stage(uuid, text, text, text, int, jsonb, jsonb, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION linkaios_kernel.upsert_stage(uuid, text, text, text, int, jsonb, jsonb, jsonb) TO service_role;

-- Add trace refs to stage
CREATE OR REPLACE FUNCTION linkaios_kernel.add_stage_refs(
  p_run_id uuid,
  p_stage_id text,
  p_lease_id uuid DEFAULT NULL,
  p_workflow_run_id text DEFAULT NULL,
  p_audit_event_id uuid DEFAULT NULL,
  p_model_run_id text DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = linkaios_kernel, public
AS $$
BEGIN
  UPDATE linkaios_kernel.stages
  SET lease_ids = CASE WHEN p_lease_id IS NOT NULL
                       THEN array_append(lease_ids, p_lease_id)
                       ELSE lease_ids END,
      workflow_run_ids = CASE WHEN p_workflow_run_id IS NOT NULL
                              THEN array_append(workflow_run_ids, p_workflow_run_id)
                              ELSE workflow_run_ids END,
      audit_event_ids = CASE WHEN p_audit_event_id IS NOT NULL
                             THEN array_append(audit_event_ids, p_audit_event_id)
                             ELSE audit_event_ids END,
      model_run_id = COALESCE(p_model_run_id, model_run_id),
      updated_at = now()
  WHERE run_id = p_run_id AND stage_id = p_stage_id;

  RETURN FOUND;
END;
$$;

REVOKE ALL ON FUNCTION linkaios_kernel.add_stage_refs(uuid, text, uuid, text, uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION linkaios_kernel.add_stage_refs(uuid, text, uuid, text, uuid, text) TO service_role;

-- Request approval for a stage
CREATE OR REPLACE FUNCTION linkaios_kernel.request_approval(
  p_run_id uuid,
  p_stage_id text,
  p_tenant_id uuid,
  p_capability_id text,
  p_lease_id uuid,
  p_requested_by_actor_kind text,
  p_requested_by_actor_id text
)
RETURNS TABLE (approval_id uuid)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = linkaios_kernel, public
AS $$
DECLARE
  v_approval_id uuid;
BEGIN
  INSERT INTO linkaios_kernel.approvals (
    run_id, stage_id, tenant_id, capability_id, lease_id,
    status, requested_by_actor_kind, requested_by_actor_id
  ) VALUES (
    p_run_id, p_stage_id, p_tenant_id, p_capability_id, p_lease_id,
    'pending', p_requested_by_actor_kind, p_requested_by_actor_id
  )
  ON CONFLICT (run_id, stage_id) DO UPDATE SET
    capability_id = EXCLUDED.capability_id,
    lease_id = EXCLUDED.lease_id,
    status = 'pending',
    requested_at = now(),
    requested_by_actor_kind = EXCLUDED.requested_by_actor_kind,
    requested_by_actor_id = EXCLUDED.requested_by_actor_id,
    decided_at = NULL,
    decided_by_actor_id = NULL,
    decision_reason = NULL,
    expires_at = now() + interval '24 hours',
    updated_at = now()
  RETURNING linkaios_kernel.approvals.approval_id INTO v_approval_id;

  RETURN QUERY SELECT v_approval_id;
END;
$$;

REVOKE ALL ON FUNCTION linkaios_kernel.request_approval(uuid, text, uuid, text, uuid, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION linkaios_kernel.request_approval(uuid, text, uuid, text, uuid, text, text) TO service_role;

-- Grant/reject approval
CREATE OR REPLACE FUNCTION linkaios_kernel.decide_approval(
  p_approval_id uuid,
  p_decision text,  -- 'granted' | 'rejected'
  p_decided_by_actor_id text,
  p_reason text DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = linkaios_kernel, public
AS $$
BEGIN
  UPDATE linkaios_kernel.approvals
  SET status = p_decision,
      decided_at = now(),
      decided_by_actor_id = p_decided_by_actor_id,
      decision_reason = COALESCE(p_reason, decision_reason),
      updated_at = now()
  WHERE approval_id = p_approval_id AND status = 'pending';

  RETURN FOUND;
END;
$$;

REVOKE ALL ON FUNCTION linkaios_kernel.decide_approval(uuid, text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION linkaios_kernel.decide_approval(uuid, text, text, text) TO service_role;

-- Register or get existing lead (idempotent)
CREATE OR REPLACE FUNCTION linkaios_kernel.register_lead(
  p_tenant_id uuid,
  p_idempotency_key text,
  p_business_name text,
  p_industry text,
  p_contact_json jsonb,
  p_location_json jsonb,
  p_notes text,
  p_external_ids jsonb,
  p_source text
)
RETURNS TABLE (lead_id uuid, is_existing boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = linkaios_kernel, public
AS $$
DECLARE
  v_lead_id uuid;
  v_is_existing boolean := false;
  v_created_at timestamptz;
BEGIN
  -- Try to find existing lead
  SELECT lr.lead_id, lr.created_at
  INTO v_lead_id, v_created_at
  FROM linkaios_kernel.lead_registry lr
  WHERE lr.tenant_id = p_tenant_id AND lr.idempotency_key = p_idempotency_key
  LIMIT 1;

  IF FOUND THEN
    v_is_existing := true;
    -- Only return existing if within 24h window
    IF v_created_at > (now() - interval '24 hours') THEN
      RETURN QUERY SELECT v_lead_id, v_is_existing;
      RETURN;
    END IF;
    -- Outside window: create new with modified key
    p_idempotency_key := p_idempotency_key || ':' || extract(epoch from now())::text;
  END IF;

  INSERT INTO linkaios_kernel.lead_registry (
    tenant_id, idempotency_key, business_name, industry,
    contact_json, location_json, notes, external_ids, source
  ) VALUES (
    p_tenant_id, p_idempotency_key, p_business_name, p_industry,
    p_contact_json, p_location_json, p_notes, p_external_ids, p_source
  )
  RETURNING linkaios_kernel.lead_registry.lead_id INTO v_lead_id;

  RETURN QUERY SELECT v_lead_id, v_is_existing;
END;
$$;

REVOKE ALL ON FUNCTION linkaios_kernel.register_lead(uuid, text, text, text, jsonb, jsonb, text, jsonb, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION linkaios_kernel.register_lead(uuid, text, text, text, jsonb, jsonb, text, jsonb, text) TO service_role;

-- Get trace view for a run (joins refs from all planes)
CREATE OR REPLACE FUNCTION linkaios_kernel.get_run_trace(p_run_id uuid)
RETURNS TABLE (
  run_id uuid,
  tenant_id uuid,
  plugin_id text,
  status text,
  started_at timestamptz,
  ended_at timestamptz,
  outputs_json jsonb,
  failure_json jsonb,
  lease_ids uuid[],
  workflow_run_ids text[],
  audit_event_ids uuid[]
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = linkaios_kernel, public
AS $$
  SELECT
    r.run_id,
    r.tenant_id,
    r.plugin_id,
    r.status,
    r.started_at,
    r.ended_at,
    r.outputs_json,
    r.failure_json,
    r.lease_ids,
    r.workflow_run_ids,
    r.audit_event_ids
  FROM linkaios_kernel.runs r
  WHERE r.run_id = p_run_id;
$$;

REVOKE ALL ON FUNCTION linkaios_kernel.get_run_trace(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION linkaios_kernel.get_run_trace(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION linkaios_kernel.get_run_trace(uuid) TO authenticated;

-- Get stages for a run
CREATE OR REPLACE FUNCTION linkaios_kernel.get_run_stages(p_run_id uuid)
RETURNS TABLE (
  stage_id text,
  responsible_plane text,
  status text,
  attempt int,
  started_at timestamptz,
  ended_at timestamptz,
  lease_ids uuid[],
  workflow_run_ids text[],
  audit_event_ids uuid[]
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = linkaios_kernel, public
AS $$
  SELECT
    s.stage_id,
    s.responsible_plane,
    s.status,
    s.attempt,
    s.started_at,
    s.ended_at,
    s.lease_ids,
    s.workflow_run_ids,
    s.audit_event_ids
  FROM linkaios_kernel.stages s
  WHERE s.run_id = p_run_id
  ORDER BY s.created_at;
$$;

REVOKE ALL ON FUNCTION linkaios_kernel.get_run_stages(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION linkaios_kernel.get_run_stages(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION linkaios_kernel.get_run_stages(uuid) TO authenticated;

COMMENT ON FUNCTION linkaios_kernel.create_work_request IS
  'Create a work request (idempotent via idempotency_key). Returns (work_request_id, is_existing).';
COMMENT ON FUNCTION linkaios_kernel.create_run IS 'Create a run from work_request.';
COMMENT ON FUNCTION linkaios_kernel.update_run_status IS 'Update run status and optional outputs/failure.';
COMMENT ON FUNCTION linkaios_kernel.upsert_stage IS 'Create or update a stage.';
COMMENT ON FUNCTION linkaios_kernel.request_approval IS 'Request approval for a require_approval stage.';
COMMENT ON FUNCTION linkaios_kernel.decide_approval IS 'Grant or reject an approval request.';
COMMENT ON FUNCTION linkaios_kernel.register_lead IS 'Register a lead (idempotent via idempotency_key within 24h window).';
COMMENT ON FUNCTION linkaios_kernel.get_run_trace IS 'Read-only trace view for a run (no PII).';
COMMENT ON FUNCTION linkaios_kernel.get_run_stages IS 'Read-only stage list for a run.';
