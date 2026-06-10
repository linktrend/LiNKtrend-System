-- Admin fleet View filter: canonical tenant scope on agents (supplements runtime_settings.linkaios_fleet).

BEGIN;

ALTER TABLE linkaios.agents
  ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES linkaios_kernel.tenants (tenant_id) ON DELETE SET NULL;

COMMENT ON COLUMN linkaios.agents.tenant_id IS
  'Kernel tenant for fleet View scoping — licensor studio bots vs licensee bots. Prefer over runtime_settings.linkaios_fleet.tenant_id when set.';

CREATE INDEX IF NOT EXISTS idx_agents_tenant ON linkaios.agents (tenant_id);

-- Best-effort backfill from legacy runtime_settings.linkaios_fleet.tenant_id
UPDATE linkaios.agents a
SET tenant_id = (a.runtime_settings -> 'linkaios_fleet' ->> 'tenant_id')::uuid
WHERE a.tenant_id IS NULL
  AND (a.runtime_settings -> 'linkaios_fleet' ->> 'tenant_id') ~* '^[0-9a-f-]{36}$';

NOTIFY pgrst, 'reload schema';

COMMIT;
