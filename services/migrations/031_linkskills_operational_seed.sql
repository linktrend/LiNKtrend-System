-- Area 5: LinkSkills operational seed — cap.* catalog, lease_registry view, agent skill bindings

INSERT INTO linkskills.capability_catalog (
  capability_id,
  display_name,
  description,
  policy_mode,
  args_schema,
  result_schema,
  tenant_scoped
)
VALUES
  (
    'cap.zulip.run_messaging',
    'Zulip Run Messaging',
    'Run notifications and governed Zulip connectivity probes',
    'auto_grant',
    '{"operation":"string","mode":"mock|shadow|live","run_id":"string?","stage_id":"string?"}'::jsonb,
    '{"status":"string","message_ref":"string?","connectivity":"object?"}'::jsonb,
    true
  ),
  (
    'cap.plane.execution_tracking',
    'Plane Execution Tracking',
    'Plane readiness probes and execution tracking (studio-provided)',
    'auto_grant',
    '{"operation":"string","mode":"mock|shadow|live","execution_scope":"string?"}'::jsonb,
    '{"status":"string","plane_ref":"string?","connectivity":"object?"}'::jsonb,
    true
  )
ON CONFLICT (capability_id) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description,
  policy_mode = EXCLUDED.policy_mode,
  args_schema = EXCLUDED.args_schema,
  result_schema = EXCLUDED.result_schema,
  updated_at = now();

CREATE TABLE IF NOT EXISTS linkskills.agent_skill_bindings (
  binding_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id text NOT NULL,
  skill_id text NOT NULL,
  skill_version text NOT NULL DEFAULT '1.0.0',
  certification_status text NOT NULL DEFAULT 'certified'
    CHECK (certification_status IN ('certified', 'pending', 'revoked')),
  suite_id text NOT NULL DEFAULT 'linksites',
  notes text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (agent_id, skill_id)
);

COMMENT ON TABLE linkskills.agent_skill_bindings IS
  'Certified skill bindings for OpenClaw agents (linksites-builder, linksites-ops, lisa, librarian).';

INSERT INTO linkskills.agent_skill_bindings (agent_id, skill_id, skill_version, certification_status, suite_id, notes)
VALUES
  ('linksites-builder', 'content.generation', '1.0.0', 'certified', 'linksites', 'Website package generation'),
  ('linksites-builder', 'style.planning', '1.0.0', 'certified', 'linksites', 'Template and style planning'),
  ('linksites-builder', 'cap.asset.generation', '1.0.0', 'certified', 'linksites', 'Asset generation capability skill surface'),
  ('linksites-ops', 'linksites.publish', '1.0.0', 'certified', 'linksites', 'Publish and payload sync operations'),
  ('linksites-ops', 'cap.payload.local_sync', '1.0.0', 'certified', 'linksites', 'Payload local sync'),
  ('linksites-ops', 'cap.supabase.mirror_content', '1.0.0', 'certified', 'linksites', 'Supabase mirror writes'),
  ('lisa', 'operator.assistant', '1.0.0', 'certified', 'linksites', 'Principal-facing operator assistant'),
  ('lisa', 'cap.zulip.run_messaging', '1.0.0', 'certified', 'linksites', 'Governed project messaging'),
  ('librarian', 'knowledge.ingest', '1.0.0', 'certified', 'linksites', 'LiNKbrain knowledge loop'),
  ('librarian', 'provenance.review', '1.0.0', 'certified', 'linksites', 'Run provenance and lesson extraction')
ON CONFLICT (agent_id, skill_id) DO UPDATE SET
  certification_status = EXCLUDED.certification_status,
  skill_version = EXCLUDED.skill_version,
  notes = EXCLUDED.notes,
  updated_at = now();

CREATE OR REPLACE VIEW linkskills.lease_registry AS
SELECT
  ll.lease_id,
  ll.capability_id AS capability,
  ll.status,
  ll.tenant_id,
  ll.run_id,
  ll.stage_id,
  ll.requested_at,
  ll.decided_at AS granted_at,
  ll.executed_at,
  ll.expires_at,
  CASE
    WHEN linkskills.is_kill_switch_tripped(ll.capability_id, ll.tenant_id) THEN 'tripped'::text
    ELSE 'open'::text
  END AS kill_switch_state,
  ll.ledger_entry_id,
  ll.audit_event_id
FROM linkskills.lease_ledger ll;

COMMENT ON VIEW linkskills.lease_registry IS
  'Admin/cockpit lease ledger projection (canonical lease_ledger + kill switch state).';

GRANT SELECT ON linkskills.lease_registry TO service_role, authenticated;
GRANT SELECT ON linkskills.agent_skill_bindings TO service_role, authenticated;

ALTER TABLE linkskills.agent_skill_bindings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS agent_skill_bindings_select_all ON linkskills.agent_skill_bindings;
CREATE POLICY agent_skill_bindings_select_all ON linkskills.agent_skill_bindings
  FOR SELECT TO authenticated, service_role USING (true);
