/**
 * LiNKaios kernel — Plugin manifest loader and validation
 *
 * Implements CONTRACTS_MVO.md §1.2, §1.3:
 * - Loads plugin manifests at boot or install
 * - Validates against canonical contract types
 * - Rejects plugins that violate role boundaries
 */

import { createSupabaseServiceClient } from "@linktrend/db";
import type { SupabaseClient } from "@linktrend/db";
import {
  PluginManifestSchema,
  type PluginManifest,
  type PluginManifestStage,
  type Plane,
} from "@linktrend/linklogic-sdk";
import type { Env } from "@linktrend/shared-config";
import { getWebsiteFactoryManifest } from "@/lib/plugins/websitefactory";

// WebsiteFactory manifest per LINKAIOS_KERNEL_MANIFEST.md §4
const WEBSITEFACTORY_MANIFEST: PluginManifest = {
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
  stages: [
    {
      stage_id: "lead_intake",
      display_name: "Intake lead",
      responsible_plane: "linkaios",
      inputs: ["lead_input"],
      outputs: ["lead_record_ref"],
      failure_mode: "abort_run",
    },
    {
      stage_id: "lead_evaluation",
      display_name: "Evaluate lead",
      responsible_plane: "linkbot",
      inputs: ["lead_record_ref"],
      outputs: ["lead_evaluation"],
      failure_mode: "retryable",
    },
    {
      stage_id: "template_selection",
      display_name: "Select industry template",
      responsible_plane: "linkbot",
      inputs: ["lead_evaluation"],
      outputs: ["template_id"],
      failure_mode: "retryable",
    },
    {
      stage_id: "copy_generation",
      display_name: "Generate business copy",
      responsible_plane: "linkbot",
      inputs: ["lead_record_ref", "template_id"],
      outputs: ["copy_bundle"],
      failure_mode: "retryable",
    },
    {
      stage_id: "media_placement",
      display_name: "Place images/placeholders",
      responsible_plane: "linkbot",
      inputs: ["template_id", "copy_bundle"],
      outputs: ["media_plan"],
      failure_mode: "retryable",
    },
    {
      stage_id: "look_and_feel",
      display_name: "Apply brand look-and-feel",
      responsible_plane: "linkautowork",
      inputs: ["template_id", "copy_bundle", "media_plan"],
      outputs: ["render_spec"],
      failure_mode: "retryable",
    },
    {
      stage_id: "crm_upsert",
      display_name: "Write CRM record (stub)",
      responsible_plane: "linkskills",
      inputs: ["lead_record_ref", "lead_evaluation"],
      outputs: ["crm_record_id"],
      failure_mode: "require_approval",
    },
    {
      stage_id: "plane_project_create",
      display_name: "Create project + task (stub)",
      responsible_plane: "linkskills",
      inputs: ["lead_record_ref"],
      outputs: ["project_id", "task_id"],
      failure_mode: "require_approval",
    },
    {
      stage_id: "preview_publish",
      display_name: "Publish preview site",
      responsible_plane: "linkskills",
      inputs: ["render_spec"],
      outputs: ["preview_url", "preview_artifact_ref"],
      failure_mode: "require_approval",
    },
    {
      stage_id: "record_run",
      display_name: "Persist run + audit closure",
      responsible_plane: "linkbrain",
      inputs: ["run_id", "all_outputs"],
      outputs: ["audit_event_ids"],
      failure_mode: "abort_run",
    },
  ],
  config_surfaces: [
    "default_template_id",
    "brand_palette_source",
    "preview_route_prefix",
    "model_routing_profile",
  ],
  required_capabilities: [
    "crm.upsert",
    "plane.project.create",
    "plane.task.create",
    "preview.publish",
  ],
  required_workflow_hooks: [
    "autowork.websitefactory.render",
    "autowork.websitefactory.preview_serve",
  ],
  required_audit_events: [
    "run.started",
    "stage.completed",
    "lease.requested",
    "lease.granted",
    "lease.executed",
    "preview.published",
    "run.completed",
    "run.failed",
  ],
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

// Canonical audit actions per CONTRACTS_MVO.md §6.3.1
const CANONICAL_AUDIT_ACTIONS = new Set([
  "run.started",
  "run.completed",
  "run.failed",
  "run.cancelled",
  "stage.started",
  "stage.completed",
  "stage.failed",
  "stage.awaiting_approval",
  "stage.skipped",
  "role.started",
  "role.completed",
  "role.failed",
  "role.skipped",
  "lease.requested",
  "lease.granted",
  "lease.denied",
  "lease.executed",
  "lease.expired",
  "lease.revoked",
  "workflow.invoked",
  "workflow.completed",
  "workflow.failed",
  "workflow.compensated",
  "preview.published",
  "research.performed",
  "provenance.recorded",
  "template.guidance.selected",
  "website.package.generated",
  "crm.upserted",
  "plane.project.created",
  "plane.task.created",
  "approval.requested",
  "approval.granted",
  "approval.rejected",
  "approval.timed_out",
]);

// Valid planes
const VALID_PLANES: Plane[] = [
  "linkaios",
  "linkbot",
  "linkskills",
  "linkautowork",
  "linkbrain",
];

// Approval-owning planes
const APPROVAL_OWNING_PLANES: Plane[] = ["linkaios", "linkskills"];

/**
 * Load the WebsiteFactory manifest (hardcoded for MVO).
 * Future: load from database or config system.
 */
export function loadWebsiteFactoryManifest(): PluginManifest {
  return getWebsiteFactoryManifest();
}

// Local validation error type (compatible with types.ts interface)
interface ValidationError {
  code: string;
  message: string;
  field?: string;
}

/**
 * Validate a plugin manifest against CONTRACTS_MVO.md rules.
 * Returns array of errors; empty array means valid.
 */
export function validateManifest(
  manifest: unknown,
): ValidationError[] {
  const errors: ValidationError[] = [];

  // Schema validation via Zod
  const parsed = PluginManifestSchema.safeParse(manifest);
  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      errors.push({
        code: "MANIFEST_INVALID",
        message: issue.message,
        field: issue.path.join("."),
      });
    }
    return errors; // Stop here; can't validate further if schema fails
  }

  const m = parsed.data;

  // §1.3 Validation: kernel must not own side effects
  for (const stage of m.stages) {
    if (
      stage.responsible_plane === "linkaios" &&
      hasSideEffectOutputs(stage.outputs)
    ) {
      errors.push({
        code: "MANIFEST_KERNEL_OWNS_SIDE_EFFECT",
        message: `Stage "${stage.stage_id}" has responsible_plane="linkaios" but declares capability-like outputs. Kernel must not own side effects.`,
        field: `stages.${stage.stage_id}.outputs`,
      });
    }
  }

  // §1.3 Validation: require_approval stages must be linkaios or linkskills
  for (const stage of m.stages) {
    if (
      stage.failure_mode === "require_approval" &&
      !APPROVAL_OWNING_PLANES.includes(stage.responsible_plane)
    ) {
      errors.push({
        code: "MANIFEST_APPROVAL_PLANE_INVALID",
        message: `Stage "${stage.stage_id}" has failure_mode="require_approval" but responsible_plane="${stage.responsible_plane}". Only linkaios or linkskills can own approvals.`,
        field: `stages.${stage.stage_id}.failure_mode`,
      });
    }
  }

  // §1.3 Validation: audit events must be canonical
  for (const event of m.required_audit_events) {
    if (!CANONICAL_AUDIT_ACTIONS.has(event)) {
      errors.push({
        code: "MANIFEST_AUDIT_EVENT_UNKNOWN",
        message: `Audit event "${event}" is not in the canonical §6.3.1 set.`,
        field: "required_audit_events",
      });
    }
  }

  return errors;
}

