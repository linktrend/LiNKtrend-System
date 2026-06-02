/**
 * WebsiteFactory Plugin Manifest
 *
 * Plugin declaration per CONTRACTS_MVO.md §1.4 and LINKAIOS_KERNEL_MANIFEST.md §4.
 * This is the canonical manifest for the WebsiteFactory vertical plugin.
 *
 * Role boundaries:
 * - Plugin declares stages, capabilities, workflows, audit events
 * - Plugin does NOT own: approvals, trace, run state, leases, memory, workflows, secrets
 * - Plugin consumes kernel extension points from WP-010
 */

import type {
  PluginManifest,
  PluginManifestStage,
  Plane,
  FailureMode,
  LiNKbotRoleAttachment,
} from "@linktrend/linklogic-sdk";

// Stage definitions per CONTRACTS_MVO.md §10 stage trace
const WEBSITE_FACTORY_STAGES: PluginManifestStage[] = [
  {
    stage_id: "lead_intake",
    display_name: "Intake lead",
    responsible_plane: "linkaios" as Plane,
    inputs: ["lead_input"],
    outputs: ["lead_record_ref"],
    failure_mode: "abort_run" as FailureMode,
  },
  {
    stage_id: "research_enrichment",
    display_name: "Research and enrich lead context",
    responsible_plane: "linkbot" as Plane,
    inputs: ["lead_record_ref"],
    outputs: ["lead_research_bundle"],
    failure_mode: "retryable" as FailureMode,
  },
  {
    stage_id: "website_package_generation",
    display_name: "Generate website package from template guidance",
    responsible_plane: "linkbot" as Plane,
    inputs: ["lead_record_ref", "lead_research_bundle", "template_id"],
    outputs: ["website_package"],
    failure_mode: "retryable" as FailureMode,
  },
  {
    stage_id: "artifact_write_local",
    display_name: "Write generated artifacts locally",
    responsible_plane: "linkautowork" as Plane,
    inputs: ["website_package", "site_id", "site_generation_run_id"],
    outputs: ["artifact_ref", "artifact_manifest_ref", "artifact_digest"],
    failure_mode: "retryable" as FailureMode,
  },
  {
    stage_id: "supabase_mirror_upsert",
    display_name: "Upsert content into Supabase mirror",
    responsible_plane: "linkautowork" as Plane,
    inputs: ["artifact_ref", "site_id", "site_generation_run_id", "lease_id"],
    outputs: ["mirror_write_ref", "mirror_revision_ref", "upserted_records_count"],
    failure_mode: "retryable" as FailureMode,
  },
  {
    stage_id: "payload_sync_local",
    display_name: "Sync mirror content into local Payload",
    responsible_plane: "linkautowork" as Plane,
    inputs: ["mirror_write_ref", "site_id", "site_generation_run_id", "lease_id"],
    outputs: ["payload_sync_ref", "payload_document_refs", "payload_sync_status"],
    failure_mode: "retryable" as FailureMode,
  },
  {
    stage_id: "preview_readiness_check",
    display_name: "Run deterministic preview readiness checks",
    responsible_plane: "linkautowork" as Plane,
    inputs: ["payload_sync_ref", "preview_url", "site_id", "site_generation_run_id"],
    outputs: ["checks_passed", "check_report_ref", "preview_readiness_status"],
    failure_mode: "retryable" as FailureMode,
  },
  {
    stage_id: "crm_ready_to_contact_mark",
    display_name: "Mark CRM lead ready_to_contact",
    responsible_plane: "linkautowork" as Plane,
    inputs: ["lead_record_ref", "checks_passed", "check_report_ref", "lease_id"],
    outputs: ["crm_record_id", "lead_status", "status_updated_at"],
    failure_mode: "retryable" as FailureMode,
  },
  {
    stage_id: "outreach_draft",
    display_name: "Draft outreach (Principal D2 A)",
    responsible_plane: "linkaios" as Plane,
    inputs: ["lead_record_ref", "publish_url", "crm_record_id"],
    outputs: ["outreach_draft_ref", "outreach_status", "outreach_lease_id"],
    failure_mode: "retryable" as FailureMode,
  },
  {
    stage_id: "plane_execution_tracking",
    display_name: "Write execution tracking project/task (mock/shadow)",
    responsible_plane: "linkskills" as Plane,
    inputs: ["lead_record_ref", "site_id", "site_generation_run_id"],
    outputs: ["project_id", "task_id"],
    failure_mode: "require_approval" as FailureMode,
  },
  {
    stage_id: "zulip_run_notify",
    display_name: "Send run notifications (mock/shadow)",
    responsible_plane: "linkskills" as Plane,
    inputs: ["run_id", "site_id", "site_generation_run_id"],
    outputs: ["message_id"],
    failure_mode: "require_approval" as FailureMode,
  },
  {
    stage_id: "close_or_recycle",
    display_name: "Close or recycle lead",
    responsible_plane: "linkaios" as Plane,
    inputs: ["lead_record_ref", "crm_record_id", "site_id", "outreach_draft_ref"],
    outputs: ["close_recycle_outcome", "lead_status", "crm_status_updated_at"],
    failure_mode: "retryable" as FailureMode,
  },
  {
    stage_id: "record_run",
    display_name: "Persist run + audit closure",
    responsible_plane: "linkbrain" as Plane,
    inputs: ["run_id", "all_outputs"],
    outputs: ["audit_event_ids"],
    failure_mode: "abort_run" as FailureMode,
  },
];

