-- Wave 4: Mission → Project terminology (linkaios schema).
-- Safe additive migration: renames canonical table/columns/functions; legacy views/wrappers remain.
-- Does NOT touch auth. Gateway schema keeps mission_id column names (FK targets linkaios.projects).
-- ALL_IN_ONE.sql must be merged manually — see services/migrations/README.md.

BEGIN;

-- ---------------------------------------------------------------------------
-- 1. Rename linkaios.missions → linkaios.projects
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  IF to_regclass('linkaios.missions') IS NOT NULL
     AND to_regclass('linkaios.projects') IS NULL THEN
    ALTER TABLE linkaios.missions RENAME TO projects;
  END IF;
END $$;

COMMENT ON TABLE linkaios.projects IS
  'Tenant projects (formerly linkaios.missions). Canonical LiNKaios work container.';
COMMENT ON SCHEMA linkaios IS
  'LiNKaios command-plane records: agents, projects, skills, memory, traces.';

-- ---------------------------------------------------------------------------
-- 2. Rename mission_id → project_id on linkaios tables
-- ---------------------------------------------------------------------------
DO $$
DECLARE
  tbl text;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    'manifests',
    'memory_entries',
    'traces',
    'brain_virtual_files',
    'mission_tools',
    'tool_governance_requests'
  ] LOOP
    IF EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'linkaios'
        AND table_name = tbl
        AND column_name = 'mission_id'
    )
    AND NOT EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'linkaios'
        AND table_name = tbl
        AND column_name = 'project_id'
    ) THEN
      EXECUTE format('ALTER TABLE linkaios.%I RENAME COLUMN mission_id TO project_id', tbl);
    END IF;
  END LOOP;
END $$;

-- ---------------------------------------------------------------------------
-- 3. Refresh constraints and indexes that reference mission_id
-- ---------------------------------------------------------------------------
ALTER TABLE linkaios.brain_virtual_files
  DROP CONSTRAINT IF EXISTS brain_virtual_files_scope_check;

ALTER TABLE linkaios.brain_virtual_files
  ADD CONSTRAINT brain_virtual_files_scope_check CHECK (
    scope IN ('company', 'mission', 'project', 'agent')
    AND (
      (scope = 'company' AND project_id IS NULL AND agent_id IS NULL)
      OR (scope IN ('mission', 'project') AND project_id IS NOT NULL AND agent_id IS NULL)
      OR (scope = 'agent' AND agent_id IS NOT NULL AND project_id IS NULL)
    )
  );

ALTER TABLE linkaios.tool_governance_requests
  DROP CONSTRAINT IF EXISTS tool_gov_mission_required;

ALTER TABLE linkaios.tool_governance_requests
  DROP CONSTRAINT IF EXISTS tool_gov_project_required;

ALTER TABLE linkaios.tool_governance_requests
  ADD CONSTRAINT tool_gov_project_required CHECK (
    (
      request_type IN ('mission_binding_add', 'mission_binding_remove')
      AND project_id IS NOT NULL
    )
    OR (request_type NOT IN ('mission_binding_add', 'mission_binding_remove'))
  );

DO $$
BEGIN
  IF to_regclass('linkaios.idx_missions_status') IS NOT NULL
     AND to_regclass('linkaios.idx_projects_status') IS NULL THEN
    ALTER INDEX linkaios.idx_missions_status RENAME TO idx_projects_status;
  END IF;

  IF to_regclass('linkaios.idx_memory_mission') IS NOT NULL
     AND to_regclass('linkaios.idx_memory_project') IS NULL THEN
    ALTER INDEX linkaios.idx_memory_mission RENAME TO idx_memory_project;
  END IF;

  IF to_regclass('linkaios.idx_traces_mission') IS NOT NULL
     AND to_regclass('linkaios.idx_traces_project') IS NULL THEN
    ALTER INDEX linkaios.idx_traces_mission RENAME TO idx_traces_project;
  END IF;

  IF to_regclass('linkaios.idx_mission_tools_mission') IS NOT NULL
     AND to_regclass('linkaios.idx_project_tools_project') IS NULL THEN
    ALTER INDEX linkaios.idx_mission_tools_mission RENAME TO idx_project_tools_project;
  END IF;

  IF to_regclass('linkaios.idx_tool_gov_mission_status') IS NOT NULL
     AND to_regclass('linkaios.idx_tool_gov_project_status') IS NULL THEN
    ALTER INDEX linkaios.idx_tool_gov_mission_status RENAME TO idx_tool_gov_project_status;
  END IF;
END $$;

DROP INDEX IF EXISTS linkaios.brain_virtual_files_mission_path;
CREATE UNIQUE INDEX IF NOT EXISTS brain_virtual_files_project_path
  ON linkaios.brain_virtual_files (project_id, logical_path)
  WHERE scope IN ('mission', 'project');

