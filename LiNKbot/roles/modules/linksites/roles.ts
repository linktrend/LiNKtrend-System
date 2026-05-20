/**
 * LinkSites LiNKbot Role Definitions
 *
 * Role-bound worker definitions for the LinkSites / WebsiteFactory module.
 * These roles implement the contracts defined in CONTRACTS_MVO.md §0.A.4
 *
 * Source of truth: LiNKaios/linkaios-web/src/lib/plugins/websitefactory/manifest.ts
 */

import type { LiNKbotRoleAttachment } from "@linktrend/linklogic-sdk";

/**
 * LinkSites role IDs (canonical).
 */
export type LinkSitesRoleId =
  | "lead_scout_bot"
  | "research_enrichment_bot"
  | "website_builder_bot"
  | "outreach_bot";

/**
 * All LinkSites role IDs in execution order.
 */
export const LINKSITES_ROLE_IDS: LinkSitesRoleId[] = [
  "lead_scout_bot",
  "research_enrichment_bot",
  "website_builder_bot",
  "outreach_bot",
];

/**
 * MVO-enabled roles that can execute in the current development mode.
 * lead_scout_bot and outreach_bot are explicitly disabled.
 */
export const LINKSITES_MVO_ENABLED_ROLES: LinkSitesRoleId[] = [
  "research_enrichment_bot",
  "website_builder_bot",
];

/**
 * MVO-disabled roles (declared but not executed).
 */
export const LINKSITES_MVO_DISABLED_ROLES: LinkSitesRoleId[] = [
  "lead_scout_bot",
  "outreach_bot",
];

/**
 * Role definition for lead_scout_bot.
 *
 * Declared but disabled in MVO. Mock CRM data supplies the lead path.
 */
export const LEAD_SCOUT_BOT_ROLE: LiNKbotRoleAttachment = {
  role_id: "lead_scout_bot",
  purpose: "Future lead discovery and first-pass qualification for CRM intake. Declared but disabled in MVO.",
  inputs: ["lead_input"],
  outputs: ["lead_record_ref"],
  allowed_capabilities: [],
  allowed_skills: [],
  model_policy: {
    model_routing_profile: "fast",
  },
  audit_events: ["role.skipped"],
  development_restrictions: [
    "disabled_in_mvo",
    "mock_input_only",
    "no_live_acquisition",
    "no_public_scraping",
  ],
};

/**
 * Role definition for research_enrichment_bot.
 *
 * Researches the lead and comparable businesses; produces a provenance-backed
 * enrichment bundle for downstream website generation.
 */
export const RESEARCH_ENRICHMENT_BOT_ROLE: LiNKbotRoleAttachment = {
  role_id: "research_enrichment_bot",
  purpose: "Research the lead and comparable businesses; produce a provenance-backed enrichment bundle for downstream website generation.",
  inputs: ["lead_record_ref", "lead_input"],
  outputs: ["lead_research_bundle"],
  allowed_capabilities: [
    "cap.research.public_web",
    "cap.zulip.run_messaging",
    "cap.plane.execution_tracking",
  ],
  allowed_skills: ["research.public.read"],
  model_policy: {
    model_routing_profile: "quality",
  },
  audit_events: [
    "role.started",
    "role.completed",
    "research.performed",
    "provenance.recorded",
    "role.failed",
  ],
  development_restrictions: [
    "research_read_only",
    "provenance_required",
    "no_direct_crm_write",
    "no_direct_payload_or_supabase_write",
  ],
};

/**
 * Role definition for website_builder_bot.
 *
 * Uses discovered LiNKsites template(s) as guidance and produces business-specific
 * website package content.
 */
export const WEBSITE_BUILDER_BOT_ROLE: LiNKbotRoleAttachment = {
  role_id: "website_builder_bot",
  purpose: "Use discovered LiNKsites template(s) as guidance and produce business-specific website package content.",
  inputs: ["lead_record_ref", "lead_research_bundle", "template_id"],
  outputs: ["website_package"],
  allowed_capabilities: [
    "cap.asset.generation",
    "cap.research.public_web",
    "cap.zulip.run_messaging",
  ],
  allowed_skills: [
    "asset.generate.image",
    "asset.generate.video",
    "asset.metadata.write",
  ],
  model_policy: {
    model_routing_profile: "quality",
  },
  audit_events: [
    "role.started",
    "role.completed",
    "template.guidance.selected",
    "website.package.generated",
    "provenance.recorded",
    "role.failed",
  ],
  development_restrictions: [
    "template_guidance_not_clone",
    "local_artifact_target_only",
    "no_direct_publish",
    "no_target_schema_invention",
  ],
};

