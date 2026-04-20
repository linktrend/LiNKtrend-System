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
  runtime_settings jsonb NOT NULL DEFAULT '{}'::jsonb,
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
  project_head_user_id uuid REFERENCES auth.users (id) ON DELETE SET NULL,
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

CREATE TABLE linkaios.integration_secrets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  label text NOT NULL,
  provider text NOT NULL DEFAULT 'other',
  secret_value text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT integration_secrets_provider_check CHECK (
    provider IN ('openai', 'anthropic', 'google', 'zulip', 'gateway', 'other')
  )
);

CREATE INDEX idx_integration_secrets_provider ON linkaios.integration_secrets (provider);

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
CREATE INDEX idx_prism_cleanup_action_created ON prism.cleanup_events (action, created_at DESC);

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

REVOKE ALL ON TABLE linkaios.integration_secrets FROM PUBLIC;
REVOKE ALL ON TABLE linkaios.integration_secrets FROM anon;
REVOKE ALL ON TABLE linkaios.integration_secrets FROM authenticated;
GRANT ALL ON TABLE linkaios.integration_secrets TO service_role;

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
ALTER TABLE linkaios.integration_secrets ENABLE ROW LEVEL SECURITY;

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

-- 014 LiNKbrain virtual file layer + 015 org/legal entity (same as 014 + 015 incremental migrations)
CREATE TABLE linkaios.brain_legal_entities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO linkaios.brain_legal_entities (id, code, name)
VALUES (
  '00000000-0000-4000-8000-000000000001'::uuid,
  'default',
  'Default legal entity'
)
ON CONFLICT (code) DO NOTHING;

CREATE TABLE linkaios.brain_virtual_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  logical_path text NOT NULL,
  scope text NOT NULL,
  mission_id uuid REFERENCES linkaios.missions (id) ON DELETE CASCADE,
  agent_id uuid REFERENCES linkaios.agents (id) ON DELETE CASCADE,
  legal_entity_id uuid NOT NULL DEFAULT '00000000-0000-4000-8000-000000000001'::uuid
    REFERENCES linkaios.brain_legal_entities (id) ON DELETE RESTRICT,
  sensitivity text NOT NULL DEFAULT 'internal'
    CHECK (sensitivity IN ('public', 'internal', 'confidential', 'restricted')),
  file_kind text NOT NULL DEFAULT 'standard'
    CHECK (file_kind IN ('standard', 'daily_log', 'upload', 'librarian', 'quick_note')),
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT brain_virtual_files_scope_check CHECK (
    scope IN ('company', 'mission', 'agent')
    AND (
      (scope = 'company' AND mission_id IS NULL AND agent_id IS NULL)
      OR (scope = 'mission' AND mission_id IS NOT NULL AND agent_id IS NULL)
      OR (scope = 'agent' AND agent_id IS NOT NULL AND mission_id IS NULL)
    )
  )
);

COMMENT ON COLUMN linkaios.brain_virtual_files.legal_entity_id IS 'Mandatory subsidiary / holding entity for compliance boundaries.';
COMMENT ON COLUMN linkaios.brain_virtual_files.sensitivity IS 'Document classification; not the same as org tree.';
COMMENT ON COLUMN linkaios.brain_virtual_files.file_kind IS 'Normative editability: daily_log is append-only via dedicated APIs in product rules.';

CREATE UNIQUE INDEX brain_virtual_files_company_path ON linkaios.brain_virtual_files (logical_path)
  WHERE scope = 'company';

CREATE UNIQUE INDEX brain_virtual_files_mission_path ON linkaios.brain_virtual_files (mission_id, logical_path)
  WHERE scope = 'mission';

CREATE UNIQUE INDEX brain_virtual_files_agent_path ON linkaios.brain_virtual_files (agent_id, logical_path)
  WHERE scope = 'agent';

CREATE INDEX brain_virtual_files_scope_mission ON linkaios.brain_virtual_files (scope, mission_id);
CREATE INDEX brain_virtual_files_scope_agent ON linkaios.brain_virtual_files (scope, agent_id);
CREATE INDEX brain_virtual_files_legal_entity ON linkaios.brain_virtual_files (legal_entity_id);

CREATE TABLE linkaios.brain_file_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  file_id uuid NOT NULL REFERENCES linkaios.brain_virtual_files (id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  body text NOT NULL DEFAULT '',
  predecessor_version_id uuid REFERENCES linkaios.brain_file_versions (id) ON DELETE SET NULL,
  created_by uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  published_at timestamptz
);

CREATE UNIQUE INDEX brain_file_versions_one_published_per_file
  ON linkaios.brain_file_versions (file_id)
  WHERE status = 'published';

CREATE INDEX brain_file_versions_file_status ON linkaios.brain_file_versions (file_id, status, created_at DESC);

CREATE TABLE linkaios.brain_chunks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  version_id uuid NOT NULL REFERENCES linkaios.brain_file_versions (id) ON DELETE CASCADE,
  ordinal int NOT NULL,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (version_id, ordinal)
);

CREATE INDEX brain_chunks_version ON linkaios.brain_chunks (version_id, ordinal);

CREATE TABLE linkaios.brain_chunk_embeddings (
  chunk_id uuid PRIMARY KEY REFERENCES linkaios.brain_chunks (id) ON DELETE CASCADE,
  model text NOT NULL,
  dimensions int NOT NULL CHECK (dimensions > 0 AND dimensions <= 4096),
  embedding float8[] NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT brain_chunk_embeddings_len CHECK (cardinality(embedding) = dimensions)
);

