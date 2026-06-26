/**
 * LinkSites OpenClaw mapping local to bot-runtime.
 */

import { FLEET_V1_OPENCLAW_AGENTS } from "./fleet-v1-openclaw.js";

export const LINKSITES_OPENCLAW_HEAD_AGENT = FLEET_V1_OPENCLAW_AGENTS.LINKSITES_HEAD;

export const LINKSITES_ROLES = {
  lead_scout_bot: true,
  research_enrichment_bot: true,
  website_builder_bot: true,
  outreach_bot: true,
  librarian_bot: true,
} as const;

export type LinkSitesRoleId = keyof typeof LINKSITES_ROLES;

export const LINKSITES_ROLE_TO_OPENCLAW_AGENT: Record<LinkSitesRoleId, string> = {
  lead_scout_bot: LINKSITES_OPENCLAW_HEAD_AGENT,
  research_enrichment_bot: LINKSITES_OPENCLAW_HEAD_AGENT,
  website_builder_bot: LINKSITES_OPENCLAW_HEAD_AGENT,
  outreach_bot: LINKSITES_OPENCLAW_HEAD_AGENT,
  librarian_bot: LINKSITES_OPENCLAW_HEAD_AGENT,
};

export function openClawAgentIdForLinksitesRole(roleId: string): string | null {
  if (!(roleId in LINKSITES_ROLES)) {
    return null;
  }
  return LINKSITES_ROLE_TO_OPENCLAW_AGENT[roleId as LinkSitesRoleId];
}
