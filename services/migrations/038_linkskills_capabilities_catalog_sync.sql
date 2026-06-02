-- Sync cap.* rows from capability_catalog (024) into capabilities (030) for idempotency FK.

INSERT INTO linkskills.capabilities (
  capability_id,
  target_software,
  allowed_operations,
  mode_flags,
  lease_requirements,
  idempotency_rules,
  audit_events,
  allowed_callers
)
SELECT
  cc.capability_id,
  CASE
    WHEN cc.capability_id LIKE 'cap.zulip.%' THEN 'zulip'
    WHEN cc.capability_id LIKE 'cap.plane.%' THEN 'plane'
    WHEN cc.capability_id LIKE 'cap.payload.%' THEN 'payload'
    WHEN cc.capability_id LIKE 'cap.crm.%' THEN 'odoo'
    ELSE 'external'
  END,
  '["connectivity.probe","readiness.probe","run.notify","channel.message.mock_send"]'::jsonb,
  ARRAY['mock', 'shadow', 'live']::text[],
  ARRAY['lease_required']::text[],
  '24h',
  ARRAY['lease.requested', 'lease.executed']::text[],
  ARRAY['linkaios', 'linkbot', 'plugin']::text[]
FROM linkskills.capability_catalog cc
WHERE cc.capability_id LIKE 'cap.%'
ON CONFLICT (capability_id) DO UPDATE SET
  target_software = EXCLUDED.target_software,
  mode_flags = EXCLUDED.mode_flags,
  updated_at = now();
