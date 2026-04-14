-- LiNKtrend service schemas reset (safe: does not touch auth, storage, or extensions).
-- Run after backup if you ever have data you care about.

DROP SCHEMA IF EXISTS gateway CASCADE;
DROP SCHEMA IF EXISTS prism CASCADE;
DROP SCHEMA IF EXISTS bot_runtime CASCADE;
DROP SCHEMA IF EXISTS linkaios CASCADE;
-- Central governance domain: identities, missions, LiNKskills, LiNKbrain memory, traces.
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE SCHEMA IF NOT EXISTS linkaios;

CREATE TABLE linkaios.agents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  display_name text NOT NULL,
  status text NOT NULL DEFAULT 'inactive' CHECK (status IN ('active', 'inactive', 'retired')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE linkaios.missions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  status text NOT NULL DEFAULT 'draft' CHECK (
    status IN ('draft', 'assigned', 'running', 'completed', 'failed', 'cancelled')
  ),
  primary_agent_id uuid REFERENCES linkaios.agents (id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE linkaios.manifests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id uuid NOT NULL REFERENCES linkaios.missions (id) ON DELETE CASCADE,
  version int NOT NULL DEFAULT 1,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE linkaios.skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  version int NOT NULL DEFAULT 1,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'approved', 'deprecated')),
  body_markdown text NOT NULL DEFAULT '',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (name, version)
);

CREATE TABLE linkaios.memory_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id uuid REFERENCES linkaios.missions (id) ON DELETE CASCADE,
  classification text NOT NULL DEFAULT 'working',
  body text NOT NULL DEFAULT '',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE linkaios.traces (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id uuid REFERENCES linkaios.missions (id) ON DELETE SET NULL,
  event_type text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_missions_status ON linkaios.missions (status);
CREATE INDEX idx_skills_name_status ON linkaios.skills (name, status);
CREATE INDEX idx_memory_mission ON linkaios.memory_entries (mission_id);
CREATE INDEX idx_traces_mission ON linkaios.traces (mission_id);

COMMENT ON SCHEMA linkaios IS 'LiNKaios command-plane records: agents, missions, skills, memory, traces.';
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
-- Optional demo seed.
INSERT INTO linkaios.agents (id, display_name, status)
SELECT gen_random_uuid(), 'Demo agent', 'active'
WHERE NOT EXISTS (SELECT 1 FROM linkaios.agents WHERE display_name = 'Demo agent');

INSERT INTO linkaios.skills (name, version, status, body_markdown, metadata)
SELECT 'bootstrap',
       1,
       'approved',
       '# Bootstrap skill\nThis row exists so LiNKlogic can resolve a real skill.',
       '{}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM linkaios.skills WHERE name = 'bootstrap' AND version = 1);
-- PostgREST / Data API access for custom schemas (see Supabase docs: Using custom schemas).
-- Also add linkaios, bot_runtime, prism, gateway to "Exposed schemas" in Dashboard → Settings → API.

GRANT USAGE ON SCHEMA linkaios TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA linkaios TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA linkaios TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA linkaios TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA linkaios GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA linkaios GRANT ALL ON ROUTINES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA linkaios GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;

GRANT USAGE ON SCHEMA bot_runtime TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA bot_runtime TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA bot_runtime TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA bot_runtime TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA bot_runtime GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA bot_runtime GRANT ALL ON ROUTINES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA bot_runtime GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;

GRANT USAGE ON SCHEMA prism TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA prism TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA prism TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA prism TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA prism GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA prism GRANT ALL ON ROUTINES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA prism GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;

GRANT USAGE ON SCHEMA gateway TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA gateway TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA gateway TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA gateway TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA gateway GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA gateway GRANT ALL ON ROUTINES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA gateway GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
