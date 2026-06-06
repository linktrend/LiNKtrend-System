/**
 * LiNKdeveloper: specialist factory roles → Agent Zero lanes (STUDIO_FORWARD_PLAN §4.2).
 *
 * Orchestrator and product steward remain OpenClaw — see `openclaw-mapping.ts`.
 */

import { FLEET_V1_AGENT_ZERO_LANES } from "../../platform/agent-zero-lanes.js";

/** Roles executed on Agent Zero lanes (never OpenClaw head or steward). */
export const LINKDEVELOPER_AGENT_ZERO_ROLE_IDS = [
  "market_linkbot",
  "requirements_linkbot",
  "architecture_linkbot",
  "platform_linkbot",
  "qa_linkbot",
  "security_linkbot",
  "devops_linkbot",
] as const;

export type LinkdeveloperAgentZeroRoleId = (typeof LINKDEVELOPER_AGENT_ZERO_ROLE_IDS)[number];

export const LINKDEVELOPER_ROLE_TO_AGENT_ZERO_LANE: Record<LinkdeveloperAgentZeroRoleId, string> = {
  market_linkbot: FLEET_V1_AGENT_ZERO_LANES.LINKDEVELOPER_ANALYSIS,
  requirements_linkbot: FLEET_V1_AGENT_ZERO_LANES.LINKDEVELOPER_ANALYSIS,
  architecture_linkbot: FLEET_V1_AGENT_ZERO_LANES.LINKDEVELOPER_ARCHITECTURE,
  platform_linkbot: FLEET_V1_AGENT_ZERO_LANES.LINKDEVELOPER_ARCHITECTURE,
  qa_linkbot: FLEET_V1_AGENT_ZERO_LANES.LINKDEVELOPER_VALIDATION,
  security_linkbot: FLEET_V1_AGENT_ZERO_LANES.LINKDEVELOPER_VALIDATION,
  devops_linkbot: FLEET_V1_AGENT_ZERO_LANES.LINKDEVELOPER_OPS,
};

/** Resolve Agent Zero lane for LiNKdeveloper specialist roles. */
export function agentZeroLaneForLinkdeveloperRole(roleId: string): string | null {
  return LINKDEVELOPER_ROLE_TO_AGENT_ZERO_LANE[roleId as LinkdeveloperAgentZeroRoleId] ?? null;
}

/** All specialist role_ids with AZ mapping (for tests and dispatch guards). */
export function listLinkdeveloperAgentZeroRoleIds(): string[] {
  return [...LINKDEVELOPER_AGENT_ZERO_ROLE_IDS];
}
