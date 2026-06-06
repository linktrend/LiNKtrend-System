import { describe, expect, it } from "vitest";

import {
  assertBrainContextTenantScope,
  filterRowsByTenant,
  wouldCrossTenantBrainRead,
} from "./tenant-isolation";

describe("tenant isolation (Wave 5.6)", () => {
  const tenantA = "00000000-0000-4000-8000-000000000001";
  const tenantB = "00000000-0000-4000-8000-000000000002";

  it("denies cross-tenant brain context scope", () => {
    const violation = assertBrainContextTenantScope({
      requestTenantId: tenantA,
      scopeTenantId: tenantB,
      operation: "retrieve_context",
    });
    expect(violation?.code).toBe("CROSS_TENANT_READ_DENIED");
  });

  it("allows same-tenant brain context scope", () => {
    const violation = assertBrainContextTenantScope({
      requestTenantId: tenantA,
      scopeTenantId: tenantA,
      operation: "retrieve_context",
    });
    expect(violation).toBeNull();
  });

  it("two tenants: prove no brain cross-read in filtered store", () => {
    const store = [
      { id: "m1", tenant_id: tenantA, payload: { secret: "a-only" } },
      { id: "m2", tenant_id: tenantB, payload: { secret: "b-only" } },
      { id: "m3", tenant_id: tenantA, payload: { secret: "a2" } },
    ];

    const tenantAView = filterRowsByTenant(store, tenantA);
    expect(tenantAView).toHaveLength(2);
    expect(tenantAView.every((r) => r.tenant_id === tenantA)).toBe(true);
    expect(tenantAView.some((r) => r.id === "m2")).toBe(false);

    expect(wouldCrossTenantBrainRead(tenantA, tenantB)).toBe(true);
    expect(wouldCrossTenantBrainRead(tenantA, tenantA)).toBe(false);
  });
});
