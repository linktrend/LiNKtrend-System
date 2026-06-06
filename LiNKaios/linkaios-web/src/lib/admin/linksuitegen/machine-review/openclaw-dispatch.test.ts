import { describe, expect, it } from "vitest";

import { agentIdForLinksuitegenRole } from "./openclaw-dispatch";

describe("openclaw-dispatch (fleet v1)", () => {
  it("maps orchestrator roles to admin-openclaw", () => {
    expect(agentIdForLinksuitegenRole("suitegen_orchestrator_linkbot")).toBe("admin-openclaw");
    expect(agentIdForLinksuitegenRole("handoff_coordinator_linkbot")).toBe("admin-openclaw");
  });

  it("does not map factory analyst roles to legacy OpenClaw profiles", () => {
    const factoryRoles = [
      "discovery_analyst_linkbot",
      "bop_architect_linkbot",
      "validation_qa_linkbot",
      "linksuitegen_crm_classifier_linkbot",
    ];
    for (const roleId of factoryRoles) {
      expect(agentIdForLinksuitegenRole(roleId)).toBeNull();
    }
    expect(agentIdForLinksuitegenRole("linksuitegen-factory")).toBeNull();
    expect(agentIdForLinksuitegenRole("linksuitegen-orchestrator")).toBeNull();
  });
});
