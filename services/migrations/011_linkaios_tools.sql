-- LiNKskills tools registry: governed capabilities (bundles, HTTP, registry refs, plugins, MCP).

CREATE TABLE linkaios.tools (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  version int NOT NULL DEFAULT 1,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'approved', 'archived')),
  tool_type text NOT NULL CHECK (
    tool_type IN (
      'executable_bundle',
      'http',
      'registry_reference',
      'plugin',
      'mcp_server'
    )
  ),
  category text NOT NULL DEFAULT 'General',
  description text NOT NULL DEFAULT '',
  implementation jsonb NOT NULL DEFAULT '{}'::jsonb,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (name)
);

CREATE INDEX idx_tools_status ON linkaios.tools (status);
CREATE INDEX idx_tools_type ON linkaios.tools (tool_type);
CREATE INDEX idx_tools_updated ON linkaios.tools (updated_at DESC);

COMMENT ON TABLE linkaios.tools IS 'Command-plane tool registry: lifecycle, publish/runtime flags (metadata.linkaios_admin), type-specific implementation JSON.';

ALTER TABLE linkaios.tools ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS linkaios_tools_select ON linkaios.tools;
DROP POLICY IF EXISTS linkaios_tools_insert ON linkaios.tools;
DROP POLICY IF EXISTS linkaios_tools_update ON linkaios.tools;
DROP POLICY IF EXISTS linkaios_tools_delete ON linkaios.tools;

CREATE POLICY linkaios_tools_select ON linkaios.tools FOR SELECT TO authenticated USING (true);
CREATE POLICY linkaios_tools_insert ON linkaios.tools FOR INSERT TO authenticated WITH CHECK (linkaios.command_centre_write_allowed());
CREATE POLICY linkaios_tools_update ON linkaios.tools FOR UPDATE TO authenticated USING (linkaios.command_centre_write_allowed()) WITH CHECK (linkaios.command_centre_write_allowed());
CREATE POLICY linkaios_tools_delete ON linkaios.tools FOR DELETE TO authenticated USING (linkaios.command_centre_write_allowed());

INSERT INTO linkaios.tools (name, version, status, tool_type, category, description, implementation, metadata)
SELECT 'http-fetch',
       1,
       'approved',
       'http',
       'Network',
       'Signed outbound HTTP with allow-listed hosts.',
       '{"base_url":"https://api.example.com","notes":"demo"}'::jsonb,
       '{"linkaios_admin":{"published":true,"runtime_enabled":true}}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM linkaios.tools t WHERE t.name = 'http-fetch');

INSERT INTO linkaios.tools (name, version, status, tool_type, category, description, implementation, metadata)
SELECT 'workspace-read',
       1,
       'approved',
       'executable_bundle',
       'Filesystem',
       'Read-only workspace paths under policy roots.',
       '{"artifact_uri":"s3://artifacts/tools/workspace-read/1.tgz","checksum_sha256":null}'::jsonb,
       '{"linkaios_admin":{"published":true,"runtime_enabled":false}}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM linkaios.tools t WHERE t.name = 'workspace-read');

INSERT INTO linkaios.tools (name, version, status, tool_type, category, description, implementation, metadata)
SELECT 'restricted-shell',
       1,
       'draft',
       'executable_bundle',
       'Execution',
       'Ephemeral shell with syscall filter (draft).',
       '{"artifact_uri":"","notes":"not published"}'::jsonb,
       '{"linkaios_admin":{"published":false,"runtime_enabled":false}}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM linkaios.tools t WHERE t.name = 'restricted-shell');
