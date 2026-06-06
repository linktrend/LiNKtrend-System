import { describe, expect, it } from "vitest";

import {
  agentZeroLaneForLinkdeveloperRole,
  LINKDEVELOPER_ROLE_TO_AGENT_ZERO_LANE,
  listLinkdeveloperAgentZeroRoleIds,
} from "./agent-zero-mapping.js";

describe("linkdeveloper agent-zero-mapping (Wave 2.4)", () => {
  it("maps analysis roles to az-linkdeveloper-analysis", () => {
    expect(LINKDEVELOPER_ROLE_TO_AGENT_ZERO_LANE.market_linkbot).toBe("az-linkdeveloper-analysis");
    expect(LINKDEVELOPER_ROLE_TO_AGENT_ZERO_LANE.requirements_linkbot).toBe("az-linkdeveloper-analysis");
  });

  it("maps architecture roles to az-linkdeveloper-architecture", () => {
    expect(agentZeroLaneForLinkdeveloperRole("architecture_linkbot")).toBe("az-linkdeveloper-architecture");
    expect(agentZeroLaneForLinkdeveloperRole("platform_linkbot")).toBe("az-linkdeveloper-architecture");
  });

  it("maps validation and ops lanes", () => {
    expect(agentZeroLaneForLinkdeveloperRole("qa_linkbot")).toBe("az-linkdeveloper-validation");
    expect(agentZeroLaneForLinkdeveloperRole("devops_linkbot")).toBe("az-linkdeveloper-ops");
  });

  it("lists seven specialist roles", () => {
    expect(listLinkdeveloperAgentZeroRoleIds()).toHaveLength(7);
  });
});
