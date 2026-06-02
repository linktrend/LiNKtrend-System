/**
 * LiNKaios kernel — Work / Run / Stage orchestration
 *
 * Implements CONTRACTS_MVO.md §4:
 * - work_request intake → run creation
 * - Stage dispatch to correct planes
 * - Status transitions
 * - Retry policy
 * - Trace ref accumulation
 */

import { createSupabaseServiceClient } from "@linktrend/db";
import type { SupabaseClient } from "@linktrend/db";
import {
  type LeadInput,
  type Run,
  type Stage,
  type WorkRequest,
  type FailureReport,
  type PluginManifest,
  type PluginManifestStage,
  type PreviewOutput,
  LeadInputSchema,
} from "@linktrend/linklogic-sdk";
import type { Env } from "@linktrend/shared-config";
import type { ManifestValidationError } from "./manifest-loader";
import {
  writeRunAuditEvent,
  writeStageAuditEvent,
  requestLinkSkillsLease,
  RETRY_DELAY_MS,
} from "./dispatch";
// WebsiteFactory plugin extension point
import {
  executeWebsiteFactoryStage,
  getWebsiteFactoryManifest,
  mapStageToCapability as pluginMapStageToCapability,
} from "@/lib/suite-integrations/websitefactory";

// Re-export plugin functions for consumers
export {
  executeWebsiteFactoryStage,
  getWebsiteFactoryManifest,
} from "@/lib/suite-integrations/websitefactory";
import type {
  LeadRecord,
  RunCreationResult,
  DispatchContext,
  DispatchResult,
  TraceViewResult,
  KernelConfig,
} from "./types";
import { DEFAULT_KERNEL_CONFIG } from "./types";
import { recordCloseOrRecycle } from "../../../../../suites/linksites/phases/close-recycle/close-recycle";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

// ============================================================================
// Work Request Intake
// ============================================================================

/**
 * Validate and create a work request for websitefactory.lead_to_preview.
 * Implements CONTRACTS_MVO.md §3 lead intake.
 */
