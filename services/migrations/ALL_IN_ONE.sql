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

-- RLS + PRISM sweep table (additive; does not touch auth schema).
CREATE TABLE IF NOT EXISTS prism.swept_sessions (
  worker_session_id uuid PRIMARY KEY REFERENCES bot_runtime.worker_sessions (id) ON DELETE CASCADE,
  swept_at timestamptz NOT NULL DEFAULT now(),
  detail jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_prism_swept_at ON prism.swept_sessions (swept_at DESC);

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE prism.swept_sessions TO anon, authenticated, service_role;

ALTER TABLE linkaios.agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE linkaios.missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE linkaios.manifests ENABLE ROW LEVEL SECURITY;
ALTER TABLE linkaios.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE linkaios.memory_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE linkaios.traces ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS linkaios_agents_authenticated ON linkaios.agents;
CREATE POLICY linkaios_agents_authenticated ON linkaios.agents FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS linkaios_missions_authenticated ON linkaios.missions;
CREATE POLICY linkaios_missions_authenticated ON linkaios.missions FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS linkaios_manifests_authenticated ON linkaios.manifests;
CREATE POLICY linkaios_manifests_authenticated ON linkaios.manifests FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS linkaios_skills_authenticated ON linkaios.skills;
CREATE POLICY linkaios_skills_authenticated ON linkaios.skills FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS linkaios_memory_authenticated ON linkaios.memory_entries;
CREATE POLICY linkaios_memory_authenticated ON linkaios.memory_entries FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS linkaios_traces_authenticated ON linkaios.traces;
CREATE POLICY linkaios_traces_authenticated ON linkaios.traces FOR ALL TO authenticated USING (true) WITH CHECK (true);

ALTER TABLE bot_runtime.worker_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS bot_runtime_sessions_authenticated ON bot_runtime.worker_sessions;
CREATE POLICY bot_runtime_sessions_authenticated ON bot_runtime.worker_sessions FOR ALL TO authenticated USING (true) WITH CHECK (true);

ALTER TABLE prism.cleanup_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE prism.swept_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS prism_cleanup_authenticated ON prism.cleanup_events;
CREATE POLICY prism_cleanup_authenticated ON prism.cleanup_events FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS prism_swept_authenticated ON prism.swept_sessions;
CREATE POLICY prism_swept_authenticated ON prism.swept_sessions FOR ALL TO authenticated USING (true) WITH CHECK (true);

ALTER TABLE gateway.zulip_message_links ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS gateway_links_authenticated ON gateway.zulip_message_links;
CREATE POLICY gateway_links_authenticated ON gateway.zulip_message_links FOR ALL TO authenticated USING (true) WITH CHECK (true);

COMMENT ON TABLE prism.swept_sessions IS 'PRISM acknowledged closed worker sessions (residue sweep bookkeeping).';

-- 009: Zulip stream → mission mapping (run before 010).
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

-- 010: Operator roles + stricter RLS (depends on 009 for stream_routing policies).
CREATE TABLE IF NOT EXISTS linkaios.user_access (
  user_id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('admin', 'operator', 'viewer')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_access_role ON linkaios.user_access (role);

REVOKE ALL ON TABLE linkaios.user_access FROM anon;
REVOKE INSERT, UPDATE, DELETE ON TABLE linkaios.user_access FROM authenticated;
GRANT SELECT ON TABLE linkaios.user_access TO authenticated;
GRANT ALL ON TABLE linkaios.user_access TO service_role;

ALTER TABLE linkaios.user_access ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS linkaios_user_access_select_own ON linkaios.user_access;
CREATE POLICY linkaios_user_access_select_own ON linkaios.user_access FOR SELECT TO authenticated USING (user_id = auth.uid());

COMMENT ON TABLE linkaios.user_access IS 'Optional per-user role. Absence of a row means operator-equivalent access.';

CREATE OR REPLACE FUNCTION linkaios.command_centre_write_allowed()
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT COALESCE(
    (SELECT ua.role FROM linkaios.user_access ua WHERE ua.user_id = auth.uid() LIMIT 1),
    'operator'
  ) IN ('operator', 'admin');
$$;

GRANT EXECUTE ON FUNCTION linkaios.command_centre_write_allowed() TO authenticated;

DROP POLICY IF EXISTS linkaios_agents_authenticated ON linkaios.agents;
CREATE POLICY linkaios_agents_select ON linkaios.agents FOR SELECT TO authenticated USING (true);
CREATE POLICY linkaios_agents_insert ON linkaios.agents FOR INSERT TO authenticated WITH CHECK (linkaios.command_centre_write_allowed());
CREATE POLICY linkaios_agents_update ON linkaios.agents FOR UPDATE TO authenticated USING (linkaios.command_centre_write_allowed()) WITH CHECK (linkaios.command_centre_write_allowed());
CREATE POLICY linkaios_agents_delete ON linkaios.agents FOR DELETE TO authenticated USING (linkaios.command_centre_write_allowed());

DROP POLICY IF EXISTS linkaios_missions_authenticated ON linkaios.missions;
CREATE POLICY linkaios_missions_select ON linkaios.missions FOR SELECT TO authenticated USING (true);
CREATE POLICY linkaios_missions_insert ON linkaios.missions FOR INSERT TO authenticated WITH CHECK (linkaios.command_centre_write_allowed());
CREATE POLICY linkaios_missions_update ON linkaios.missions FOR UPDATE TO authenticated USING (linkaios.command_centre_write_allowed()) WITH CHECK (linkaios.command_centre_write_allowed());
CREATE POLICY linkaios_missions_delete ON linkaios.missions FOR DELETE TO authenticated USING (linkaios.command_centre_write_allowed());

DROP POLICY IF EXISTS linkaios_manifests_authenticated ON linkaios.manifests;
CREATE POLICY linkaios_manifests_select ON linkaios.manifests FOR SELECT TO authenticated USING (true);
CREATE POLICY linkaios_manifests_insert ON linkaios.manifests FOR INSERT TO authenticated WITH CHECK (linkaios.command_centre_write_allowed());
CREATE POLICY linkaios_manifests_update ON linkaios.manifests FOR UPDATE TO authenticated USING (linkaios.command_centre_write_allowed()) WITH CHECK (linkaios.command_centre_write_allowed());
CREATE POLICY linkaios_manifests_delete ON linkaios.manifests FOR DELETE TO authenticated USING (linkaios.command_centre_write_allowed());

DROP POLICY IF EXISTS linkaios_skills_authenticated ON linkaios.skills;
CREATE POLICY linkaios_skills_select ON linkaios.skills FOR SELECT TO authenticated USING (true);
CREATE POLICY linkaios_skills_insert ON linkaios.skills FOR INSERT TO authenticated WITH CHECK (linkaios.command_centre_write_allowed());
CREATE POLICY linkaios_skills_update ON linkaios.skills FOR UPDATE TO authenticated USING (linkaios.command_centre_write_allowed()) WITH CHECK (linkaios.command_centre_write_allowed());
CREATE POLICY linkaios_skills_delete ON linkaios.skills FOR DELETE TO authenticated USING (linkaios.command_centre_write_allowed());

DROP POLICY IF EXISTS linkaios_memory_authenticated ON linkaios.memory_entries;
CREATE POLICY linkaios_memory_select ON linkaios.memory_entries FOR SELECT TO authenticated USING (true);
CREATE POLICY linkaios_memory_insert ON linkaios.memory_entries FOR INSERT TO authenticated WITH CHECK (linkaios.command_centre_write_allowed());
CREATE POLICY linkaios_memory_update ON linkaios.memory_entries FOR UPDATE TO authenticated USING (linkaios.command_centre_write_allowed()) WITH CHECK (linkaios.command_centre_write_allowed());
CREATE POLICY linkaios_memory_delete ON linkaios.memory_entries FOR DELETE TO authenticated USING (linkaios.command_centre_write_allowed());

DROP POLICY IF EXISTS linkaios_traces_authenticated ON linkaios.traces;
CREATE POLICY linkaios_traces_select ON linkaios.traces FOR SELECT TO authenticated USING (true);
CREATE POLICY linkaios_traces_insert ON linkaios.traces FOR INSERT TO authenticated WITH CHECK (linkaios.command_centre_write_allowed());
CREATE POLICY linkaios_traces_update ON linkaios.traces FOR UPDATE TO authenticated USING (linkaios.command_centre_write_allowed()) WITH CHECK (linkaios.command_centre_write_allowed());
CREATE POLICY linkaios_traces_delete ON linkaios.traces FOR DELETE TO authenticated USING (linkaios.command_centre_write_allowed());

DROP POLICY IF EXISTS bot_runtime_sessions_authenticated ON bot_runtime.worker_sessions;
CREATE POLICY bot_runtime_sessions_select ON bot_runtime.worker_sessions FOR SELECT TO authenticated USING (true);
CREATE POLICY bot_runtime_sessions_insert ON bot_runtime.worker_sessions FOR INSERT TO authenticated WITH CHECK (linkaios.command_centre_write_allowed());
CREATE POLICY bot_runtime_sessions_update ON bot_runtime.worker_sessions FOR UPDATE TO authenticated USING (linkaios.command_centre_write_allowed()) WITH CHECK (linkaios.command_centre_write_allowed());
CREATE POLICY bot_runtime_sessions_delete ON bot_runtime.worker_sessions FOR DELETE TO authenticated USING (linkaios.command_centre_write_allowed());

DROP POLICY IF EXISTS prism_cleanup_authenticated ON prism.cleanup_events;
CREATE POLICY prism_cleanup_select ON prism.cleanup_events FOR SELECT TO authenticated USING (true);
CREATE POLICY prism_cleanup_insert ON prism.cleanup_events FOR INSERT TO authenticated WITH CHECK (linkaios.command_centre_write_allowed());
CREATE POLICY prism_cleanup_update ON prism.cleanup_events FOR UPDATE TO authenticated USING (linkaios.command_centre_write_allowed()) WITH CHECK (linkaios.command_centre_write_allowed());
CREATE POLICY prism_cleanup_delete ON prism.cleanup_events FOR DELETE TO authenticated USING (linkaios.command_centre_write_allowed());

DROP POLICY IF EXISTS prism_swept_authenticated ON prism.swept_sessions;
CREATE POLICY prism_swept_select ON prism.swept_sessions FOR SELECT TO authenticated USING (true);
CREATE POLICY prism_swept_insert ON prism.swept_sessions FOR INSERT TO authenticated WITH CHECK (linkaios.command_centre_write_allowed());
CREATE POLICY prism_swept_update ON prism.swept_sessions FOR UPDATE TO authenticated USING (linkaios.command_centre_write_allowed()) WITH CHECK (linkaios.command_centre_write_allowed());
CREATE POLICY prism_swept_delete ON prism.swept_sessions FOR DELETE TO authenticated USING (linkaios.command_centre_write_allowed());

DROP POLICY IF EXISTS gateway_links_authenticated ON gateway.zulip_message_links;
CREATE POLICY gateway_links_select ON gateway.zulip_message_links FOR SELECT TO authenticated USING (true);
CREATE POLICY gateway_links_insert ON gateway.zulip_message_links FOR INSERT TO authenticated WITH CHECK (linkaios.command_centre_write_allowed());
CREATE POLICY gateway_links_update ON gateway.zulip_message_links FOR UPDATE TO authenticated USING (linkaios.command_centre_write_allowed()) WITH CHECK (linkaios.command_centre_write_allowed());
CREATE POLICY gateway_links_delete ON gateway.zulip_message_links FOR DELETE TO authenticated USING (linkaios.command_centre_write_allowed());

DROP POLICY IF EXISTS gateway_stream_routing_authenticated ON gateway.stream_routing;
CREATE POLICY gateway_stream_routing_select ON gateway.stream_routing FOR SELECT TO authenticated USING (true);
CREATE POLICY gateway_stream_routing_insert ON gateway.stream_routing FOR INSERT TO authenticated WITH CHECK (linkaios.command_centre_write_allowed());
CREATE POLICY gateway_stream_routing_update ON gateway.stream_routing FOR UPDATE TO authenticated USING (linkaios.command_centre_write_allowed()) WITH CHECK (linkaios.command_centre_write_allowed());
CREATE POLICY gateway_stream_routing_delete ON gateway.stream_routing FOR DELETE TO authenticated USING (linkaios.command_centre_write_allowed());
