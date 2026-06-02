/**
 * Suite role → OpenClaw agentId (mirrors LiNKaios suite-role-mapping.ts).
 */

const ROLE_TO_AGENT: Record<string, string> = {
  lead_scout_bot: "linksites-builder",
  research_enrichment_bot: "linksites-builder",
  website_builder_bot: "linksites-builder",
  outreach_bot: "linksites-ops",
  librarian_bot: "librarian",
};

/** Resolve OpenClaw agentId for a LiNKbot role_id. */
export function openClawAgentIdForRole(roleId: string): string | null {
  return ROLE_TO_AGENT[roleId] ?? null;
}