CREATE TABLE linkaios.brain_index_cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  file_id uuid NOT NULL REFERENCES linkaios.brain_virtual_files (id) ON DELETE CASCADE,
  version_id uuid REFERENCES linkaios.brain_file_versions (id) ON DELETE CASCADE,
  card_key text NOT NULL,
  title text NOT NULL,
  summary text NOT NULL DEFAULT '',
  primary_chunk_id uuid REFERENCES linkaios.brain_chunks (id) ON DELETE SET NULL,
  ordinal int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (file_id, card_key)
);

CREATE INDEX brain_index_cards_file ON linkaios.brain_index_cards (file_id, ordinal);

CREATE TABLE linkaios.brain_daily_log_lines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id uuid NOT NULL REFERENCES linkaios.agents (id) ON DELETE CASCADE,
  log_date date NOT NULL,
  sequence_no int NOT NULL,
  content text NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (agent_id, log_date, sequence_no)
);

CREATE INDEX brain_daily_log_lines_agent_date ON linkaios.brain_daily_log_lines (agent_id, log_date, sequence_no);

-- 015: company org structure + document tags (M2M)
CREATE TABLE linkaios.brain_org_nodes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dimension text NOT NULL,
  label text NOT NULL,
  parent_id uuid REFERENCES linkaios.brain_org_nodes (id) ON DELETE SET NULL,
  valid_from date NOT NULL DEFAULT (CURRENT_DATE),
  valid_to date,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT brain_org_nodes_valid_range CHECK (valid_to IS NULL OR valid_to >= valid_from)
);

CREATE INDEX brain_org_nodes_dimension ON linkaios.brain_org_nodes (dimension, sort_order, label);
CREATE INDEX brain_org_nodes_parent ON linkaios.brain_org_nodes (parent_id);

COMMENT ON TABLE linkaios.brain_org_nodes IS 'Company organisational nodes for discovery tags (M2M to brain files); primary anchor remains scope+mission/agent.';

