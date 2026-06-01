-- LTS-001: Expose kernel / brain / skills schemas with tenant_id RLS (additive).
-- Prerequisite: linkaios_kernel (025), linkbrain (023+), linkskills (030+) from services/migrations.

BEGIN;

COMMENT ON SCHEMA linkaios_kernel IS
  'MVO kernel plane: tenants, work_requests, runs, stages. Expose via Supabase Data API.';
COMMENT ON SCHEMA linkbrain IS
  'LiNKbrain audit + memory plane. Tenant-scoped rows; service_role writers.';
COMMENT ON SCHEMA linkskills IS
  'LinkSkills capability leases and ledger. Tenant-scoped lease rows.';

-- Ensure API roles can reach schemas (idempotent).
GRANT USAGE ON SCHEMA linkaios_kernel TO service_role, authenticated;
GRANT USAGE ON SCHEMA linkbrain TO service_role;
GRANT USAGE ON SCHEMA linkskills TO service_role, authenticated;

GRANT SELECT ON ALL TABLES IN SCHEMA linkaios_kernel TO authenticated;
GRANT SELECT ON linkbrain.audit_events TO service_role;
GRANT SELECT ON linkbrain.memory_objects TO service_role;
GRANT SELECT ON ALL TABLES IN SCHEMA linkskills TO authenticated;

-- Tenant-scoped read policies for authenticated operators (replace broad SELECT where present).
CREATE OR REPLACE FUNCTION linkaios_kernel.operator_visible_tenant(p_tenant_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = linkaios_kernel, public
AS $$
  SELECT
    p_tenant_id IS NOT NULL
    AND (
      linkaios.command_centre_write_allowed()
      OR EXISTS (
        SELECT 1
        FROM linkaios_kernel.work_requests wr
        WHERE wr.tenant_id = p_tenant_id
          AND wr.requested_by_actor_id = auth.uid()::text
      )
    );
$$;

REVOKE ALL ON FUNCTION linkaios_kernel.operator_visible_tenant(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION linkaios_kernel.operator_visible_tenant(uuid) TO authenticated;

DROP POLICY IF EXISTS kernel_runs_tenant_select ON linkaios_kernel.runs;
CREATE POLICY kernel_runs_tenant_select ON linkaios_kernel.runs
  FOR SELECT TO authenticated
  USING (linkaios_kernel.operator_visible_tenant(tenant_id));

DROP POLICY IF EXISTS kernel_work_requests_tenant_select ON linkaios_kernel.work_requests;
CREATE POLICY kernel_work_requests_tenant_select ON linkaios_kernel.work_requests
  FOR SELECT TO authenticated
  USING (linkaios_kernel.operator_visible_tenant(tenant_id));

DROP POLICY IF EXISTS kernel_stages_tenant_select ON linkaios_kernel.stages;
CREATE POLICY kernel_stages_tenant_select ON linkaios_kernel.stages
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM linkaios_kernel.runs r
      WHERE r.run_id = stages.run_id
        AND linkaios_kernel.operator_visible_tenant(r.tenant_id)
    )
  );

DROP POLICY IF EXISTS lease_requests_tenant_select ON linkskills.lease_requests;
CREATE POLICY lease_requests_tenant_select ON linkskills.lease_requests
  FOR SELECT TO authenticated
  USING (linkaios_kernel.operator_visible_tenant(tenant_id));

DROP POLICY IF EXISTS lease_ledger_tenant_select ON linkskills.lease_ledger_entries;
CREATE POLICY lease_ledger_tenant_select ON linkskills.lease_ledger_entries
  FOR SELECT TO authenticated
  USING (linkaios_kernel.operator_visible_tenant(tenant_id));

COMMIT;
