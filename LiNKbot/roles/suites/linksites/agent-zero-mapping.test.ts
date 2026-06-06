import { describe, expect, it } from "vitest";

import {
  agentZeroLaneForLinksitesRole,
  LINKSITES_ROLE_TO_AGENT_ZERO_LANE,
  runtimeForLinksitesRole,
} from "./agent-zero-mapping.js";

describe("linksites agent-zero-mapping (Wave 2.4)", () => {
  it("maps research and build roles to AZ lanes", () => {
    expect(LINKSITES_ROLE_TO_AGENT_ZERO_LANE.research_enrichment_bot).toBe("az-linksites-research");
    expect(LINKSITES_ROLE_TO_AGENT_ZERO_LANE.website_builder_bot).toBe("az-linksites-build");
    expect(LINKSITES_ROLE_TO_AGENT_ZERO_LANE.lead_scout_bot).toBe("az-linksites-research");
  });

  it("resolves outreach to OpenClaw head", () => {
    expect(runtimeForLinksitesRole("outreach_bot")).toEqual({
      runtime: "openclaw",
      agentId: "linksites-head",
    });
  });

  it("returns null for unknown roles", () => {
    expect(agentZeroLaneForLinksitesRole("unknown_bot")).toBeNull();
  });
});
