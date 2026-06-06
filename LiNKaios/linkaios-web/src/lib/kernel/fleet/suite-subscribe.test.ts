import { describe, expect, it } from "vitest";

import { buildTenantFleetProvision } from "./tenant-provision";
import { subscribeSuiteFleet } from "./suite-subscribe";

describe("suite subscribe fleet slots (Wave 5.3)", () => {
  it("allocates linksites-head on client subscribe", () => {
    const provision = buildTenantFleetProvision({
      tenantId: "t1",
      slug: "linktrend",
      displayName: "Linktrend",
      tenantKind: "client",
    });
    const result = subscribeSuiteFleet({
      tenantId: "t1",
      tenantKind: "client",
      suiteId: "linksites",
      moduleIds: ["websitefactory"],
      existingBindings: provision.bindings,
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.newBindings.some((b) => b.openclawAgentId === "linksites-head")).toBe(true);
    }
  });

  it("rejects linkdeveloper subscribe on admin tenant", () => {
    const provision = buildTenantFleetProvision({
      tenantId: "t-admin",
      slug: "admin",
      displayName: "Admin",
      tenantKind: "admin",
    });
    const result = subscribeSuiteFleet({
      tenantId: "t-admin",
      tenantKind: "admin",
      suiteId: "linkdeveloper",
      moduleIds: ["factory"],
      existingBindings: provision.bindings,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe("SUITE_NOT_ALLOWED");
  });

  it("rejects subscribe when gateway cap exceeded", () => {
    const bindings = [
      { openclawAgentId: "ceo-client", slotKind: "ceo" as const },
      { openclawAgentId: "linkdeveloper-orchestrator", slotKind: "suite_head" as const, suiteId: "linkdeveloper" },
      { openclawAgentId: "linkdeveloper-steward", slotKind: "suite_role" as const, suiteId: "linkdeveloper" },
      { openclawAgentId: "admin-openclaw", slotKind: "ceo" as const },
      { openclawAgentId: "extra-profile", slotKind: "suite_role" as const },
    ];
    const result = subscribeSuiteFleet({
      tenantId: "t1",
      tenantKind: "client",
      suiteId: "linksites",
      moduleIds: ["m1"],
      existingBindings: bindings,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe("FLEET_OVER_CAP");
  });
});
