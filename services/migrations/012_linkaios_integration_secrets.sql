-- Central integration secrets (LLM keys, gateway tokens, etc.).
-- Intended access path: Next.js server actions after command-centre admin check, using service_role client.
-- Do not grant to authenticated — avoids exposing secrets through PostgREST with the user JWT.

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

COMMENT ON TABLE linkaios.integration_secrets IS
  'Operator-managed API keys and tokens for LiNKaios and LiNKbots. Read/write only via trusted server code (service_role), never PostgREST with end-user JWT.';

ALTER TABLE linkaios.integration_secrets ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE linkaios.integration_secrets FROM PUBLIC;
REVOKE ALL ON TABLE linkaios.integration_secrets FROM anon;
REVOKE ALL ON TABLE linkaios.integration_secrets FROM authenticated;
GRANT ALL ON TABLE linkaios.integration_secrets TO service_role;