CREATE TABLE linkaios.brain_virtual_file_org_tags (
  file_id uuid NOT NULL REFERENCES linkaios.brain_virtual_files (id) ON DELETE CASCADE,
  org_node_id uuid NOT NULL REFERENCES linkaios.brain_org_nodes (id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (file_id, org_node_id)
);

CREATE INDEX brain_vf_org_tags_node ON linkaios.brain_virtual_file_org_tags (org_node_id);

ALTER TABLE linkaios.brain_legal_entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE linkaios.brain_org_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE linkaios.brain_virtual_file_org_tags ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON linkaios.brain_legal_entities TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON linkaios.brain_legal_entities TO service_role;
GRANT INSERT, UPDATE, DELETE ON linkaios.brain_legal_entities TO authenticated;

CREATE POLICY brain_legal_entities_select ON linkaios.brain_legal_entities FOR SELECT TO authenticated USING (true);
CREATE POLICY brain_legal_entities_write ON linkaios.brain_legal_entities FOR INSERT TO authenticated WITH CHECK (linkaios.command_centre_write_allowed());
CREATE POLICY brain_legal_entities_update ON linkaios.brain_legal_entities FOR UPDATE TO authenticated USING (linkaios.command_centre_write_allowed()) WITH CHECK (linkaios.command_centre_write_allowed());
CREATE POLICY brain_legal_entities_delete ON linkaios.brain_legal_entities FOR DELETE TO authenticated USING (linkaios.command_centre_write_allowed());

GRANT SELECT ON linkaios.brain_org_nodes TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON linkaios.brain_org_nodes TO service_role;
GRANT INSERT, UPDATE, DELETE ON linkaios.brain_org_nodes TO authenticated;

CREATE POLICY brain_org_nodes_select ON linkaios.brain_org_nodes FOR SELECT TO authenticated USING (true);
CREATE POLICY brain_org_nodes_write ON linkaios.brain_org_nodes FOR INSERT TO authenticated WITH CHECK (linkaios.command_centre_write_allowed());
CREATE POLICY brain_org_nodes_update ON linkaios.brain_org_nodes FOR UPDATE TO authenticated USING (linkaios.command_centre_write_allowed()) WITH CHECK (linkaios.command_centre_write_allowed());
CREATE POLICY brain_org_nodes_delete ON linkaios.brain_org_nodes FOR DELETE TO authenticated USING (linkaios.command_centre_write_allowed());

GRANT SELECT ON linkaios.brain_virtual_file_org_tags TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON linkaios.brain_virtual_file_org_tags TO service_role;
GRANT INSERT, UPDATE, DELETE ON linkaios.brain_virtual_file_org_tags TO authenticated;

CREATE POLICY brain_vf_org_tags_select ON linkaios.brain_virtual_file_org_tags FOR SELECT TO authenticated USING (true);
CREATE POLICY brain_vf_org_tags_write ON linkaios.brain_virtual_file_org_tags FOR INSERT TO authenticated WITH CHECK (linkaios.command_centre_write_allowed());
CREATE POLICY brain_vf_org_tags_update ON linkaios.brain_virtual_file_org_tags FOR UPDATE TO authenticated USING (linkaios.command_centre_write_allowed()) WITH CHECK (linkaios.command_centre_write_allowed());
CREATE POLICY brain_vf_org_tags_delete ON linkaios.brain_virtual_file_org_tags FOR DELETE TO authenticated USING (linkaios.command_centre_write_allowed());

ALTER TABLE linkaios.brain_virtual_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE linkaios.brain_file_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE linkaios.brain_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE linkaios.brain_chunk_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE linkaios.brain_index_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE linkaios.brain_daily_log_lines ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON linkaios.brain_virtual_files TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON linkaios.brain_file_versions TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON linkaios.brain_chunks TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON linkaios.brain_chunk_embeddings TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON linkaios.brain_index_cards TO service_role;
GRANT SELECT, INSERT, DELETE ON linkaios.brain_daily_log_lines TO service_role;

GRANT SELECT ON linkaios.brain_virtual_files TO authenticated;
GRANT SELECT ON linkaios.brain_file_versions TO authenticated;
GRANT SELECT ON linkaios.brain_chunks TO authenticated;
GRANT SELECT ON linkaios.brain_chunk_embeddings TO authenticated;
GRANT SELECT ON linkaios.brain_index_cards TO authenticated;
GRANT SELECT ON linkaios.brain_daily_log_lines TO authenticated;

GRANT INSERT, UPDATE, DELETE ON linkaios.brain_virtual_files TO authenticated;
GRANT INSERT, UPDATE, DELETE ON linkaios.brain_file_versions TO authenticated;
GRANT INSERT, UPDATE, DELETE ON linkaios.brain_chunks TO authenticated;
GRANT INSERT, UPDATE, DELETE ON linkaios.brain_chunk_embeddings TO authenticated;
GRANT INSERT, UPDATE, DELETE ON linkaios.brain_index_cards TO authenticated;

CREATE POLICY brain_virtual_files_select ON linkaios.brain_virtual_files FOR SELECT TO authenticated USING (true);
CREATE POLICY brain_virtual_files_write ON linkaios.brain_virtual_files FOR INSERT TO authenticated WITH CHECK (linkaios.command_centre_write_allowed());
CREATE POLICY brain_virtual_files_update ON linkaios.brain_virtual_files FOR UPDATE TO authenticated USING (linkaios.command_centre_write_allowed()) WITH CHECK (linkaios.command_centre_write_allowed());
CREATE POLICY brain_virtual_files_delete ON linkaios.brain_virtual_files FOR DELETE TO authenticated USING (linkaios.command_centre_write_allowed());

CREATE POLICY brain_file_versions_select ON linkaios.brain_file_versions FOR SELECT TO authenticated USING (true);
CREATE POLICY brain_file_versions_insert ON linkaios.brain_file_versions FOR INSERT TO authenticated WITH CHECK (linkaios.command_centre_write_allowed());
CREATE POLICY brain_file_versions_update ON linkaios.brain_file_versions FOR UPDATE TO authenticated USING (linkaios.command_centre_write_allowed()) WITH CHECK (linkaios.command_centre_write_allowed());
CREATE POLICY brain_file_versions_delete ON linkaios.brain_file_versions FOR DELETE TO authenticated USING (linkaios.command_centre_write_allowed());

CREATE POLICY brain_chunks_select ON linkaios.brain_chunks FOR SELECT TO authenticated USING (true);
CREATE POLICY brain_chunks_write ON linkaios.brain_chunks FOR INSERT TO authenticated WITH CHECK (linkaios.command_centre_write_allowed());
CREATE POLICY brain_chunks_update ON linkaios.brain_chunks FOR UPDATE TO authenticated USING (linkaios.command_centre_write_allowed()) WITH CHECK (linkaios.command_centre_write_allowed());
CREATE POLICY brain_chunks_delete ON linkaios.brain_chunks FOR DELETE TO authenticated USING (linkaios.command_centre_write_allowed());

CREATE POLICY brain_chunk_embeddings_select ON linkaios.brain_chunk_embeddings FOR SELECT TO authenticated USING (true);
CREATE POLICY brain_chunk_embeddings_write ON linkaios.brain_chunk_embeddings FOR INSERT TO authenticated WITH CHECK (linkaios.command_centre_write_allowed());
CREATE POLICY brain_chunk_embeddings_update ON linkaios.brain_chunk_embeddings FOR UPDATE TO authenticated USING (linkaios.command_centre_write_allowed()) WITH CHECK (linkaios.command_centre_write_allowed());
CREATE POLICY brain_chunk_embeddings_delete ON linkaios.brain_chunk_embeddings FOR DELETE TO authenticated USING (linkaios.command_centre_write_allowed());

CREATE POLICY brain_index_cards_select ON linkaios.brain_index_cards FOR SELECT TO authenticated USING (true);
CREATE POLICY brain_index_cards_write ON linkaios.brain_index_cards FOR INSERT TO authenticated WITH CHECK (linkaios.command_centre_write_allowed());
CREATE POLICY brain_index_cards_update ON linkaios.brain_index_cards FOR UPDATE TO authenticated USING (linkaios.command_centre_write_allowed()) WITH CHECK (linkaios.command_centre_write_allowed());
CREATE POLICY brain_index_cards_delete ON linkaios.brain_index_cards FOR DELETE TO authenticated USING (linkaios.command_centre_write_allowed());

CREATE POLICY brain_daily_log_lines_select ON linkaios.brain_daily_log_lines FOR SELECT TO authenticated USING (true);

-- 016 uploads + embed job state + operator daily-log append (same as services/migrations/016_linkbrain_uploads_embed_jobs.sql)
CREATE TABLE linkaios.brain_upload_objects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  file_id uuid NOT NULL REFERENCES linkaios.brain_virtual_files (id) ON DELETE CASCADE,
  bucket text NOT NULL DEFAULT 'brain-uploads',
  object_path text NOT NULL,
  byte_size bigint NOT NULL CHECK (byte_size >= 0),
  mime_type text NOT NULL,
  sha256 text,
  virus_scan_status text NOT NULL DEFAULT 'skipped'
    CHECK (virus_scan_status IN ('pending', 'skipped', 'passed', 'failed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (bucket, object_path)
);

CREATE INDEX brain_upload_objects_file ON linkaios.brain_upload_objects (file_id);

COMMENT ON TABLE linkaios.brain_upload_objects IS 'Supabase Storage object tied to a virtual file (file_kind upload); metadata only.';

CREATE TABLE linkaios.brain_embed_jobs (
  version_id uuid PRIMARY KEY REFERENCES linkaios.brain_file_versions (id) ON DELETE CASCADE,
  state text NOT NULL DEFAULT 'pending' CHECK (state IN ('pending', 'processing', 'done', 'failed')),
  last_error text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX brain_embed_jobs_state ON linkaios.brain_embed_jobs (state, updated_at DESC);

COMMENT ON TABLE linkaios.brain_embed_jobs IS 'Published version embedding pipeline state for operators and idempotent workers.';

ALTER TABLE linkaios.brain_upload_objects ENABLE ROW LEVEL SECURITY;
ALTER TABLE linkaios.brain_embed_jobs ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON linkaios.brain_upload_objects TO service_role;
GRANT SELECT ON linkaios.brain_upload_objects TO authenticated;
GRANT INSERT, UPDATE, DELETE ON linkaios.brain_upload_objects TO authenticated;

CREATE POLICY brain_upload_objects_select ON linkaios.brain_upload_objects FOR SELECT TO authenticated USING (true);
CREATE POLICY brain_upload_objects_write ON linkaios.brain_upload_objects FOR INSERT TO authenticated WITH CHECK (linkaios.command_centre_write_allowed());
CREATE POLICY brain_upload_objects_update ON linkaios.brain_upload_objects FOR UPDATE TO authenticated USING (linkaios.command_centre_write_allowed()) WITH CHECK (linkaios.command_centre_write_allowed());
CREATE POLICY brain_upload_objects_delete ON linkaios.brain_upload_objects FOR DELETE TO authenticated USING (linkaios.command_centre_write_allowed());

GRANT SELECT, INSERT, UPDATE, DELETE ON linkaios.brain_embed_jobs TO service_role;
GRANT SELECT ON linkaios.brain_embed_jobs TO authenticated;
GRANT INSERT, UPDATE, DELETE ON linkaios.brain_embed_jobs TO authenticated;

CREATE POLICY brain_embed_jobs_select ON linkaios.brain_embed_jobs FOR SELECT TO authenticated USING (true);
CREATE POLICY brain_embed_jobs_write ON linkaios.brain_embed_jobs FOR INSERT TO authenticated WITH CHECK (linkaios.command_centre_write_allowed());
CREATE POLICY brain_embed_jobs_update ON linkaios.brain_embed_jobs FOR UPDATE TO authenticated USING (linkaios.command_centre_write_allowed()) WITH CHECK (linkaios.command_centre_write_allowed());
CREATE POLICY brain_embed_jobs_delete ON linkaios.brain_embed_jobs FOR DELETE TO authenticated USING (linkaios.command_centre_write_allowed());

GRANT INSERT ON linkaios.brain_daily_log_lines TO authenticated;

CREATE POLICY brain_daily_log_lines_insert ON linkaios.brain_daily_log_lines FOR INSERT TO authenticated
  WITH CHECK (linkaios.command_centre_write_allowed());

-- 017 Supabase Storage bucket for uploads (same as services/migrations/017_storage_brain_uploads_bucket.sql)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'storage') THEN
    INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    VALUES (
      'brain-uploads',
      'brain-uploads',
      false,
      26214400,
      ARRAY[
        'application/pdf',
        'image/png',
        'image/jpeg',
        'image/webp',
        'text/plain',
        'text/markdown'
      ]::text[]
    )
    ON CONFLICT (id) DO UPDATE SET
      file_size_limit = EXCLUDED.file_size_limit,
      allowed_mime_types = EXCLUDED.allowed_mime_types;

    IF NOT EXISTS (
      SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'brain_uploads_service_all'
    ) THEN
      CREATE POLICY brain_uploads_service_all ON storage.objects
        FOR ALL TO service_role
        USING (bucket_id = 'brain-uploads')
        WITH CHECK (bucket_id = 'brain-uploads');
    END IF;
  END IF;
END $$;

-- 011 tools registry + 018 tool governance (incremental parity)
-- LiNKskills tools registry: governed capabilities (bundles, HTTP, registry refs, plugins, MCP).

CREATE TABLE linkaios.tools (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  version int NOT NULL DEFAULT 1,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'approved', 'archived')),
  tool_type text NOT NULL CHECK (
    tool_type IN (
      'executable_bundle',
      'http',
      'registry_reference',
      'plugin',
      'mcp_server'
    )
  ),
  category text NOT NULL DEFAULT 'General',
  description text NOT NULL DEFAULT '',
  implementation jsonb NOT NULL DEFAULT '{}'::jsonb,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (name)
);

