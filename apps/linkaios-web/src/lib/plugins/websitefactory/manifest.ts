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
    stage_id: "lead_evaluation",
    display_name: "Evaluate lead",
    responsible_plane: "linkbot" as Plane,
    inputs: ["lead_record_ref"],
    outputs: ["lead_evaluation"],
    failure_mode: "retryable" as FailureMode,
  },
  {
    stage_id: "template_selection",
    display_name: "Select industry template",
    responsible_plane: "linkbot" as Plane,
    inputs: ["lead_evaluation"],
    outputs: ["template_id"],
    failure_mode: "retryable" as FailureMode,
  },
  {
    stage_id: "copy_generation",
    display_name: "Generate business copy",
    responsible_plane: "linkbot" as Plane,
    inputs: ["lead_record_ref", "template_id"],
    outputs: ["copy_bundle"],
    failure_mode: "retryable" as FailureMode,
  },
  {
    stage_id: "media_placement",
    display_name: "Place images/placeholders",
    responsible_plane: "linkbot" as Plane,
    inputs: ["template_id", "copy_bundle"],
    outputs: ["media_plan"],
    failure_mode: "retryable" as FailureMode,
  },
  {
    stage_id: "look_and_feel",
    display_name: "Apply brand look-and-feel",
    responsible_plane: "linkautowork" as Plane,
    inputs: ["template_id", "copy_bundle", "media_plan"],
    outputs: ["render_spec"],
    failure_mode: "retryable" as FailureMode,
  },
  {
    stage_id: "crm_upsert",
    display_name: "Write CRM record (stub)",
    responsible_plane: "linkskills" as Plane,
    inputs: ["lead_record_ref", "lead_evaluation"],
    outputs: ["crm_record_id"],
    failure_mode: "require_approval" as FailureMode,
  },
  {
    stage_id: "plane_project_create",
    display_name: "Create project + task (stub)",
    responsible_plane: "linkskills" as Plane,
    inputs: ["lead_record_ref"],
    outputs: ["project_id", "task_id"],
    failure_mode: "require_approval" as FailureMode,
  },
  {
    stage_id: "preview_publish",
    display_name: "Publish preview site",
    responsible_plane: "linkskills" as Plane,
    inputs: ["render_spec"],
    outputs: ["preview_url", "preview_artifact_ref"],
    failure_mode: "require_approval" as FailureMode,
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
  "crm.upsert",
  "plane.project.create",
  "plane.task.create",
  "preview.publish",
];

// Required workflow hooks per CONTRACTS_MVO.md §6.4
const REQUIRED_WORKFLOW_HOOKS = [
  "autowork.websitefactory.render",
  "autowork.websitefactory.preview_serve",
];

// Required audit events per CONTRACTS_MVO.md §6.3.1
const REQUIRED_AUDIT_EVENTS = [
  "run.started",
  "stage.completed",
  "lease.requested",
  "lease.granted",
  "lease.executed",
  "preview.published",
  "run.completed",
  "run.failed",
];

/**
 * Canonical WebsiteFactory plugin manifest.
 * This is the single source of truth for plugin configuration.
 */
export const WEBSITE_FACTORY_MANIFEST: PluginManifest = {
  plugin_id: "websitefactory",
  plugin_name: "LinkSites / WebsiteFactory",
  version: "0.1.0-mvo",
  purpose:
    "Take an SMB lead, evaluate it, select an industry template, generate business-specific copy, place placeholder imagery, adjust look-and-feel without changing template structure, and produce a preview site URL suitable for stakeholder review.",

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

  preview_output_shape: {
    run_id: "string",
    tenant_id: "string",
    preview_url: "string",
    preview_artifact_ref: "string",
    crm_record_id: "string | null",
    project_id: "string | null",
    task_id: "string | null",
    lease_ids: "string[]",
    workflow_run_ids: "string[]",
    audit_event_ids: "string[]",
    status: "one_of[succeeded, partial, failed, awaiting_approval]",
  },

  non_goals: [
    "Full Payload CMS publish path",
    "Vercel deploy previews",
    "Real Chatwoot/Odoo CRM writes",
    "Real Plane API project/task creation",
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
    "crm_upsert",
    "plane_project_create",
    "preview_publish",
  ].includes(stageId);
}

/**
 * Check if a stage requires LinkBot reasoning.
 */
export function isReasoningStage(stageId: string): boolean {
  return [
    "lead_evaluation",
    "template_selection",
    "copy_generation",
    "media_placement",
  ].includes(stageId);
}

/**
 * Check if a stage requires LiNKautowork workflow.
 */
export function isWorkflowStage(stageId: string): boolean {
  return ["look_and_feel", "preview_publish"].includes(stageId);
}

/**
 * Map stage_id to required capability_id.
 */
export function mapStageToCapability(stageId: string): string | null {
  switch (stageId) {
    case "crm_upsert":
      return "crm.upsert";
    case "plane_project_create":
      return "plane.project.create"; // Also implies plane.task.create
    case "preview_publish":
      return "preview.publish";
    default:
      return null;
  }
}

/**
 * Map stage_id to required workflow handle.
 */
export function mapStageToWorkflowHandle(stageId: string): string | null {
  switch (stageId) {
    case "look_and_feel":
      return "autowork.websitefactory.render";
    case "preview_publish":
      return "autowork.websitefactory.preview_serve";
    default:
      return null;
  }
}

/**
 * Map stage_id to LinkBot reasoning kind.
 */
export function mapStageToReasoningKind(
  stageId: string,
):
  | "lead_evaluation"
  | "template_selection"
  | "copy_generation"
  | "media_placement"
  | null {
  switch (stageId) {
    case "lead_evaluation":
      return "lead_evaluation";
    case "template_selection":
      return "template_selection";
    case "copy_generation":
      return "copy_generation";
    case "media_placement":
      return "media_placement";
    default:
      return null;
  }
}
