-- LiNKskills progressive disclosure: categories, authoritative defaults, scripts/refs tables, slim embeddings.

CREATE TABLE IF NOT EXISTS linkaios.skill_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  one_line_description text NOT NULL DEFAULT '',
  intro_text text NOT NULL DEFAULT '',
  sort_order int NOT NULL DEFAULT 0,
  parent_id uuid REFERENCES linkaios.skill_categories (id) ON DELETE SET NULL
);

INSERT INTO linkaios.skill_categories (slug, title, one_line_description, sort_order, intro_text)
VALUES (
  'general',
  'General',
  'Skills not yet assigned to a specific category.',
  0,
  'Use LiNKskills Layer 1 APIs or the catalog UI for category-scoped discovery.'
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO linkaios.skill_categories (slug, title, one_line_description, sort_order)
SELECT DISTINCT ON (x.slug)
  x.slug,
  x.title,
  '',
  0
FROM (
  SELECT
    lower(
      regexp_replace(
        trim(both '-' FROM regexp_replace(coalesce(s.metadata #>> '{linkaios_admin,category}', s.metadata ->> 'category', 'General'), '[^a-zA-Z0-9]+', '-', 'g')),
        '^-+|-+$',
        '',
        'g'
      )
    ) AS slug,
    trim(coalesce(s.metadata #>> '{linkaios_admin,category}', s.metadata ->> 'category', 'General')) AS title
  FROM linkaios.skills s
) x
WHERE length(x.slug) > 0
  AND x.slug NOT IN (SELECT slug FROM linkaios.skill_categories)
ORDER BY x.slug
ON CONFLICT (slug) DO NOTHING;

ALTER TABLE linkaios.skills
  ADD COLUMN IF NOT EXISTS category_id uuid REFERENCES linkaios.skill_categories (id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS default_model text,
  ADD COLUMN IF NOT EXISTS skill_mode text NOT NULL DEFAULT 'simple',
  ADD COLUMN IF NOT EXISTS step_recipe jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS default_declared_tools text[] NOT NULL DEFAULT ARRAY[]::text[],
  ADD COLUMN IF NOT EXISTS tags text[] NOT NULL DEFAULT ARRAY[]::text[];

ALTER TABLE linkaios.skills DROP CONSTRAINT IF EXISTS skills_skill_mode_check;
ALTER TABLE linkaios.skills
  ADD CONSTRAINT skills_skill_mode_check CHECK (skill_mode IN ('simple', 'stepped'));

UPDATE linkaios.skills s
SET default_declared_tools = sub.tools
FROM (
  SELECT
    s2.id,
    coalesce(
      array_agg(lower(trim(elem::text))) FILTER (WHERE trim(elem::text) <> ''),
      ARRAY[]::text[]
    ) AS tools
  FROM linkaios.skills s2
  LEFT JOIN LATERAL jsonb_array_elements_text(
    CASE
      WHEN jsonb_typeof(s2.metadata -> 'declared_tools') = 'array' THEN s2.metadata -> 'declared_tools'
      ELSE '[]'::jsonb
    END
  ) elem ON true
  GROUP BY s2.id
) sub
WHERE s.id = sub.id
  AND cardinality(s.default_declared_tools) = 0
  AND cardinality(sub.tools) > 0;

UPDATE linkaios.skills s
SET category_id = sc.id
FROM linkaios.skill_categories sc
WHERE s.category_id IS NULL
  AND sc.slug = lower(
    regexp_replace(
      trim(both '-' FROM regexp_replace(coalesce(s.metadata #>> '{linkaios_admin,category}', s.metadata ->> 'category', 'general'), '[^a-zA-Z0-9]+', '-', 'g')),
      '^-+|-+$',
      '',
      'g'
    )
  );

UPDATE linkaios.skills
SET category_id = (SELECT id FROM linkaios.skill_categories WHERE slug = 'general' LIMIT 1)
WHERE category_id IS NULL;

CREATE TABLE IF NOT EXISTS linkaios.skill_scripts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  skill_id uuid NOT NULL REFERENCES linkaios.skills (id) ON DELETE CASCADE,
  filename text NOT NULL,
  content text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_skill_scripts_skill ON linkaios.skill_scripts (skill_id);

INSERT INTO linkaios.skill_scripts (id, skill_id, filename, content)
SELECT gen_random_uuid(),
  s.id,
  coalesce(nullif(trim(elem ->> 'filename'), ''), 'script.sh'),
  coalesce(elem ->> 'content', '')
FROM linkaios.skills s
CROSS JOIN LATERAL jsonb_array_elements(coalesce(s.metadata -> 'linkaios_scripts', '[]'::jsonb)) elem
WHERE jsonb_typeof(coalesce(s.metadata -> 'linkaios_scripts', '[]'::jsonb)) = 'array'
  AND jsonb_array_length(coalesce(s.metadata -> 'linkaios_scripts', '[]'::jsonb)) > 0;

UPDATE linkaios.skills s
SET metadata = s.metadata - 'linkaios_scripts'
WHERE s.metadata ? 'linkaios_scripts';

CREATE TABLE IF NOT EXISTS linkaios.skill_references (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  skill_id uuid NOT NULL REFERENCES linkaios.skills (id) ON DELETE CASCADE,
  label text NOT NULL,
  kind text NOT NULL CHECK (kind IN ('brain_path', 'storage_uri', 'tool_name')),
  target text NOT NULL DEFAULT '',
  step_ordinal int,
  extra jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_skill_references_skill ON linkaios.skill_references (skill_id);

INSERT INTO linkaios.skill_references (id, skill_id, label, kind, target, step_ordinal, extra)
SELECT gen_random_uuid(),
  s.id,
  coalesce(nullif(trim(elem ->> 'name'), ''), 'reference'),
  'brain_path',
  '',
  NULL,
  jsonb_build_object('legacy_asset_id', elem ->> 'id')
FROM linkaios.skills s
CROSS JOIN LATERAL jsonb_array_elements(coalesce(s.metadata -> 'linkaios_references', '[]'::jsonb)) elem
WHERE jsonb_typeof(coalesce(s.metadata -> 'linkaios_references', '[]'::jsonb)) = 'array'
  AND jsonb_array_length(coalesce(s.metadata -> 'linkaios_references', '[]'::jsonb)) > 0;

UPDATE linkaios.skills s
SET metadata = s.metadata - 'linkaios_references'
WHERE s.metadata ? 'linkaios_references';

CREATE TABLE IF NOT EXISTS linkaios.skill_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  skill_id uuid NOT NULL REFERENCES linkaios.skills (id) ON DELETE CASCADE,
  name text NOT NULL,
  storage_uri text NOT NULL DEFAULT '',
  byte_size bigint,
  step_ordinal int,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_skill_assets_skill ON linkaios.skill_assets (skill_id);

INSERT INTO linkaios.skill_assets (id, skill_id, name, storage_uri, byte_size, step_ordinal)
SELECT gen_random_uuid(),
  s.id,
  coalesce(nullif(trim(elem ->> 'name'), ''), 'asset'),
  '',
  CASE WHEN (elem ->> 'bytes') ~ '^[0-9]+$' THEN (elem ->> 'bytes')::bigint ELSE NULL END,
  NULL
FROM linkaios.skills s
CROSS JOIN LATERAL jsonb_array_elements(coalesce(s.metadata -> 'linkaios_assets', '[]'::jsonb)) elem
WHERE jsonb_typeof(coalesce(s.metadata -> 'linkaios_assets', '[]'::jsonb)) = 'array'
  AND jsonb_array_length(coalesce(s.metadata -> 'linkaios_assets', '[]'::jsonb)) > 0;

UPDATE linkaios.skills s
SET metadata = s.metadata - 'linkaios_assets'
WHERE s.metadata ? 'linkaios_assets';

CREATE TABLE IF NOT EXISTS linkaios.skill_slim_embeddings (
  skill_id uuid PRIMARY KEY REFERENCES linkaios.skills (id) ON DELETE CASCADE,
  model text NOT NULL,
  dimensions int NOT NULL CHECK (dimensions > 0),
  embedding double precision[] NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT skill_slim_embeddings_len CHECK (cardinality(embedding) = dimensions)
);

CREATE INDEX IF NOT EXISTS idx_skills_category_status_updated ON linkaios.skills (category_id, status, updated_at DESC);

ALTER TABLE linkaios.skill_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE linkaios.skill_scripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE linkaios.skill_references ENABLE ROW LEVEL SECURITY;
ALTER TABLE linkaios.skill_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE linkaios.skill_slim_embeddings ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON linkaios.skill_categories TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON linkaios.skill_categories TO service_role;
GRANT INSERT, UPDATE, DELETE ON linkaios.skill_categories TO authenticated;

DROP POLICY IF EXISTS skill_categories_select ON linkaios.skill_categories;
DROP POLICY IF EXISTS skill_categories_write ON linkaios.skill_categories;
DROP POLICY IF EXISTS skill_categories_update ON linkaios.skill_categories;
DROP POLICY IF EXISTS skill_categories_delete ON linkaios.skill_categories;
CREATE POLICY skill_categories_select ON linkaios.skill_categories FOR SELECT TO authenticated USING (true);
CREATE POLICY skill_categories_write ON linkaios.skill_categories FOR INSERT TO authenticated WITH CHECK (linkaios.command_centre_write_allowed());
CREATE POLICY skill_categories_update ON linkaios.skill_categories FOR UPDATE TO authenticated USING (linkaios.command_centre_write_allowed()) WITH CHECK (linkaios.command_centre_write_allowed());
CREATE POLICY skill_categories_delete ON linkaios.skill_categories FOR DELETE TO authenticated USING (linkaios.command_centre_write_allowed());

GRANT SELECT, INSERT, UPDATE, DELETE ON linkaios.skill_scripts TO service_role;
GRANT SELECT ON linkaios.skill_scripts TO authenticated;
GRANT INSERT, UPDATE, DELETE ON linkaios.skill_scripts TO authenticated;

DROP POLICY IF EXISTS skill_scripts_select ON linkaios.skill_scripts;
DROP POLICY IF EXISTS skill_scripts_insert ON linkaios.skill_scripts;
DROP POLICY IF EXISTS skill_scripts_update ON linkaios.skill_scripts;
DROP POLICY IF EXISTS skill_scripts_delete ON linkaios.skill_scripts;
CREATE POLICY skill_scripts_select ON linkaios.skill_scripts FOR SELECT TO authenticated USING (true);
CREATE POLICY skill_scripts_insert ON linkaios.skill_scripts FOR INSERT TO authenticated WITH CHECK (linkaios.command_centre_write_allowed());
CREATE POLICY skill_scripts_update ON linkaios.skill_scripts FOR UPDATE TO authenticated USING (linkaios.command_centre_write_allowed()) WITH CHECK (linkaios.command_centre_write_allowed());
CREATE POLICY skill_scripts_delete ON linkaios.skill_scripts FOR DELETE TO authenticated USING (linkaios.command_centre_write_allowed());

GRANT SELECT, INSERT, UPDATE, DELETE ON linkaios.skill_references TO service_role;
GRANT SELECT ON linkaios.skill_references TO authenticated;
GRANT INSERT, UPDATE, DELETE ON linkaios.skill_references TO authenticated;

DROP POLICY IF EXISTS skill_references_select ON linkaios.skill_references;
DROP POLICY IF EXISTS skill_references_insert ON linkaios.skill_references;
DROP POLICY IF EXISTS skill_references_update ON linkaios.skill_references;
DROP POLICY IF EXISTS skill_references_delete ON linkaios.skill_references;
CREATE POLICY skill_references_select ON linkaios.skill_references FOR SELECT TO authenticated USING (true);
CREATE POLICY skill_references_insert ON linkaios.skill_references FOR INSERT TO authenticated WITH CHECK (linkaios.command_centre_write_allowed());
CREATE POLICY skill_references_update ON linkaios.skill_references FOR UPDATE TO authenticated USING (linkaios.command_centre_write_allowed()) WITH CHECK (linkaios.command_centre_write_allowed());
CREATE POLICY skill_references_delete ON linkaios.skill_references FOR DELETE TO authenticated USING (linkaios.command_centre_write_allowed());

GRANT SELECT, INSERT, UPDATE, DELETE ON linkaios.skill_assets TO service_role;
GRANT SELECT ON linkaios.skill_assets TO authenticated;
GRANT INSERT, UPDATE, DELETE ON linkaios.skill_assets TO authenticated;

DROP POLICY IF EXISTS skill_assets_select ON linkaios.skill_assets;
DROP POLICY IF EXISTS skill_assets_insert ON linkaios.skill_assets;
DROP POLICY IF EXISTS skill_assets_update ON linkaios.skill_assets;
DROP POLICY IF EXISTS skill_assets_delete ON linkaios.skill_assets;
CREATE POLICY skill_assets_select ON linkaios.skill_assets FOR SELECT TO authenticated USING (true);
CREATE POLICY skill_assets_insert ON linkaios.skill_assets FOR INSERT TO authenticated WITH CHECK (linkaios.command_centre_write_allowed());
CREATE POLICY skill_assets_update ON linkaios.skill_assets FOR UPDATE TO authenticated USING (linkaios.command_centre_write_allowed()) WITH CHECK (linkaios.command_centre_write_allowed());
CREATE POLICY skill_assets_delete ON linkaios.skill_assets FOR DELETE TO authenticated USING (linkaios.command_centre_write_allowed());

GRANT SELECT, INSERT, UPDATE, DELETE ON linkaios.skill_slim_embeddings TO service_role;
GRANT SELECT ON linkaios.skill_slim_embeddings TO authenticated;
GRANT INSERT, UPDATE, DELETE ON linkaios.skill_slim_embeddings TO authenticated;

DROP POLICY IF EXISTS skill_slim_embeddings_select ON linkaios.skill_slim_embeddings;
DROP POLICY IF EXISTS skill_slim_embeddings_insert ON linkaios.skill_slim_embeddings;
DROP POLICY IF EXISTS skill_slim_embeddings_update ON linkaios.skill_slim_embeddings;
DROP POLICY IF EXISTS skill_slim_embeddings_delete ON linkaios.skill_slim_embeddings;
CREATE POLICY skill_slim_embeddings_select ON linkaios.skill_slim_embeddings FOR SELECT TO authenticated USING (true);
CREATE POLICY skill_slim_embeddings_insert ON linkaios.skill_slim_embeddings FOR INSERT TO authenticated WITH CHECK (linkaios.command_centre_write_allowed());
CREATE POLICY skill_slim_embeddings_update ON linkaios.skill_slim_embeddings FOR UPDATE TO authenticated USING (linkaios.command_centre_write_allowed()) WITH CHECK (linkaios.command_centre_write_allowed());
CREATE POLICY skill_slim_embeddings_delete ON linkaios.skill_slim_embeddings FOR DELETE TO authenticated USING (linkaios.command_centre_write_allowed());

COMMENT ON TABLE linkaios.skill_categories IS 'Layer-1 LiNKskills category catalogue.';
COMMENT ON TABLE linkaios.skill_scripts IS 'Authoritative script blobs for skills (migrated from metadata.linkaios_scripts).';
COMMENT ON TABLE linkaios.skill_references IS 'Machine pointers + labels for brain paths, URIs, or tool names.';
COMMENT ON TABLE linkaios.skill_assets IS 'Asset metadata rows for skills.';
COMMENT ON TABLE linkaios.skill_slim_embeddings IS 'Semantic index over slim skill routing text.';
