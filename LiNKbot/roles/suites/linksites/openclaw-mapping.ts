/**
 * OpenClaw profile mapping for LinkSites suite roles (fleet v1).
 */

export const LINKSITES_OPENCLAW_ROLE_MAP: Record<string, string> = {
  outreach_bot: "linksites-head",
};

export function openClawAgentForLinksitesRole(roleId: string): string | null {
  return LINKSITES_OPENCLAW_ROLE_MAP[roleId] ?? null;
}
