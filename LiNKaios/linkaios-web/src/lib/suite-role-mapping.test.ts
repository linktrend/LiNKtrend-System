import { describe, expect, it } from "vitest";

import {
  agentZeroLaneForSuiteRole,
  openClawAgentForRole,
  SUITE_ROLE_TO_LINKBOT_ROLE,
  SUITE_ROLE_TO_OPENCLAW_AGENT,
} from "./suite-role-mapping";

describe("suite-role-mapping (fleet v1)", () => {
  it("maps outreach to linksites-head OpenClaw profile", () => {
    expect(openClawAgentForRole(SUITE_ROLE_TO_LINKBOT_ROLE.outreach)).toBe("linksites-head");
  });

  it("does not map research roles to legacy OpenClaw profiles", () => {
    expect(openClawAgentForRole("research_enrichment_bot")).toBeNull();
    expect(openClawAgentForRole("website_builder_bot")).toBeNull();
    expect(openClawAgentForRole("librarian_bot")).toBeNull();
  });

  it("maps AZ lanes for research, build, and librarian", () => {
    expect(agentZeroLaneForSuiteRole("research_enrichment_bot")).toBe("az-linksites-research");
    expect(agentZeroLaneForSuiteRole("website_builder_bot")).toBe("az-linksites-build");
    expect(agentZeroLaneForSuiteRole("librarian_bot")).toBe("az-librarian");
  });

  it("only exposes fleet v1 OpenClaw agent ids", () => {
    for (const agentId of Object.values(SUITE_ROLE_TO_OPENCLAW_AGENT)) {
      expect(agentId).toBe("linksites-head");
    }
  });
});
