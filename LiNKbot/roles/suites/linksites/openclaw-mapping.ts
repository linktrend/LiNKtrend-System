/**
 * LinkSites: all suite role templates → one OpenClaw head (`linksites-head`).
 *
 * Catalogue issues keep distinct role_ids for Plane assignees; fleet runtime
 * routes OpenClaw dispatches through the suite head profile.
 */

import { FLEET_V1_OPENCLAW_AGENTS } from "../../platform/fleet-v1-openclaw.js";
import { LINKSITES_ROLES, type LinkSitesRoleId } from "./roles.js";

/** OpenClaw agentId — LinkSites department head (Client tenant). */
export const LINKSITES_OPENCLAW_HEAD_AGENT = FLEET_V1_OPENCLAW_AGENTS.LINKSITES_HEAD;

/** All declared LinkSites suite roles map to the suite head OpenClaw profile. */
export const LINKSITES_ROLE_TO_OPENCLAW_AGENT: Record<LinkSitesRoleId, string> = {
  lead_scout_bot: LINKSITES_OPENCLAW_HEAD_AGENT,
  research_enrichment_bot: LINKSITES_OPENCLAW_HEAD_AGENT,
  website_builder_bot: LINKSITES_OPENCLAW_HEAD_AGENT,
  outreach_bot: LINKSITES_OPENCLAW_HEAD_AGENT,
  librarian_bot: LINKSITES_OPENCLAW_HEAD_AGENT,
};

/** Resolve OpenClaw agentId for a LinkSites LiNKbot role_id. */
export function openClawAgentIdForLinksitesRole(roleId: string): string | null {
  if (!(roleId in LINKSITES_ROLES)) {
    return null;
  }
  return LINKSITES_ROLE_TO_OPENCLAW_AGENT[roleId as LinkSitesRoleId];
}
