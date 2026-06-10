-- Fix ambiguous tenant_id in seed_demo_tenant return (RETURNS TABLE vs bare SELECT).

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

  INSERT INTO linkaios_kernel.tenant_plugins (tenant_id, plugin_id, enabled)
  VALUES (v_tenant_id, 'websitefactory', true)
  ON CONFLICT ON CONSTRAINT tenant_plugins_pkey DO UPDATE SET enabled = true, updated_at = now();

  RETURN QUERY
  SELECT v_tenant_id AS tenant_id, v_plugin_ids AS plugin_ids;
END;
$$;

REVOKE ALL ON FUNCTION linkaios_kernel.seed_demo_tenant(text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION linkaios_kernel.seed_demo_tenant(text, text) TO service_role;
