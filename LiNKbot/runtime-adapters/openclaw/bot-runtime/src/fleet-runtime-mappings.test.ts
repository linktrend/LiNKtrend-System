import { describe, expect, it } from "vitest";

import { agentZeroLaneForPlatformLibrarianRole } from "../../../../roles/platform/librarian/agent-zero-mapping.js";
import { agentZeroLaneForLinkdeveloperRole } from "../../../../roles/suites/linkdeveloper/agent-zero-mapping.js";
import { agentZeroLaneForLinksitesRole } from "../../../../roles/suites/linksites/agent-zero-mapping.js";
import { agentZeroLaneForLinksuitegenRole } from "../../../../roles/suites/linksuitegen/agent-zero-mapping.js";
import { openClawAgentIdForLinkdeveloperRole } from "../../../../roles/suites/linkdeveloper/openclaw-mapping.js";
import { openClawAgentIdForLinksitesRole } from "../../../../roles/suites/linksites/openclaw-mapping.js";
import { openClawAgentIdForLinksuitegenRole } from "../../../../roles/suites/linksuitegen/openclaw-mapping.js";
import {
  AGENT_ZERO_ROLE_TO_LANE,
  FLEET_V1_AGENT_ZERO_LANE_IDS,
  OPENCLAW_ROLE_TO_AGENT,
} from "./fleet-runtime-mappings.js";

const CANONICAL_AZ_ROLES = [
  "librarian_bot",
  "lead_scout_bot",
  "research_enrichment_bot",
  "website_builder_bot",
  "discovery_analyst_linkbot",
  "bop_architect_linkbot",
  "validation_qa_linkbot",
  "linksuitegen_crm_classifier_linkbot",
  "market_linkbot",
  "requirements_linkbot",
  "architecture_linkbot",
  "platform_linkbot",
  "qa_linkbot",
  "security_linkbot",
  "devops_linkbot",
] as const;

function canonicalAzLane(roleId: string): string | null {
  return (
    agentZeroLaneForPlatformLibrarianRole(roleId) ??
    agentZeroLaneForLinksitesRole(roleId) ??
    agentZeroLaneForLinksuitegenRole(roleId) ??
    agentZeroLaneForLinkdeveloperRole(roleId) ??
    null
  );
}

describe("fleet-runtime-mappings sync (Wave 2.4)", () => {
  it("mirrors canonical Agent Zero lane tables", () => {
    for (const roleId of CANONICAL_AZ_ROLES) {
      expect(AGENT_ZERO_ROLE_TO_LANE[roleId]).toBe(canonicalAzLane(roleId));
      expect(FLEET_V1_AGENT_ZERO_LANE_IDS).toContain(AGENT_ZERO_ROLE_TO_LANE[roleId]);
    }
  });

  it("mirrors canonical OpenClaw mapping tables", () => {
    const openclawRoles = [
      "outreach_bot",
      "suite_orchestrator_linkbot",
      "product_steward_linkbot",
      "suitegen_orchestrator_linkbot",
      "handoff_coordinator_linkbot",
    ] as const;
    for (const roleId of openclawRoles) {
      const canonical =
        openClawAgentIdForLinksitesRole(roleId) ??
        openClawAgentIdForLinkdeveloperRole(roleId) ??
        openClawAgentIdForLinksuitegenRole(roleId) ??
        null;
      expect(OPENCLAW_ROLE_TO_AGENT[roleId]).toBe(canonical);
    }
  });
});
