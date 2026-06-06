import { describe, expect, it } from "vitest";

import {
  buildStudioTenantSeedPlans,
  isSuiteVisibleInMarketplace,
  STUDIO_CLIENT_TENANT_SLUG,
} from "./studio-tenant-seed";

describe("studio tenant seed (Wave 7)", () => {
  it("provisions linktrend client with linksites and linkdeveloper entitlements", () => {
    const plans = buildStudioTenantSeedPlans();
    const client = plans.find((p) => p.slug === STUDIO_CLIENT_TENANT_SLUG);
    expect(client?.tenantKind).toBe("client");
    expect(client?.bindings.some((b) => b.openclawAgentId === "ceo-client")).toBe(true);
    expect(client?.suiteEntitlements.map((e) => e.suiteId)).toEqual(
      expect.arrayContaining(["linksites", "linkdeveloper"]),
    );
  });

  it("hides linkdeveloper from marketplace for non-linktrend tenants", () => {
    expect(isSuiteVisibleInMarketplace("linkdeveloper", "demo")).toBe(false);
    expect(isSuiteVisibleInMarketplace("linkdeveloper", STUDIO_CLIENT_TENANT_SLUG)).toBe(true);
    expect(isSuiteVisibleInMarketplace("linksites", "demo")).toBe(true);
  });
});
