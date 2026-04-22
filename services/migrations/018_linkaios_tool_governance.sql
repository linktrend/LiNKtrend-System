-- LiNKaios tool governance: org/mission tool bindings, governance requests, RLS, and manifest backfill.
-- Canonical slice from ALL_IN_ONE.sql; must run before progressive-disclosure migrations (e.g. 022).

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