export async function intakeLeadWorkRequest(
  env: Env,
  leadInput: unknown,
  requestedBy: { actor_kind: "user" | "system" | "bot"; actor_id: string },
): Promise<{
  workRequest: WorkRequest;
  leadRecord: LeadRecord;
  isExisting: boolean;
}> {
  // Validate LeadInput schema
  const parsed = LeadInputSchema.safeParse(leadInput);
  if (!parsed.success) {
    throw new LeadValidationError(parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`));
  }
  const input = parsed.data;

  const supabase = createSupabaseServiceClient(env);

  // Verify tenant exists and is active
  const { data: tenant, error: tenantError } = await supabase
    .schema("linkaios_kernel").from("tenants")
    .select("tenant_id, status")
    .eq("tenant_id", input.tenant_id)
    .single();

  if (tenantError || !tenant) {
    throw new LeadValidationError(["LEAD_TENANT_INACTIVE: Tenant not found"], "LEAD_TENANT_INACTIVE");
  }
  if (tenant.status !== "active") {
    throw new LeadValidationError(
      [`LEAD_TENANT_INACTIVE: Tenant status is ${tenant.status}`],
      "LEAD_TENANT_INACTIVE",
    );
  }

  // Compute idempotency key
  const idempotencyKey = computeIdempotencyKey(input);

  // Register or get existing lead
  const { data: leadData, error: leadError } = await supabase.schema("linkaios_kernel").rpc("register_lead", {
    p_tenant_id: input.tenant_id,
    p_idempotency_key: idempotencyKey,
    p_business_name: input.business_name,
    p_industry: input.industry,
    p_contact_json: input.contact || {},
    p_location_json: input.location || {},
    p_notes: input.notes || "",
    p_external_ids: input.external_ids || {},
    p_source: input.source,
  });

  if (leadError) {
    throw new LeadValidationError([`Lead registration failed: ${leadError.message}`]);
  }

  const leadResult = Array.isArray(leadData) ? leadData[0] : leadData;
  const leadId = leadResult?.lead_id as string;
  const isExistingLead = leadResult?.is_existing as boolean;

  // Create work request
  const workRequestType = "websitefactory.lead_to_preview";
  const workRequestId = crypto.randomUUID();
  const workRequest: WorkRequest = {
    work_request_id: workRequestId,
    tenant_id: input.tenant_id,
    plugin_id: "websitefactory",
    work_request_type: workRequestType,
    payload: input,
    requested_by: requestedBy,
    created_at: new Date().toISOString(),
    idempotency_key: `${input.tenant_id}:${workRequestType}:${idempotencyKey}`,
  };

  const { data: wrData, error: wrError } = await supabase.schema("linkaios_kernel").rpc("create_work_request", {
    p_tenant_id: workRequest.tenant_id,
    p_plugin_id: workRequest.plugin_id,
    p_work_request_type: workRequest.work_request_type,
    p_payload: workRequest.payload as Record<string, unknown>,
    p_requested_by_actor_kind: workRequest.requested_by.actor_kind,
    p_requested_by_actor_id: workRequest.requested_by.actor_id,
    p_idempotency_key: workRequest.idempotency_key,
  });

  if (wrError) {
    throw new LeadValidationError([`Work request creation failed: ${wrError.message}`]);
  }

  const wrResult = Array.isArray(wrData) ? wrData[0] : wrData;
  workRequest.work_request_id = wrResult?.work_request_id as string;
  const isExistingWorkRequest = wrResult?.is_existing as boolean;

  // Get lead record
  const { data: leadRecord } = await supabase
    .schema("linkaios_kernel").from("lead_registry")
    .select("*")
    .eq("lead_id", leadId)
    .single();

  return {
    workRequest,
    leadRecord: leadRecord as LeadRecord,
    isExisting: isExistingWorkRequest || isExistingLead,
  };
}

/**
 * Compute idempotency key from LeadInput.
 * Per CONTRACTS_MVO.md §3.3.
 */
function computeIdempotencyKey(input: LeadInput): string {
  if (input.client_idempotency_key) {
    return input.client_idempotency_key;
  }

  const normalizedName = input.business_name.trim().toLowerCase().replace(/\s+/g, " ");
  const base = [
    input.tenant_id,
    normalizedName,
    input.contact?.email || "",
    input.contact?.phone || "",
  ].join(":");

  // Simple hash (in production, use crypto.subtle.digest for SHA-256)
  // For MVO, we use a simple prefix + timestamp approach
  return `lead:${base}`;
}

export class LeadValidationError extends Error {
  constructor(
    public readonly issues: string[],
    public readonly code: string = "LEAD_INPUT_INVALID",
  ) {
    super(`Lead validation failed: ${issues.join("; ")}`);
    this.name = "LeadValidationError";
  }
}

// ============================================================================
// Run Lifecycle
// ============================================================================

/**
 * Create a run from a work request.
 * Implements CONTRACTS_MVO.md §4.2.
 */
export async function createRun(
  env: Env,
  workRequest: WorkRequest,
): Promise<RunCreationResult> {
  const supabase = createSupabaseServiceClient(env);
  // Load manifest from plugin registry (MVO: websitefactory only)
  const manifest = loadPluginManifest(workRequest.plugin_id);

  // Check for existing run via work_request.idempotency_key
  const { data: existingRuns } = await supabase
    .schema("linkaios_kernel").from("runs")
    .select("run_id, status, created_at")
    .eq("work_request_id", workRequest.work_request_id)
    .order("created_at", { ascending: false })
    .limit(1);

  if (existingRuns && existingRuns.length > 0) {
    const existing = existingRuns[0];
    // If run exists and is not terminal, return it
    if (!["succeeded", "failed", "cancelled"].includes(existing.status as string)) {
      const run = await loadRun(supabase, existing.run_id as string);
      return { run, isExisting: true, existingRunId: existing.run_id as string };
    }
  }

  // Create new run
  const projectId =
    typeof workRequest.payload === "object" &&
    workRequest.payload !== null &&
    "project_id" in workRequest.payload &&
    typeof (workRequest.payload as { project_id?: unknown }).project_id === "string"
      ? (workRequest.payload as { project_id: string }).project_id
      : null;

  const { data: runData, error } = await supabase.schema("linkaios_kernel").rpc("create_run", {
    p_work_request_id: workRequest.work_request_id,
    p_tenant_id: workRequest.tenant_id,
    p_plugin_id: workRequest.plugin_id,
    ...(projectId ? { p_project_id: projectId } : {}),
  });

  if (error || !runData) {
    throw new RunCreationError(`Failed to create run: ${error?.message || "unknown"}`);
  }

  const runId = (Array.isArray(runData) ? runData[0] : runData)?.run_id as string;

  await supabase.schema("linkaios_kernel").rpc("update_run_status", {
    p_run_id: runId,
    p_status: "pending",
    p_outputs_json: { lead_input: workRequest.payload },
  });

  // Initialize stages from manifest
  const stages: Stage[] = [];
  for (const manifestStage of manifest.stages) {
    const stage: Stage = {
      stage_id: manifestStage.stage_id,
      run_id: runId,
      responsible_plane: manifestStage.responsible_plane,
      status: "pending",
      attempt: 1,
      inputs_snapshot: {},
      refs: {},
    };
    stages.push(stage);

    await supabase.schema("linkaios_kernel").rpc("upsert_stage", {
      p_run_id: runId,
      p_stage_id: stage.stage_id,
      p_responsible_plane: stage.responsible_plane,
      p_status: stage.status,
      p_attempt: stage.attempt,
      p_inputs_snapshot: stage.inputs_snapshot,
    });
  }

  const run: Run = {
    run_id: runId,
    work_request_id: workRequest.work_request_id,
    tenant_id: workRequest.tenant_id,
    plugin_id: workRequest.plugin_id,
    status: "pending",
    started_at: new Date().toISOString(),
    stages,
    outputs: {},
  };

  // Write run.started audit event
  const runStartedAudit = await writeRunAuditEvent(env, run.tenant_id, run.run_id, "run.started", {
    plugin_id: run.plugin_id,
    work_request_type: workRequest.work_request_type,
  });
  await supabase.schema("linkaios_kernel").rpc("add_run_refs", {
    p_run_id: run.run_id,
    p_audit_event_id: runStartedAudit.event_id,
  });

  return { run, isExisting: false };
}

export class RunCreationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RunCreationError";
  }
}

/**
 * Load a run with all its stages.
 */
async function loadRun(supabase: SupabaseClient, runId: string): Promise<Run> {
  const { data: runData, error } = await supabase
    .schema("linkaios_kernel").from("runs")
    .select("*")
    .eq("run_id", runId)
    .single();

  if (error || !runData) {
    throw new RunCreationError(`Failed to load run: ${error?.message || "not found"}`);
  }

  const { data: stagesData } = await supabase
    .schema("linkaios_kernel").from("stages")
    .select("*")
    .eq("run_id", runId)
    .order("created_at", { ascending: true });

  const run: Run = {
    run_id: runData.run_id as string,
    work_request_id: runData.work_request_id as string,
    tenant_id: runData.tenant_id as string,
    plugin_id: runData.plugin_id as string,
    status: runData.status as Run["status"],
    started_at: runData.started_at as string,
    ended_at: runData.ended_at as string | undefined,
    stages: (stagesData || []).map((s) => ({
      stage_id: s.stage_id as string,
      run_id: s.run_id as string,
      responsible_plane: s.responsible_plane as Stage["responsible_plane"],
      status: s.status as Stage["status"],
      attempt: s.attempt as number,
      inputs_snapshot: (s.inputs_snapshot as Record<string, unknown>) || {},
      outputs: s.outputs_json as Record<string, unknown> | undefined,
      started_at: s.started_at as string | undefined,
      ended_at: s.ended_at as string | undefined,
      refs: {
        lease_ids: s.lease_ids as string[] | undefined,
        workflow_run_ids: s.workflow_run_ids as string[] | undefined,
        audit_event_ids: s.audit_event_ids as string[] | undefined,
        model_run_id: s.model_run_id as string | undefined,
      },
      failure: s.failure_json as FailureReport | undefined,
    })),
    outputs: (runData.outputs_json as Record<string, unknown>) || {},
    failure: runData.failure_json as FailureReport | undefined,
  };

  return run;
}

// ============================================================================
// Stage Execution
// ============================================================================

/**
 * Plugin stage execution wrapper.
 * Converts plugin result to kernel DispatchResult format.
 */
async function executePluginStage(
  env: Env,
  run: Run,
  stage: Stage,
  manifestStage: PluginManifestStage,
  accumulatedOutputs: Record<string, unknown>,
): Promise<DispatchResult> {
  const stageContext = {
    env,
    run,
    stage,
    manifestStage,
    inputs: accumulatedOutputs,
    dispatchCtx: {
      tenant_id: run.tenant_id,
      run_id: run.run_id,
      stage_id: stage.stage_id,
      plugin_id: run.plugin_id,
      attempt: stage.attempt,
    },
  };

  // Delegate to plugin's executeStage handler
  return executeWebsiteFactoryStage(stageContext);
}

/**
 * Execute a single stage.
 * Dispatches to the correct plane based on responsible_plane.
 *
 * Per CONTRACTS_MVO.md §12 role boundaries:
 * - Kernel owns: orchestration, persistence, approvals, trace, status
 * - Plugin owns: declaring stages and delegating to planes
 * - LiNKbot/LinkSkills/LiNKautowork/LiNKbrain own their respective responsibilities
 */
async function executeStage(
  env: Env,
  run: Run,
  stage: Stage,
  manifestStage: PluginManifestStage,
  accumulatedOutputs: Record<string, unknown>,
): Promise<DispatchResult> {
  const ctx: DispatchContext = {
    tenant_id: run.tenant_id,
    run_id: run.run_id,
    stage_id: stage.stage_id,
    plugin_id: run.plugin_id,
    attempt: stage.attempt,
  };

  const supabase = createSupabaseServiceClient(env);

  // Mark stage as dispatched
  await supabase.schema("linkaios_kernel").rpc("upsert_stage", {
    p_run_id: run.run_id,
    p_stage_id: stage.stage_id,
    p_responsible_plane: stage.responsible_plane,
    p_status: "dispatched",
    p_attempt: stage.attempt,
    p_inputs_snapshot: accumulatedOutputs,
  });

  // Write stage.started audit event
  await writeStageAuditEvent(env, ctx, "stage.started", {
    attempt: stage.attempt,
    failure_mode: manifestStage.failure_mode,
  }, stage.responsible_plane);

  let result: DispatchResult;

  try {
    switch (stage.responsible_plane) {
      case "linkaios":
        // Kernel-owned stage (lead_intake) - kernel executes directly
        result = await executeKernelStage(env, ctx, stage, accumulatedOutputs);
        break;
      case "linkbot":
      case "linkskills":
      case "linkautowork":
      case "linkbrain":
        // Plugin-declared stages: delegate to plugin's executeStage handler
        // Plugin then delegates to the correct plane (LiNKbot, LinkSkills, etc.)
        result = await executePluginStage(env, run, stage, manifestStage, accumulatedOutputs);
        break;
      default:
        result = {
          success: false,
          failure: {
            code: "KERNEL_DISPATCH_FAILED",
            plane: "linkaios",
            message: `Unknown responsible_plane: ${stage.responsible_plane}`,
            retryable: false,
            occurred_at: new Date().toISOString(),
          },
        };
    }
  } catch (err) {
    result = {
      success: false,
      failure: {
        code: "KERNEL_DISPATCH_FAILED",
        plane: "linkaios",
        message: err instanceof Error ? err.message : String(err),
        retryable: true,
        occurred_at: new Date().toISOString(),
      },
    };
  }

  // Update stage with result
  if (result.success) {
    await supabase.schema("linkaios_kernel").rpc("upsert_stage", {
      p_run_id: run.run_id,
      p_stage_id: stage.stage_id,
      p_responsible_plane: stage.responsible_plane,
      p_status: "succeeded",
      p_attempt: stage.attempt,
      p_outputs_json: result.outputs,
    });

    // Add trace refs
    const auditEventIds = [
      ...(result.audit_event_ids || []),
      ...(result.audit_event_id ? [result.audit_event_id] : []),
    ].filter((eventId, index, all) => eventId && all.indexOf(eventId) === index);

    if (result.lease_id || result.workflow_run_id || auditEventIds.length > 0) {
      await supabase.schema("linkaios_kernel").rpc("add_stage_refs", {
        p_run_id: run.run_id,
        p_stage_id: stage.stage_id,
        p_lease_id: result.lease_id,
        p_workflow_run_id: result.workflow_run_id,
        p_audit_event_id: auditEventIds[0],
        p_model_run_id: result.model_run_id,
      });
      for (const auditEventId of auditEventIds.slice(1)) {
        await supabase.schema("linkaios_kernel").rpc("add_stage_refs", {
          p_run_id: run.run_id,
          p_stage_id: stage.stage_id,
          p_audit_event_id: auditEventId,
        });
      }
    }

    // Write stage.completed audit event
    await writeStageAuditEvent(env, ctx, "stage.completed", {
      outputs_keys: result.outputs ? Object.keys(result.outputs) : [],
    }, stage.responsible_plane);
  } else if (result.requires_approval) {
    // Approval required
    await supabase.schema("linkaios_kernel").rpc("upsert_stage", {
      p_run_id: run.run_id,
      p_stage_id: stage.stage_id,
      p_responsible_plane: stage.responsible_plane,
      p_status: "awaiting_approval",
      p_attempt: stage.attempt,
    });

    // Create approval request using plugin's capability mapping
    const capability = pluginMapStageToCapability(stage.stage_id);
    if (capability) {
      await supabase.schema("linkaios_kernel").rpc("request_approval", {
        p_run_id: run.run_id,
        p_stage_id: stage.stage_id,
        p_tenant_id: run.tenant_id,
        p_capability_id: capability,
        p_lease_id: result.lease_id,
        p_requested_by_actor_kind: "kernel",
        p_requested_by_actor_id: "linkaios.kernel",
      });
    }

    await writeStageAuditEvent(env, ctx, "stage.awaiting_approval", {
      capability,
      lease_id: result.lease_id,
    }, stage.responsible_plane);
  } else {
    // Failed
    await supabase.schema("linkaios_kernel").rpc("upsert_stage", {
      p_run_id: run.run_id,
      p_stage_id: stage.stage_id,
      p_responsible_plane: stage.responsible_plane,
      p_status: "failed",
      p_attempt: stage.attempt,
      p_failure_json: result.failure as Record<string, unknown>,
    });

    await writeStageAuditEvent(env, ctx, "stage.failed", {
      failure_code: result.failure?.code,
      failure_message: result.failure?.message,
    }, stage.responsible_plane);
  }

  return result;
}

type MvoLivePublishContext = {
  site_id: string;
  site_slug: string;
  preview_url: string;
  publish_url: string;
  payload_sync_ref?: string;
  artifact_ref?: string;
};

function loadMvoLivePublishContext(): MvoLivePublishContext | null {
  const inline = process.env.MVO_LIVE_PUBLISH_JSON?.trim();
  const filePath = process.env.MVO_LIVE_PUBLISH_PATH?.trim();
  let raw = inline;
  if (!raw && filePath && existsSync(filePath)) {
    raw = readFileSync(filePath, "utf8");
  }
  if (!raw) {
    const defaultPath = resolve(
      process.cwd(),
      "LiNKdev/product/reports/linktrend-system/mvo-live-publish.json",
    );
    if (existsSync(defaultPath)) {
      raw = readFileSync(defaultPath, "utf8");
    }
  }
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const siteId =
      typeof parsed.site_id === "string"
        ? parsed.site_id
        : typeof parsed.site_id === "number" && Number.isFinite(parsed.site_id)
          ? String(parsed.site_id)
          : "";
    const previewUrl = typeof parsed.preview_url === "string" ? parsed.preview_url : "";
    if (!siteId || !previewUrl) return null;
    return {
      site_id: siteId,
      site_slug: typeof parsed.site_slug === "string" ? parsed.site_slug : siteId,
      preview_url: previewUrl,
      publish_url:
        typeof parsed.publish_url === "string" ? parsed.publish_url : previewUrl,
      payload_sync_ref:
        typeof parsed.payload_sync_ref === "string" ? parsed.payload_sync_ref : undefined,
      artifact_ref: typeof parsed.artifact_ref === "string" ? parsed.artifact_ref : undefined,
    };
  } catch {
    return null;
  }
}

/**
 * Execute a kernel-owned stage (lead_intake, outreach, close/recycle).
 */
async function executeKernelStage(
  env: Env,
  ctx: DispatchContext,
  stage: Stage,
  inputs: Record<string, unknown>,
): Promise<DispatchResult> {
  // lead_intake is simple: return the lead_record_ref
  if (stage.stage_id === "lead_intake") {
    const leadInput = inputs.lead_input as LeadInput | undefined;
    if (!leadInput) {
      return {
        success: false,
        failure: {
          code: "LEAD_INPUT_INVALID",
          plane: "linkaios",
          message: "Missing lead_input in stage inputs",
          retryable: false,
          occurred_at: new Date().toISOString(),
        },
      };
    }

    const live = loadMvoLivePublishContext();
    const leadRecordRef = {
      lead_id: (inputs.lead_id as string) || "unknown",
      tenant_id: ctx.tenant_id,
      idempotency_key: computeIdempotencyKey(leadInput),
    };

    const outputs: Record<string, unknown> = { lead_record_ref: leadRecordRef };
    if (live) {
      outputs.site_id = String(live.site_id);
      outputs.site_slug = live.site_slug;
      outputs.site_generation_run_id = ctx.run_id;
      outputs.preview_url = live.preview_url;
      outputs.publish_url = live.publish_url;
      outputs.preview_artifact_ref =
        live.artifact_ref || `payload_site:${live.site_id}`;
      if (live.payload_sync_ref) outputs.payload_sync_ref = live.payload_sync_ref;
      if (live.artifact_ref) outputs.artifact_ref = live.artifact_ref;
    }

    return { success: true, outputs };
  }

  if (stage.stage_id === "outreach_draft") {
    const publishUrl =
      (inputs.publish_url as string) || (inputs.preview_url as string) || "";
    if (!publishUrl) {
      return {
        success: false,
        failure: {
          code: "WORKFLOW_STEP_FAILED",
          plane: "linkaios",
          message: "outreach_draft requires publish_url from live publish",
          retryable: false,
          occurred_at: new Date().toISOString(),
        },
      };
    }

    const leaseRequest = await requestLinkSkillsLease(env, ctx, {
      capability: "crm.upsert",
      arguments: {
        action: "outreach_draft",
        publish_url: publishUrl,
        lead_record_ref: inputs.lead_record_ref,
      },
      idempotency_key: `${ctx.run_id}:outreach_draft:crm.upsert`,
      actor: { actor_kind: "plugin", actor_id: "linkaios.kernel" },
    });
    if (!leaseRequest.success || !leaseRequest.lease_id) {
      return leaseRequest;
    }

    const outreachDraftRef = `outreach_draft:${ctx.tenant_id}:${ctx.run_id}`;
    const draftedAudit = await writeStageAuditEvent(env, ctx, "outreach.drafted", {
      outreach_draft_ref: outreachDraftRef,
      publish_url: publishUrl,
      lease_id: leaseRequest.lease_id,
      outreach_status: "draft_pending_principal_approval",
    }, "linkbot");
    const heldAudit = await writeStageAuditEvent(env, ctx, "outreach.held_for_approval", {
      outreach_draft_ref: outreachDraftRef,
      publish_url: publishUrl,
      lease_id: leaseRequest.lease_id,
    }, "linkbot");

    return {
      success: true,
      outputs: {
        outreach_draft_ref: outreachDraftRef,
        outreach_status: "draft_pending_principal_approval",
        outreach_lease_id: leaseRequest.lease_id,
      },
      lease_id: leaseRequest.lease_id,
      audit_event_ids: [draftedAudit.event_id, heldAudit.event_id],
    };
  }

  if (stage.stage_id === "close_or_recycle") {
    const leaseRequest = await requestLinkSkillsLease(env, ctx, {
      capability: "crm.upsert",
      arguments: {
        action: "close_or_recycle",
        outcome: "recycle",
        lead_record_ref: inputs.lead_record_ref,
        crm_record_id: inputs.crm_record_id,
        site_id: inputs.site_id,
      },
      idempotency_key: `${ctx.run_id}:close_or_recycle:crm.upsert`,
      actor: { actor_kind: "plugin", actor_id: "linkaios.kernel" },
    });
    if (!leaseRequest.success || !leaseRequest.lease_id) {
      return leaseRequest;
    }

    const record = recordCloseOrRecycle({
      tenant_id: ctx.tenant_id,
      run_id: ctx.run_id,
      outcome: "recycle",
    });
    const crmAudit = await writeStageAuditEvent(env, ctx, "crm.status_updated", {
      lead_status: "recycled_for_next_lead",
      outcome: record.outcome,
      site_id: inputs.site_id,
      lease_id: leaseRequest.lease_id,
    }, "linkskills");

    return {
      success: true,
      outputs: {
        close_recycle_outcome: record.outcome,
        lead_status: "recycled_for_next_lead",
        crm_status_updated_at: record.recorded_at,
      },
      lease_id: leaseRequest.lease_id,
      audit_event_ids: [crmAudit.event_id],
    };
  }

  return {
    success: false,
    failure: {
      code: "KERNEL_DISPATCH_FAILED",
      plane: "linkaios",
      message: `Unknown kernel stage: ${stage.stage_id}`,
      retryable: false,
      occurred_at: new Date().toISOString(),
    },
  };
}

// ============================================================================
// Plugin-Aware Manifest Loading
// ============================================================================

/**
 * Load manifest for a plugin_id.
 * For MVO, only websitefactory is supported.
 * Future: generic plugin registry lookup.
 */
function loadPluginManifest(pluginId: string): PluginManifest {
  if (pluginId === "websitefactory") {
    return getWebsiteFactoryManifest();
  }
  throw new Error(`Unknown plugin_id: ${pluginId}. Only 'websitefactory' is supported for MVO.`);
}

// ============================================================================
// Run Execution
// ============================================================================

/**
 * Execute a run through all its stages.
 * Implements CONTRACTS_MVO.md §4 Run lifecycle.
 */
export async function executeRun(
  env: Env,
  runId: string,
  config: KernelConfig = DEFAULT_KERNEL_CONFIG,
): Promise<Run> {
  const supabase = createSupabaseServiceClient(env);
  // Load run first to get plugin_id, then load manifest from plugin
  const run = await loadRun(supabase, runId);
  const manifest = loadPluginManifest(run.plugin_id);

  // Transition to running
  if (run.status === "pending") {
    await supabase.schema("linkaios_kernel").rpc("update_run_status", {
      p_run_id: runId,
      p_status: "running",
    });
    run.status = "running";
  }

  if (run.status !== "running") {
    return run; // Already terminal or awaiting_approval
  }

  // Execute stages in order
  const accumulatedOutputs: Record<string, unknown> = { ...run.outputs };

  for (const manifestStage of manifest.stages) {
    const stage = run.stages.find((s) => s.stage_id === manifestStage.stage_id);
    if (!stage) continue;

    // Skip already completed stages
    if (stage.status === "succeeded" || stage.status === "skipped") {
      // Merge outputs
      if (stage.outputs) {
        Object.assign(accumulatedOutputs, stage.outputs);
      }
      continue;
    }

    // Skip if awaiting approval
    if (stage.status === "awaiting_approval") {
      // Check if approval has been granted
      const { data: approval } = await supabase
        .schema("linkaios_kernel").from("approvals")
        .select("status")
        .eq("run_id", runId)
        .eq("stage_id", stage.stage_id)
        .single();

      if (approval?.status === "granted") {
        // Resume stage
        stage.status = "running";
      } else if (approval?.status === "rejected" || approval?.status === "timed_out") {
        // Mark as failed
        await supabase.schema("linkaios_kernel").rpc("upsert_stage", {
          p_run_id: runId,
          p_stage_id: stage.stage_id,
          p_responsible_plane: stage.responsible_plane,
          p_status: "failed",
          p_failure_json: {
            code: approval.status === "rejected" ? "APPROVAL_REJECTED" : "APPROVAL_TIMEOUT",
            plane: stage.responsible_plane,
            message: `Approval ${approval.status}`,
            retryable: false,
            occurred_at: new Date().toISOString(),
          },
        });

        // Determine run outcome based on failure_mode
        if (manifestStage.failure_mode === "abort_run") {
          await supabase.schema("linkaios_kernel").rpc("update_run_status", {
            p_run_id: runId,
            p_status: "failed",
          });
          run.status = "failed";
          return run;
        } else if (manifestStage.failure_mode === "require_approval") {
          // Partial success - continue
          continue;
        }
      } else {
        // Still pending, stop execution
        run.status = "awaiting_approval";
        await supabase.schema("linkaios_kernel").rpc("update_run_status", {
          p_run_id: runId,
          p_status: "awaiting_approval",
        });
        return run;
      }
    }

    // Execute stage with retries
    let attempt = stage.attempt || 1;
    let result: DispatchResult | null = null;

    while (attempt <= config.maxStageRetries) {
      result = await executeStage(env, run, { ...stage, attempt }, manifestStage, accumulatedOutputs);

      if (result.success) {
        break;
      }

      if (result.requires_approval) {
        // Stop and wait for approval
        run.status = "awaiting_approval";
        await supabase.schema("linkaios_kernel").rpc("update_run_status", {
          p_run_id: runId,
          p_status: "awaiting_approval",
        });
        return run;
      }

      if (!result.failure?.retryable || manifestStage.failure_mode === "abort_run") {
        break;
      }

      // Retry
      attempt++;
      if (attempt <= config.maxStageRetries) {
        const delay = RETRY_DELAY_MS[Math.min(attempt - 2, RETRY_DELAY_MS.length - 1)];
        await new Promise((r) => setTimeout(r, delay));
      }
    }

    if (!result?.success) {
      // Stage failed
      if (manifestStage.failure_mode === "abort_run") {
        await supabase.schema("linkaios_kernel").rpc("update_run_status", {
          p_run_id: runId,
          p_status: "failed",
          p_failure_json: result?.failure as Record<string, unknown>,
        });
        run.status = "failed";

        // Write run.failed audit event
        const runFailedAudit = await writeRunAuditEvent(env, run.tenant_id, runId, "run.failed", {
          failing_stage_id: stage.stage_id,
          failure_code: result?.failure?.code,
        });
        await supabase.schema("linkaios_kernel").rpc("add_run_refs", {
          p_run_id: runId,
          p_audit_event_id: runFailedAudit.event_id,
        });

        return run;
      } else if (manifestStage.failure_mode === "require_approval") {
        // Partial - mark run as awaiting_approval
        await supabase.schema("linkaios_kernel").rpc("update_run_status", {
          p_run_id: runId,
          p_status: "awaiting_approval",
        });
        run.status = "awaiting_approval";
        return run;
      }
      // retryable exceeded - fail the run
      await supabase.schema("linkaios_kernel").rpc("update_run_status", {
        p_run_id: runId,
        p_status: "failed",
        p_failure_json: result?.failure as Record<string, unknown>,
      });
      const runFailedAudit = await writeRunAuditEvent(env, run.tenant_id, runId, "run.failed", {
        failing_stage_id: stage.stage_id,
        failure_code: result?.failure?.code,
      });
      await supabase.schema("linkaios_kernel").rpc("add_run_refs", {
        p_run_id: runId,
        p_audit_event_id: runFailedAudit.event_id,
      });
      run.status = "failed";
      return run;
    }

    // Success - merge outputs
    if (result.outputs) {
      Object.assign(accumulatedOutputs, result.outputs);
    }

    // Update run outputs
    await supabase.schema("linkaios_kernel").rpc("update_run_status", {
      p_run_id: runId,
      p_status: "running",
      p_outputs_json: accumulatedOutputs,
    });
  }

  // All stages complete - mark run as succeeded
  await supabase.schema("linkaios_kernel").rpc("update_run_status", {
    p_run_id: runId,
    p_status: "succeeded",
    p_outputs_json: accumulatedOutputs,
  });

  // Write run.completed audit event
  const runCompletedAudit = await writeRunAuditEvent(env, run.tenant_id, runId, "run.completed", {
    plugin_id: run.plugin_id,
    final_outputs_keys: Object.keys(accumulatedOutputs),
  });
  await supabase.schema("linkaios_kernel").rpc("add_run_refs", {
    p_run_id: runId,
    p_audit_event_id: runCompletedAudit.event_id,
  });

  run.status = "succeeded";
  run.outputs = accumulatedOutputs;
  return run;
}

// ============================================================================
// Trace / Status Views
// ============================================================================

/**
 * Get trace view for a run (read-only, no PII).
 * Implements CONTRACTS_MVO.md §4 Status + Trace surfaces.
 */
export async function getRunTrace(
  env: Env,
  runId: string,
): Promise<TraceViewResult | null> {
  const supabase = createSupabaseServiceClient(env);

  const { data: runData } = await supabase.schema("linkaios_kernel").rpc("get_run_trace", {
    p_run_id: runId,
  });

  if (!runData) return null;

  const { data: stagesData } = await supabase.schema("linkaios_kernel").rpc("get_run_stages", {
    p_run_id: runId,
  });

  const { data: approvalsData } = await supabase
    .schema("linkaios_kernel").from("approvals")
    .select("*")
    .eq("run_id", runId);

  // Build run object
  const run: Run = {
    run_id: (Array.isArray(runData) ? runData[0] : runData)?.run_id as string,
    work_request_id: "", // Not exposed in trace view
    tenant_id: (Array.isArray(runData) ? runData[0] : runData)?.tenant_id as string,
    plugin_id: (Array.isArray(runData) ? runData[0] : runData)?.plugin_id as string,
    status: (Array.isArray(runData) ? runData[0] : runData)?.status as Run["status"],
    started_at: (Array.isArray(runData) ? runData[0] : runData)?.started_at as string,
    ended_at: (Array.isArray(runData) ? runData[0] : runData)?.ended_at as string | undefined,
    stages: [],
    outputs: (Array.isArray(runData) ? runData[0] : runData)?.outputs_json as Record<string, unknown>,
  };
  run.outputs = {
    ...(run.outputs || {}),
    _run_audit_event_ids: (Array.isArray(runData) ? runData[0] : runData)?.audit_event_ids as string[] | undefined,
  };

  // Build stages
  const stages: Stage[] = ((stagesData || []) as Array<Record<string, unknown>>).map((s) => ({
    stage_id: s.stage_id as string,
    run_id: runId,
    responsible_plane: s.responsible_plane as Stage["responsible_plane"],
    status: s.status as Stage["status"],
    attempt: s.attempt as number,
    inputs_snapshot: {},
    started_at: s.started_at as string | undefined,
    ended_at: s.ended_at as string | undefined,
    refs: {
      lease_ids: s.lease_ids as string[] | undefined,
      workflow_run_ids: s.workflow_run_ids as string[] | undefined,
      audit_event_ids: s.audit_event_ids as string[] | undefined,
    },
  }));

  // Keep run-level stage refs available for buildPreviewOutput() aggregation.
  run.stages = stages;

  return {
    run,
    stages,
    approvals: (approvalsData || []) as TraceViewResult["approvals"],
  };
}

/**
 * Build PreviewOutput from run (CONTRACTS_MVO.md §9).
 */
export function buildPreviewOutput(run: Run): PreviewOutput {
  const out = run.outputs || {};
  const runAuditEventIds = Array.isArray(out._run_audit_event_ids) ? out._run_audit_event_ids : [];
  const stageAuditEventIds = run.stages.flatMap((s) => s.refs?.audit_event_ids || []);
  const auditEventIds = Array.from(new Set([...runAuditEventIds, ...stageAuditEventIds]));

  return {
    run_id: run.run_id,
    tenant_id: run.tenant_id,
    plugin_id: "websitefactory",
    preview_url: (out.preview_url as string) || "",
    preview_artifact_ref: (out.preview_artifact_ref as string) || "",
    crm_record_id: (out.crm_record_id as string) || null,
    project_id: (out.project_id as string) || null,
    task_id: (out.task_id as string) || null,
    lease_ids: run.stages.flatMap((s) => s.refs?.lease_ids || []),
    workflow_run_ids: run.stages.flatMap((s) => s.refs?.workflow_run_ids || []),
    audit_event_ids: auditEventIds,
    status: run.status === "partial" ? "partial" : run.status === "awaiting_approval" ? "awaiting_approval" : run.status === "succeeded" ? "succeeded" : "failed",
    finalized_at: run.ended_at,
  };
}
