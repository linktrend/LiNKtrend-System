-- Wave 5: fleet bindings, suite entitlements, provision/subscribe RPCs
-- @see docs/ecosystem/FLEET_AND_RUNTIME_POLICY.md

BEGIN;

CREATE TABLE IF NOT EXISTS linkaios_kernel.tenant_fleet_bindings (
  binding_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES linkaios_kernel.tenants (tenant_id) ON DELETE CASCADE,
  openclaw_agent_id text NOT NULL,
  slot_kind text NOT NULL CHECK (slot_kind IN ('ceo', 'suite_head', 'suite_role')),
  suite_id text,
  role_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, openclaw_agent_id)
);

COMMENT ON TABLE linkaios_kernel.tenant_fleet_bindings IS
  'Tenant-scoped OpenClaw fleet v1 slot bindings (Wave 5.2 / 5.3).';

CREATE INDEX IF NOT EXISTS idx_tenant_fleet_bindings_tenant
  ON linkaios_kernel.tenant_fleet_bindings (tenant_id);

CREATE TABLE IF NOT EXISTS linkaios_kernel.tenant_suite_entitlements (
  entitlement_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES linkaios_kernel.tenants (tenant_id) ON DELETE CASCADE,
  suite_id text NOT NULL,
  module_ids text[] NOT NULL DEFAULT '{}',
  enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, suite_id)
);

COMMENT ON TABLE linkaios_kernel.tenant_suite_entitlements IS
  'Suite module entitlements per tenant (Wave 5.3).';

CREATE INDEX IF NOT EXISTS idx_tenant_suite_entitlements_tenant
  ON linkaios_kernel.tenant_suite_entitlements (tenant_id);

ALTER TABLE linkaios_kernel.tenant_fleet_bindings ENABLE ROW LEVEL SECURITY;
ALTER TABLE linkaios_kernel.tenant_suite_entitlements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS tenant_fleet_bindings_select ON linkaios_kernel.tenant_fleet_bindings;
CREATE POLICY tenant_fleet_bindings_select ON linkaios_kernel.tenant_fleet_bindings
  FOR SELECT TO authenticated
  USING (linkaios_kernel.operator_visible_tenant(tenant_id));

DROP POLICY IF EXISTS tenant_suite_entitlements_select ON linkaios_kernel.tenant_suite_entitlements;
CREATE POLICY tenant_suite_entitlements_select ON linkaios_kernel.tenant_suite_entitlements
  FOR SELECT TO authenticated
  USING (linkaios_kernel.operator_visible_tenant(tenant_id));

GRANT SELECT ON linkaios_kernel.tenant_fleet_bindings TO authenticated;
GRANT SELECT ON linkaios_kernel.tenant_suite_entitlements TO authenticated;

-- Provision CEO binding + council flag on tenant create (application supplies binding rows).
CREATE OR REPLACE FUNCTION linkaios_kernel.provision_tenant_fleet(
  p_tenant_id uuid,
  p_tenant_kind text,
  p_llm_council_entitled boolean DEFAULT NULL,
  p_bindings jsonb DEFAULT '[]'::jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = linkaios_kernel, public
AS $$
DECLARE
  v_entitled boolean;
  v_binding jsonb;
  v_count int;
BEGIN
  IF p_tenant_kind NOT IN ('admin', 'client') THEN
    RAISE EXCEPTION 'invalid tenant_kind: %', p_tenant_kind;
  END IF;

  v_entitled := COALESCE(
    p_llm_council_entitled,
    p_tenant_kind = 'client'
  );

  UPDATE linkaios_kernel.tenants
  SET config_json = config_json || jsonb_build_object(
    'fleet', jsonb_build_object(
      'tenant_kind', p_tenant_kind,
      'llm_council_entitled', v_entitled
    )
  ),
  updated_at = now()
  WHERE tenant_id = p_tenant_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'tenant not found: %', p_tenant_id;
  END IF;

  FOR v_binding IN SELECT * FROM jsonb_array_elements(p_bindings)
  LOOP
    INSERT INTO linkaios_kernel.tenant_fleet_bindings (
      tenant_id,
      openclaw_agent_id,
      slot_kind,
      suite_id,
      role_id
    ) VALUES (
      p_tenant_id,
      v_binding->>'openclaw_agent_id',
      v_binding->>'slot_kind',
      NULLIF(v_binding->>'suite_id', ''),
      NULLIF(v_binding->>'role_id', '')
    )
    ON CONFLICT (tenant_id, openclaw_agent_id) DO NOTHING;
  END LOOP;

  SELECT count(DISTINCT openclaw_agent_id) INTO v_count
  FROM linkaios_kernel.tenant_fleet_bindings
  WHERE tenant_id = p_tenant_id;

  RETURN jsonb_build_object(
    'tenant_id', p_tenant_id,
    'tenant_kind', p_tenant_kind,
    'llm_council_entitled', v_entitled,
    'binding_count', v_count
  );
END;
$$;

REVOKE ALL ON FUNCTION linkaios_kernel.provision_tenant_fleet(uuid, text, boolean, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION linkaios_kernel.provision_tenant_fleet(uuid, text, boolean, jsonb) TO service_role;

-- Subscribe suite: upsert entitlement + allocate head slots (caller validates cap in app layer).
CREATE OR REPLACE FUNCTION linkaios_kernel.subscribe_suite_fleet(
  p_tenant_id uuid,
  p_suite_id text,
  p_module_ids text[] DEFAULT '{}',
  p_new_bindings jsonb DEFAULT '[]'::jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = linkaios_kernel, public
AS $$
DECLARE
  v_binding jsonb;
BEGIN
  INSERT INTO linkaios_kernel.tenant_suite_entitlements (
    tenant_id,
    suite_id,
    module_ids,
    enabled,
    updated_at
  ) VALUES (
    p_tenant_id,
    p_suite_id,
    COALESCE(p_module_ids, '{}'),
    true,
    now()
  )
  ON CONFLICT (tenant_id, suite_id) DO UPDATE SET
    module_ids = EXCLUDED.module_ids,
    enabled = true,
    updated_at = now();

  FOR v_binding IN SELECT * FROM jsonb_array_elements(p_new_bindings)
  LOOP
    INSERT INTO linkaios_kernel.tenant_fleet_bindings (
      tenant_id,
      openclaw_agent_id,
      slot_kind,
      suite_id,
      role_id
    ) VALUES (
      p_tenant_id,
      v_binding->>'openclaw_agent_id',
      v_binding->>'slot_kind',
      NULLIF(v_binding->>'suite_id', ''),
      NULLIF(v_binding->>'role_id', '')
    )
    ON CONFLICT (tenant_id, openclaw_agent_id) DO NOTHING;
  END LOOP;

  RETURN jsonb_build_object(
    'tenant_id', p_tenant_id,
    'suite_id', p_suite_id,
    'module_ids', COALESCE(p_module_ids, '{}'),
    'ok', true
  );
END;
$$;

REVOKE ALL ON FUNCTION linkaios_kernel.subscribe_suite_fleet(uuid, text, text[], jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION linkaios_kernel.subscribe_suite_fleet(uuid, text, text[], jsonb) TO service_role;

COMMIT;