DROP INDEX IF EXISTS linkaios.brain_virtual_files_scope_mission;
CREATE INDEX IF NOT EXISTS brain_virtual_files_scope_project
  ON linkaios.brain_virtual_files (scope, project_id);

DROP INDEX IF EXISTS linkaios.idx_tool_gov_pending_dedupe;
CREATE UNIQUE INDEX IF NOT EXISTS idx_tool_gov_pending_dedupe
  ON linkaios.tool_governance_requests (
    correlation_id,
    tool_id,
    COALESCE(project_id, '00000000-0000-0000-0000-000000000000'::uuid),
    request_type
  )
  WHERE status = 'pending' AND correlation_id IS NOT NULL;

-- ---------------------------------------------------------------------------
-- 4. RLS policies: rename mission policies on projects table
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  IF to_regclass('linkaios.projects') IS NOT NULL THEN
    DROP POLICY IF EXISTS linkaios_missions_authenticated ON linkaios.projects;
    DROP POLICY IF EXISTS linkaios_missions_select ON linkaios.projects;
    DROP POLICY IF EXISTS linkaios_missions_insert ON linkaios.projects;
    DROP POLICY IF EXISTS linkaios_missions_update ON linkaios.projects;
    DROP POLICY IF EXISTS linkaios_missions_delete ON linkaios.projects;

    DROP POLICY IF EXISTS linkaios_projects_select ON linkaios.projects;
    DROP POLICY IF EXISTS linkaios_projects_insert ON linkaios.projects;
    DROP POLICY IF EXISTS linkaios_projects_update ON linkaios.projects;
    DROP POLICY IF EXISTS linkaios_projects_delete ON linkaios.projects;

    CREATE POLICY linkaios_projects_select ON linkaios.projects
      FOR SELECT TO authenticated USING (true);
    CREATE POLICY linkaios_projects_insert ON linkaios.projects
      FOR INSERT TO authenticated WITH CHECK (linkaios.command_centre_write_allowed());
    CREATE POLICY linkaios_projects_update ON linkaios.projects
      FOR UPDATE TO authenticated
      USING (linkaios.command_centre_write_allowed())
      WITH CHECK (linkaios.command_centre_write_allowed());
    CREATE POLICY linkaios_projects_delete ON linkaios.projects
      FOR DELETE TO authenticated USING (linkaios.command_centre_write_allowed());
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- 5. Canonical functions (project terminology)
-- ---------------------------------------------------------------------------
-- Postgres cannot rename function parameters via CREATE OR REPLACE.
DROP FUNCTION IF EXISTS linkaios.tool_governance_emit_trace(text, uuid, jsonb);

CREATE OR REPLACE FUNCTION linkaios.is_project_head(p_project_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM linkaios.projects p
    WHERE p.id = p_project_id
      AND p.project_head_user_id IS NOT NULL
      AND p.project_head_user_id = auth.uid()
  );
$$;

GRANT EXECUTE ON FUNCTION linkaios.is_project_head(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION linkaios.sync_project_manifest_tools(p_project_id uuid)
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
        WHERE mt.project_id = p_project_id
        ORDER BY t.name
      ) AS sub
    ),
    '[]'::jsonb
  )
  INTO names;

  SELECT m.id
  INTO mid
  FROM linkaios.manifests m
  WHERE m.project_id = p_project_id
  ORDER BY m.version DESC
  LIMIT 1;

  IF mid IS NULL THEN
    RETURN;
  END IF;

  UPDATE linkaios.manifests mf
  SET
    payload = jsonb_set(
      COALESCE(mf.payload, '{}'::jsonb),
      '{approvedTools}',
      COALESCE(names, '[]'::jsonb),
      true
    ),
    created_at = mf.created_at
  WHERE mf.id = mid;
END;
$$;

