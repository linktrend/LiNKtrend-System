-- Wave 6/7: Studio tenants (Admin vendor + Linktrend client) with fleet bindings and entitlements
-- @see LiNKdev/product/reports/linktrend-system/STUDIO_FORWARD_PLAN.md Waves 6–7

BEGIN;

CREATE OR REPLACE FUNCTION linkaios_kernel.seed_studio_tenants()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = linkaios_kernel, public
AS $$
DECLARE
  v_admin_id uuid;
  v_client_id uuid;
  v_admin_bindings jsonb;
  v_client_bindings jsonb;
  v_sub jsonb;
BEGIN
  -- Admin vendor tenant
  INSERT INTO linkaios_kernel.tenants (slug, display_name, config_json)
  VALUES (
    'linktrend-admin',
    'LiNKtrend Admin',
    jsonb_build_object('fleet', jsonb_build_object('tenant_kind', 'admin', 'llm_council_entitled', false))
  )
  ON CONFLICT (slug) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    updated_at = now()
  RETURNING tenant_id INTO v_admin_id;

  v_admin_bindings := jsonb_build_array(
    jsonb_build_object(
      'openclaw_agent_id', 'admin-openclaw',
      'slot_kind', 'ceo',
      'suite_id', '',
      'role_id', 'admin_openclaw_linkbot'
    )
  );

  PERFORM linkaios_kernel.provision_tenant_fleet(v_admin_id, 'admin', false, v_admin_bindings);

  -- Linktrend client tenant (studio operating its own business)
  INSERT INTO linkaios_kernel.tenants (slug, display_name, config_json)
  VALUES (
    'linktrend',
    'Linktrend',
    jsonb_build_object('fleet', jsonb_build_object('tenant_kind', 'client', 'llm_council_entitled', true))
  )
  ON CONFLICT (slug) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    updated_at = now()
  RETURNING tenant_id INTO v_client_id;

  v_client_bindings := jsonb_build_array(
    jsonb_build_object(
      'openclaw_agent_id', 'ceo-client',
      'slot_kind', 'ceo',
      'suite_id', '',
      'role_id', 'ceo_client_linkbot'
    )
  );

  PERFORM linkaios_kernel.provision_tenant_fleet(v_client_id, 'client', true, v_client_bindings);

  -- LinkSites suite (MVO modules)
  v_sub := linkaios_kernel.subscribe_suite_fleet(
    v_client_id,
    'linksites',
    ARRAY['lead_to_preview', 'publish', 'outreach']::text[],
    jsonb_build_array(
      jsonb_build_object(
        'openclaw_agent_id', 'linksites-head',
        'slot_kind', 'suite_head',
        'suite_id', 'linksites',
        'role_id', 'outreach_bot'
      )
    )
  );

  -- LiNKdeveloper suite (client-only; not marketplace-visible for other tenants)
  v_sub := linkaios_kernel.subscribe_suite_fleet(
    v_client_id,
    'linkdeveloper',
    ARRAY['product_run', 'validation', 'launch']::text[],
    jsonb_build_array(
      jsonb_build_object(
        'openclaw_agent_id', 'linkdeveloper-orchestrator',
        'slot_kind', 'suite_head',
        'suite_id', 'linkdeveloper',
        'role_id', 'suite_orchestrator_linkbot'
      ),
      jsonb_build_object(
        'openclaw_agent_id', 'linkdeveloper-steward',
        'slot_kind', 'suite_role',
        'suite_id', 'linkdeveloper',
        'role_id', 'product_steward_linkbot'
      )
    )
  );

  -- Enable WebsiteFactory plugin for Linktrend client when present
  INSERT INTO linkaios_kernel.tenant_plugins (tenant_id, plugin_id, enabled)
  SELECT v_client_id, 'websitefactory', true
  WHERE EXISTS (SELECT 1 FROM linkaios_kernel.plugins WHERE plugin_id = 'websitefactory')
  ON CONFLICT (tenant_id, plugin_id) DO UPDATE SET enabled = true, updated_at = now();

  RETURN jsonb_build_object(
    'admin_tenant_id', v_admin_id,
    'client_tenant_id', v_client_id,
    'client_suites', jsonb_build_array('linksites', 'linkdeveloper'),
    'ok', true
  );
END;
$$;

REVOKE ALL ON FUNCTION linkaios_kernel.seed_studio_tenants() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION linkaios_kernel.seed_studio_tenants() TO service_role;

COMMIT;
