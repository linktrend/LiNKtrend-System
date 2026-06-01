import { describe, expect, it } from "vitest";

import { ALL_LICENSEES_SCOPE } from "@/lib/app-roles";

import {
  assertTenantScopedAccess,
  DEMO_TENANT_ID,
  filterRowsForLicensorScope,
  nextSuitePublishState,
  suiteVisibleInMarketplace,
} from "./admin-vendor-ops";

describe("admin vendor ops (LTS-004)", () => {
  it("blocks cross-tenant scoped mutations from All licensees view", () => {
    const result = assertTenantScopedAccess(ALL_LICENSEES_SCOPE, DEMO_TENANT_ID);
    expect(result.allowed).toBe(false);
    expect(result.reason).toMatch(/Cross-tenant/i);
  });

  it("allows vendor ops when licensor scope matches tenant", () => {
    const result = assertTenantScopedAccess("xyz-marketing", "xyz-marketing");
    expect(result.allowed).toBe(true);
  });

  it("filters licensee rows without leaking other tenants when scoped", () => {
    const rows = [
      { tenantId: "xyz-marketing", name: "A" },
      { tenantId: "lexos-legal", name: "B" },
    ];
    expect(filterRowsForLicensorScope("xyz-marketing", rows)).toEqual([rows[0]]);
    expect(filterRowsForLicensorScope(ALL_LICENSEES_SCOPE, rows)).toEqual(rows);
  });

  it("suite publish visibility follows draft → ready → published lifecycle", () => {
    expect(suiteVisibleInMarketplace("draft")).toBe(false);
    expect(suiteVisibleInMarketplace("ready")).toBe(false);
    expect(suiteVisibleInMarketplace("published")).toBe(true);
    expect(nextSuitePublishState("draft", "mark_ready")).toBe("ready");
    expect(nextSuitePublishState("ready", "publish")).toBe("published");
  });
});
