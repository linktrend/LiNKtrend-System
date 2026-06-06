/**
 * LiNKsuitegen handoff → marketplace plugin publish (Wave 6.4 / 10.3).
 * Upserts into linkaios_kernel.plugins for DB-backed marketplace catalogue.
 */

import type { SupabaseClient } from "@linktrend/db";
import type { PluginManifest } from "@linktrend/linklogic-sdk";

export type LinksuitegenHandoffInput = {
  handoff_id: string;
  schema_version: string;
  suite_id: string;
  suite_family: string;
  suite_version: string;
  bundle_path: string;
  validation_status: "validated" | "failed" | "pending";
  display_name?: string;
  target_context?: Record<string, unknown>;
  admin_install_target?: Record<string, unknown>;
};

export type HandoffPublishResult =
  | { ok: true; plugin_id: string; status: string; marketplace_state: string }
  | { ok: false; code: string; message: string };

/** Build a kernel-compatible manifest from a LiNKsuitegen handoff bundle. */
export function pluginManifestFromHandoff(input: LinksuitegenHandoffInput): PluginManifest {
  const displayName =
    input.display_name?.trim() ||
    input.suite_id.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  return {
    plugin_id: input.suite_id,
    plugin_name: displayName,
    version: input.suite_version,
    purpose: `LiNKsuitegen factory suite (${input.suite_family}) — published via handoff ${input.handoff_id}.`,
    public_surfaces: {
      work_request_types: [`${input.suite_id}.run`],
      ui_panels: ["suite_catalogue", "project_workspace"],
      read_views: ["run_detail", "suite_modules"],
    },
    stages: [
      {
        stage_id: "intake",
        display_name: "Suite intake",
        responsible_plane: "linkaios",
        inputs: ["suite_context"],
        outputs: ["run_id"],
        failure_mode: "abort_run",
      },
      {
        stage_id: "execute",
        display_name: "Execute suite modules",
        responsible_plane: "linkbot",
        inputs: ["run_id"],
        outputs: ["stage_outputs"],
        failure_mode: "retryable",
      },
      {
        stage_id: "audit_close",
        display_name: "Audit closure",
        responsible_plane: "linkbrain",
        inputs: ["run_id", "stage_outputs"],
        outputs: ["audit_event_ids"],
        failure_mode: "abort_run",
      },
    ],
    config_surfaces: ["module_entitlements", "capability_leases"],
    required_capabilities: [],
    required_workflow_hooks: [],
    required_audit_events: ["run.started", "run.completed", "run.failed", "stage.completed"],
    preview_output_shape: {
      run_id: "string",
      tenant_id: "string",
      status: "one_of[succeeded, partial, failed, awaiting_approval]",
    },
    non_goals: ["Direct OpenClaw factory analyst roles — routed to az-suitegen-factory"],
    marketplace: {
      source: "linksuitegen",
      handoff_id: input.handoff_id,
      suite_family: input.suite_family,
      bundle_path: input.bundle_path,
      validation_status: input.validation_status,
      marketplace_listed: input.validation_status === "validated",
      stripe_mode: "shadow",
      publish_state: input.validation_status === "validated" ? "published" : "draft",
      client_visible: input.suite_id !== "linkdeveloper",
    },
  } as PluginManifest & { marketplace: Record<string, unknown> };
}

export function handoffPublishBlocked(input: LinksuitegenHandoffInput): HandoffPublishResult | null {
  if (input.validation_status !== "validated") {
    return {
      ok: false,
      code: "HANDOFF_NOT_VALIDATED",
      message: `Handoff ${input.handoff_id} validation_status=${input.validation_status}`,
    };
  }
  if (!input.suite_id?.trim()) {
    return { ok: false, code: "MISSING_SUITE_ID", message: "suite_id is required" };
  }
  return null;
}

/** Upsert handoff suite into plugins registry (idempotent on plugin_id). */
export async function publishHandoffToMarketplace(
  supabase: SupabaseClient,
  input: LinksuitegenHandoffInput,
): Promise<HandoffPublishResult> {
  const blocked = handoffPublishBlocked(input);
  if (blocked) return blocked;

  const manifest = pluginManifestFromHandoff(input);
  const { error } = await supabase.schema("linkaios_kernel").from("plugins").upsert(
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
    return { ok: false, code: "PLUGIN_UPSERT_FAILED", message: error.message };
  }

  const marketplace = (manifest as PluginManifest & { marketplace?: { publish_state?: string } })
    .marketplace;

  return {
    ok: true,
    plugin_id: manifest.plugin_id,
    status: "active",
    marketplace_state: marketplace?.publish_state ?? "published",
  };
}
