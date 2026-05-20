-- WP-033: Plane real integration mapping foundation
-- Additive external-id mappings for future Plane work-item integration.
-- No remote writes are introduced in this migration.

CREATE TABLE IF NOT EXISTS linkskills.plane_project_mappings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  lead_id text NOT NULL,
  plane_project_id text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, lead_id),
  UNIQUE (plane_project_id)
);

CREATE INDEX IF NOT EXISTS idx_plane_project_mappings_tenant
  ON linkskills.plane_project_mappings (tenant_id);

CREATE TABLE IF NOT EXISTS linkskills.plane_work_item_mappings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plane_project_id text NOT NULL REFERENCES linkskills.plane_project_mappings (plane_project_id) ON DELETE CASCADE,
  title_normalized text NOT NULL,
  plane_work_item_id text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (plane_project_id, title_normalized),
  UNIQUE (plane_work_item_id)
);

CREATE INDEX IF NOT EXISTS idx_plane_work_item_mappings_project
  ON linkskills.plane_work_item_mappings (plane_project_id);

ALTER TABLE linkskills.plane_project_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE linkskills.plane_work_item_mappings ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE ON linkskills.plane_project_mappings TO service_role;
GRANT SELECT, INSERT, UPDATE ON linkskills.plane_work_item_mappings TO service_role;
REVOKE ALL ON linkskills.plane_project_mappings FROM authenticated;
REVOKE ALL ON linkskills.plane_work_item_mappings FROM authenticated;

DROP POLICY IF EXISTS plane_project_mappings_select ON linkskills.plane_project_mappings;
DROP POLICY IF EXISTS plane_work_item_mappings_select ON linkskills.plane_work_item_mappings;
DROP POLICY IF EXISTS plane_project_mappings_service_role_rw ON linkskills.plane_project_mappings;
DROP POLICY IF EXISTS plane_work_item_mappings_service_role_rw ON linkskills.plane_work_item_mappings;

CREATE POLICY plane_project_mappings_service_role_rw
  ON linkskills.plane_project_mappings
  FOR ALL
  TO service_role
  USING (true);

CREATE POLICY plane_work_item_mappings_service_role_rw
  ON linkskills.plane_work_item_mappings
  FOR ALL
  TO service_role
  USING (true);

CREATE OR REPLACE FUNCTION linkskills.normalize_work_item_title(p_title text)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT lower(regexp_replace(trim(coalesce(p_title, '')), '\\s+', ' ', 'g'));
$$;

CREATE OR REPLACE FUNCTION linkskills.upsert_plane_project_mapping(
  p_tenant_id uuid,
  p_lead_id text,
  p_plane_project_id text
)
RETURNS TABLE (plane_project_id text, created boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = linkskills, public
AS $$
BEGIN
  INSERT INTO linkskills.plane_project_mappings (tenant_id, lead_id, plane_project_id)
  VALUES (p_tenant_id, p_lead_id, p_plane_project_id)
  ON CONFLICT (tenant_id, lead_id)
  DO UPDATE SET
    plane_project_id = EXCLUDED.plane_project_id,
    updated_at = now();

  RETURN QUERY
  SELECT ppm.plane_project_id,
         (ppm.created_at = ppm.updated_at) AS created
  FROM linkskills.plane_project_mappings ppm
  WHERE ppm.tenant_id = p_tenant_id
    AND ppm.lead_id = p_lead_id;
END;
$$;

CREATE OR REPLACE FUNCTION linkskills.upsert_plane_work_item_mapping(
  p_plane_project_id text,
  p_title text,
  p_plane_work_item_id text
)
RETURNS TABLE (plane_work_item_id text, title_normalized text, created boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = linkskills, public
AS $$
DECLARE
  v_title_normalized text;
BEGIN
  v_title_normalized := linkskills.normalize_work_item_title(p_title);

  INSERT INTO linkskills.plane_work_item_mappings (plane_project_id, title_normalized, plane_work_item_id)
  VALUES (p_plane_project_id, v_title_normalized, p_plane_work_item_id)
  ON CONFLICT (plane_project_id, title_normalized)
  DO UPDATE SET
    plane_work_item_id = EXCLUDED.plane_work_item_id,
    updated_at = now();

  RETURN QUERY
  SELECT pwm.plane_work_item_id,
         pwm.title_normalized,
         (pwm.created_at = pwm.updated_at) AS created
  FROM linkskills.plane_work_item_mappings pwm
  WHERE pwm.plane_project_id = p_plane_project_id
    AND pwm.title_normalized = v_title_normalized;
END;
$$;

REVOKE ALL ON FUNCTION linkskills.upsert_plane_project_mapping(uuid, text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION linkskills.upsert_plane_work_item_mapping(text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION linkskills.upsert_plane_project_mapping(uuid, text, text) TO service_role;
GRANT EXECUTE ON FUNCTION linkskills.upsert_plane_work_item_mapping(text, text, text) TO service_role;

COMMENT ON TABLE linkskills.plane_project_mappings IS
  'Plane project id mappings for idempotent external integration: (tenant_id, lead_id) -> plane_project_id.';

COMMENT ON TABLE linkskills.plane_work_item_mappings IS
  'Plane work-item id mappings for idempotent external integration: (plane_project_id, title_normalized) -> plane_work_item_id.';

COMMENT ON FUNCTION linkskills.normalize_work_item_title IS
  'Normalize work-item title for idempotent mapping keys.';

COMMENT ON FUNCTION linkskills.upsert_plane_project_mapping IS
  'Idempotent project mapping upsert for Plane integration foundation (WP-033).';

COMMENT ON FUNCTION linkskills.upsert_plane_work_item_mapping IS
  'Idempotent work-item mapping upsert for Plane integration foundation (WP-033).';
