import { describe, expect, it } from "vitest";

import { ALL_LICENSEES_SCOPE } from "@/lib/app-roles";

import {
  aggregateCrossTenantFleet,
  assertFleetTroubleshootAllowed,
  fleetHealthSummary,
  fleetTroubleshootHref,
  studioDefaultsForSuite,
  STUDIO_CAPABILITY_DEFAULTS,
} from "./admin-fleet-troubleshoot";

describe("admin fleet troubleshoot (LTS-005)", () => {
  const rows = [
    { id: "bot-a", tenantId: "xyz-marketing", statusLabel: "Busy" },
    { id: "bot-b", tenantId: "lexos-legal", statusLabel: "Idle" },
  ];

  it("aggregates fleet by licensor scope without cross-tenant leak", () => {
    expect(aggregateCrossTenantFleet("xyz-marketing", rows)).toEqual([rows[0]]);
    expect(aggregateCrossTenantFleet(ALL_LICENSEES_SCOPE, rows)).toEqual(rows);
  });

  it("blocks troubleshoot when scope is All licensees", () => {
    const result = assertFleetTroubleshootAllowed(ALL_LICENSEES_SCOPE, "xyz-marketing");
    expect(result.allowed).toBe(false);
    expect(result.reason).toMatch(/Select a licensee/i);
  });

  it("acceptance: vendor fleet status, troubleshoot links, capability defaults", () => {
    const scoped = aggregateCrossTenantFleet("xyz-marketing", rows);
    const health = fleetHealthSummary(scoped);
    expect(health.total).toBe(1);
    expect(health.busy).toBe(1);
    expect(fleetTroubleshootHref("bot-a", "view_logs")).toBe("/workers/bot-a/sessions");
    expect(studioDefaultsForSuite("linksites").length).toBeGreaterThan(0);
    expect(STUDIO_CAPABILITY_DEFAULTS.some((c) => c.capability_id === "cap.linksites.publish")).toBe(true);
    expect(assertFleetTroubleshootAllowed("xyz-marketing", "xyz-marketing").allowed).toBe(true);
  });
});
