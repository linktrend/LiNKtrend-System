CREATE SCHEMA IF NOT EXISTS prism;

CREATE TABLE prism.cleanup_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_session_id uuid,
  action text NOT NULL,
  path_pattern text,
  detail jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_prism_cleanup_session ON prism.cleanup_events (worker_session_id);

COMMENT ON SCHEMA prism IS 'PRISM-Defender cleanup and containment telemetry.';
