-- LiNKbrain PRD: mandatory legal entity, sensitivity, file kind, company org nodes + document tags (M2M).

CREATE TABLE linkaios.brain_legal_entities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO linkaios.brain_legal_entities (id, code, name)
VALUES (
  '00000000-0000-4000-8000-000000000001'::uuid,
  'default',
  'Default legal entity'
)
ON CONFLICT (code) DO NOTHING;

ALTER TABLE linkaios.brain_virtual_files
  ADD COLUMN legal_entity_id uuid NOT NULL DEFAULT '00000000-0000-4000-8000-000000000001'::uuid
    REFERENCES linkaios.brain_legal_entities (id) ON DELETE RESTRICT,
  ADD COLUMN sensitivity text NOT NULL DEFAULT 'internal'
    CHECK (sensitivity IN ('public', 'internal', 'confidential', 'restricted')),
  ADD COLUMN file_kind text NOT NULL DEFAULT 'standard'
    CHECK (file_kind IN ('standard', 'daily_log', 'upload', 'librarian', 'quick_note'));

COMMENT ON COLUMN linkaios.brain_virtual_files.legal_entity_id IS 'Mandatory subsidiary / holding entity for compliance boundaries.';
COMMENT ON COLUMN linkaios.brain_virtual_files.sensitivity IS 'Document classification; not the same as org tree.';
COMMENT ON COLUMN linkaios.brain_virtual_files.file_kind IS 'Normative editability: daily_log is append-only via dedicated APIs in product rules.';

CREATE INDEX brain_virtual_files_legal_entity ON linkaios.brain_virtual_files (legal_entity_id);

-- Company org structure (axes as rows; parent optional for hierarchy within a dimension).
CREATE TABLE linkaios.brain_org_nodes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dimension text NOT NULL,
  label text NOT NULL,
  parent_id uuid REFERENCES linkaios.brain_org_nodes (id) ON DELETE SET NULL,
  valid_from date NOT NULL DEFAULT (CURRENT_DATE),
  valid_to date,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT brain_org_nodes_valid_range CHECK (valid_to IS NULL OR valid_to >= valid_from)
);

CREATE INDEX brain_org_nodes_dimension ON linkaios.brain_org_nodes (dimension, sort_order, label);
CREATE INDEX brain_org_nodes_parent ON linkaios.brain_org_nodes (parent_id);

COMMENT ON TABLE linkaios.brain_org_nodes IS 'Company organisational nodes for discovery tags (M2M to brain files); primary anchor remains scope+mission/agent.';

CREATE TABLE linkaios.brain_virtual_file_org_tags (
  file_id uuid NOT NULL REFERENCES linkaios.brain_virtual_files (id) ON DELETE CASCADE,
  org_node_id uuid NOT NULL REFERENCES linkaios.brain_org_nodes (id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (file_id, org_node_id)
);

CREATE INDEX brain_vf_org_tags_node ON linkaios.brain_virtual_file_org_tags (org_node_id);

ALTER TABLE linkaios.brain_legal_entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE linkaios.brain_org_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE linkaios.brain_virtual_file_org_tags ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON linkaios.brain_legal_entities TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON linkaios.brain_legal_entities TO service_role;
GRANT INSERT, UPDATE, DELETE ON linkaios.brain_legal_entities TO authenticated;

CREATE POLICY brain_legal_entities_select ON linkaios.brain_legal_entities FOR SELECT TO authenticated USING (true);
CREATE POLICY brain_legal_entities_write ON linkaios.brain_legal_entities FOR INSERT TO authenticated WITH CHECK (linkaios.command_centre_write_allowed());
CREATE POLICY brain_legal_entities_update ON linkaios.brain_legal_entities FOR UPDATE TO authenticated USING (linkaios.command_centre_write_allowed()) WITH CHECK (linkaios.command_centre_write_allowed());
CREATE POLICY brain_legal_entities_delete ON linkaios.brain_legal_entities FOR DELETE TO authenticated USING (linkaios.command_centre_write_allowed());

GRANT SELECT ON linkaios.brain_org_nodes TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON linkaios.brain_org_nodes TO service_role;
GRANT INSERT, UPDATE, DELETE ON linkaios.brain_org_nodes TO authenticated;

CREATE POLICY brain_org_nodes_select ON linkaios.brain_org_nodes FOR SELECT TO authenticated USING (true);
CREATE POLICY brain_org_nodes_write ON linkaios.brain_org_nodes FOR INSERT TO authenticated WITH CHECK (linkaios.command_centre_write_allowed());
CREATE POLICY brain_org_nodes_update ON linkaios.brain_org_nodes FOR UPDATE TO authenticated USING (linkaios.command_centre_write_allowed()) WITH CHECK (linkaios.command_centre_write_allowed());
CREATE POLICY brain_org_nodes_delete ON linkaios.brain_org_nodes FOR DELETE TO authenticated USING (linkaios.command_centre_write_allowed());

GRANT SELECT ON linkaios.brain_virtual_file_org_tags TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON linkaios.brain_virtual_file_org_tags TO service_role;
GRANT INSERT, UPDATE, DELETE ON linkaios.brain_virtual_file_org_tags TO authenticated;

CREATE POLICY brain_vf_org_tags_select ON linkaios.brain_virtual_file_org_tags FOR SELECT TO authenticated USING (true);
CREATE POLICY brain_vf_org_tags_write ON linkaios.brain_virtual_file_org_tags FOR INSERT TO authenticated WITH CHECK (linkaios.command_centre_write_allowed());
CREATE POLICY brain_vf_org_tags_update ON linkaios.brain_virtual_file_org_tags FOR UPDATE TO authenticated USING (linkaios.command_centre_write_allowed()) WITH CHECK (linkaios.command_centre_write_allowed());
CREATE POLICY brain_vf_org_tags_delete ON linkaios.brain_virtual_file_org_tags FOR DELETE TO authenticated USING (linkaios.command_centre_write_allowed());
