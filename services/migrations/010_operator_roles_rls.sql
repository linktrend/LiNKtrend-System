-- Operator roles + stricter RLS. Default: no row in user_access => treated as operator (same as before).
-- Explicit viewer row => read-only on command-plane tables (no INSERT/UPDATE/DELETE except SELECT).

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

-- linkaios: replace broad policies with read-all / write-operators+admins

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

-- bot_runtime

DROP POLICY IF EXISTS bot_runtime_sessions_authenticated ON bot_runtime.worker_sessions;
CREATE POLICY bot_runtime_sessions_select ON bot_runtime.worker_sessions FOR SELECT TO authenticated USING (true);
CREATE POLICY bot_runtime_sessions_insert ON bot_runtime.worker_sessions FOR INSERT TO authenticated WITH CHECK (linkaios.command_centre_write_allowed());
CREATE POLICY bot_runtime_sessions_update ON bot_runtime.worker_sessions FOR UPDATE TO authenticated USING (linkaios.command_centre_write_allowed()) WITH CHECK (linkaios.command_centre_write_allowed());
CREATE POLICY bot_runtime_sessions_delete ON bot_runtime.worker_sessions FOR DELETE TO authenticated USING (linkaios.command_centre_write_allowed());

-- prism

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

-- gateway

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
