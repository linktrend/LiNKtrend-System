CREATE SCHEMA IF NOT EXISTS gateway;

-- Bridge metadata only. The Zulip application keeps its own database.
CREATE TABLE gateway.zulip_message_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  zulip_message_id text NOT NULL,
  stream_id bigint,
  topic text,
  mission_id uuid REFERENCES linkaios.missions (id) ON DELETE SET NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (zulip_message_id)
);

CREATE INDEX idx_gateway_mission ON gateway.zulip_message_links (mission_id);

COMMENT ON SCHEMA gateway IS 'Zulip-Gateway mapping from Zulip traffic to mission context.';
