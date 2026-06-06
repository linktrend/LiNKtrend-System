/**
 * LiNKdeveloper: OpenClaw mapping for suite head + product steward only.
 *
 * Specialist factory roles map to Agent Zero lanes (Wave 2 `agent-zero-mapping.ts`).
 */

import { FLEET_V1_OPENCLAW_AGENTS } from "../../platform/fleet-v1-openclaw.js";

/** OpenClaw agentId — LiNKdeveloper factory head (Client tenant). */
export const LINKDEVELOPER_OPENCLAW_ORCHESTRATOR_AGENT =
  FLEET_V1_OPENCLAW_AGENTS.LINKDEVELOPER_ORCHESTRATOR;

/** OpenClaw agentId — product steward (Client tenant, per active product run). */
export const LINKDEVELOPER_OPENCLAW_STEWARD_AGENT = FLEET_V1_OPENCLAW_AGENTS.LINKDEVELOPER_STEWARD;

/** Roles executed by the suite orchestrator LiNKbot. */
export const LINKDEVELOPER_ORCHESTRATOR_ROLE_IDS = ["suite_orchestrator_linkbot"] as const;

/** Roles executed by the product steward LiNKbot. */
export const LINKDEVELOPER_STEWARD_ROLE_IDS = ["product_steward_linkbot"] as const;

export type LinkdeveloperOpenClawRoleId =
  | (typeof LINKDEVELOPER_ORCHESTRATOR_ROLE_IDS)[number]
  | (typeof LINKDEVELOPER_STEWARD_ROLE_IDS)[number];

export const LINKDEVELOPER_ROLE_TO_OPENCLAW_AGENT: Record<LinkdeveloperOpenClawRoleId, string> = {
  suite_orchestrator_linkbot: LINKDEVELOPER_OPENCLAW_ORCHESTRATOR_AGENT,
  product_steward_linkbot: LINKDEVELOPER_OPENCLAW_STEWARD_AGENT,
};

/** Resolve OpenClaw agentId for a LiNKdeveloper role that uses OpenClaw (head or steward). */
export function openClawAgentIdForLinkdeveloperRole(roleId: string): string | null {
  return LINKDEVELOPER_ROLE_TO_OPENCLAW_AGENT[roleId as LinkdeveloperOpenClawRoleId] ?? null;
}
