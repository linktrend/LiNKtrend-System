-- LiNKbrain audit envelope ledger (CONTRACTS_MVO.md §6.3, DECISIONS.md D-08).
-- Canonical AuditEvent ledger: every plane (linkaios / linkbot / linkskills / linkautowork / linkbrain)
-- writes side-effect, decision, and run-transition events here. Per-service ad hoc logging is forbidden.
--
-- Reuse note: archived `lb_shared.audit_runs` (Archive/LiNKaios/packages/linkbrain/migrations/0001_init.sql)
-- modeled run-level audit only. The MVO envelope is broader (stage/lease/workflow/output/approval) and
-- standardized across planes, so we adapt the structural pattern (tenant_id, jsonb payload, append-only,
-- RLS by tenant, SECURITY DEFINER writer) rather than reuse the table directly.

CREATE SCHEMA IF NOT EXISTS linkbrain;

CREATE TABLE IF NOT EXISTS linkbrain.audit_events (
  event_id uuid PRIMARY KEY,
  ts timestamptz NOT NULL,
  tenant_id uuid NOT NULL,
  plane text NOT NULL,
  actor_kind text NOT NULL,
  actor_id text NOT NULL,
  action text NOT NULL,
  subject jsonb NOT NULL DEFAULT '{}'::jsonb,
  refs jsonb NOT NULL DEFAULT '{}'::jsonb,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  schema_version text NOT NULL,
  persisted_at timestamptz NOT NULL DEFAULT now(),

  -- §1.2 Plane union
  CONSTRAINT audit_events_plane_check CHECK (
    plane IN ('linkaios', 'linkbot', 'linkskills', 'linkautowork', 'linkbrain')
  ),

  -- §6.3 actor_kind union
  CONSTRAINT audit_events_actor_kind_check CHECK (
    actor_kind IN ('kernel', 'plugin', 'bot', 'user', 'system')
  ),

  -- §6.3 schema_version pin (envelope v1)
  CONSTRAINT audit_events_schema_version_check CHECK (schema_version = '1'),

  -- §6.3 action must be non-empty; full canonical list (§6.3.1) is enforced in the writer
  -- because decisions may add new actions over time (never rename).
  CONSTRAINT audit_events_action_nonempty CHECK (length(trim(action)) > 0),
  CONSTRAINT audit_events_actor_id_nonempty CHECK (length(trim(actor_id)) > 0),

  -- §3.4 PII guard: payload MUST NOT carry raw contact fields. The writer also enforces this;
  -- the table-level guard catches drift from direct inserts.
  CONSTRAINT audit_events_payload_no_pii CHECK (
    NOT (payload ? 'email')
    AND NOT (payload ? 'phone')
    AND NOT (payload ? 'contact_email')
    AND NOT (payload ? 'contact_phone')
    AND NOT (payload ? 'contact')
  )
);

COMMENT ON TABLE linkbrain.audit_events IS
  'Canonical AuditEvent ledger (CONTRACTS_MVO.md §6.3). Append-only; one row per envelope. All planes write via linkbrain.write_audit_event.';

CREATE INDEX IF NOT EXISTS audit_events_tenant_ts
  ON linkbrain.audit_events (tenant_id, ts DESC);

CREATE INDEX IF NOT EXISTS audit_events_tenant_plane_action_ts
  ON linkbrain.audit_events (tenant_id, plane, action, ts DESC);

-- Subject id fast-lookup indexes (jsonb path expressions); only the MVO ids that planes will join on.
CREATE INDEX IF NOT EXISTS audit_events_subject_run
  ON linkbrain.audit_events ((subject ->> 'run_id'))
  WHERE subject ? 'run_id';

CREATE INDEX IF NOT EXISTS audit_events_subject_stage
  ON linkbrain.audit_events ((subject ->> 'stage_id'))
  WHERE subject ? 'stage_id';

CREATE INDEX IF NOT EXISTS audit_events_subject_lease
  ON linkbrain.audit_events ((subject ->> 'lease_id'))
  WHERE subject ? 'lease_id';

CREATE INDEX IF NOT EXISTS audit_events_subject_workflow_run
  ON linkbrain.audit_events ((subject ->> 'workflow_run_id'))
  WHERE subject ? 'workflow_run_id';

-- Append-only enforcement: no UPDATE / DELETE for ordinary roles.
ALTER TABLE linkbrain.audit_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS audit_events_no_update ON linkbrain.audit_events;
DROP POLICY IF EXISTS audit_events_no_delete ON linkbrain.audit_events;
DROP POLICY IF EXISTS audit_events_select_all ON linkbrain.audit_events;
DROP POLICY IF EXISTS audit_events_insert_service ON linkbrain.audit_events;

-- SELECT is allowed for service_role (trace surface joins by id); tenant scoping is enforced at the app layer
-- because MVO planes use the service client. Future work can tighten with auth.uid()-aware policies.
CREATE POLICY audit_events_select_all ON linkbrain.audit_events
  FOR SELECT
  TO service_role
  USING (true);

