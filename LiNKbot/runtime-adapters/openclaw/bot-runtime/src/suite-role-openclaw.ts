/**
 * Suite role → OpenClaw agentId (fleet v1 — Wave 9.3).
 *
 * Research/build roles use Agent Zero lanes; outreach uses linksites-head.
 */

import { agentZeroLaneForRole } from "./suite-role-agent-zero.js";

const ROLE_TO_AGENT: Record<string, string> = {
  outreach_bot: "linksites-head",
  suite_orchestrator_linkbot: "linkdeveloper-orchestrator",
  product_steward_linkbot: "linkdeveloper-steward",
  suitegen_orchestrator_linkbot: "admin-openclaw",
  handoff_coordinator_linkbot: "admin-openclaw",
  admin_openclaw_linkbot: "admin-openclaw",
  ceo_client_linkbot: "ceo-client",
};

/** Resolve OpenClaw agentId for a LiNKbot role_id. */
export function openClawAgentIdForRole(roleId: string): string | null {
  if (agentZeroLaneForRole(roleId)) return null;
  return ROLE_TO_AGENT[roleId] ?? null;
}

export { ROLE_TO_AGENT as OPENCLAW_ROLE_AGENT_MAP };
