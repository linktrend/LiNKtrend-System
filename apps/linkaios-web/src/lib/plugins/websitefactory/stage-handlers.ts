/**
 * WebsiteFactory Plugin — Stage Handler Glue
 *
 * Implements stage execution delegation per CONTRACTS_MVO.md §6, §10.
 * This is thin glue only — no business logic, only dispatch to correct planes.
 *
 * Delegation map:
 * - reasoning stages → LinkBot (WP-009)
 * - side-effect capabilities → LinkSkills (WP-007)
 * - deterministic workflows → LiNKautowork (WP-008)
 * - audit writes → LiNKbrain (WP-006)
 *
 * Role-bleed guards:
 * - Plugin does NOT own approvals, trace, run state, leases, memory, workflows, secrets
 * - Plugin only declares stages and delegates execution
 */

import type {
  Run,
  Stage,
  PluginManifestStage,
  BotReasonRequest,
  LeaseRequest,
  WorkflowInvokeRequest,
  FailureReport,
} from "@linktrend/linklogic-sdk";
import type { Env } from "@linktrend/shared-config";
import {
  dispatchToLinkBot,
  requestLinkSkillsLease,
  executeLinkSkillsLease,
  dispatchToLinkAutowork,
} from "@/lib/kernel/dispatch";
import type { DispatchContext, DispatchResult } from "@/lib/kernel/types";
import {
  mapStageToReasoningKind,
  mapStageToCapability,
  mapStageToWorkflowHandle,
  isCapabilityStage,
  isReasoningStage,
  isWorkflowStage,
} from "./manifest";

/**
 * Runtime compatibility shim:
 * the v2 manifest uses `cap.*` ids, while local LinkSkills seed data
 * still exposes legacy ids used by `request_lease` FK checks.
 */
function resolveRuntimeCapabilityId(capabilityId: string): string {
  switch (capabilityId) {
    case "cap.crm.odoo_shadow":
      return "crm.upsert";
    case "cap.plane.execution_tracking":
      return "plane.project.create";
    case "cap.zulip.run_messaging":
      return "preview.publish";
    case "cap.supabase.mirror_content":
      return "preview.publish";
    case "cap.payload.local_sync":
      return "preview.publish";
    case "cap.research.public_web":
      return "crm.upsert";
    case "cap.asset.generation":
      return "preview.publish";
    default:
      return capabilityId;
  }
}

/**
 * Stage execution context passed through all handlers.
 */
export interface StageContext {
  env: Env;
  run: Run;
  stage: Stage;
  manifestStage: PluginManifestStage;
  inputs: Record<string, unknown>;
  dispatchCtx: DispatchContext;
}

/**
 * Execute a WebsiteFactory stage by delegating to the correct plane.
 *
 * Per CONTRACTS_MVO.md §10 stage trace:
 * - lead_intake: kernel (already handled before plugin glue)
 * - research_enrichment, website_package_generation: LinkBot
 * - artifact_write_local, supabase_mirror_upsert, payload_sync_local,
 *   preview_readiness_check, crm_ready_to_contact_mark: LiNKautowork
 * - plane_execution_tracking, zulip_run_notify: LinkSkills (capability lease)
 * - record_run: LiNKbrain
 */
export async function executeWebsiteFactoryStage(
  ctx: StageContext,
): Promise<DispatchResult> {
  const { stage } = ctx;

  try {
    switch (stage.responsible_plane) {
      case "linkbot":
        return await executeReasoningStage(ctx);
      case "linkautowork":
        return await executeWorkflowStage(ctx);
      case "linkskills":
        return await executeCapabilityStage(ctx);
      case "linkbrain":
        return await executeRecordRunStage(ctx);
      default:
        return {
          success: false,
          failure: {
            code: "KERNEL_DISPATCH_FAILED",
            plane: "linkaios",
            message: `Unknown responsible_plane: ${stage.responsible_plane} for stage ${stage.stage_id}`,
            retryable: false,
            occurred_at: new Date().toISOString(),
          },
        };
    }
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      failure: {
        code: "KERNEL_DISPATCH_FAILED",
        plane: "linkaios",
        message: `Stage execution failed: ${error}`,
        retryable: true,
        occurred_at: new Date().toISOString(),
      },
    };
  }
}

