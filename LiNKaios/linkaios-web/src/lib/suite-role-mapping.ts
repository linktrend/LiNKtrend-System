/**
 * LinkSites suite role → runtime identity mapping (OpenClaw, Plane, Zulip).
 *
 * User-facing suite roles (lead scout, website builder, outreach, librarian) map to
 * LiNKbot role_ids, OpenClaw agentIds on linkbot.linktrend.internal, Plane service
 * users, and Zulip bot emails (GSM-backed on VPS).
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

/** OpenClaw gateway agentId (LiNKbot-core deploy/prod/openclaw.json). */
export const SUITE_ROLE_TO_OPENCLAW_AGENT: Record<SuiteRoleKey, string> = {
  lead_scout: "linksites-builder",
  website_builder: "linksites-builder",
  outreach: "linksites-ops",
  librarian: "librarian",
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
  return SUITE_ROLE_TO_OPENCLAW_AGENT[entry[0] as SuiteRoleKey];
}

export function planeAssigneeForRole(roleId: string): string | null {
  const entry = Object.entries(SUITE_ROLE_TO_LINKBOT_ROLE).find(([, v]) => v === roleId);
  if (!entry) return null;
  return SUITE_ROLE_TO_PLANE_ASSIGNEE[entry[0] as SuiteRoleKey];
}
