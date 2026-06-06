-- Wave 3.5 — Base Client subscription council entitlement on tenant config_json

COMMENT ON COLUMN linkaios_kernel.tenants.config_json IS
  'Tenant-scoped config. Client base subscription sets llm_council_enabled=true and ceo_openclaw_profile.';

CREATE OR REPLACE FUNCTION linkaios_kernel.apply_client_base_entitlements(
  p_tenant_id uuid,
  p_ceo_openclaw_profile text DEFAULT 'ceo-client'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = linkaios_kernel, public
AS $$
BEGIN
  UPDATE linkaios_kernel.tenants
  SET
    config_json = config_json
      || jsonb_build_object(
        'llm_council_enabled', true,
        'ceo_openclaw_profile', COALESCE(NULLIF(trim(p_ceo_openclaw_profile), ''), 'ceo-client'),
        'base_subscription', jsonb_build_object(
          'includes_ceo_openclaw', true,
          'includes_llm_council', true
        )
      ),
    updated_at = now()
  WHERE tenant_id = p_tenant_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'apply_client_base_entitlements: tenant % not found', p_tenant_id;
  END IF;
END;
$$;

COMMENT ON FUNCTION linkaios_kernel.apply_client_base_entitlements(uuid, text) IS
  'Sets base LiNKaios Client entitlements: CEO OpenClaw profile + LLM Council access (STUDIO_FORWARD_PLAN §1.1).';

REVOKE ALL ON FUNCTION linkaios_kernel.apply_client_base_entitlements(uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION linkaios_kernel.apply_client_base_entitlements(uuid, text) TO service_role;

-- Extend demo seed with council entitlement for MVO client proof
CREATE OR REPLACE FUNCTION linkaios_kernel.seed_demo_tenant(
  p_slug text DEFAULT 'demo',
  p_display_name text DEFAULT 'Demo Tenant'
)
RETURNS TABLE (tenant_id uuid, plugin_ids text[])
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = linkaios_kernel, public
AS $$
DECLARE
  v_tenant_id uuid;
  v_plugin_ids text[] := ARRAY['websitefactory'];
BEGIN
  INSERT INTO linkaios_kernel.tenants (slug, display_name)
  VALUES (p_slug, p_display_name)
  ON CONFLICT (slug) DO UPDATE SET updated_at = now()
  RETURNING linkaios_kernel.tenants.tenant_id INTO v_tenant_id;

  PERFORM linkaios_kernel.apply_client_base_entitlements(v_tenant_id, 'ceo-client');

  INSERT INTO linkaios_kernel.tenant_plugins (tenant_id, plugin_id, enabled)
  VALUES (v_tenant_id, 'websitefactory', true)
  ON CONFLICT (tenant_id, plugin_id) DO UPDATE SET enabled = true, updated_at = now();

  RETURN QUERY
  SELECT v_tenant_id AS tenant_id, v_plugin_ids AS plugin_ids;
END;
$$;

-- Register cap.llm_council.deliberation in capability catalog when table exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'linkskills' AND table_name = 'capability_catalog'
  ) THEN
    INSERT INTO linkskills.capability_catalog (
      capability_id,
      display_name,
      description,
      policy_mode,
      tenant_scoped,
      args_schema,
      result_schema
    )
    VALUES (
      'cap.llm_council.deliberation',
      'LLM Council Gate Deliberation',
      'Governed multi-model gate deliberation via link-llm-council (G1–G5)',
      'require_approval',
      true,
      '{"type":"object"}'::jsonb,
      '{"type":"object"}'::jsonb
    )
    ON CONFLICT (capability_id) DO UPDATE SET
      display_name = EXCLUDED.display_name,
      description = EXCLUDED.description,
      updated_at = now();
  END IF;
END;
$$;
