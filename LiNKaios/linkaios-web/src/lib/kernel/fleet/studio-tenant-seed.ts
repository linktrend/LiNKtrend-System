/**
 * Studio tenant seed plan — Linktrend Admin + Linktrend Client (Wave 7.1–7.3).
 *
 * SQL: supabase/migrations/20260606140000_wave6_7_studio_tenants.sql
 */

import { buildTenantFleetProvision } from "./tenant-provision";
import { subscribeSuiteFleet, type FleetOpenClawSlot } from "./suite-subscribe";

export const STUDIO_ADMIN_TENANT_SLUG = "linktrend-admin";
export const STUDIO_CLIENT_TENANT_SLUG = "linktrend";

export const LINKTREND_CLIENT_SUITE_IDS = ["linksites", "linkdeveloper"] as const;

export type StudioTenantSeedPlan = {
  slug: string;
  displayName: string;
  tenantKind: "admin" | "client";
  bindings: FleetOpenClawSlot[];
  suiteEntitlements: Array<{ suiteId: string; moduleIds: string[] }>;
};

/** Deterministic studio tenant bootstrap for v1 (Admin vendor + Linktrend client). */
export function buildStudioTenantSeedPlans(): StudioTenantSeedPlan[] {
  const adminProvision = buildTenantFleetProvision({
    tenantId: "00000000-0000-4000-8000-000000000001",
    slug: STUDIO_ADMIN_TENANT_SLUG,
    displayName: "LiNKtrend Admin",
    tenantKind: "admin",
  });

  const clientProvision = buildTenantFleetProvision({
    tenantId: "00000000-0000-4000-8000-000000000002",
    slug: STUDIO_CLIENT_TENANT_SLUG,
    displayName: "Linktrend",
    tenantKind: "client",
  });

  let clientBindings = [...clientProvision.bindings];
  const clientEntitlements: Array<{ suiteId: string; moduleIds: string[] }> = [];

  for (const suiteId of LINKTREND_CLIENT_SUITE_IDS) {
    const moduleIds =
      suiteId === "linksites"
        ? ["lead_to_preview", "publish", "outreach"]
        : ["product_run", "validation", "launch"];
    const sub = subscribeSuiteFleet({
      tenantId: clientProvision.tenantId,
      tenantKind: "client",
      suiteId,
      moduleIds,
      existingBindings: clientBindings,
    });
    if (sub.ok) {
      clientBindings = sub.allBindings;
      clientEntitlements.push({ suiteId, moduleIds });
    }
  }

  return [
    {
      slug: STUDIO_ADMIN_TENANT_SLUG,
      displayName: "LiNKtrend Admin",
      tenantKind: "admin",
      bindings: adminProvision.bindings,
      suiteEntitlements: [],
    },
    {
      slug: STUDIO_CLIENT_TENANT_SLUG,
      displayName: "Linktrend",
      tenantKind: "client",
      bindings: clientBindings,
      suiteEntitlements: clientEntitlements,
    },
  ];
}

/** LiNKdeveloper is client-only — excluded from marketplace for non-linktrend tenants. */
export function isSuiteVisibleInMarketplace(suiteId: string, tenantSlug: string | null): boolean {
  if (suiteId === "linkdeveloper") {
    return tenantSlug === STUDIO_CLIENT_TENANT_SLUG;
  }
  return true;
}