// Required capabilities per CONTRACTS_MVO.md §7
const REQUIRED_CAPABILITIES = [
  "cap.crm.odoo_shadow",
  "cap.payload.local_sync",
  "cap.supabase.mirror_content",
  "cap.zulip.run_messaging",
  "cap.research.public_web",
  "cap.asset.generation",
  "cap.plane.execution_tracking",
];

// Required workflow hooks per CONTRACTS_MVO.md §6.4
const REQUIRED_WORKFLOW_HOOKS = [
  "autowork.linksites.artifact_write_local",
  "autowork.linksites.supabase_mirror_upsert",
  "autowork.linksites.payload_sync_local",
  "autowork.linksites.preview_readiness_check",
  "autowork.linksites.crm_ready_to_contact_mark",
];

// Required audit events per CONTRACTS_MVO.md §6.3.1
const REQUIRED_AUDIT_EVENTS = [
  "run.started",
  "stage.completed",
  "stage.failed",
  "role.started",
  "role.completed",
  "role.failed",
  "role.skipped",
  "lease.requested",
  "lease.granted",
  "lease.executed",
  "preview.published",
  "outreach.drafted",
  "outreach.held_for_approval",
  "research.performed",
  "provenance.recorded",
  "template.guidance.selected",
  "website.package.generated",
  "run.completed",
  "run.failed",
];