/**
 * Execute a reasoning stage via LinkBot.
 * Implements CONTRACTS_MVO.md §6.1
 */
async function executeReasoningStage(ctx: StageContext): Promise<DispatchResult> {
  const { env, stage, inputs, dispatchCtx } = ctx;

  const reasoningKind = mapStageToReasoningKind(stage.stage_id);
  if (!reasoningKind) {
    return {
      success: false,
      failure: {
        code: "MODEL_OUTPUT_INVALID",
        plane: "linkbot",
        message: `No reasoning kind mapping for stage: ${stage.stage_id}`,
        retryable: false,
        occurred_at: new Date().toISOString(),
      },
    };
  }

  // Build reasoning request per CONTRACTS_MVO.md §6.1
  const reasonRequest: Omit<BotReasonRequest, "tenant_id" | "run_id" | "stage_id"> = {
    reasoning_kind: reasoningKind,
    inputs: sanitizeInputsForLinkBot(inputs),
    model_routing_profile: ctx.run.outputs?.model_routing_profile as string || "default",
    pii_policy: "strip_contact", // MVO default per CONTRACTS_MVO.md §3.4
  };

  // Dispatch to LinkBot via kernel adapter
  return dispatchToLinkBot(env, dispatchCtx, reasonRequest);
}

/**
 * Execute a capability-gated stage via LinkSkills.
 * Implements CONTRACTS_MVO.md §6.2, §7
 *
 * Flow: request lease → (if granted) execute lease → return result
 * If requires_approval: return requires_approval flag for kernel to handle
 */
async function executeCapabilityStage(ctx: StageContext): Promise<DispatchResult> {
  const { env, run, stage, inputs, dispatchCtx } = ctx;

  const capability = mapStageToCapability(stage.stage_id);
  if (!capability) {
    return {
      success: false,
      failure: {
        code: "LEASE_REQUEST_INVALID",
        plane: "linkskills",
        message: `No capability mapping for stage: ${stage.stage_id}`,
        retryable: false,
        occurred_at: new Date().toISOString(),
      },
    };
  }
  const runtimeCapability = resolveRuntimeCapabilityId(capability);

  // Build lease request per CONTRACTS_MVO.md §6.2
  const leaseRequest: Omit<LeaseRequest, "tenant_id" | "run_id" | "stage_id"> = {
    capability: runtimeCapability,
    arguments: buildCapabilityArguments(stage.stage_id, inputs, run),
    idempotency_key: `${run.run_id}:${stage.stage_id}:${runtimeCapability}`,
    actor: {
      actor_kind: "plugin",
      actor_id: "websitefactory",
    },
  };

  // Request lease from LinkSkills
  const leaseResult = await requestLinkSkillsLease(env, dispatchCtx, leaseRequest);

  if (!leaseResult.success) {
    // Lease denied or requires approval
    return leaseResult;
  }

  if (leaseResult.requires_approval) {
    // Stop here - kernel will handle approval flow
    return leaseResult;
  }

  // Lease granted - execute it
  if (leaseResult.lease_id) {
    const execResult = await executeLinkSkillsLease(env, dispatchCtx, {
      lease_id: leaseResult.lease_id,
      idempotency_key: `${run.run_id}:${stage.stage_id}:${runtimeCapability}:exec`,
    });

    if (!execResult.success) {
      return execResult;
    }

    // Merge lease_id into result for trace refs
    return {
      ...execResult,
      lease_id: leaseResult.lease_id,
    };
  }

  return leaseResult;
}

/**
 * Execute a deterministic workflow stage via LiNKautowork.
 * Implements CONTRACTS_MVO.md §6.4
 */
