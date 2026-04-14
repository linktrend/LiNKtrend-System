-- Zulip stream → mission mapping for gateway (additive; does not touch auth).

CREATE TABLE IF NOT EXISTS gateway.stream_routing (
  zulip_stream_id bigint PRIMARY KEY,
  mission_id uuid NOT NULL REFERENCES linkaios.missions (id) ON DELETE CASCADE,
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_stream_routing_mission ON gateway.stream_routing (mission_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE gateway.stream_routing TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA gateway GRANT ALL ON TABLES TO anon, authenticated, service_role;

ALTER TABLE gateway.stream_routing ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS gateway_stream_routing_authenticated ON gateway.stream_routing;
CREATE POLICY gateway_stream_routing_authenticated ON gateway.stream_routing FOR ALL TO authenticated USING (true) WITH CHECK (true);

COMMENT ON TABLE gateway.stream_routing IS 'Maps Zulip stream_id to linkaios.missions.id for mission-aware gateway routing.';
