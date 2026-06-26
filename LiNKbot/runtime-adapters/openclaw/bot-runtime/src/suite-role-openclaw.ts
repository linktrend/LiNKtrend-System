/**
 * Suite role → OpenClaw agentId barrel (fleet v1).
 *
 * Aggregates per-suite mapping modules. Factory analyst and librarian lanes
 * that use Agent Zero are excluded — see suite `agent-zero-mapping.ts` (Wave 2).
 */

import { FLEET_V1_OPENCLAW_AGENTS } from "./fleet-v1-openclaw.js";
import { LINKDEVELOPER_ROLE_TO_OPENCLAW_AGENT } from "./linkdeveloper-openclaw-mapping.js";
import { LINKSITES_ROLE_TO_OPENCLAW_AGENT } from "./linksites-openclaw-mapping.js";
import { LINKSUITEGEN_ROLE_TO_OPENCLAW_AGENT } from "./linksuitegen-openclaw-mapping.js";

const ROLE_TO_AGENT: Record<string, string> = {
  ...LINKSITES_ROLE_TO_OPENCLAW_AGENT,
  ...LINKDEVELOPER_ROLE_TO_OPENCLAW_AGENT,
  ...LINKSUITEGEN_ROLE_TO_OPENCLAW_AGENT,
  /** Client CEO OpenClaw profile (base subscription). */
  ceo_client_linkbot: FLEET_V1_OPENCLAW_AGENTS.CEO_CLIENT,
  /** Admin vendor executive OpenClaw profile. */
  admin_openclaw_linkbot: FLEET_V1_OPENCLAW_AGENTS.ADMIN,
};

/** Resolve OpenClaw agentId for a LiNKbot role_id. Returns null when role uses Agent Zero or automation only. */
export function openClawAgentIdForRole(roleId: string): string | null {
  return ROLE_TO_AGENT[roleId] ?? null;
}

/** All role_ids with a fleet v1 OpenClaw mapping (for tests and dispatch guards). */
export function listOpenClawMappedRoleIds(): string[] {
  return Object.keys(ROLE_TO_AGENT);
}