async function executeWorkflowStage(ctx: StageContext): Promise<DispatchResult> {
  const { env, run, stage, inputs, dispatchCtx } = ctx;

  const workflowHandle = mapStageToWorkflowHandle(stage.stage_id);
  if (!workflowHandle) {
    return {
      success: false,
      failure: {
        code: "WORKFLOW_NOT_FOUND",
        plane: "linkautowork",
        message: `No workflow handle mapping for stage: ${stage.stage_id}`,
        retryable: false,
        occurred_at: new Date().toISOString(),
      },
    };
  }

  // Build workflow invocation request per CONTRACTS_MVO.md §6.4
  const workflowRequest: Omit<WorkflowInvokeRequest, "tenant_id" | "run_id" | "stage_id"> = {
    workflow_handle: workflowHandle,
    inputs: buildWorkflowInputs(stage.stage_id, inputs, run),
    idempotency_key: `${run.run_id}:${stage.stage_id}:${workflowHandle}`,
    // lease_id is added by caller if this workflow is capability-gated
  };

  const stageCapability = mapStageToCapability(stage.stage_id);
  if (stageCapability) {
    const runtimeCapability = resolveRuntimeCapabilityId(stageCapability);
    const leaseRequest: Omit<LeaseRequest, "tenant_id" | "run_id" | "stage_id"> = {
      capability: runtimeCapability,
      arguments: buildCapabilityArguments(stage.stage_id, inputs, run),
      idempotency_key: `${run.run_id}:${stage.stage_id}:${runtimeCapability}`,
      actor: {
        actor_kind: "plugin",
        actor_id: "websitefactory",
      },
    };

    const leaseResult = await requestLinkSkillsLease(env, dispatchCtx, leaseRequest);
    if (!leaseResult.success) {
      return leaseResult;
    }
    if (!leaseResult.lease_id) {
      return {
        success: false,
        failure: {
          code: "LEASE_DENIED",
          plane: "linkskills",
          message: `Lease was granted without lease_id for stage: ${stage.stage_id}`,
          retryable: false,
          occurred_at: new Date().toISOString(),
        },
      };
    }

    const execResult = await executeLinkSkillsLease(env, dispatchCtx, {
      lease_id: leaseResult.lease_id,
      idempotency_key: `${run.run_id}:${stage.stage_id}:${runtimeCapability}:exec`,
    });
    if (!execResult.success) {
      return execResult;
    }

    const workflowResult = await dispatchToLinkAutowork(env, dispatchCtx, {
      ...workflowRequest,
      lease_id: leaseResult.lease_id,
    });

    return {
      ...workflowResult,
      lease_id: workflowResult.lease_id || leaseResult.lease_id,
      audit_event_ids: [
        ...(execResult.audit_event_ids || []),
        ...(workflowResult.audit_event_ids || []),
      ],
    };
  }

  // Dispatch to LiNKautowork via kernel adapter
  return dispatchToLinkAutowork(env, dispatchCtx, workflowRequest);
}

/**
 * Execute the record_run stage via LiNKbrain.
 * This is the final stage that persists run closure.
 */
async function executeRecordRunStage(ctx: StageContext): Promise<DispatchResult> {
  const { run } = ctx;

  // Return success - LiNKbrain persistence is handled by kernel
  return {
    success: true,
    outputs: {
      audit_event_ids: [], // Populated by kernel from accumulated refs
    },
  };
}

/**
 * Build capability-specific arguments.
 */
function buildCapabilityArguments(
  stageId: string,
  inputs: Record<string, unknown>,
  run: Run,
): Record<string, unknown> {
  switch (stageId) {
    case "plane_execution_tracking": {
      const leadRecordRef = inputs.lead_record_ref as Record<string, string> | undefined;
      return {
        tenant_id: run.tenant_id,
        lead_id: leadRecordRef?.lead_id || "",
        site_id: inputs.site_id || "",
        site_generation_run_id: inputs.site_generation_run_id || "",
      };
    }
    case "zulip_run_notify": {
      return {
        tenant_id: run.tenant_id,
        run_id: run.run_id,
        site_id: inputs.site_id || "",
        site_generation_run_id: inputs.site_generation_run_id || "",
      };
    }
    default:
      return inputs;
  }
}

