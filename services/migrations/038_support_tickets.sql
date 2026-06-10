-- Support tickets queue — canonical store for Customer Service (Chatwoot sync via cap.chatwoot.customer_support).
-- Apply with other pending migrations; UI runs in shadow mode until this batch is applied and connector is live.

BEGIN;

CREATE TABLE IF NOT EXISTS linkaios.support_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid,
  licensee_id text NOT NULL,
  company_id text,
  brand_id text,
  subject text NOT NULL,
  description text NOT NULL DEFAULT '',
  page_path text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved')),
  priority text NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high')),
  source text NOT NULL DEFAULT 'manual' CHECK (
    source IN ('page_help', 'settings', 'manual', 'chatwoot_sync')
  ),
  requested_by text NOT NULL DEFAULT '',
  external_ref text,
  ai_attempt_summary text,
  assigned_operator_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_support_tickets_licensee ON linkaios.support_tickets (licensee_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON linkaios.support_tickets (status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_created ON linkaios.support_tickets (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_support_tickets_tenant ON linkaios.support_tickets (tenant_id) WHERE tenant_id IS NOT NULL;

COMMENT ON TABLE linkaios.support_tickets IS
  'Licensee support tickets — unified Customer Service queue; Chatwoot conversation id in external_ref when live.';
COMMENT ON COLUMN linkaios.support_tickets.tenant_id IS
  'Licensee tenant uuid when resolved; required for RLS when multi-tenant enforcement is enabled.';
COMMENT ON COLUMN linkaios.support_tickets.external_ref IS
  'Chatwoot conversation id after cap.chatwoot.customer_support sync.';

ALTER TABLE linkaios.support_tickets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS linkaios_support_tickets_select ON linkaios.support_tickets;
DROP POLICY IF EXISTS linkaios_support_tickets_insert ON linkaios.support_tickets;
DROP POLICY IF EXISTS linkaios_support_tickets_update ON linkaios.support_tickets;

CREATE POLICY linkaios_support_tickets_select ON linkaios.support_tickets
  FOR SELECT TO authenticated USING (true);

-- Licensee Help/Settings intake: any signed-in user may open a ticket; status changes stay operator-gated.
CREATE POLICY linkaios_support_tickets_insert ON linkaios.support_tickets
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY linkaios_support_tickets_update ON linkaios.support_tickets
  FOR UPDATE TO authenticated
  USING (linkaios.command_centre_write_allowed())
  WITH CHECK (linkaios.command_centre_write_allowed());

COMMIT;