CREATE POLICY audit_events_insert_service ON linkbrain.audit_events
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- No UPDATE / DELETE policy → denied for everyone (including service_role). Ledger is append-only.

-- Grants: service_role only. Other roles get nothing (per archived linkbrain pattern).
GRANT USAGE ON SCHEMA linkbrain TO service_role;
GRANT SELECT, INSERT ON linkbrain.audit_events TO service_role;
REVOKE UPDATE, DELETE, TRUNCATE ON linkbrain.audit_events FROM PUBLIC, anon, authenticated, service_role;

-- SECURITY DEFINER writer. Validates the envelope and rejects:
--   - missing required fields (event_id, ts, tenant_id, plane, actor, action, subject, schema_version)
--   - unknown plane / actor_kind / schema_version (table CHECKs)
--   - PII in payload (table CHECK + explicit guard below)
--   - empty action / actor_id
-- Returns (event_id, persisted_at). Idempotent on event_id (re-write of same envelope returns prior row).
CREATE OR REPLACE FUNCTION linkbrain.write_audit_event(
  p_event_id uuid,
  p_ts timestamptz,
  p_tenant_id uuid,
  p_plane text,
  p_actor_kind text,
  p_actor_id text,
  p_action text,
  p_subject jsonb,
  p_refs jsonb,
  p_payload jsonb,
  p_schema_version text
)
RETURNS TABLE (event_id uuid, persisted_at timestamptz)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = linkbrain, public
AS $$
DECLARE
  v_subject jsonb := coalesce(p_subject, '{}'::jsonb);
  v_refs jsonb := coalesce(p_refs, '{}'::jsonb);
  v_payload jsonb := coalesce(p_payload, '{}'::jsonb);
BEGIN
  IF p_event_id IS NULL THEN
    RAISE EXCEPTION 'AUDIT_ENVELOPE_INVALID: event_id is required';
  END IF;
  IF p_ts IS NULL THEN
    RAISE EXCEPTION 'AUDIT_ENVELOPE_INVALID: ts is required';
  END IF;
  IF p_tenant_id IS NULL THEN
    RAISE EXCEPTION 'AUDIT_ENVELOPE_INVALID: tenant_id is required';
  END IF;
  IF p_plane IS NULL OR length(trim(p_plane)) = 0 THEN
    RAISE EXCEPTION 'AUDIT_ENVELOPE_INVALID: plane is required';
  END IF;
  IF p_actor_kind IS NULL OR length(trim(p_actor_kind)) = 0 THEN
    RAISE EXCEPTION 'AUDIT_ENVELOPE_INVALID: actor.actor_kind is required';
  END IF;
  IF p_actor_id IS NULL OR length(trim(p_actor_id)) = 0 THEN
    RAISE EXCEPTION 'AUDIT_ENVELOPE_INVALID: actor.actor_id is required';
  END IF;
  IF p_action IS NULL OR length(trim(p_action)) = 0 THEN
    RAISE EXCEPTION 'AUDIT_ENVELOPE_INVALID: action is required';
  END IF;
  IF p_schema_version IS NULL OR p_schema_version <> '1' THEN
    RAISE EXCEPTION 'AUDIT_ENVELOPE_INVALID: schema_version must be "1"';
  END IF;

  -- §3.4 PII guard. Belt-and-suspenders with the table CHECK so callers see a clearer error.
  IF v_payload ? 'email' OR v_payload ? 'phone'
     OR v_payload ? 'contact_email' OR v_payload ? 'contact_phone'
     OR v_payload ? 'contact' THEN
    RAISE EXCEPTION 'AUDIT_ENVELOPE_PII_FORBIDDEN: payload must not include raw contact fields (email/phone/contact); use subject.lead_id';
  END IF;

  INSERT INTO linkbrain.audit_events (
    event_id, ts, tenant_id, plane, actor_kind, actor_id, action,
    subject, refs, payload, schema_version
  ) VALUES (
    p_event_id, p_ts, p_tenant_id, p_plane, p_actor_kind, p_actor_id, p_action,
    v_subject, v_refs, v_payload, p_schema_version
  )
  ON CONFLICT ON CONSTRAINT audit_events_pkey DO NOTHING;

  RETURN QUERY
    SELECT ae.event_id, ae.persisted_at
    FROM linkbrain.audit_events ae
    WHERE ae.event_id = p_event_id;
END;
$$;

REVOKE ALL ON FUNCTION linkbrain.write_audit_event(uuid, timestamptz, uuid, text, text, text, text, jsonb, jsonb, jsonb, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION linkbrain.write_audit_event(uuid, timestamptz, uuid, text, text, text, text, jsonb, jsonb, jsonb, text) TO service_role;

COMMENT ON FUNCTION linkbrain.write_audit_event(uuid, timestamptz, uuid, text, text, text, text, jsonb, jsonb, jsonb, text) IS
  'Canonical brain.audit.write entry point. Validates envelope (§6.3), enforces PII guard (§3.4), and is idempotent on event_id.';
