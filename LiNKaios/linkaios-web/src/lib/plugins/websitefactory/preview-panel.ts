/**
 * WebsiteFactory Plugin — Preview Panel Wiring
 *
 * Thin display of PreviewOutput per CONTRACTS_MVO.md §9 and DECISIONS.md D-03.
 * Static/local preview route served by LiNKaios/linkaios-web.
 *
 * Role boundaries:
 * - Plugin does NOT own: preview serving infrastructure, CDN, DNS, TLS
 * - Plugin only declares preview_output_shape and provides thin display helpers
 * - Actual preview serving is handled by LiNKautowork + LiNKaios kernel route
 */

import type { PreviewOutput, Run, Stage } from "@linktrend/linklogic-sdk";

/**
 * Preview panel display model.
 * Thin wrapper over PreviewOutput with UI-friendly formatting.
 */
export interface PreviewPanelView {
  // Core preview output (from CONTRACTS_MVO.md §9)
  previewUrl: string;
  previewArtifactRef: string;
  status: PreviewOutput["status"];

  // Trace refs (for operator drill-down)
  runId: string;
  tenantId: string;
  leaseIds: string[];
  workflowRunIds: string[];
  auditEventIds: string[];

  // Optional CRM/Plane refs (null if approval not granted)
  crmRecordId: string | null;
  projectId: string | null;
  taskId: string | null;

  // UI state helpers
  isReady: boolean;
  isAwaitingApproval: boolean;
  hasFailed: boolean;

  // Stage completion summary
  completedStages: string[];
  pendingStages: string[];
  failedStages: string[];
}

/**
 * Build a preview panel view from a completed Run.
 *
 * Per CONTRACTS_MVO.md §9, the PreviewOutput is built from run outputs and stage refs.
 * No business data duplication — only refs and the preview URL.
 */
export function buildPreviewPanelView(
  run: Run,
  stages: Stage[],
): PreviewPanelView {
  const outputs = run.outputs || {};

  // Extract stage status summary
  const completedStages: string[] = [];
  const pendingStages: string[] = [];
  const failedStages: string[] = [];

  for (const stage of stages) {
    switch (stage.status) {
      case "succeeded":
        completedStages.push(stage.stage_id);
        break;
      case "pending":
      case "dispatched":
      case "running":
        pendingStages.push(stage.stage_id);
        break;
      case "failed":
      case "awaiting_approval":
        failedStages.push(stage.stage_id);
        break;
    }
  }

  // Collect all trace refs from stages
  const leaseIds: string[] = [];
  const workflowRunIds: string[] = [];
  const auditEventIds: string[] = [];

  for (const stage of stages) {
    if (stage.refs?.lease_ids) {
      leaseIds.push(...stage.refs.lease_ids);
    }
    if (stage.refs?.workflow_run_ids) {
      workflowRunIds.push(...stage.refs.workflow_run_ids);
    }
    if (stage.refs?.audit_event_ids) {
      auditEventIds.push(...stage.refs.audit_event_ids);
    }
  }

  const status = run.status as PreviewOutput["status"];

  return {
    previewUrl: (outputs.preview_url as string) || "",
    previewArtifactRef: (outputs.preview_artifact_ref as string) || "",
    status,

    runId: run.run_id,
    tenantId: run.tenant_id,
    leaseIds: [...new Set(leaseIds)], // Deduplicate
    workflowRunIds: [...new Set(workflowRunIds)],
    auditEventIds: [...new Set(auditEventIds)],

    crmRecordId: (outputs.crm_record_id as string) || null,
    projectId: (outputs.project_id as string) || null,
    taskId: (outputs.task_id as string) || null,

    isReady: status === "succeeded" && !!(outputs.preview_url as string),
    isAwaitingApproval: status === "awaiting_approval",
    hasFailed: status === "failed" || status === "partial",

    completedStages,
    pendingStages,
    failedStages,
  };
}

/**
 * Generate the static preview route URL per DECISIONS.md D-03.
 *
 * Pattern: /preview/<tenant_id>/<run_id>
 * Served by LiNKaios/linkaios-web preview route.
 */
export function generatePreviewRoute(
  tenantId: string,
  runId: string,
  baseUrl?: string,
): string {
  const path = `/preview/${tenantId}/${runId}`;
  return baseUrl ? `${baseUrl}${path}` : path;
}

/**
 * Validate that preview output has required fields.
 */
export function validatePreviewOutput(
  previewOutput: Partial<PreviewOutput>,
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!previewOutput.run_id) {
    errors.push("Missing run_id");
  }
  if (!previewOutput.tenant_id) {
    errors.push("Missing tenant_id");
  }
  if (!previewOutput.preview_url) {
    errors.push("Missing preview_url");
  }
  if (!previewOutput.preview_artifact_ref) {
    errors.push("Missing preview_artifact_ref");
  }
  if (!previewOutput.status) {
    errors.push("Missing status");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Build iframe-safe preview URL.
 * For MVO static/local preview, the URL is already same-origin.
 */
export function buildIframeSrc(previewUrl: string): string {
  // For static/local preview, no additional sandboxing needed
  // Future: add token parameter for authenticated preview access
  return previewUrl;
}

/**
 * Preview panel configuration for UI mounting.
 */
export interface PreviewPanelConfig {
  panel_id: "preview_panel";
  plugin_id: "websitefactory";
  mount_point: "run_detail_page";
  display_components: ["preview_iframe", "trace_refs", "stage_summary"];
  data_sources: ["PreviewOutput"];
}

/**
 * Get the canonical preview panel configuration.
 */
export function getPreviewPanelConfig(): PreviewPanelConfig {
  return {
    panel_id: "preview_panel",
    plugin_id: "websitefactory",
    mount_point: "run_detail_page",
    display_components: ["preview_iframe", "trace_refs", "stage_summary"],
    data_sources: ["PreviewOutput"],
  };
}

/**
 * Format trace refs for display in the preview panel.
 */
export function formatTraceRefsForDisplay(
  leaseIds: string[],
  workflowRunIds: string[],
  auditEventIds: string[],
): {
  leases: { id: string; url: string }[];
  workflows: { id: string; url: string }[];
  audits: { id: string; url: string }[];
} {
  return {
    leases: leaseIds.map((id) => ({
      id,
      url: `#/skills/leases/${id}`, // LinkSkills run ledger view
    })),
    workflows: workflowRunIds.map((id) => ({
      id,
      url: `#/autowork/runs/${id}`, // LiNKautowork run view
    })),
    audits: auditEventIds.map((id) => ({
      id,
      url: `#/brain/events/${id}`, // LiNKbrain event view
    })),
  };
}
