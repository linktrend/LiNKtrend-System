-- WP-047: LinkSites v2 capability catalog entries (connector-only, safe-mode-first)
-- Adds capability IDs from CONTRACTS_MVO.md §0.A.5.1 without enabling live writes.

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
    'cap.crm.odoo_shadow',
    'CRM Odoo Shadow',
    'Mock/status updates and Odoo readiness probes through governed leases',
    'require_approval',
    '{"lead_id":"string","target_status":"string?","mode":"mock|shadow|live"}'::jsonb,
    '{"status":"string","lead_id":"string","updated":"boolean"}'::jsonb,
    true
  ),
  (
    'cap.payload.local_sync',
    'Payload Local Sync',
    'Upsert local Payload content and preview sync status via governed leases',
    'require_approval',
    '{"site_id":"string","site_generation_run_id":"string","mode":"mock|shadow|live"}'::jsonb,
    '{"payload_sync_ref":"string","status":"string"}'::jsonb,
    true
  ),
  (
    'cap.supabase.mirror_content',
    'Supabase Mirror Content',
    'Upsert Supabase mirror content and asset refs via governed leases',
    'require_approval',
    '{"site_id":"string","site_generation_run_id":"string","mode":"mock|shadow|live"}'::jsonb,
    '{"mirror_write_ref":"string","status":"string"}'::jsonb,
    true
  ),
  (
    'cap.zulip.run_messaging',
    'Zulip Run Messaging',
    'Run notifications and channel messaging through governed leases',
    'require_approval',
    '{"run_id":"string","message_purpose":"string","mode":"mock|shadow|live"}'::jsonb,
    '{"message_ref":"string","status":"string"}'::jsonb,
    true
  ),
  (
    'cap.research.public_web',
    'Public Web Research',
    'Read-only web research with citation/provenance capture',
    'require_approval',
    '{"query":"string","provider":"string?","mode":"mock|shadow|live"}'::jsonb,
    '{"citations":"array","status":"string"}'::jsonb,
    true
  ),
  (
    'cap.asset.generation',
    'Asset Generation',
    'Generate image/video assets with provenance metadata under lease governance',
    'require_approval',
    '{"site_id":"string","asset_kind":"image|video","prompt":"string","mode":"mock|shadow|live"}'::jsonb,
    '{"asset_ref":"string","status":"string"}'::jsonb,
    true
  ),
  (
    'cap.plane.execution_tracking',
    'Plane Execution Tracking',
    'Ensure project/task execution tracking records under governed leases',
    'require_approval',
    '{"execution_scope":"string","normalized_title":"string?","mode":"mock|shadow|live"}'::jsonb,
    '{"project_ref":"string?","task_ref":"string?","status":"string"}'::jsonb,
    true
  )
ON CONFLICT (capability_id) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description,
  policy_mode = EXCLUDED.policy_mode,
  args_schema = EXCLUDED.args_schema,
  result_schema = EXCLUDED.result_schema,
  tenant_scoped = EXCLUDED.tenant_scoped,
  updated_at = now();
