/**
 * LinkSites suite role → runtime identity mapping (fleet v1).
 *
 * Synced with LiNKbot/roles/suites/linksites/* (Wave 1 / Wave 5).
 * User-facing suite role keys map to LiNKbot role_ids, OpenClaw agentIds,
 * Plane assignees, and Zulip bot env keys.
 *
 * @see docs/ecosystem/FLEET_AND_RUNTIME_POLICY.md
 */

export type SuiteRoleKey =
  | "lead_scout"
  | "website_builder"
  | "outreach"
  | "librarian";

/** Canonical LiNKbot role_id per suite role key. */
export const SUITE_ROLE_TO_LINKBOT_ROLE: Record<SuiteRoleKey, string> = {
  lead_scout: "lead_scout_bot",
  website_builder: "website_builder_bot",
  outreach: "outreach_bot",
  librarian: "librarian_bot",
};

/**
 * OpenClaw gateway agentId when role uses OpenClaw head (fleet v1).
 * Research/build/librarian use Agent Zero — no OpenClaw mapping.
 */
export const SUITE_ROLE_TO_OPENCLAW_AGENT: Partial<Record<SuiteRoleKey, string>> = {
  outreach: "linksites-head",
};

/** Agent Zero lanes for roles not on OpenClaw (fleet v1). */
export const SUITE_ROLE_TO_AGENT_ZERO_LANE: Partial<Record<SuiteRoleKey, string>> = {
  lead_scout: "az-linksites-research",
  website_builder: "az-linksites-build",
  librarian: "az-librarian",
};

/**
 * Plane assignee display names — one service user per LiNKbot role (MVO).
 * Plane user ids are resolved at runtime via cap.plane.execution_tracking.
 */
export const SUITE_ROLE_TO_PLANE_ASSIGNEE: Record<SuiteRoleKey, string> = {
  lead_scout: "LinkSites Lead Scout",
  website_builder: "LinkSites Builder",
  outreach: "LinkSites Outreach",
  librarian: "LiNKbrain Librarian",
};

/** Zulip bot identity env keys (values from GSM on VPS). */
export const SUITE_ROLE_TO_ZULIP_BOT_ENV: Record<SuiteRoleKey, string> = {
  lead_scout: "ZULIP_BOT_EMAIL",
  website_builder: "ZULIP_BOT_EMAIL",
  outreach: "ZULIP_BOT_EMAIL",
  librarian: "ZULIP_BOT_EMAIL",
};

export function openClawAgentForRole(roleId: string): string | null {
  const entry = Object.entries(SUITE_ROLE_TO_LINKBOT_ROLE).find(([, v]) => v === roleId);
  if (!entry) return null;
  return SUITE_ROLE_TO_OPENCLAW_AGENT[entry[0] as SuiteRoleKey] ?? null;
}

export function agentZeroLaneForSuiteRole(roleId: string): string | null {
  switch (roleId) {
    case "lead_scout_bot":
    case "research_enrichment_bot":
      return "az-linksites-research";
    case "website_builder_bot":
      return "az-linksites-build";
    case "librarian_bot":
      return "az-librarian";
    default:
      return null;
  }
}

export function planeAssigneeForRole(roleId: string): string | null {
  const entry = Object.entries(SUITE_ROLE_TO_LINKBOT_ROLE).find(([, v]) => v === roleId);
  if (!entry) return null;
  return SUITE_ROLE_TO_PLANE_ASSIGNEE[entry[0] as SuiteRoleKey];
}
