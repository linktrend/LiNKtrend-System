import { describe, expect, it } from "vitest";

import { buildFleetV1DashboardSummary } from "./fleet-dashboard";

describe("fleet v1 dashboard (Wave 6.5)", () => {
  it("lists five OpenClaw profiles and eight AZ lanes", () => {
    const summary = buildFleetV1DashboardSummary();
    expect(summary.openclawProfiles).toHaveLength(5);
    expect(summary.agentZeroLanes).toHaveLength(8);
    expect(summary.gatewayCap).toBe(5);
    expect(summary.openclawProfiles.map((p) => p.agentId)).toContain("admin-openclaw");
    expect(summary.agentZeroLanes.map((l) => l.laneId)).toContain("az-librarian");
    expect(summary.agentZeroLanes.map((l) => l.laneId)).toContain("az-suitegen-factory");
  });
});
