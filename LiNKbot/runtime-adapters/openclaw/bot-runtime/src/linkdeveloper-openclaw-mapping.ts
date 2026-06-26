/**
 * LiNKdeveloper OpenClaw mapping local to bot-runtime.
 */

import { FLEET_V1_OPENCLAW_AGENTS } from "./fleet-v1-openclaw.js";

export const LINKDEVELOPER_OPENCLAW_ORCHESTRATOR_AGENT =
  FLEET_V1_OPENCLAW_AGENTS.LINKDEVELOPER_ORCHESTRATOR;

export const LINKDEVELOPER_OPENCLAW_STEWARD_AGENT = FLEET_V1_OPENCLAW_AGENTS.LINKDEVELOPER_STEWARD;

export const LINKDEVELOPER_ORCHESTRATOR_ROLE_IDS = ["suite_orchestrator_linkbot"] as const;

export const LINKDEVELOPER_STEWARD_ROLE_IDS = ["product_steward_linkbot"] as const;

export type LinkdeveloperOpenClawRoleId =
  | (typeof LINKDEVELOPER_ORCHESTRATOR_ROLE_IDS)[number]
  | (typeof LINKDEVELOPER_STEWARD_ROLE_IDS)[number];

export const LINKDEVELOPER_ROLE_TO_OPENCLAW_AGENT: Record<LinkdeveloperOpenClawRoleId, string> = {
  suite_orchestrator_linkbot: LINKDEVELOPER_OPENCLAW_ORCHESTRATOR_AGENT,
  product_steward_linkbot: LINKDEVELOPER_OPENCLAW_STEWARD_AGENT,
};

export function openClawAgentIdForLinkdeveloperRole(roleId: string): string | null {
  return LINKDEVELOPER_ROLE_TO_OPENCLAW_AGENT[roleId as LinkdeveloperOpenClawRoleId] ?? null;
}
