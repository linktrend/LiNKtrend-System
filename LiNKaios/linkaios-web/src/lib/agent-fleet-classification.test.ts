import { describe, expect, it } from "vitest";

import { isAdminBot, parseAgentFleetClassification } from "./agent-fleet-classification";

describe("agent fleet classification", () => {
  it("parseAgentFleetClassification reads linkaios_fleet metadata", () => {
    expect(
      parseAgentFleetClassification({
        linkaios_fleet: { scope: "licensor", tenant_id: "lic-1" },
      }),
    ).toEqual({ scope: "licensor", tenantId: "lic-1" });
    expect(parseAgentFleetClassification({})).toEqual({ scope: null, tenantId: null });
  });

  it("isAdminBot respects explicit licensor scope", () => {
    expect(
      isAdminBot(
        { id: "a1", runtime_settings: { linkaios_fleet: { scope: "licensor" } } },
        { licensorTenantId: "lic-1" },
      ),
    ).toBe(true);
    expect(
      isAdminBot(
        { id: "a2", runtime_settings: { linkaios_fleet: { scope: "licensee" } } },
        { licensorTenantId: "lic-1" },
      ),
    ).toBe(false);
  });

  it("isAdminBot matches licensor tenant_id column when scope is absent", () => {
    expect(
      isAdminBot(
        { id: "a3", tenant_id: "lic-1", runtime_settings: {} },
        { licensorTenantId: "lic-1" },
      ),
    ).toBe(true);
    expect(
      isAdminBot(
        { id: "a4", tenant_id: "client-9", runtime_settings: {} },
        { licensorTenantId: "lic-1" },
      ),
    ).toBe(false);
  });

  it("isAdminBot matches licensor tenant_id when scope is absent", () => {
    expect(
      isAdminBot(
        { id: "a3", runtime_settings: { linkaios_fleet: { tenant_id: "lic-1" } } },
        { licensorTenantId: "lic-1" },
      ),
    ).toBe(true);
    expect(
      isAdminBot(
        { id: "a4", runtime_settings: { linkaios_fleet: { tenant_id: "client-9" } } },
        { licensorTenantId: "lic-1" },
      ),
    ).toBe(false);
  });

  it("isAdminBot defaults unclassified agents to client tenant bots", () => {
    expect(isAdminBot({ id: "a5", runtime_settings: {} }, { licensorTenantId: "lic-1" })).toBe(false);
  });

  it("isAdminBot treats demo fixture agents as admin bots when mocks are on", () => {
    expect(isAdminBot({ id: "demo-lisa", runtime_settings: {} }, { uiMocksDemoAgent: true })).toBe(true);
    expect(isAdminBot({ id: "demo-lisa", runtime_settings: {} }, { uiMocksDemoAgent: false })).toBe(false);
  });
});
