-- LiNKaios command-plane core tables (agents, projects, skills, memory, traces).
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE SCHEMA IF NOT EXISTS linkaios;

CREATE TABLE IF NOT EXISTS linkaios.agents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  display_name text NOT NULL,
  status text NOT NULL DEFAULT 'inactive' CHECK (status IN ('active', 'inactive', 'retired')),
  runtime_settings jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS linkaios.projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  status text NOT NULL DEFAULT 'draft' CHECK (
    status IN ('draft', 'assigned', 'running', 'completed', 'failed', 'cancelled')
  ),
  primary_agent_id uuid REFERENCES linkaios.agents (id) ON DELETE SET NULL,
  project_head_user_id uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS linkaios.manifests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES linkaios.projects (id) ON DELETE CASCADE,
  version int NOT NULL DEFAULT 1,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS linkaios.skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  version int NOT NULL DEFAULT 1,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'approved', 'deprecated')),
  body_markdown text NOT NULL DEFAULT '',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (name, version)
);

CREATE TABLE IF NOT EXISTS linkaios.memory_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES linkaios.projects (id) ON DELETE CASCADE,
  classification text NOT NULL DEFAULT 'working',
  body text NOT NULL DEFAULT '',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS linkaios.traces (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES linkaios.projects (id) ON DELETE SET NULL,
  event_type text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS linkaios.integration_secrets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  label text NOT NULL,
  provider text NOT NULL DEFAULT 'other',
  secret_value text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT integration_secrets_provider_check CHECK (
    provider IN ('openai', 'anthropic', 'google', 'zulip', 'gateway', 'other')
  )
);

CREATE INDEX IF NOT EXISTS idx_integration_secrets_provider ON linkaios.integration_secrets (provider);
CREATE INDEX IF NOT EXISTS idx_projects_status ON linkaios.projects (status);
CREATE INDEX IF NOT EXISTS idx_skills_name_status ON linkaios.skills (name, status);
CREATE INDEX IF NOT EXISTS idx_memory_project ON linkaios.memory_entries (project_id);
CREATE INDEX IF NOT EXISTS idx_traces_project ON linkaios.traces (project_id);

COMMENT ON TABLE linkaios.projects IS 'Tenant projects (canonical LiNKaios work container).';
COMMENT ON SCHEMA linkaios IS 'LiNKaios command-plane records: agents, projects, skills, memory, traces.';