CREATE INDEX idx_tools_status ON linkaios.tools (status);
CREATE INDEX idx_tools_type ON linkaios.tools (tool_type);
CREATE INDEX idx_tools_updated ON linkaios.tools (updated_at DESC);

COMMENT ON TABLE linkaios.tools IS 'Command-plane tool registry: lifecycle, publish/runtime flags (metadata.linkaios_admin), type-specific implementation JSON.';

ALTER TABLE linkaios.tools ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS linkaios_tools_select ON linkaios.tools;
DROP POLICY IF EXISTS linkaios_tools_insert ON linkaios.tools;
DROP POLICY IF EXISTS linkaios_tools_update ON linkaios.tools;
DROP POLICY IF EXISTS linkaios_tools_delete ON linkaios.tools;

CREATE POLICY linkaios_tools_select ON linkaios.tools FOR SELECT TO authenticated USING (true);
CREATE POLICY linkaios_tools_insert ON linkaios.tools FOR INSERT TO authenticated WITH CHECK (linkaios.command_centre_write_allowed());
CREATE POLICY linkaios_tools_update ON linkaios.tools FOR UPDATE TO authenticated USING (linkaios.command_centre_write_allowed()) WITH CHECK (linkaios.command_centre_write_allowed());
CREATE POLICY linkaios_tools_delete ON linkaios.tools FOR DELETE TO authenticated USING (linkaios.command_centre_write_allowed());

