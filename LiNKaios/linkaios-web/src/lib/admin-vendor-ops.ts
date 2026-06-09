/**
 * Admin vendor ops — demo tenant, suite catalogue publish/visibility, tenant isolation.
 * Traceability: PPD §4 Admin (LTS-004).
 */

import { ALL_LICENSEES_SCOPE, type LicensorScope } from "@/lib/app-roles";
import type { LicensorSuitePublishState } from "@/lib/licensor-suite-catalog";

export const DEMO_TENANT_ID = "demo-tenant";

export type TenantScopedRow = { tenantId: string };

export function assertTenantScopedAccess(
  activeScope: LicensorScope,
  resourceTenantId: string,
): { allowed: boolean; reason?: string } {
  if (activeScope === ALL_LICENSEES_SCOPE) {
    return {
      allowed: false,
      reason: "Cross-tenant mutation blocked in All licensees view — select one licensee first",
    };
  }
  if (activeScope !== resourceTenantId) {
    return {
      allowed: false,
      reason: `Cross-tenant access denied: scope ${activeScope} cannot access tenant ${resourceTenantId}`,
    };
  }
  return { allowed: true };
}

export function filterRowsForLicensorScope<T extends TenantScopedRow>(
  scope: LicensorScope,
  rows: T[],
): T[] {
  if (scope === ALL_LICENSEES_SCOPE) return rows;
  return rows.filter((row) => row.tenantId === scope);
}

export function suiteVisibleInMarketplace(publishState: LicensorSuitePublishState): boolean {
  return publishState === "published";
}

export type SuitePublishAction = "mark_ready" | "publish" | "unpublish" | "suspend";

export function nextSuitePublishState(
  current: LicensorSuitePublishState,
  action: SuitePublishAction,
): LicensorSuitePublishState | null {
  if (action === "mark_ready" && current === "draft") return "ready";
  if (action === "publish" && current === "ready") return "published";
  if (action === "unpublish" && current === "published") return "ready";
  if (action === "suspend" && current === "published") return "draft";
  return null;
}

export function demoTenantLabel(): string {
  return "Demo Tenant";
}