REVOKE ALL ON FUNCTION linkaios.sync_project_manifest_tools(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION linkaios.sync_project_manifest_tools(uuid) TO service_role;

CREATE OR REPLACE FUNCTION linkaios.tool_governance_emit_trace(
  p_event_type text,
  p_project_id uuid,
  p_payload jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = linkaios, public
AS $$
BEGIN
  INSERT INTO linkaios.traces (project_id, event_type, payload)
  VALUES (p_project_id, p_event_type, COALESCE(p_payload, '{}'::jsonb));
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
  is_ph := r.project_id IS NOT NULL AND linkaios.is_project_head(r.project_id);

  IF r.request_type IN ('mission_binding_add', 'mission_binding_remove') THEN
    need_org := true;
    need_ph := true;
  ELSIF r.request_type = 'runtime_blocked' THEN
    need_org := true;
    need_ph := (r.project_id IS NOT NULL);
  ELSIF r.request_type IN (
    'org_allowlist_add',
    'org_allowlist_remove',
    'org_missionless_add',
    'org_missionless_remove'
  ) THEN
    need_org := true;
    need_ph := false;
  ELSE
    RAISE EXCEPTION 'unsupported_request_type';
  END IF;

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
    IF r.request_type = 'mission_binding_add'
      OR (r.request_type = 'runtime_blocked' AND r.project_id IS NOT NULL) THEN
      INSERT INTO linkaios.mission_tools (project_id, tool_id)
      VALUES (r.project_id, r.tool_id)
      ON CONFLICT DO NOTHING;
      PERFORM linkaios.sync_project_manifest_tools(r.project_id);
      INSERT INTO linkaios.traces (project_id, event_type, payload)
      VALUES (
        r.project_id,
        'tool.binding.added',
        jsonb_build_object(
          'tool_name', tname,
          'tool_id', r.tool_id,
          'mission_id', r.project_id,
          'project_id', r.project_id,
          'request_id', r.id,
          'correlation_id', r.correlation_id,
          'actor_user_id', actor
        )
      );
    ELSIF r.request_type = 'runtime_blocked' AND r.project_id IS NULL THEN
      INSERT INTO linkaios.org_tool_allowlist (tool_id) VALUES (r.tool_id) ON CONFLICT DO NOTHING;
      INSERT INTO linkaios.traces (project_id, event_type, payload)
      VALUES (
        NULL,
        'tool.binding.added',
        jsonb_build_object(
          'tool_name', tname,
          'tool_id', r.tool_id,
          'mission_id', NULL,
          'project_id', NULL,
          'request_id', r.id,
          'correlation_id', r.correlation_id,
          'scope', 'org_allowlist',
          'actor_user_id', actor
        )
      );
    ELSIF r.request_type = 'mission_binding_remove' THEN
      DELETE FROM linkaios.mission_tools mt
      WHERE mt.project_id = r.project_id AND mt.tool_id = r.tool_id;
      PERFORM linkaios.sync_project_manifest_tools(r.project_id);
      INSERT INTO linkaios.traces (project_id, event_type, payload)
      VALUES (
        r.project_id,
        'tool.binding.removed',
        jsonb_build_object(
          'tool_name', tname,
          'tool_id', r.tool_id,
          'mission_id', r.project_id,
          'project_id', r.project_id,
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

    INSERT INTO linkaios.traces (project_id, event_type, payload)
    VALUES (
      r.project_id,
      'tool.request.approved',
      jsonb_build_object(
        'tool_name', tname,
        'tool_id', r.tool_id,
        'mission_id', r.project_id,
        'project_id', r.project_id,
        'request_id', r.id,
        'request_type', r.request_type,
        'correlation_id', r.correlation_id,
        'actor_user_id', actor,
        'org_admin_approved_by', r.org_admin_approved_by,
        'project_head_approved_by', r.project_head_approved_by
      )
    );
  ELSE
    INSERT INTO linkaios.traces (project_id, event_type, payload)
    VALUES (
      r.project_id,
      'tool.request.approved',
      jsonb_build_object(
        'phase', 'partial',
        'tool_name', tname,
        'tool_id', r.tool_id,
        'mission_id', r.project_id,
        'project_id', r.project_id,
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
    OR (r.project_id IS NOT NULL AND linkaios.is_project_head(r.project_id));

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

  INSERT INTO linkaios.traces (project_id, event_type, payload)
  VALUES (
    r.project_id,
    'tool.request.rejected',
    jsonb_build_object(
      'tool_name', tname,
      'tool_id', r.tool_id,
      'mission_id', r.project_id,
      'project_id', r.project_id,
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

-- ---------------------------------------------------------------------------
-- 6. Legacy wrappers (Mission terminology callers)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION linkaios.is_mission_project_head(p_mission_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT linkaios.is_project_head(p_mission_id);
$$;

GRANT EXECUTE ON FUNCTION linkaios.is_mission_project_head(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION linkaios.sync_mission_manifest_tools(p_mission_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = linkaios, public
AS $$
  SELECT linkaios.sync_project_manifest_tools(p_mission_id);
$$;

REVOKE ALL ON FUNCTION linkaios.sync_mission_manifest_tools(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION linkaios.sync_mission_manifest_tools(uuid) TO service_role;

-- ---------------------------------------------------------------------------
-- 7. Backward-compat view: linkaios.missions → linkaios.projects
-- ---------------------------------------------------------------------------
CREATE OR REPLACE VIEW linkaios.missions AS
SELECT * FROM linkaios.projects;

COMMENT ON VIEW linkaios.missions IS
  'Legacy backward-compat view over linkaios.projects (Mission→Project terminology wave). Prefer linkaios.projects for new callers.';

GRANT SELECT, INSERT, UPDATE, DELETE ON linkaios.missions TO authenticated;
GRANT ALL ON linkaios.missions TO service_role;

COMMIT;