/**
 * Check if outputs include capability-like refs (side effect indicators).
 * Heuristic: any output named like a capability or ending in _id.
 */
function hasSideEffectOutputs(outputs: string[]): boolean {
  const capabilityPatterns = [
    "crm_record_id",
    "project_id",
    "task_id",
    "preview_url",
    "preview_artifact_ref",
  ];
  return outputs.some((o) => capabilityPatterns.includes(o));
}

/**
 * Load and validate WebsiteFactory manifest.
 * Throws if invalid (should never happen for hardcoded manifest).
 */
export function loadAndValidateWebsiteFactoryManifest(): PluginManifest {
  const manifest = loadWebsiteFactoryManifest();
  const errors = validateManifest(manifest);
  if (errors.length > 0) {
    throw new ManifestValidationError(errors);
  }
  return manifest;
}

export class ManifestValidationError extends Error {
  constructor(public readonly errors: Array<{ code: string; message: string; field?: string }>) {
    super(
      `Manifest validation failed: ${errors.map((e) => `${e.code} (${e.field}): ${e.message}`).join("; ")}`,
    );
    this.name = "ManifestValidationError";
  }
}

/**
 * Seed the WebsiteFactory plugin into the database.
 * Idempotent: updates if exists.
 */
export async function seedWebsiteFactoryPlugin(
  env: Env,
): Promise<{ plugin_id: string; status: string }> {
  const manifest = loadAndValidateWebsiteFactoryManifest();
  const supabase = createSupabaseServiceClient(env);

  const { error } = await supabase.from("plugins").upsert(
    {
      plugin_id: manifest.plugin_id,
      plugin_name: manifest.plugin_name,
      version: manifest.version,
      purpose: manifest.purpose,
      manifest_json: manifest as unknown as Record<string, unknown>,
      status: "active",
      updated_at: new Date().toISOString(),
    },
    { onConflict: "plugin_id" },
  );

  if (error) {
    throw new Error(`Failed to seed WebsiteFactory plugin: ${error.message}`);
  }

  return { plugin_id: manifest.plugin_id, status: "active" };
}

/**
 * Get plugin manifest from database.
 */
export async function getPluginManifest(
  supabase: SupabaseClient,
  pluginId: string,
): Promise<PluginManifest | null> {
  const { data, error } = await supabase
    .from("plugins")
    .select("manifest_json")
    .eq("plugin_id", pluginId)
    .eq("status", "active")
    .single();

  if (error || !data) return null;

  const parsed = PluginManifestSchema.safeParse(data.manifest_json);
  return parsed.success ? parsed.data : null;
}
