CREATE TABLE IF NOT EXISTS autowork_idempotency_keys (
  key_hash VARCHAR(64) PRIMARY KEY,
  tenant_id VARCHAR(64) NOT NULL,
  workflow_handle VARCHAR(255) NOT NULL,
  workflow_run_id UUID NOT NULL,
  result_json JSONB NOT NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('succeeded', 'failed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '24 hours'
);

CREATE INDEX IF NOT EXISTS idx_autowork_idempotency_tenant_handle
  ON autowork_idempotency_keys (tenant_id, workflow_handle);

CREATE INDEX IF NOT EXISTS idx_autowork_idempotency_expires
  ON autowork_idempotency_keys (expires_at);