INSERT INTO linkaios.tools (name, version, status, tool_type, category, description, implementation, metadata)
SELECT 'http-fetch',
       1,
       'approved',
       'http',
       'Network',
       'Signed outbound HTTP with allow-listed hosts.',
       '{"base_url":"https://api.example.com","notes":"demo"}'::jsonb,
       '{"linkaios_admin":{"published":true,"runtime_enabled":true}}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM linkaios.tools t WHERE t.name = 'http-fetch');

INSERT INTO linkaios.tools (name, version, status, tool_type, category, description, implementation, metadata)
SELECT 'workspace-read',
       1,
       'approved',
       'executable_bundle',
       'Filesystem',
       'Read-only workspace paths under policy roots.',
       '{"artifact_uri":"s3://artifacts/tools/workspace-read/1.tgz","checksum_sha256":null}'::jsonb,
       '{"linkaios_admin":{"published":true,"runtime_enabled":false}}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM linkaios.tools t WHERE t.name = 'workspace-read');

INSERT INTO linkaios.tools (name, version, status, tool_type, category, description, implementation, metadata)
SELECT 'restricted-shell',
       1,
       'draft',
       'executable_bundle',
       'Execution',
       'Ephemeral shell with syscall filter (draft).',
       '{"artifact_uri":"","notes":"not published"}'::jsonb,
       '{"linkaios_admin":{"published":false,"runtime_enabled":false}}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM linkaios.tools t WHERE t.name = 'restricted-shell');

