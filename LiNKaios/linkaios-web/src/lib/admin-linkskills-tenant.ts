import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import {
  isAdminViewScope,
  isAllLicenseesScope,
  isPlatformAllScope,
  isSingleLicenseeScope,
  type LicensorScope,
} from "@/lib/app-roles";
import type { CockpitFilterOptions } from "@/lib/cockpit";
import { loadLeaseStatusForTenants } from "@/lib/cockpit/cockpit-data";
import { filterLeasesForViewScope } from "@/lib/licensor-view-scope";
import { LICENSEE_REGISTRY } from "@/lib/licensee-registry";
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

async function resolveTenantUuidBySlug(slug: string): Promise<string | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .schema("linkaios_kernel")
    .from("tenants")
    .select("tenant_id")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    console.error(`resolveTenantUuidBySlug(${slug}):`, error.message);
    return null;
  }

  const row = data as { tenant_id?: string } | null;
  return row?.tenant_id ?? null;
}

/**
 * Resolve tenant UUIDs to query for the Admin sidebar View filter.
 * Includes registry slug fallbacks when kernel rows are not seeded yet.
 */
export async function resolveTenantIdsForViewScope(scope: LicensorScope): Promise<string[]> {
  const licensorId = await resolveLicensorTenantId();
  const licenseeSlugs = LICENSEE_REGISTRY.map((row) => row.id);
  const licenseeUuids = (
    await Promise.all(licenseeSlugs.map((slug) => resolveTenantUuidBySlug(slug)))
  ).filter((id): id is string => Boolean(id));

  const licenseeKeys = [...new Set([...licenseeUuids, ...licenseeSlugs])];

  if (isAdminViewScope(scope)) {
    return licensorId ? [licensorId, LICENSOR_TENANT_SLUG] : [LICENSOR_TENANT_SLUG];
  }

  if (isAllLicenseesScope(scope)) {
    return licenseeKeys;
  }

  if (isSingleLicenseeScope(scope)) {
    const uuid = await resolveTenantUuidBySlug(scope);
    return uuid ? [uuid, scope] : [scope];
  }

  if (isPlatformAllScope(scope)) {
    const all = new Set<string>(licenseeKeys);
    if (licensorId) {
      all.add(licensorId);
      all.add(LICENSOR_TENANT_SLUG);
    }
    return [...all];
  }

  return licensorId ? [licensorId] : [];
}

/**
 * Load capability leases for Admin View — aggregates across tenants when scope requires it.
 */
export async function loadLeasesForAdminView(
  supabase: SupabaseClient,
  scope: LicensorScope,
  options?: CockpitFilterOptions,
): Promise<ReturnType<typeof loadLeaseStatusForTenants>> {
  const tenantIds = await resolveTenantIdsForViewScope(scope);
  if (tenantIds.length === 0) return [];
  const leases = await loadLeaseStatusForTenants(supabase, tenantIds, options);
  const licensorTenantId = await resolveLicensorTenantId();
  return filterLeasesForViewScope(scope, leases, licensorTenantId);
}
