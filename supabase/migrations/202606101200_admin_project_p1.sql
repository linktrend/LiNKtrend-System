-- P1 Admin Projects: run spine RPC, project brief column.

BEGIN;

ALTER TABLE linkaios.projects
  ADD COLUMN IF NOT EXISTS brief text;

COMMENT ON COLUMN linkaios.projects.brief IS 'Operator-editable project brief; enriched over time on Overview.';

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

NOTIFY pgrst, 'reload schema';

COMMIT;
