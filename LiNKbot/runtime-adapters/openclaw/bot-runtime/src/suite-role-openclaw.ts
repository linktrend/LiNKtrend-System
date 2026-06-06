/**
 * Suite role → OpenClaw agentId barrel (fleet v1).
 */

import { OPENCLAW_ROLE_TO_AGENT } from "./fleet-runtime-mappings.js";

/** Resolve OpenClaw agentId for a LiNKbot role_id. Returns null when role uses Agent Zero or automation only. */
export function openClawAgentIdForRole(roleId: string): string | null {
  return OPENCLAW_ROLE_TO_AGENT[roleId] ?? null;
}

/** All role_ids with a fleet v1 OpenClaw mapping (for tests and dispatch guards). */
export function listOpenClawMappedRoleIds(): string[] {
  return Object.keys(OPENCLAW_ROLE_TO_AGENT);
}