/**
 * Role definition for outreach_bot.
 *
 * Declared but disabled in MVO. Future outreach drafting/sending role.
 */
export const OUTREACH_BOT_ROLE: LiNKbotRoleAttachment = {
  role_id: "outreach_bot",
  purpose: "Future outreach drafting/sending role for post-MVO phases. Declared but disabled in MVO.",
  inputs: ["lead_record_ref", "website_package"],
  outputs: [],
  allowed_capabilities: [],
  allowed_skills: [],
  model_policy: {
    model_routing_profile: "default",
  },
  audit_events: ["role.skipped"],
  development_restrictions: [
    "disabled_in_mvo",
    "no_outreach_draft",
    "no_outreach_send",
    "no_external_contact",
  ],
};

/**
 * All LinkSites role definitions as a record.
 */
export const LINKSITES_ROLES: Record<LinkSitesRoleId, LiNKbotRoleAttachment> = {
  lead_scout_bot: LEAD_SCOUT_BOT_ROLE,
  research_enrichment_bot: RESEARCH_ENRICHMENT_BOT_ROLE,
  website_builder_bot: WEBSITE_BUILDER_BOT_ROLE,
  outreach_bot: OUTREACH_BOT_ROLE,
};

/**
 * Get role definition by role_id.
 */
export function getLinkSitesRole(roleId: LinkSitesRoleId): LiNKbotRoleAttachment {
  const role = LINKSITES_ROLES[roleId];
  if (!role) {
    throw new Error(`Unknown LinkSites role: ${roleId}`);
  }
  return role;
}

/**
 * Check if a role is enabled in MVO.
 */
export function isRoleEnabledInMvo(roleId: LinkSitesRoleId): boolean {
  return LINKSITES_MVO_ENABLED_ROLES.includes(roleId);
}

/**
 * Check if a role is disabled in MVO.
 */
export function isRoleDisabledInMvo(roleId: LinkSitesRoleId): boolean {
  return LINKSITES_MVO_DISABLED_ROLES.includes(roleId);
}

/**
 * Get all enabled roles for MVO execution.
 */
export function getMvoEnabledRoles(): LiNKbotRoleAttachment[] {
  return LINKSITES_MVO_ENABLED_ROLES.map((id) => LINKSITES_ROLES[id]);
}

/**
 * Map reasoning kind to role ID.
 */
export function mapReasoningKindToRoleId(
  reasoningKind: "research_enrichment" | "website_package_generation",
): LinkSitesRoleId {
  switch (reasoningKind) {
    case "research_enrichment":
      return "research_enrichment_bot";
    case "website_package_generation":
      return "website_builder_bot";
    default:
      throw new Error(`Unknown reasoning kind: ${reasoningKind}`);
  }
}

/**
 * Get the reasoning kind for a role ID.
 */
export function mapRoleIdToReasoningKind(
  roleId: LinkSitesRoleId,
): "research_enrichment" | "website_package_generation" | null {
  switch (roleId) {
    case "research_enrichment_bot":
      return "research_enrichment";
    case "website_builder_bot":
      return "website_package_generation";
    default:
      return null;
  }
}

/**
 * Validate that a role can execute in the current context.
 * Throws if the role is disabled or invalid.
 */
export function validateRoleExecution(
  roleId: LinkSitesRoleId,
  context: { mode?: "development" | "shadow" | "live" } = {},
): { valid: true; role: LiNKbotRoleAttachment } | { valid: false; reason: string } {
  const role = LINKSITES_ROLES[roleId];

  if (!role) {
    return { valid: false, reason: `Unknown role: ${roleId}` };
  }

  if (isRoleDisabledInMvo(roleId)) {
    return {
      valid: false,
      reason: `Role ${roleId} is disabled in MVO (development_restrictions: ${role.development_restrictions?.join(", ")})`,
    };
  }

  // Check mode restrictions
  if (context.mode === "live") {
    const hasNoLiveRestriction = role.development_restrictions?.some((r) =>
      r.includes("no_live") || r.includes("local_only"),
    );
    if (hasNoLiveRestriction) {
      return {
        valid: false,
        reason: `Role ${roleId} cannot execute in live mode`,
      };
    }
  }

  return { valid: true, role };
}
