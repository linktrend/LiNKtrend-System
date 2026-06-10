/**
 * Admin vendor ops — demo tenant, suite catalogue publish/visibility, tenant isolation.
 * Traceability: PPD §4 Admin (LTS-004).
 */

import type { LicensorSuitePublishState } from "@/lib/licensor-suite-catalog";

export {
  assertTenantScopedAccess,
  filterRowsForLicensorScope,
  type LicensorScope,
} from "@/lib/licensor-view-scope";

export const DEMO_TENANT_ID = "demo-tenant";

export type TenantScopedRow = { tenantId: string };

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
