import { describe, expect, it } from "vitest";

import { FLEET_V1_AGENT_ZERO_LANE_IDS } from "./fleet-runtime-mappings.js";
import { agentZeroLaneForRole, listAgentZeroMappedRoleIds } from "./suite-role-agent-zero.js";

describe("suite-role-agent-zero barrel (Wave 2.4)", () => {
  it("maps librarian to az-librarian", () => {
    expect(agentZeroLaneForRole("librarian_bot")).toBe("az-librarian");
  });

  it("maps LinkSites research/build roles", () => {
    expect(agentZeroLaneForRole("research_enrichment_bot")).toBe("az-linksites-research");
    expect(agentZeroLaneForRole("website_builder_bot")).toBe("az-linksites-build");
  });

  it("maps LiNKsuitegen factory analysts to az-suitegen-factory", () => {
    expect(agentZeroLaneForRole("discovery_analyst_linkbot")).toBe("az-suitegen-factory");
  });

  it("maps LiNKdeveloper specialists", () => {
    expect(agentZeroLaneForRole("market_linkbot")).toBe("az-linkdeveloper-analysis");
    expect(agentZeroLaneForRole("devops_linkbot")).toBe("az-linkdeveloper-ops");
  });

  it("returns null for OpenClaw-only roles", () => {
    expect(agentZeroLaneForRole("linksites-head")).toBeNull();
    expect(agentZeroLaneForRole("suite_orchestrator_linkbot")).toBeNull();
  });

  it("only returns fleet v1 lane ids", () => {
    for (const roleId of listAgentZeroMappedRoleIds()) {
      const lane = agentZeroLaneForRole(roleId);
      expect(lane).toBeTruthy();
      expect(FLEET_V1_AGENT_ZERO_LANE_IDS).toContain(lane);
    }
  });
});