// LiNKbot role attachments per CONTRACTS_MVO.md §0.A.4
const REQUIRED_LINKBOT_ROLES: LiNKbotRoleAttachment[] = [
  {
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
  },
  {
    role_id: "research_enrichment_bot",
    purpose: "Research the lead and comparable businesses; produce a provenance-backed enrichment bundle for downstream website generation.",
    inputs: ["lead_record_ref", "lead_input"],
    outputs: ["lead_research_bundle"],
    allowed_capabilities: ["cap.research.public_web", "cap.zulip.run_messaging", "cap.plane.execution_tracking"],
    allowed_skills: ["research.public.read"],
    model_policy: {
      model_routing_profile: "quality",
    },
    audit_events: ["role.started", "role.completed", "research.performed", "provenance.recorded", "role.failed"],
    development_restrictions: [
      "research_read_only",
      "provenance_required",
      "no_direct_crm_write",
      "no_direct_payload_or_supabase_write",
    ],
  },
  {
    role_id: "website_builder_bot",
    purpose: "Use discovered LiNKsites template(s) as guidance and produce business-specific website package content.",
    inputs: ["lead_record_ref", "lead_research_bundle", "template_id"],
    outputs: ["website_package"],
    allowed_capabilities: ["cap.asset.generation", "cap.research.public_web", "cap.zulip.run_messaging"],
    allowed_skills: ["asset.generate.image", "asset.generate.video", "asset.metadata.write"],
    model_policy: {
      model_routing_profile: "quality",
    },
    audit_events: ["role.started", "role.completed", "template.guidance.selected", "website.package.generated", "provenance.recorded", "role.failed"],
    development_restrictions: [
      "template_guidance_not_clone",
      "local_artifact_target_only",
      "no_direct_publish",
      "no_target_schema_invention",
    ],
  },
  {
    role_id: "outreach_bot",
    purpose: "Governed draft-only outreach to sell the ready-made site (Principal D2 A). Live send requires explicit Principal approval.",
    inputs: ["lead_record_ref", "publish_url", "governance"],
    outputs: ["outreach_draft_ref", "outreach_status"],
    allowed_capabilities: ["cap.crm.odoo_shadow", "cap.zulip.run_messaging", "cap.plane.execution_tracking"],
    allowed_skills: [],
    model_policy: {
      model_routing_profile: "quality",
    },
    audit_events: [
      "role.started",
      "outreach.drafted",
      "outreach.held_for_approval",
      "role.completed",
      "role.failed",
    ],
    development_restrictions: [
      "draft_only_for_mvo",
      "lease_required",
      "no_live_send_without_principal_approval",
      "full_trace_required",
    ],
  },
];

/**
 * Canonical WebsiteFactory plugin manifest.
 * This is the single source of truth for plugin configuration.
 */
export const WEBSITE_FACTORY_MANIFEST: PluginManifest = {
  plugin_id: "websitefactory",
  plugin_kind: "vertical",
  plugin_name: "LinkSites / WebsiteFactory",
  version: "0.1.0-mvo",
  purpose:
    "Take an SMB lead, evaluate it, select an industry template, generate business-specific copy, place placeholder imagery, adjust look-and-feel without changing template structure, and produce a preview site URL suitable for stakeholder review.",

  modes_supported: ["development"],

  public_surfaces: {
    work_request_types: ["websitefactory.lead_to_preview"],
    ui_panels: ["intake_form", "stage_timeline", "preview_panel"],
    read_views: ["run_detail", "preview_artifact"],
  },

  stages: WEBSITE_FACTORY_STAGES,

  config_surfaces: [
    "default_template_id",
    "brand_palette_source",
    "preview_route_prefix",
    "model_routing_profile",
  ],

  required_capabilities: REQUIRED_CAPABILITIES,
  required_workflow_hooks: REQUIRED_WORKFLOW_HOOKS,
  required_audit_events: REQUIRED_AUDIT_EVENTS,
  required_linkbot_roles: REQUIRED_LINKBOT_ROLES,

  preview_output_shape: {
    run_id: "string",
    tenant_id: "string",
    preview_url: "string | null",
    preview_artifact_ref: "string | null",
    crm_record_id: "string | null",
    project_id: "string | null",
    task_id: "string | null",
    lease_ids: "string[]",
    workflow_run_ids: "string[]",
    audit_event_ids: "string[]",
    status: "one_of[succeeded, partial, failed, awaiting_approval]",
  },

  non_goals: [
    "Real production Payload CMS writes",
    "Production hosting/deployment",
    "Real Odoo CRM writes in live mode",
    "Real Plane API project/task creation in live mode",
    "LEXOS/legal vertical work",
    "Live image generation (placeholders only for MVO)",
    "Domain provisioning, DNS, TLS",
    "Outbound email to the lead",
  ],
};

/**
 * Get the WebsiteFactory manifest.
 * Used by kernel manifest loader and plugin registration.
 */
export function getWebsiteFactoryManifest(): PluginManifest {
  return WEBSITE_FACTORY_MANIFEST;
}

/**
 * Get stage definition by stage_id.
 */
export function getStageDefinition(
  stageId: string,
): PluginManifestStage | undefined {
  return WEBSITE_FACTORY_STAGES.find((s) => s.stage_id === stageId);
}

