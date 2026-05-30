/**
 * LinkSites Role Exports
 *
 * Re-exports LiNKbot role definitions for the LinkSites module.
 * Canonical definitions live in LiNKbot/roles/suites/linksites/
 */

export {
  // Role IDs
  type LinkSitesRoleId,
  LINKSITES_ROLE_IDS,
  LINKSITES_MVO_ENABLED_ROLES,
  LINKSITES_MVO_DISABLED_ROLES,

  // Role definitions
  LEAD_SCOUT_BOT_ROLE,
  RESEARCH_ENRICHMENT_BOT_ROLE,
  WEBSITE_BUILDER_BOT_ROLE,
  OUTREACH_BOT_ROLE,
  LINKSITES_ROLES,

  // Utility functions
  getLinkSitesRole,
  isRoleEnabledInMvo,
  isRoleDisabledInMvo,
  getMvoEnabledRoles,
  mapReasoningKindToRoleId,
  mapRoleIdToReasoningKind,
  validateRoleExecution,
} from "../../LiNKbot/roles/suites/linksites/roles";
