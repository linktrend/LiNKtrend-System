import { describe, expect, it } from "vitest";

import { buildTenantFleetProvision } from "./tenant-provision";

describe("tenant fleet provision (Wave 5.2)", () => {
  it("binds admin-openclaw for admin tenant", () => {
    const result = buildTenantFleetProvision({
      tenantId: "t-admin",
      slug: "linktrend-admin",
      displayName: "LiNKtrend Admin",
      tenantKind: "admin",
    });
    expect(result.bindings).toEqual([
      {
        openclawAgentId: "admin-openclaw",
        slotKind: "ceo",
        roleId: "admin_openclaw_linkbot",
      },
    ]);
    expect(result.llmCouncilEntitled).toBe(false);
  });

  it("binds ceo-client and council flag for client tenant", () => {
    const result = buildTenantFleetProvision({
      tenantId: "t-client",
      slug: "linktrend",
      displayName: "Linktrend",
      tenantKind: "client",
    });
    expect(result.bindings[0]?.openclawAgentId).toBe("ceo-client");
    expect(result.llmCouncilEntitled).toBe(true);
  });
});