CREATE TABLE IF NOT EXISTS linkaios.org_tool_allowlist (
  tool_id uuid NOT NULL PRIMARY KEY REFERENCES linkaios.tools (id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS linkaios.org_missionless_default_tools (
  tool_id uuid NOT NULL PRIMARY KEY REFERENCES linkaios.tools (id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS linkaios.mission_tools (
  mission_id uuid NOT NULL REFERENCES linkaios.missions (id) ON DELETE CASCADE,
  tool_id uuid NOT NULL REFERENCES linkaios.tools (id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (mission_id, tool_id)
);

CREATE INDEX IF NOT EXISTS idx_mission_tools_mission ON linkaios.mission_tools (mission_id);
CREATE INDEX IF NOT EXISTS idx_mission_tools_tool ON linkaios.mission_tools (tool_id);

CREATE TABLE IF NOT EXISTS linkaios.tool_governance_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  request_type text NOT NULL CHECK (
    request_type IN (
      'mission_binding_add',
      'mission_binding_remove',
      'org_allowlist_add',
      'org_allowlist_remove',
      'org_missionless_add',
      'org_missionless_remove',
      'runtime_blocked'
    )
  ),
  mission_id uuid REFERENCES linkaios.missions (id) ON DELETE CASCADE,
  tool_id uuid NOT NULL REFERENCES linkaios.tools (id) ON DELETE CASCADE,
  requested_by uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  correlation_id text,
  org_admin_approved_by uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  org_admin_approved_at timestamptz,
  project_head_approved_by uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  project_head_approved_at timestamptz,
  rejected_by uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  rejected_at timestamptz,
  reject_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT tool_gov_mission_required CHECK (
    (request_type IN ('mission_binding_add', 'mission_binding_remove') AND mission_id IS NOT NULL)
    OR (request_type NOT IN ('mission_binding_add', 'mission_binding_remove'))
  )
);

CREATE INDEX IF NOT EXISTS idx_tool_gov_status ON linkaios.tool_governance_requests (status);
CREATE INDEX IF NOT EXISTS idx_tool_gov_mission_status ON linkaios.tool_governance_requests (mission_id, status);
CREATE INDEX IF NOT EXISTS idx_tool_gov_correlation ON linkaios.tool_governance_requests (correlation_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_tool_gov_pending_dedupe
  ON linkaios.tool_governance_requests (
    correlation_id,
    tool_id,
    COALESCE(mission_id, '00000000-0000-0000-0000-000000000000'::uuid),
    request_type
  )
  WHERE status = 'pending' AND correlation_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_traces_event_type ON linkaios.traces (event_type);

COMMENT ON TABLE linkaios.org_tool_allowlist IS 'Org-wide allowed catalog tools (deny-by-default outside this set).';
COMMENT ON TABLE linkaios.org_missionless_default_tools IS 'Default mission-less tool names subset; intersected with org allowlist in SDK.';
COMMENT ON TABLE linkaios.mission_tools IS 'Authoritative per-mission tool bindings; manifest approvedTools is denormalized from here.';
COMMENT ON TABLE linkaios.tool_governance_requests IS 'Pending/approved/rejected tool policy changes; dual approval for mission bindings.';

-- Helper predicates (SECURITY INVOKER; used in policies and RPCs)
CREATE OR REPLACE FUNCTION linkaios.is_org_admin()
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT COALESCE(
    (SELECT ua.role FROM linkaios.user_access ua WHERE ua.user_id = auth.uid() LIMIT 1),
    'operator'
  ) = 'admin';
$$;

CREATE OR REPLACE FUNCTION linkaios.is_mission_project_head(p_mission_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM linkaios.missions m
    WHERE m.id = p_mission_id
      AND m.project_head_user_id IS NOT NULL
      AND m.project_head_user_id = auth.uid()
  );
$$;

GRANT EXECUTE ON FUNCTION linkaios.is_org_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION linkaios.is_mission_project_head(uuid) TO authenticated;

-- Sync latest manifest payload.approvedTools from mission_tools (denormalized mirror)
CREATE OR REPLACE FUNCTION linkaios.sync_mission_manifest_tools(p_mission_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = linkaios, public
AS $$
DECLARE
  mid uuid;
  names jsonb;
BEGIN
  SELECT COALESCE(
    (
      SELECT jsonb_agg(sub.n)
      FROM (
        SELECT t.name AS n
        FROM linkaios.mission_tools mt
        JOIN linkaios.tools t ON t.id = mt.tool_id
        WHERE mt.mission_id = p_mission_id
        ORDER BY t.name
      ) AS sub
    ),
    '[]'::jsonb
  )
  INTO names;

  SELECT m.id
  INTO mid
  FROM linkaios.manifests m
  WHERE m.mission_id = p_mission_id
  ORDER BY m.version DESC
  LIMIT 1;

  IF mid IS NULL THEN
    RETURN;
  END IF;

  UPDATE linkaios.manifests mf
  SET
    payload = jsonb_set(COALESCE(mf.payload, '{}'::jsonb), '{approvedTools}', COALESCE(names, '[]'::jsonb), true),
    created_at = mf.created_at
  WHERE mf.id = mid;
END;
$$;

REVOKE ALL ON FUNCTION linkaios.sync_mission_manifest_tools(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION linkaios.sync_mission_manifest_tools(uuid) TO service_role;

CREATE OR REPLACE FUNCTION linkaios.tool_governance_emit_trace(
  p_event_type text,
  p_mission_id uuid,
  p_payload jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = linkaios, public
AS $$
BEGIN
  INSERT INTO linkaios.traces (mission_id, event_type, payload)
  VALUES (p_mission_id, p_event_type, COALESCE(p_payload, '{}'::jsonb));
END;
$$;

REVOKE ALL ON FUNCTION linkaios.tool_governance_emit_trace(text, uuid, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION linkaios.tool_governance_emit_trace(text, uuid, jsonb) TO service_role;
GRANT EXECUTE ON FUNCTION linkaios.tool_governance_emit_trace(text, uuid, jsonb) TO authenticated;

CREATE OR REPLACE FUNCTION linkaios.tool_governance_approve(p_request_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = linkaios, public
AS $$
DECLARE
  r linkaios.tool_governance_requests%ROWTYPE;
  tname text;
  need_org boolean := false;
  need_ph boolean := false;
  both_done boolean := false;
  actor uuid := auth.uid();
  is_adm boolean;
  is_ph boolean;
  progressed boolean := false;
BEGIN
  IF actor IS NULL THEN
    RAISE EXCEPTION 'not_authenticated';
  END IF;

  SELECT * INTO r FROM linkaios.tool_governance_requests WHERE id = p_request_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'request_not_found';
  END IF;
  IF r.status <> 'pending' THEN
    RAISE EXCEPTION 'request_not_pending';
  END IF;

  SELECT t.name INTO tname FROM linkaios.tools t WHERE t.id = r.tool_id;

  is_adm := linkaios.is_org_admin();
  is_ph := r.mission_id IS NOT NULL AND linkaios.is_mission_project_head(r.mission_id);

  IF r.request_type IN ('mission_binding_add', 'mission_binding_remove') THEN
    need_org := true;
    need_ph := true;
  ELSIF r.request_type = 'runtime_blocked' THEN
    need_org := true;
    need_ph := (r.mission_id IS NOT NULL);
  ELSIF r.request_type IN ('org_allowlist_add', 'org_allowlist_remove', 'org_missionless_add', 'org_missionless_remove') THEN
    need_org := true;
    need_ph := false;
  ELSE
    RAISE EXCEPTION 'unsupported_request_type';
  END IF;

  -- Either approval order: fill whichever required slot the actor is allowed to fill.
  IF need_org AND r.org_admin_approved_by IS NULL AND is_adm THEN
    UPDATE linkaios.tool_governance_requests
    SET
      org_admin_approved_by = actor,
      org_admin_approved_at = now(),
      updated_at = now()
    WHERE id = p_request_id;
    progressed := true;
  END IF;

  SELECT * INTO r FROM linkaios.tool_governance_requests WHERE id = p_request_id;

  IF need_ph AND r.project_head_approved_by IS NULL AND is_ph THEN
    UPDATE linkaios.tool_governance_requests
    SET
      project_head_approved_by = actor,
      project_head_approved_at = now(),
      updated_at = now()
    WHERE id = p_request_id;
    progressed := true;
  END IF;

  IF NOT progressed THEN
    RAISE EXCEPTION 'nothing_to_approve_or_not_authorized';
  END IF;

  SELECT * INTO r FROM linkaios.tool_governance_requests WHERE id = p_request_id;

  both_done :=
    (NOT need_org OR r.org_admin_approved_by IS NOT NULL)
    AND (NOT need_ph OR r.project_head_approved_by IS NOT NULL);

  IF both_done THEN
    IF r.request_type = 'mission_binding_add' OR (r.request_type = 'runtime_blocked' AND r.mission_id IS NOT NULL) THEN
      INSERT INTO linkaios.mission_tools (mission_id, tool_id)
      VALUES (r.mission_id, r.tool_id)
      ON CONFLICT DO NOTHING;
      PERFORM linkaios.sync_mission_manifest_tools(r.mission_id);
      INSERT INTO linkaios.traces (mission_id, event_type, payload)
      VALUES (
        r.mission_id,
        'tool.binding.added',
        jsonb_build_object(
          'tool_name', tname,
          'tool_id', r.tool_id,
          'mission_id', r.mission_id,
          'request_id', r.id,
          'correlation_id', r.correlation_id,
          'actor_user_id', actor
        )
      );
    ELSIF r.request_type = 'runtime_blocked' AND r.mission_id IS NULL THEN
      INSERT INTO linkaios.org_tool_allowlist (tool_id) VALUES (r.tool_id) ON CONFLICT DO NOTHING;
      INSERT INTO linkaios.traces (mission_id, event_type, payload)
      VALUES (
        NULL,
        'tool.binding.added',
        jsonb_build_object(
          'tool_name', tname,
          'tool_id', r.tool_id,
          'mission_id', NULL,
          'request_id', r.id,
          'correlation_id', r.correlation_id,
          'scope', 'org_allowlist',
          'actor_user_id', actor
        )
      );
    ELSIF r.request_type = 'mission_binding_remove' THEN
      DELETE FROM linkaios.mission_tools mt
      WHERE mt.mission_id = r.mission_id AND mt.tool_id = r.tool_id;
      PERFORM linkaios.sync_mission_manifest_tools(r.mission_id);
      INSERT INTO linkaios.traces (mission_id, event_type, payload)
      VALUES (
        r.mission_id,
        'tool.binding.removed',
        jsonb_build_object(
          'tool_name', tname,
          'tool_id', r.tool_id,
          'mission_id', r.mission_id,
          'request_id', r.id,
          'actor_user_id', actor
        )
      );
    ELSIF r.request_type = 'org_allowlist_add' THEN
      INSERT INTO linkaios.org_tool_allowlist (tool_id) VALUES (r.tool_id) ON CONFLICT DO NOTHING;
    ELSIF r.request_type = 'org_allowlist_remove' THEN
      DELETE FROM linkaios.org_missionless_default_tools WHERE tool_id = r.tool_id;
      DELETE FROM linkaios.org_tool_allowlist WHERE tool_id = r.tool_id;
    ELSIF r.request_type = 'org_missionless_add' THEN
      INSERT INTO linkaios.org_missionless_default_tools (tool_id) VALUES (r.tool_id) ON CONFLICT DO NOTHING;
    ELSIF r.request_type = 'org_missionless_remove' THEN
      DELETE FROM linkaios.org_missionless_default_tools WHERE tool_id = r.tool_id;
    END IF;

    UPDATE linkaios.tool_governance_requests
    SET status = 'approved', updated_at = now()
    WHERE id = p_request_id;

    INSERT INTO linkaios.traces (mission_id, event_type, payload)
    VALUES (
      r.mission_id,
      'tool.request.approved',
      jsonb_build_object(
        'tool_name', tname,
        'tool_id', r.tool_id,
        'mission_id', r.mission_id,
        'request_id', r.id,
        'request_type', r.request_type,
        'correlation_id', r.correlation_id,
        'actor_user_id', actor,
        'org_admin_approved_by', r.org_admin_approved_by,
        'project_head_approved_by', r.project_head_approved_by
      )
    );
  ELSE
    INSERT INTO linkaios.traces (mission_id, event_type, payload)
    VALUES (
      r.mission_id,
      'tool.request.approved',
      jsonb_build_object(
        'phase', 'partial',
        'tool_name', tname,
        'tool_id', r.tool_id,
        'mission_id', r.mission_id,
        'request_id', r.id,
        'request_type', r.request_type,
        'actor_user_id', actor
      )
    );
  END IF;

  RETURN jsonb_build_object('ok', true, 'request_id', p_request_id, 'finalized', both_done);
END;
$$;

REVOKE ALL ON FUNCTION linkaios.tool_governance_approve(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION linkaios.tool_governance_approve(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION linkaios.tool_governance_reject(p_request_id uuid, p_reason text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = linkaios, public
AS $$
DECLARE
  r linkaios.tool_governance_requests%ROWTYPE;
  tname text;
  actor uuid := auth.uid();
  can_rej boolean;
BEGIN
  IF actor IS NULL THEN
    RAISE EXCEPTION 'not_authenticated';
  END IF;

  SELECT * INTO r FROM linkaios.tool_governance_requests WHERE id = p_request_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'request_not_found';
  END IF;
  IF r.status <> 'pending' THEN
    RAISE EXCEPTION 'request_not_pending';
  END IF;

  SELECT t.name INTO tname FROM linkaios.tools t WHERE t.id = r.tool_id;

  can_rej :=
    linkaios.is_org_admin()
    OR (r.mission_id IS NOT NULL AND linkaios.is_mission_project_head(r.mission_id));

  IF NOT can_rej THEN
    RAISE EXCEPTION 'not_authorized_to_reject';
  END IF;

  UPDATE linkaios.tool_governance_requests
  SET
    status = 'rejected',
    rejected_by = actor,
    rejected_at = now(),
    reject_reason = NULLIF(trim(p_reason), ''),
    updated_at = now()
  WHERE id = p_request_id;

  INSERT INTO linkaios.traces (mission_id, event_type, payload)
  VALUES (
    r.mission_id,
    'tool.request.rejected',
    jsonb_build_object(
      'tool_name', tname,
      'tool_id', r.tool_id,
      'mission_id', r.mission_id,
      'request_id', r.id,
      'request_type', r.request_type,
      'correlation_id', r.correlation_id,
      'actor_user_id', actor,
      'reject_reason', NULLIF(trim(p_reason), '')
    )
  );

  RETURN jsonb_build_object('ok', true, 'request_id', p_request_id);
END;
$$;

REVOKE ALL ON FUNCTION linkaios.tool_governance_reject(uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION linkaios.tool_governance_reject(uuid, text) TO authenticated;

-- RLS
ALTER TABLE linkaios.org_tool_allowlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE linkaios.org_missionless_default_tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE linkaios.mission_tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE linkaios.tool_governance_requests ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE linkaios.org_tool_allowlist FROM anon;
REVOKE ALL ON TABLE linkaios.org_missionless_default_tools FROM anon;
REVOKE ALL ON TABLE linkaios.mission_tools FROM anon;
REVOKE ALL ON TABLE linkaios.tool_governance_requests FROM anon;

GRANT SELECT, INSERT, DELETE ON TABLE linkaios.org_tool_allowlist TO authenticated;
GRANT SELECT, INSERT, DELETE ON TABLE linkaios.org_missionless_default_tools TO authenticated;
GRANT SELECT ON TABLE linkaios.mission_tools TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE linkaios.tool_governance_requests TO authenticated;

GRANT ALL ON TABLE linkaios.org_tool_allowlist TO service_role;
GRANT ALL ON TABLE linkaios.org_missionless_default_tools TO service_role;
GRANT ALL ON TABLE linkaios.mission_tools TO service_role;
GRANT ALL ON TABLE linkaios.tool_governance_requests TO service_role;

DROP POLICY IF EXISTS org_tool_allowlist_select ON linkaios.org_tool_allowlist;
DROP POLICY IF EXISTS org_tool_allowlist_write ON linkaios.org_tool_allowlist;
DROP POLICY IF EXISTS org_tool_allowlist_delete ON linkaios.org_tool_allowlist;
DROP POLICY IF EXISTS org_missionless_select ON linkaios.org_missionless_default_tools;
DROP POLICY IF EXISTS org_missionless_write ON linkaios.org_missionless_default_tools;
DROP POLICY IF EXISTS org_missionless_delete ON linkaios.org_missionless_default_tools;
DROP POLICY IF EXISTS mission_tools_select ON linkaios.mission_tools;
DROP POLICY IF EXISTS mission_tools_write ON linkaios.mission_tools;
DROP POLICY IF EXISTS tool_gov_req_select ON linkaios.tool_governance_requests;
DROP POLICY IF EXISTS tool_gov_req_insert ON linkaios.tool_governance_requests;
DROP POLICY IF EXISTS tool_gov_req_update ON linkaios.tool_governance_requests;
DROP POLICY IF EXISTS tool_gov_req_delete ON linkaios.tool_governance_requests;

CREATE POLICY org_tool_allowlist_select ON linkaios.org_tool_allowlist FOR SELECT TO authenticated USING (true);
CREATE POLICY org_tool_allowlist_write ON linkaios.org_tool_allowlist FOR INSERT TO authenticated WITH CHECK (linkaios.command_centre_write_allowed() AND linkaios.is_org_admin());
CREATE POLICY org_tool_allowlist_delete ON linkaios.org_tool_allowlist FOR DELETE TO authenticated USING (linkaios.command_centre_write_allowed() AND linkaios.is_org_admin());

CREATE POLICY org_missionless_select ON linkaios.org_missionless_default_tools FOR SELECT TO authenticated USING (true);
CREATE POLICY org_missionless_write ON linkaios.org_missionless_default_tools FOR INSERT TO authenticated WITH CHECK (linkaios.command_centre_write_allowed() AND linkaios.is_org_admin());
CREATE POLICY org_missionless_delete ON linkaios.org_missionless_default_tools FOR DELETE TO authenticated USING (linkaios.command_centre_write_allowed() AND linkaios.is_org_admin());

CREATE POLICY mission_tools_select ON linkaios.mission_tools FOR SELECT TO authenticated USING (true);

CREATE POLICY tool_gov_req_select ON linkaios.tool_governance_requests FOR SELECT TO authenticated USING (true);
CREATE POLICY tool_gov_req_insert ON linkaios.tool_governance_requests FOR INSERT TO authenticated WITH CHECK (linkaios.command_centre_write_allowed());
CREATE POLICY tool_gov_req_update ON linkaios.tool_governance_requests FOR UPDATE TO authenticated USING (linkaios.command_centre_write_allowed()) WITH CHECK (linkaios.command_centre_write_allowed());
CREATE POLICY tool_gov_req_delete ON linkaios.tool_governance_requests FOR DELETE TO authenticated USING (linkaios.command_centre_write_allowed());

-- Backfill mission_tools from latest manifest per mission
WITH latest AS (
  SELECT DISTINCT ON (m.mission_id) m.mission_id, m.payload
  FROM linkaios.manifests m
  ORDER BY m.mission_id, m.version DESC
),
names AS (
  SELECT
    l.mission_id,
    elem AS tool_name
  FROM latest l
  CROSS JOIN LATERAL jsonb_array_elements_text(
    CASE
      WHEN jsonb_typeof(l.payload -> 'approvedTools') = 'array' THEN l.payload -> 'approvedTools'
      WHEN jsonb_typeof(l.payload -> 'approvedTools') = 'object'
        AND jsonb_typeof(l.payload -> 'approvedTools' -> 'toolNames') = 'array'
        THEN l.payload -> 'approvedTools' -> 'toolNames'
      WHEN jsonb_typeof(l.payload -> 'approved_tool_names') = 'array' THEN l.payload -> 'approved_tool_names'
      ELSE '[]'::jsonb
    END
  ) AS elem
)
INSERT INTO linkaios.mission_tools (mission_id, tool_id)
SELECT n.mission_id, t.id
FROM names n
JOIN linkaios.tools t ON t.name = n.tool_name
WHERE n.tool_name IS NOT NULL AND n.tool_name <> ''
ON CONFLICT DO NOTHING;

-- Seed org allowlist: all approved catalog tools (preserve pre-governance behaviour)
INSERT INTO linkaios.org_tool_allowlist (tool_id)
SELECT id FROM linkaios.tools WHERE status = 'approved'
ON CONFLICT DO NOTHING;

INSERT INTO linkaios.org_missionless_default_tools (tool_id)
SELECT id FROM linkaios.tools WHERE status = 'approved'
ON CONFLICT DO NOTHING;

-- Denormalize manifests from mission_tools
DO $$
DECLARE
  rec record;
BEGIN
  FOR rec IN SELECT DISTINCT mission_id FROM linkaios.mission_tools LOOP
    PERFORM linkaios.sync_mission_manifest_tools(rec.mission_id);
  END LOOP;
END $$;

-- 014_trace_alert_acknowledgments.sql (operator alert resolve state; mirrors incremental migration file)
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