/**
 * Check if a stage requires LinkSkills capability lease.
 */
export function isCapabilityStage(stageId: string): boolean {
  return [
    "research_enrichment",
    "website_package_generation",
    "supabase_mirror_upsert",
    "payload_sync_local",
    "crm_ready_to_contact_mark",
    "plane_execution_tracking",
    "zulip_run_notify",
  ].includes(stageId);
}

/**
 * Check if a stage requires LiNKbot reasoning.
 */
export function isReasoningStage(stageId: string): boolean {
  return ["research_enrichment", "website_package_generation"].includes(stageId);
}

/**
 * Check if a stage requires LiNKautowork workflow.
 */
export function isWorkflowStage(stageId: string): boolean {
  return [
    "artifact_write_local",
    "supabase_mirror_upsert",
    "payload_sync_local",
    "preview_readiness_check",
    "crm_ready_to_contact_mark",
  ].includes(stageId);
}

/**
 * Map stage_id to required capability_id.
 */
export function mapStageToCapability(stageId: string): string | null {
  switch (stageId) {
    case "research_enrichment":
      return "cap.research.public_web";
    case "website_package_generation":
      return "cap.asset.generation";
    case "supabase_mirror_upsert":
      return "cap.supabase.mirror_content";
    case "payload_sync_local":
      return "cap.payload.local_sync";
    case "crm_ready_to_contact_mark":
      return "cap.crm.odoo_shadow";
    case "plane_execution_tracking":
      return "cap.plane.execution_tracking";
    case "zulip_run_notify":
      return "cap.zulip.run_messaging";
    default:
      return null;
  }
}

/**
 * Map stage_id to required workflow handle.
 */
export function mapStageToWorkflowHandle(stageId: string): string | null {
  switch (stageId) {
    case "artifact_write_local":
      return "autowork.linksites.artifact_write_local";
    case "supabase_mirror_upsert":
      return "autowork.linksites.supabase_mirror_upsert";
    case "payload_sync_local":
      return "autowork.linksites.payload_sync_local";
    case "preview_readiness_check":
      return "autowork.linksites.preview_readiness_check";
    case "crm_ready_to_contact_mark":
      return "autowork.linksites.crm_ready_to_contact_mark";
    default:
      return null;
  }
}

/**
 * Map stage_id to LiNKbot reasoning kind.
 */
export function mapStageToReasoningKind(
  stageId: string,
):
  | "research_enrichment"
  | "website_package_generation"
  | null {
  switch (stageId) {
    case "research_enrichment":
      return "research_enrichment";
    case "website_package_generation":
      return "website_package_generation";
    default:
      return null;
  }
}

/**
 * Get LiNKbot role_id for a reasoning kind.
 * Returns null if the role is disabled in MVO.
 */
export function mapReasoningKindToRoleId(
  reasoningKind: "research_enrichment" | "website_package_generation",
): "research_enrichment_bot" | "website_builder_bot" | null {
  switch (reasoningKind) {
    case "research_enrichment":
      return "research_enrichment_bot";
    case "website_package_generation":
      return "website_builder_bot";
    default:
      return null;
  }
}

/**
 * Check if a role is disabled in MVO per its development_restrictions.
 */
export function isRoleDisabledInMvo(roleId: string): boolean {
  const role = REQUIRED_LINKBOT_ROLES.find((r) => r.role_id === roleId);
  return role?.development_restrictions?.includes("disabled_in_mvo") ?? false;
}

/**
 * Get role definition by role_id.
 */
export function getRoleDefinition(
  roleId: string,
): LiNKbotRoleAttachment | undefined {
  return REQUIRED_LINKBOT_ROLES.find((r) => r.role_id === roleId);
}

/**
 * Get all LinkSites role definitions (for LiNKbot runtime wiring).
 */
export function getLinkSitesRoleDefinitions(): LiNKbotRoleAttachment[] {
  return REQUIRED_LINKBOT_ROLES;
}
