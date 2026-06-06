/**
 * LinkSites: deterministic role → Agent Zero lane (STUDIO_FORWARD_PLAN §4.1).
 *
 * OpenClaw `linksites-head` handles orchestration and governed outreach send;
 * research and build judgment work runs on AZ lanes.
 */

import { FLEET_V1_AGENT_ZERO_LANES } from "../../platform/agent-zero-lanes.js";
import type { LinkSitesRoleId } from "./roles.js";

/** Roles executed on Agent Zero lanes (never OpenClaw head). */
export const LINKSITES_AGENT_ZERO_ROLE_IDS = [
  "lead_scout_bot",
  "research_enrichment_bot",
  "website_builder_bot",
] as const;

export type LinksitesAgentZeroRoleId = (typeof LINKSITES_AGENT_ZERO_ROLE_IDS)[number];

export const LINKSITES_ROLE_TO_AGENT_ZERO_LANE: Record<LinksitesAgentZeroRoleId, string> = {
  /** Live lead scout; mock path uses LiNKautowork only. */
  lead_scout_bot: FLEET_V1_AGENT_ZERO_LANES.LINKSITES_RESEARCH,
  research_enrichment_bot: FLEET_V1_AGENT_ZERO_LANES.LINKSITES_RESEARCH,
  website_builder_bot: FLEET_V1_AGENT_ZERO_LANES.LINKSITES_BUILD,
};

export type LinksitesRuntime =
  | { runtime: "agent_zero"; laneId: string }
  | { runtime: "openclaw"; agentId: string }
  | { runtime: "automation" };

/** Resolve primary runtime for a LinkSites role_id. */
export function runtimeForLinksitesRole(roleId: string): LinksitesRuntime | null {
  if (roleId in LINKSITES_ROLE_TO_AGENT_ZERO_LANE) {
    return {
      runtime: "agent_zero",
      laneId: LINKSITES_ROLE_TO_AGENT_ZERO_LANE[roleId as LinksitesAgentZeroRoleId],
    };
  }
  if (roleId === "outreach_bot") {
    return { runtime: "openclaw", agentId: "linksites-head" };
  }
  return null;
}

/** Resolve Agent Zero lane for LinkSites roles that use AZ. */
export function agentZeroLaneForLinksitesRole(roleId: string): string | null {
  return LINKSITES_ROLE_TO_AGENT_ZERO_LANE[roleId as LinksitesAgentZeroRoleId] ?? null;
}

/** Type guard for LinkSites roles with AZ mapping. */
export function isLinksitesAgentZeroRole(roleId: string): roleId is LinksitesAgentZeroRoleId {
  return (LINKSITES_AGENT_ZERO_ROLE_IDS as readonly string[]).includes(roleId);
}

/** All LinkSites role IDs for catalogue cross-check. */
export function linksitesAgentZeroRoleIds(): LinkSitesRoleId[] {
  return [...LINKSITES_AGENT_ZERO_ROLE_IDS];
}
