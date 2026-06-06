/**
 * Suite role → Agent Zero lane barrel (fleet v1, Wave 2.4).
 */

import { agentZeroLaneForPlatformLibrarianRole } from "../../../../roles/platform/librarian/agent-zero-mapping.js";
import { agentZeroLaneForLinkdeveloperRole } from "../../../../roles/suites/linkdeveloper/agent-zero-mapping.js";
import { agentZeroLaneForLinksitesRole } from "../../../../roles/suites/linksites/agent-zero-mapping.js";
import { agentZeroLaneForLinksuitegenRole } from "../../../../roles/suites/linksuitegen/agent-zero-mapping.js";

const ROLE_TO_LANE: Record<string, string> = {
  ...(agentZeroLaneForPlatformLibrarianRole("librarian_bot")
    ? { librarian_bot: agentZeroLaneForPlatformLibrarianRole("librarian_bot")! }
    : {}),
};

function laneFromSuites(roleId: string): string | null {
  return (
    agentZeroLaneForPlatformLibrarianRole(roleId) ??
    agentZeroLaneForLinksitesRole(roleId) ??
    agentZeroLaneForLinksuitegenRole(roleId) ??
    agentZeroLaneForLinkdeveloperRole(roleId) ??
    ROLE_TO_LANE[roleId] ??
    null
  );
}

/** Resolve Agent Zero lane for a LiNKbot role_id. Returns null when role uses OpenClaw or automation only. */
export function agentZeroLaneForRole(roleId: string): string | null {
  return laneFromSuites(roleId);
}

/** All role_ids with a fleet v1 Agent Zero mapping (for tests and dispatch guards). */
export function listAgentZeroMappedRoleIds(): string[] {
  const known = [
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
  ];
  return known.filter((roleId) => laneFromSuites(roleId) != null);
}
