/**
 * LinkSites: OpenClaw mapping for suite head outreach (STUDIO_FORWARD_PLAN §4.1).
 *
 * Research/build/librarian roles use Agent Zero — see `agent-zero-mapping.ts`.
 */

import { FLEET_V1_OPENCLAW_AGENTS } from "../../platform/fleet-v1-openclaw.js";
import { LINKSITES_ROLES, type LinkSitesRoleId } from "./roles.js";

/** OpenClaw agentId — LinkSites department head (Client tenant). */
export const LINKSITES_OPENCLAW_HEAD_AGENT = FLEET_V1_OPENCLAW_AGENTS.LINKSITES_HEAD;

/** Roles executed by the suite head on OpenClaw (governed outreach send). */
export const LINKSITES_ROLE_TO_OPENCLAW_AGENT: Partial<Record<LinkSitesRoleId, string>> = {
  outreach_bot: LINKSITES_OPENCLAW_HEAD_AGENT,
};

/** Resolve OpenClaw agentId for a LinkSites LiNKbot role_id. */
export function openClawAgentIdForLinksitesRole(roleId: string): string | null {
  if (!(roleId in LINKSITES_ROLES)) {
    return null;
  }
  return LINKSITES_ROLE_TO_OPENCLAW_AGENT[roleId as LinkSitesRoleId] ?? null;
}
