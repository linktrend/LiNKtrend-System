import { describe, expect, it } from "vitest";

import {
  LINKSUITEGEN_AGENT_ZERO_FACTORY_LANE,
  LINKSUITEGEN_FACTORY_ANALYST_ROLE_IDS,
  LINKSUITEGEN_OPENCLAW_ORCHESTRATOR_AGENT,
  LINKSUITEGEN_ORCHESTRATOR_ROLE_IDS,
  agentZeroLaneForLinksuitegenRole,
  openClawAgentIdForLinksuitegenRole,
  runtimeForLinksuitegenRole,
} from "./openclaw-mapping.js";

describe("linksuitegen openclaw-mapping (Wave 1.7)", () => {
  it("maps orchestrator roles to admin-openclaw", () => {
    expect(LINKSUITEGEN_OPENCLAW_ORCHESTRATOR_AGENT).toBe("admin-openclaw");
    for (const roleId of LINKSUITEGEN_ORCHESTRATOR_ROLE_IDS) {
      expect(openClawAgentIdForLinksuitegenRole(roleId)).toBe("admin-openclaw");
      expect(runtimeForLinksuitegenRole(roleId)).toEqual({
        runtime: "openclaw",
        agentId: "admin-openclaw",
      });
    }
  });

  it("maps factory analyst roles to az-suitegen-factory (not OpenClaw)", () => {
    expect(LINKSUITEGEN_AGENT_ZERO_FACTORY_LANE).toBe("az-suitegen-factory");
    for (const roleId of LINKSUITEGEN_FACTORY_ANALYST_ROLE_IDS) {
      expect(openClawAgentIdForLinksuitegenRole(roleId)).toBeNull();
      expect(agentZeroLaneForLinksuitegenRole(roleId)).toBe("az-suitegen-factory");
      expect(runtimeForLinksuitegenRole(roleId)).toEqual({
        runtime: "agent_zero",
        laneId: "az-suitegen-factory",
      });
    }
  });

  it("does not reference legacy linksuitegen-factory OpenClaw agent", () => {
    const serialized = JSON.stringify({
      orchestrator: LINKSUITEGEN_OPENCLAW_ORCHESTRATOR_AGENT,
      factoryLane: LINKSUITEGEN_AGENT_ZERO_FACTORY_LANE,
    });
    expect(serialized).not.toContain("linksuitegen-factory");
    expect(serialized).not.toContain("linksuitegen-orchestrator");
  });
});
