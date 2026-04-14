-- Additive migration: does NOT touch auth.* or auth.users.
-- Row Level Security: only JWT role "authenticated" can read/write product schemas via PostgREST.
-- service_role (workers, server-side secrets) bypasses RLS in Supabase.

CREATE TABLE IF NOT EXISTS prism.swept_sessions (
  worker_session_id uuid PRIMARY KEY REFERENCES bot_runtime.worker_sessions (id) ON DELETE CASCADE,
  swept_at timestamptz NOT NULL DEFAULT now(),
  detail jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_prism_swept_at ON prism.swept_sessions (swept_at DESC);

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE prism.swept_sessions TO anon, authenticated, service_role;

-- linkaios
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

-- bot_runtime
ALTER TABLE bot_runtime.worker_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS bot_runtime_sessions_authenticated ON bot_runtime.worker_sessions;
CREATE POLICY bot_runtime_sessions_authenticated ON bot_runtime.worker_sessions FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- prism
ALTER TABLE prism.cleanup_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE prism.swept_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS prism_cleanup_authenticated ON prism.cleanup_events;
CREATE POLICY prism_cleanup_authenticated ON prism.cleanup_events FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS prism_swept_authenticated ON prism.swept_sessions;
CREATE POLICY prism_swept_authenticated ON prism.swept_sessions FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- gateway
ALTER TABLE gateway.zulip_message_links ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS gateway_links_authenticated ON gateway.zulip_message_links;
CREATE POLICY gateway_links_authenticated ON gateway.zulip_message_links FOR ALL TO authenticated USING (true) WITH CHECK (true);

COMMENT ON TABLE prism.swept_sessions IS 'PRISM acknowledged closed worker sessions (residue sweep bookkeeping).';
