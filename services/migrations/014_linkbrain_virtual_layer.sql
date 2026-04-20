-- LiNKbrain virtual file layer: OpenClaw-facing paths backed by Postgres (Pattern A).
-- See Definition of Done A–G: source of truth in Supabase; draft/publish; cards + chunks + embeddings; append-only daily logs.

-- Optional: enable in Supabase Dashboard if not already — embeddings stored as float8[] here to avoid hard dependency.
-- CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA extensions;

-- Single named CHECK: a column-level CHECK on `scope` would auto-name `brain_virtual_files_scope_check`
-- and collide with this explicit constraint (PostgreSQL error 42710).
CREATE TABLE linkaios.brain_virtual_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  logical_path text NOT NULL,
  scope text NOT NULL,
  mission_id uuid REFERENCES linkaios.missions (id) ON DELETE CASCADE,
  agent_id uuid REFERENCES linkaios.agents (id) ON DELETE CASCADE,
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

CREATE UNIQUE INDEX brain_virtual_files_company_path ON linkaios.brain_virtual_files (logical_path)
  WHERE scope = 'company';

CREATE UNIQUE INDEX brain_virtual_files_mission_path ON linkaios.brain_virtual_files (mission_id, logical_path)
  WHERE scope = 'mission';

CREATE UNIQUE INDEX brain_virtual_files_agent_path ON linkaios.brain_virtual_files (agent_id, logical_path)
  WHERE scope = 'agent';

CREATE INDEX brain_virtual_files_scope_mission ON linkaios.brain_virtual_files (scope, mission_id);
CREATE INDEX brain_virtual_files_scope_agent ON linkaios.brain_virtual_files (scope, agent_id);

COMMENT ON TABLE linkaios.brain_virtual_files IS 'Virtual MEMORY.md / SOUL.md / USER.md / memory/YYYY-MM-DD.md keyed by company, mission, or agent.';

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

COMMENT ON TABLE linkaios.brain_file_versions IS 'Draft vs published content; runtime reads published row per file.';

CREATE TABLE linkaios.brain_chunks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  version_id uuid NOT NULL REFERENCES linkaios.brain_file_versions (id) ON DELETE CASCADE,
  ordinal int NOT NULL,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (version_id, ordinal)
);

CREATE INDEX brain_chunks_version ON linkaios.brain_chunks (version_id, ordinal);

COMMENT ON TABLE linkaios.brain_chunks IS 'Chunked body for cards + embeddings (tiers).';

CREATE TABLE linkaios.brain_chunk_embeddings (
  chunk_id uuid PRIMARY KEY REFERENCES linkaios.brain_chunks (id) ON DELETE CASCADE,
  model text NOT NULL,
  dimensions int NOT NULL CHECK (dimensions > 0 AND dimensions <= 4096),
  embedding float8[] NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT brain_chunk_embeddings_len CHECK (cardinality(embedding) = dimensions)
);

COMMENT ON TABLE linkaios.brain_chunk_embeddings IS 'Vector stored as float8[]; same length as dimensions.';

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

COMMENT ON TABLE linkaios.brain_index_cards IS 'Catalog / index tier for progressive disclosure.';

-- Append-only daily log lines (librarian reads; no UPDATE/DELETE for normal roles)
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

COMMENT ON TABLE linkaios.brain_daily_log_lines IS 'Append-only lines for memory/YYYY-MM-DD.md; concatenate for virtual file read.';

-- RLS (aligned with 010: authenticated read-all; writes operators+admins; service_role full)
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
-- Append-only lines: workers append via service_role (bypasses RLS). Operators are read-only here (no INSERT for authenticated).
