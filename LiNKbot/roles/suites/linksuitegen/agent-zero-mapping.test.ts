import { describe, expect, it } from "vitest";

import {
  agentZeroLaneForLinksuitegenRole,
  LINKSUITEGEN_AGENT_ZERO_FACTORY_LANE,
  LINKSUITEGEN_FACTORY_ANALYST_ROLE_IDS,
} from "./agent-zero-mapping.js";

describe("linksuitegen agent-zero-mapping (Wave 2.4)", () => {
  it("maps all factory analyst roles to az-suitegen-factory", () => {
    for (const roleId of LINKSUITEGEN_FACTORY_ANALYST_ROLE_IDS) {
      expect(agentZeroLaneForLinksuitegenRole(roleId)).toBe(LINKSUITEGEN_AGENT_ZERO_FACTORY_LANE);
    }
    expect(LINKSUITEGEN_AGENT_ZERO_FACTORY_LANE).toBe("az-suitegen-factory");
  });

  it("returns null for orchestrator roles (OpenClaw only)", () => {
    expect(agentZeroLaneForLinksuitegenRole("suitegen_orchestrator_linkbot")).toBeNull();
    expect(agentZeroLaneForLinksuitegenRole("handoff_coordinator_linkbot")).toBeNull();
  });
});
