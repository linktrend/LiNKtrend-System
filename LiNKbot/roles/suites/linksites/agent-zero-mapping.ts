/**
 * Agent Zero lane mapping for LinkSites suite roles (fleet v1).
 */

export const LINKSITES_AGENT_ZERO_ROLE_MAP: Record<string, string> = {
  lead_scout_bot: "az-linksites-research",
  research_enrichment_bot: "az-linksites-research",
  website_builder_bot: "az-linksites-build",
};

export function agentZeroLaneForLinksitesRole(roleId: string): string | null {
  return LINKSITES_AGENT_ZERO_ROLE_MAP[roleId] ?? null;
}
