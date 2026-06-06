/**
 * LiNKsuitegen: factory analyst roles → Agent Zero factory lane (STUDIO_FORWARD_PLAN §4.3).
 *
 * Orchestrator roles remain on OpenClaw `admin-openclaw` — see `openclaw-mapping.ts`.
 */

import { FLEET_V1_AGENT_ZERO_LANES } from "../../platform/agent-zero-lanes.js";
import {
  LINKSUITEGEN_FACTORY_ANALYST_ROLE_IDS,
  LINKSUITEGEN_FACTORY_ROLE_TO_AGENT_ZERO_LANE,
  type LinksuitegenFactoryRoleId,
} from "./openclaw-mapping.js";

export const LINKSUITEGEN_AGENT_ZERO_FACTORY_LANE = FLEET_V1_AGENT_ZERO_LANES.SUITEGEN_FACTORY;

export { LINKSUITEGEN_FACTORY_ANALYST_ROLE_IDS, LINKSUITEGEN_FACTORY_ROLE_TO_AGENT_ZERO_LANE };

/** Resolve Agent Zero lane for LiNKsuitegen factory analyst roles. */
export function agentZeroLaneForLinksuitegenRole(roleId: string): string | null {
  return LINKSUITEGEN_FACTORY_ROLE_TO_AGENT_ZERO_LANE[roleId as LinksuitegenFactoryRoleId] ?? null;
}

/** Returns lane id when role is a factory analyst; null for orchestrator roles. */
export function linksuitegenAgentZeroLaneOrNull(roleId: string): string | null {
  return agentZeroLaneForLinksuitegenRole(roleId);
}
