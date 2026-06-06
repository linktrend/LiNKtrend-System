import { describe, expect, it } from "vitest";

import { FLEET_V1_OPENCLAW_AGENT_IDS } from "../../../../roles/platform/fleet-v1-openclaw.js";
import { LINKSITES_ROLE_TO_OPENCLAW_AGENT } from "../../../../roles/suites/linksites/openclaw-mapping.js";
import { LINKDEVELOPER_ROLE_TO_OPENCLAW_AGENT } from "../../../../roles/suites/linkdeveloper/openclaw-mapping.js";
import { LINKSUITEGEN_FACTORY_ANALYST_ROLE_IDS } from "../../../../roles/suites/linksuitegen/openclaw-mapping.js";
import { listOpenClawMappedRoleIds, openClawAgentIdForRole } from "./suite-role-openclaw.js";

describe("suite-role-openclaw barrel (Wave 1.8)", () => {
  it("resolves LinkSites roles to linksites-head", () => {
    expect(openClawAgentIdForRole("lead_scout_bot")).toBe("linksites-head");
    expect(openClawAgentIdForRole("outreach_bot")).toBe("linksites-head");
    expect(openClawAgentIdForRole("librarian_bot")).toBe("linksites-head");
  });

  it("resolves LiNKdeveloper orchestrator and steward profiles", () => {
    expect(openClawAgentIdForRole("suite_orchestrator_linkbot")).toBe("linkdeveloper-orchestrator");
    expect(openClawAgentIdForRole("product_steward_linkbot")).toBe("linkdeveloper-steward");
  });

  it("resolves LiNKsuitegen orchestrator roles to admin-openclaw", () => {
    expect(openClawAgentIdForRole("suitegen_orchestrator_linkbot")).toBe("admin-openclaw");
    expect(openClawAgentIdForRole("handoff_coordinator_linkbot")).toBe("admin-openclaw");
  });

  it("does not map LiNKsuitegen factory roles to OpenClaw", () => {
    for (const roleId of LINKSUITEGEN_FACTORY_ANALYST_ROLE_IDS) {
      expect(openClawAgentIdForRole(roleId)).toBeNull();
    }
  });

  it("resolves platform CEO profile aliases", () => {
    expect(openClawAgentIdForRole("ceo_client_linkbot")).toBe("ceo-client");
    expect(openClawAgentIdForRole("admin_openclaw_linkbot")).toBe("admin-openclaw");
  });

  it("aggregates mappings from all suite barrels", () => {
    const mapped = new Set(listOpenClawMappedRoleIds());
    for (const roleId of Object.keys(LINKSITES_ROLE_TO_OPENCLAW_AGENT)) {
      expect(mapped.has(roleId)).toBe(true);
    }
    for (const roleId of Object.keys(LINKDEVELOPER_ROLE_TO_OPENCLAW_AGENT)) {
      expect(mapped.has(roleId)).toBe(true);
    }
  });

  it("only returns fleet v1 agent ids", () => {
    const agentIds = new Set(
      listOpenClawMappedRoleIds()
        .map((roleId) => openClawAgentIdForRole(roleId))
        .filter((id): id is string => id != null),
    );
    for (const agentId of agentIds) {
      expect(FLEET_V1_OPENCLAW_AGENT_IDS).toContain(agentId);
    }
  });

  it("rejects legacy OpenClaw agent ids", () => {
    const legacy = ["linksites-builder", "linksites-ops", "librarian", "linksuitegen-orchestrator", "linksuitegen-factory"];
    const resolved = listOpenClawMappedRoleIds()
      .map((roleId) => openClawAgentIdForRole(roleId))
      .filter((id): id is string => id != null);
    for (const bad of legacy) {
      expect(resolved).not.toContain(bad);
    }
  });
});
