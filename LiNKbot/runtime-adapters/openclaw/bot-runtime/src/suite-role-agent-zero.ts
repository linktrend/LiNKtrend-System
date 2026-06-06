/**
 * Suite role → Agent Zero lane barrel (fleet v1, Wave 2.4).
 */

import { AGENT_ZERO_ROLE_TO_LANE } from "./fleet-runtime-mappings.js";

/** Resolve Agent Zero lane for a LiNKbot role_id. Returns null when role uses OpenClaw or automation only. */
export function agentZeroLaneForRole(roleId: string): string | null {
  return AGENT_ZERO_ROLE_TO_LANE[roleId] ?? null;
}

/** All role_ids with a fleet v1 Agent Zero mapping (for tests and dispatch guards). */
export function listAgentZeroMappedRoleIds(): string[] {
  return Object.keys(AGENT_ZERO_ROLE_TO_LANE);
}
