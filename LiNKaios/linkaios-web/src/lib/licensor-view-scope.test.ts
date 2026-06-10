import { describe, expect, it } from "vitest";

import {
  ADMIN_SCOPE,
  ALL_LICENSEES_SCOPE,
  PLATFORM_ALL_SCOPE,
} from "@/lib/app-roles";

import {
  assertFleetTroubleshootAllowed,
  assertTenantScopedAccess,
  filterFleetAgentsForViewScope,
  filterLeasesForViewScope,
  filterSupportTicketsForViewScope,
  LICENSOR_TENANT_ID_FALLBACK,
  matchesLicenseeRegistryId,
  normalizeLicensorScope,
  parseLicensorScopeParam,
} from "./licensor-view-scope";

describe("licensor view scope", () => {
  it("normalizes legacy admin URL param", () => {
    expect(parseLicensorScopeParam("admin")).toBe(ADMIN_SCOPE);
    expect(normalizeLicensorScope(null)).toBe(PLATFORM_ALL_SCOPE);
  });

  it("blocks cross-tenant mutations in aggregate views", () => {
    expect(assertTenantScopedAccess(ALL_LICENSEES_SCOPE, "xyz-marketing").allowed).toBe(false);
    expect(assertTenantScopedAccess(PLATFORM_ALL_SCOPE, "xyz-marketing").allowed).toBe(false);
    expect(assertTenantScopedAccess("xyz-marketing", "xyz-marketing").allowed).toBe(true);
  });

  it("limits admin view mutations to licensor tenant", () => {
    const result = assertTenantScopedAccess(ADMIN_SCOPE, "xyz-marketing", LICENSOR_TENANT_ID_FALLBACK);
    expect(result.allowed).toBe(false);
    expect(assertTenantScopedAccess(ADMIN_SCOPE, LICENSOR_TENANT_ID_FALLBACK, LICENSOR_TENANT_ID_FALLBACK).allowed).toBe(
      true,
    );
  });

  it("filters lease rows by view", () => {
    const rows = [
      { lease_id: "1", tenant_id: "linktrend" },
      { lease_id: "2", tenant_id: "xyz-marketing" },
    ];
    expect(filterLeasesForViewScope(PLATFORM_ALL_SCOPE, rows)).toEqual(rows);
    expect(filterLeasesForViewScope(ADMIN_SCOPE, rows, LICENSOR_TENANT_ID_FALLBACK)).toEqual([rows[0]]);
    expect(filterLeasesForViewScope(ALL_LICENSEES_SCOPE, rows, LICENSOR_TENANT_ID_FALLBACK)).toEqual([rows[1]]);
    expect(filterLeasesForViewScope("xyz-marketing", rows, LICENSOR_TENANT_ID_FALLBACK)).toEqual([rows[1]]);
  });

  it("filters support tickets by view", () => {
    const rows = [
      { id: "1", licenseeId: "xyz-marketing" },
      { id: "2", licenseeId: "lexos-legal" },
    ];
    expect(filterSupportTicketsForViewScope(PLATFORM_ALL_SCOPE, rows)).toEqual(rows);
    expect(filterSupportTicketsForViewScope(ALL_LICENSEES_SCOPE, rows)).toEqual(rows);
    expect(filterSupportTicketsForViewScope(ADMIN_SCOPE, rows)).toEqual([]);
    expect(filterSupportTicketsForViewScope("xyz-marketing", rows)).toEqual([rows[0]]);
  });

  it("matches licensee registry ids per view", () => {
    expect(matchesLicenseeRegistryId(ALL_LICENSEES_SCOPE, "xyz-marketing")).toBe(true);
    expect(matchesLicenseeRegistryId(ADMIN_SCOPE, "xyz-marketing")).toBe(false);
    expect(matchesLicenseeRegistryId("xyz-marketing", "xyz-marketing")).toBe(true);
  });

  it("filters fleet agents for admin-only view", () => {
    const agents = [
      { id: "a1", runtime_settings: { linkaios_fleet: { scope: "licensor" } } },
      { id: "a2", runtime_settings: { linkaios_fleet: { scope: "licensee", tenant_id: "xyz-marketing" } } },
    ];
    expect(filterFleetAgentsForViewScope(agents, ADMIN_SCOPE)).toEqual([agents[0]]);
    expect(filterFleetAgentsForViewScope(agents, ALL_LICENSEES_SCOPE)).toEqual([agents[1]]);
    expect(filterFleetAgentsForViewScope(agents, PLATFORM_ALL_SCOPE)).toEqual(agents);
  });

  it("requires explicit licensee for fleet troubleshoot in aggregate views", () => {
    expect(assertFleetTroubleshootAllowed(ALL_LICENSEES_SCOPE, "xyz-marketing").allowed).toBe(false);
    expect(assertFleetTroubleshootAllowed("xyz-marketing", "xyz-marketing").allowed).toBe(true);
  });
});
