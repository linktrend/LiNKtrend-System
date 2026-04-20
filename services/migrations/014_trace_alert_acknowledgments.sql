-- Persistent operator acknowledgement of trace-derived work alerts (LiNKaios Alerts inbox).
-- Keeps linkaios.traces immutable while recording dismiss/resolve state per operator.

CREATE TABLE IF NOT EXISTS linkaios.trace_alert_acknowledgments (
  trace_id uuid PRIMARY KEY REFERENCES linkaios.traces (id) ON DELETE CASCADE,
  resolved_at timestamptz NOT NULL DEFAULT now(),
  resolved_by uuid REFERENCES auth.users (id) ON DELETE SET NULL
);

COMMENT ON TABLE linkaios.trace_alert_acknowledgments IS
  'Operator-resolved alerts tied to trace rows; supports resolved_at and optional resolver (auth user).';

CREATE INDEX IF NOT EXISTS idx_trace_alert_ack_resolved_at ON linkaios.trace_alert_acknowledgments (resolved_at DESC);

REVOKE ALL ON TABLE linkaios.trace_alert_acknowledgments FROM anon;
GRANT SELECT, INSERT, DELETE ON linkaios.trace_alert_acknowledgments TO authenticated;
GRANT ALL ON TABLE linkaios.trace_alert_acknowledgments TO service_role;

ALTER TABLE linkaios.trace_alert_acknowledgments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS trace_alert_ack_select ON linkaios.trace_alert_acknowledgments;
CREATE POLICY trace_alert_ack_select ON linkaios.trace_alert_acknowledgments FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS trace_alert_ack_insert ON linkaios.trace_alert_acknowledgments;
CREATE POLICY trace_alert_ack_insert ON linkaios.trace_alert_acknowledgments FOR INSERT TO authenticated WITH CHECK (linkaios.command_centre_write_allowed());

DROP POLICY IF EXISTS trace_alert_ack_delete ON linkaios.trace_alert_acknowledgments;
CREATE POLICY trace_alert_ack_delete ON linkaios.trace_alert_acknowledgments FOR DELETE TO authenticated USING (linkaios.command_centre_write_allowed());
