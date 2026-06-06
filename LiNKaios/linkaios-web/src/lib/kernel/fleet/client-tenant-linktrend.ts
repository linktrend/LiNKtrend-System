/**
 * Linktrend studio client tenant fixtures (STUDIO_FORWARD_PLAN Wave 7).
 */

import { buildTenantFleetProvision } from "./tenant-provision";
import { subscribeSuiteFleet } from "./suite-subscribe";

export const LINKTREND_CLIENT_TENANT = {
  tenantId: "tenant-linktrend-studio",
  slug: "linktrend",
  displayName: "Linktrend Studio",
  companyId: "linktrend-studio",
} as const;

export const LINKTREND_CLIENT_SUITE_SUBSCRIPTIONS = ["linksites", "linkdeveloper"] as const;

export function buildLinktrendClientFleet() {
  const provision = buildTenantFleetProvision({
    tenantId: LINKTREND_CLIENT_TENANT.tenantId,
    slug: LINKTREND_CLIENT_TENANT.slug,
    displayName: LINKTREND_CLIENT_TENANT.displayName,
    tenantKind: "client",
  });

  let bindings = [...provision.bindings];
  const subscribed: string[] = [];

  for (const suiteId of LINKTREND_CLIENT_SUITE_SUBSCRIPTIONS) {
    const result = subscribeSuiteFleet({
      tenantId: LINKTREND_CLIENT_TENANT.tenantId,
      tenantKind: "client",
      suiteId,
      moduleIds: ["all"],
      existingBindings: bindings,
    });
    if (result.ok) {
      bindings = result.allBindings;
      subscribed.push(suiteId);
    }
  }

  return { provision, bindings, subscribed };
}

/** Module ids entitled for Linktrend studio company (Wave 7.5). */
export function linktrendStudioModuleEntitlements(): string[] {
  return [...LINKTREND_CLIENT_SUITE_SUBSCRIPTIONS];
}
