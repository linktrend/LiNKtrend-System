-- Expand provider taxonomy for external credentials (banks, CRM, software logins).

ALTER TABLE linkaios.integration_secrets
  DROP CONSTRAINT IF EXISTS integration_secrets_provider_check;

ALTER TABLE linkaios.integration_secrets
  ADD CONSTRAINT integration_secrets_provider_check CHECK (
    provider IN (
      'openai',
      'anthropic',
      'google',
      'zulip',
      'gateway',
      'bank',
      'payment',
      'crm',
      'software',
      'other'
    )
  );

COMMENT ON TABLE linkaios.integration_secrets IS
  'Workspace credentials for external services (LLM keys, bank APIs, CRM tokens, software logins). Read/write only via trusted server code (service_role).';
