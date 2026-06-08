import "server-only";

import { getSupabaseAdmin } from "@/lib/supabase-admin";

/** Vendor/licensor tenant slug — platform scope for LiNKtrend Admin governance surfaces. */
export const LICENSOR_TENANT_SLUG = "linktrend";
export const LICENSOR_TENANT_DISPLAY_NAME = "LiNKtrend";

function licensorTenantIdFromEnv(): string | null {
  return (
    process.env.LICENSOR_TENANT_ID?.trim() ||
    process.env.CALUSA_TENANT_ID?.trim() ||
    process.env.MVO_E2E_TENANT_ID?.trim() ||
    null
  );
}

/**
 * Resolve the vendor/licensor tenant for LiNKtrend Admin LinkSkills surfaces.
 * Never throws — returns null when env and seed fallback both fail (empty lease state OK).
 */
export async function resolveLicensorTenantId(): Promise<string | null> {
  const fromEnv = licensorTenantIdFromEnv();
  if (fromEnv) return fromEnv;

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.schema("linkaios_kernel").rpc("seed_demo_tenant", {
    p_slug: LICENSOR_TENANT_SLUG,
    p_display_name: LICENSOR_TENANT_DISPLAY_NAME,
  });

  if (error) {
    console.error("resolveLicensorTenantId: seed_demo_tenant failed:", error.message);
    return null;
  }

  if (!data?.length) {
    console.error("resolveLicensorTenantId: seed_demo_tenant returned empty result");
    return null;
  }

  const row = data[0] as { tenant_id?: string };
  if (!row.tenant_id) {
    console.error("resolveLicensorTenantId: seed_demo_tenant returned no tenant_id");
    return null;
  }

  return row.tenant_id;
}

/**
 * Resolve tenant for lease panels on the Client (licensee) surface.
 * Never throws — returns null when resolution fails.
 */
export async function resolveLicenseeTenantId(): Promise<string | null> {
  const fromEnv = process.env.MVO_E2E_TENANT_ID?.trim();
  if (fromEnv) return fromEnv;

  const tenantSlug = process.env.MVO_TENANT_SLUG?.trim() || "demo";
  const displayName =
    tenantSlug === "calusa" ? "Calusa" : tenantSlug === "demo" ? "Demo Tenant" : tenantSlug;

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.schema("linkaios_kernel").rpc("seed_demo_tenant", {
    p_slug: tenantSlug,
    p_display_name: displayName,
  });

  if (error) {
    console.error("resolveLicenseeTenantId: seed_demo_tenant failed:", error.message);
    return null;
  }

  if (!data?.length) {
    console.error("resolveLicenseeTenantId: seed_demo_tenant returned empty result");
    return null;
  }

  const row = data[0] as { tenant_id?: string };
  return row.tenant_id ?? null;
}

/**
 * Resolve tenant for LinkSkills lease panels based on Admin vs Client surface.
 */
export async function resolveLeasePanelTenantId(surface: "admin" | "licensee"): Promise<string | null> {
  return surface === "admin" ? resolveLicensorTenantId() : resolveLicenseeTenantId();
}

/**
 * @deprecated Use {@link resolveLicensorTenantId}. Calusa slug was licensee demo bleed.
 */
export async function resolveCalusaTenantId(): Promise<string> {
  const tenantId = await resolveLicensorTenantId();
  if (tenantId) return tenantId;
  throw new Error(
    "Failed to resolve licensor tenant: set LICENSOR_TENANT_ID or ensure seed_demo_tenant is available",
  );
}
