-- LTS-001: Project ↔ Run spine with trace joins (Suite terminology).

BEGIN;

ALTER TABLE linkaios.projects
  ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES linkaios_kernel.tenants (tenant_id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS suite_id text,
  ADD COLUMN IF NOT EXISTS module_ids text[] NOT NULL DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS cadence text CHECK (cadence IS NULL OR cadence IN ('once', 'continuous'));

CREATE INDEX IF NOT EXISTS idx_projects_tenant ON linkaios.projects (tenant_id);
CREATE INDEX IF NOT EXISTS idx_projects_suite ON linkaios.projects (suite_id);

ALTER TABLE linkaios_kernel.runs
  ADD COLUMN IF NOT EXISTS project_id uuid REFERENCES linkaios.projects (id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_runs_project ON linkaios_kernel.runs (project_id);

COMMENT ON COLUMN linkaios.projects.tenant_id IS 'Kernel tenant scope for RLS and run orchestration.';
COMMENT ON COLUMN linkaios_kernel.runs.project_id IS 'LiNKaios project container for this run (Suite terminology).';

CREATE OR REPLACE FUNCTION linkaios.create_project(
  p_tenant_id uuid,
  p_title text,
  p_suite_id text,
  p_module_ids text[],
  p_cadence text,
  p_actor_id text DEFAULT NULL
)
RETURNS TABLE (project_id uuid, created_at timestamptz)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = linkaios, linkaios_kernel, public
AS $$
DECLARE
  v_project_id uuid;
  v_created_at timestamptz;
BEGIN
  IF p_tenant_id IS NULL THEN
    RAISE EXCEPTION 'create_project: tenant_id is required';
  END IF;
  IF trim(p_title) = '' THEN
    RAISE EXCEPTION 'create_project: title is required';
  END IF;
  IF p_cadence IS NOT NULL AND p_cadence NOT IN ('once', 'continuous') THEN
    RAISE EXCEPTION 'create_project: invalid cadence';
  END IF;

  INSERT INTO linkaios.projects (
    title, status, tenant_id, suite_id, module_ids, cadence, project_head_user_id
  ) VALUES (
    trim(p_title),
    'draft',
    p_tenant_id,
    NULLIF(trim(p_suite_id), ''),
    COALESCE(p_module_ids, ARRAY[]::text[]),
    p_cadence,
    CASE WHEN p_actor_id ~* '^[0-9a-f-]{36}$' THEN p_actor_id::uuid ELSE NULL END
  )
  RETURNING id, linkaios.projects.created_at INTO v_project_id, v_created_at;

  INSERT INTO linkaios.traces (project_id, event_type, payload)
  VALUES (
    v_project_id,
    'project.created',
    jsonb_build_object(
      'project_id', v_project_id,
      'tenant_id', p_tenant_id,
      'suite_id', p_suite_id,
      'module_ids', to_jsonb(p_module_ids),
      'cadence', p_cadence,
      'actor_id', p_actor_id
    )
  );

  RETURN QUERY SELECT v_project_id, v_created_at;
END;
$$;

REVOKE ALL ON FUNCTION linkaios.create_project(uuid, text, text, text[], text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION linkaios.create_project(uuid, text, text, text[], text, text) TO service_role;

DROP FUNCTION IF EXISTS linkaios_kernel.create_run(uuid, uuid, text);

CREATE OR REPLACE FUNCTION linkaios_kernel.create_run(
  p_work_request_id uuid,
  p_tenant_id uuid,
  p_plugin_id text,
  p_project_id uuid DEFAULT NULL
)
RETURNS TABLE (run_id uuid)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = linkaios_kernel, public
AS $$
DECLARE
  v_run_id uuid;
BEGIN
  INSERT INTO linkaios_kernel.runs (
    work_request_id, tenant_id, plugin_id, project_id, status
  ) VALUES (
    p_work_request_id, p_tenant_id, p_plugin_id, p_project_id, 'pending'
  )
  RETURNING linkaios_kernel.runs.run_id INTO v_run_id;

  IF p_project_id IS NOT NULL THEN
    INSERT INTO linkaios.traces (project_id, event_type, payload)
    VALUES (
      p_project_id,
      'run.created',
      jsonb_build_object(
        'run_id', v_run_id,
        'tenant_id', p_tenant_id,
        'plugin_id', p_plugin_id,
        'work_request_id', p_work_request_id
      )
    );
  END IF;

  RETURN QUERY SELECT v_run_id;
END;
$$;

REVOKE ALL ON FUNCTION linkaios_kernel.create_run(uuid, uuid, text, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION linkaios_kernel.create_run(uuid, uuid, text, uuid) TO service_role;

CREATE OR REPLACE FUNCTION linkaios.get_project_run_spine(p_project_id uuid)
RETURNS TABLE (
  project_id uuid,
  project_title text,
  tenant_id uuid,
  run_id uuid,
  run_status text,
  run_started_at timestamptz,
  run_ended_at timestamptz,
  lease_ids uuid[],
  workflow_run_ids text[],
  audit_event_ids uuid[],
  trace_count bigint
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = linkaios, linkaios_kernel, public
AS $$
  SELECT
    p.id,
    p.title,
    p.tenant_id,
    r.run_id,
    r.status,
    r.started_at,
    r.ended_at,
    r.lease_ids,
    r.workflow_run_ids,
    r.audit_event_ids,
    (
      SELECT count(*)::bigint
      FROM linkaios.traces t
      WHERE t.project_id = p.id
    ) AS trace_count
  FROM linkaios.projects p
  LEFT JOIN linkaios_kernel.runs r ON r.project_id = p.id
  WHERE p.id = p_project_id
  ORDER BY r.started_at NULLS LAST;
$$;

REVOKE ALL ON FUNCTION linkaios.get_project_run_spine(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION linkaios.get_project_run_spine(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION linkaios.get_project_run_spine(uuid) TO authenticated;

COMMIT;
