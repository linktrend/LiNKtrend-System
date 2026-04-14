CREATE SCHEMA IF NOT EXISTS bot_runtime;

CREATE TABLE bot_runtime.worker_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id uuid NOT NULL REFERENCES linkaios.agents (id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'starting' CHECK (
    status IN ('starting', 'running', 'stopping', 'stopped', 'failed')
  ),
  last_heartbeat timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  started_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz
);

CREATE INDEX idx_worker_sessions_agent ON bot_runtime.worker_sessions (agent_id);
CREATE INDEX idx_worker_sessions_status ON bot_runtime.worker_sessions (status);

COMMENT ON SCHEMA bot_runtime IS 'LiNKbot / bot-runtime session and heartbeat data (not OpenClaw engine internals).';