/**
 * Build workflow-specific inputs.
 */
function buildWorkflowInputs(
  stageId: string,
  inputs: Record<string, unknown>,
  _run: Run,
): Record<string, unknown> {
  switch (stageId) {
    case "artifact_write_local":
      return {
        site_id: inputs.site_id,
        site_generation_run_id: inputs.site_generation_run_id,
        website_package: inputs.website_package,
      };
    case "supabase_mirror_upsert":
      return {
        site_id: inputs.site_id,
        site_generation_run_id: inputs.site_generation_run_id,
        artifact_ref: inputs.artifact_ref,
        lease_id: inputs.lease_id,
      };
    case "payload_sync_local":
      return {
        site_id: inputs.site_id,
        site_generation_run_id: inputs.site_generation_run_id,
        mirror_write_ref: inputs.mirror_write_ref,
        lease_id: inputs.lease_id,
      };
    case "preview_readiness_check":
      return {
        site_id: inputs.site_id,
        site_generation_run_id: inputs.site_generation_run_id,
        payload_sync_ref: inputs.payload_sync_ref,
        preview_url: inputs.preview_url,
      };
    case "crm_ready_to_contact_mark":
      return {
        lead_record_ref: inputs.lead_record_ref,
        site_id: inputs.site_id,
        site_generation_run_id: inputs.site_generation_run_id,
        checks_passed: inputs.checks_passed,
        check_report_ref: inputs.check_report_ref,
        lease_id: inputs.lease_id,
      };
    default:
      return inputs;
  }
}

/**
 * Sanitize inputs for LinkBot to strip PII per CONTRACTS_MVO.md §3.4.
 * LinkBot prompts MUST NOT receive contact (name, email, phone).
 */
function sanitizeInputsForLinkBot(
  inputs: Record<string, unknown>,
): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(inputs)) {
    // Skip PII-containing keys
    if (key === "contact" || key === "contact_json") {
      continue;
    }

    // If value is a lead_record_ref, strip contact info
    if (key === "lead_record_ref" && typeof value === "object" && value !== null) {
      const ref = value as Record<string, unknown>;
      sanitized[key] = {
        lead_id: ref.lead_id,
        tenant_id: ref.tenant_id,
        idempotency_key: ref.idempotency_key,
        // contact object intentionally omitted
      };
      continue;
    }

    // If value is a lead_input, strip contact
    if (key === "lead_input" && typeof value === "object" && value !== null) {
      const input = value as Record<string, unknown>;
      sanitized[key] = {
        tenant_id: input.tenant_id,
        source: input.source,
        business_name: input.business_name,
        industry: input.industry,
        industry_taxonomy_id: input.industry_taxonomy_id,
        location: input.location,
        notes: input.notes,
        external_ids: input.external_ids,
        // contact object intentionally omitted per §3.4
      };
      continue;
    }

    sanitized[key] = value;
  }

  return sanitized;
}

/**
 * Check if stage execution requires an approval gate.
 * Per CONTRACTS_MVO.md, stages with failure_mode="require_approval" need approval.
 */
export function stageRequiresApproval(manifestStage: PluginManifestStage): boolean {
  return manifestStage.failure_mode === "require_approval";
}

/**
 * Get retry configuration for a stage based on its failure_mode.
 */
export function getStageRetryConfig(manifestStage: PluginManifestStage): {
  maxRetries: number;
  retryable: boolean;
} {
  switch (manifestStage.failure_mode) {
    case "retryable":
      return { maxRetries: 3, retryable: true };
    case "abort_run":
      return { maxRetries: 0, retryable: false };
    case "require_approval":
      return { maxRetries: 0, retryable: false }; // Approval is not retryable
    default:
      return { maxRetries: 0, retryable: false };
  }
}
