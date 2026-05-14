/**
 * LiNKaios kernel — Dispatch adapters to external planes
 *
 * Implements CONTRACTS_MVO.md §6 cross-plane contracts:
 * - §6.1 LinkBot (reasoning dispatch)
 * - §6.2 LinkSkills (lease lifecycle)
 * - §6.3 LiNKbrain (audit/event envelope) — via SDK writer
 * - §6.4 LiNKautowork (workflow invocation)
 *
 * Role-bleed guards:
 * - Kernel NEVER executes side effects, reasoning, or audit writes itself
 * - Kernel ONLY dispatches to the responsible plane and records trace refs
 */

import { createSupabaseServiceClient } from "@linktrend/db";
import type { SupabaseClient } from "@linktrend/db";
import {
  writeBrainAuditEvent,
  type AuditEvent,
  type AuditWriteResult,
  type BotReasonRequest,
  type BotReasonResult,
  type LeaseRequest,
  type LeaseDecision,
  type LeaseExecuteRequest,
  type LeaseExecuteResult,
  type WorkflowInvokeRequest,
  type WorkflowInvokeResult,
  type FailureReport,
} from "@linktrend/linklogic-sdk";
import type { DispatchContext, DispatchResult } from "./types";
import type { Env } from "@linktrend/shared-config";

// Retry config
const DEFAULT_RETRY_ATTEMPTS = 3;
export const RETRY_DELAY_MS = [1000, 4000, 16000]; // exponential backoff per CONTRACTS_MVO.md §4.6

/**
 * Dispatch to LinkBot for reasoning stages.
 * Implements CONTRACTS_MVO.md §6.1.
 */
export async function dispatchToLinkBot(
  env: Env,
  ctx: DispatchContext,
  request: Omit<BotReasonRequest, "tenant_id" | "run_id" | "stage_id">,
): Promise<DispatchResult> {
  const fullRequest: BotReasonRequest = {
    tenant_id: ctx.tenant_id,
    run_id: ctx.run_id,
    stage_id: ctx.stage_id,
    ...request,
  };

  // MVO: LinkBot dispatch is a stub that returns mock success
  // Real implementation calls LinkBot runtime via HTTP or internal RPC
  // For MVO, we simulate the contract to prove kernel dispatch works

  const mockResult: BotReasonResult = {
    outputs: generateMockReasoningOutputs(request.reasoning_kind, request.inputs),
    model_run_id: `mock-model-${Date.now()}`,
    tokens_in: 150,
    tokens_out: 250,
  };

  // Write audit event for stage.completed via LinkBrain
  const auditResult = await writeStageAuditEvent(env, ctx, "stage.completed", {
    model_run_id: mockResult.model_run_id,
    tokens_in: mockResult.tokens_in,
    tokens_out: mockResult.tokens_out,
    reasoning_kind: request.reasoning_kind,
  });

  return {
    success: true,
    outputs: mockResult.outputs,
    model_run_id: mockResult.model_run_id,
    audit_event_id: auditResult.event_id,
  };
}

/**
 * Generate mock reasoning outputs based on reasoning kind.
 * MVO stub — real LinkBot would call OpenRouter.
 */
function generateMockReasoningOutputs(
  reasoningKind: string,
  inputs: Record<string, unknown>,
): Record<string, unknown> {
  switch (reasoningKind) {
    case "lead_evaluation":
      return {
        lead_evaluation: {
          score: 75,
          segment: "smb_services",
          rationale: "Professional services business with clear value proposition",
          model_run_id: `eval-${Date.now()}`,
        },
      };
    case "template_selection":
      return {
        template_id: "agency_v2",
      };
    case "copy_generation":
      return {
        copy_bundle: {
          blocks: [
            { block_id: "hero", text: { headline: "Your Success Starts Here", subhead: "Professional services tailored for you" } },
            { block_id: "about", text: { title: "About Us", body: "We deliver excellence in every project." } },
          ],
          locale: "en-US",
        },
      };
    case "media_placement":
      return {
        media_plan: {
          placements: [
            { block_id: "hero", asset_ref: "placeholder://hero-bg", kind: "placeholder" },
            { block_id: "about", asset_ref: "stock://team-photo", kind: "stock" },
          ],
        },
      };
    default:
      return {};
  }
}

/**
 * Request a capability lease from LinkSkills.
 * Implements CONTRACTS_MVO.md §6.2.
 */
export async function requestLinkSkillsLease(
  env: Env,
  ctx: DispatchContext,
  request: Omit<LeaseRequest, "tenant_id" | "run_id" | "stage_id">,
): Promise<DispatchResult> {
  const supabase = createSupabaseServiceClient(env);

  const { data, error } = await supabase.schema("linkskills").rpc("request_lease", {
    p_tenant_id: ctx.tenant_id,
    p_run_id: ctx.run_id,
    p_stage_id: ctx.stage_id,
    p_capability_id: request.capability,
    p_arguments: request.arguments,
    p_idempotency_key: request.idempotency_key,
    p_actor_kind: request.actor.actor_kind,
    p_actor_id: request.actor.actor_id,
  });

  if (error) {
    const failure: FailureReport = {
      code: "LEASE_REQUEST_INVALID",
      plane: "linkskills",
      message: error.message,
      retryable: true,
      occurred_at: new Date().toISOString(),
    };
    return { success: false, failure };
  }

  // data returns: { lease_id, status, is_existing, kill_switch_state }
  const result = Array.isArray(data) ? data[0] : data;
  const leaseId = result?.lease_id as string;
  const status = result?.status as string;
  const killSwitch = result?.kill_switch_state as string;

  // Write audit events
  await writeStageAuditEvent(env, ctx, "lease.requested", {
    capability: request.capability,
    lease_id: leaseId,
  });

  if (status === "denied" || killSwitch === "tripped") {
    const failure: FailureReport = {
      code: killSwitch === "tripped" ? "LEASE_KILL_SWITCH" : "LEASE_DENIED",
      plane: "linkskills",
      message: killSwitch === "tripped" ? "Kill switch tripped for capability" : "Lease denied by policy",
      retryable: false,
      occurred_at: new Date().toISOString(),
    };

    await writeStageAuditEvent(env, ctx, "lease.denied", {
      capability: request.capability,
      lease_id: leaseId,
      reason: failure.message,
    });

    return { success: false, failure, lease_id: leaseId };
  }

  // Check if approval is required
  if (status === "requires_approval") {
    await writeStageAuditEvent(env, ctx, "lease.granted", {
      capability: request.capability,
      lease_id: leaseId,
      requires_approval: true,
    });

    return {
      success: false, // Not yet executed
      requires_approval: true,
      lease_id: leaseId,
    };
  }

  // Granted - proceed to execute
  await writeStageAuditEvent(env, ctx, "lease.granted", {
    capability: request.capability,
    lease_id: leaseId,
  });

  return { success: true, lease_id: leaseId };
}

/**
 * Execute a granted lease via LinkSkills.
 */
export async function executeLinkSkillsLease(
  env: Env,
  ctx: DispatchContext,
  request: LeaseExecuteRequest,
): Promise<DispatchResult> {
  const supabase = createSupabaseServiceClient(env);

  const capability = request.idempotency_key.split(':')[2];
  let mockResult: Record<string, unknown> = {};
  if (capability === "preview.publish") {
    mockResult = {
      preview_url: `/preview/${ctx.tenant_id}/${ctx.run_id}`,
      preview_artifact_ref: `storage://previews/${ctx.run_id}.zip`,
    };
  } else if (capability === "crm.upsert") {
    mockResult = { crm_record_id: `crm-${Date.now()}` };
  } else if (capability === "plane.project.create") {
    mockResult = { project_id: `proj-${Date.now()}`, task_id: `task-${Date.now()}` };
  }

  const { data, error } = await supabase.schema("linkskills").rpc("record_execution", {
    p_lease_id: request.lease_id,
    p_idempotency_key: request.idempotency_key,
    p_result: mockResult, // MVO mock response
    p_audit_event_id: null, // Will be set by capability backend
  });

  if (error) {
    const failure: FailureReport = {
      code: "LEASE_DENIED",
      plane: "linkskills",
      message: error.message,
      retryable: false,
      occurred_at: new Date().toISOString(),
    };
    return { success: false, failure };
  }

  const result = Array.isArray(data) ? data[0] : data;
  const isDuplicate = result?.is_duplicate as boolean;
  const execResult = result?.result as Record<string, unknown>;

  // For MVO, we use stub backends that directly return results
  // In real implementation, this would call the capability backend

  await writeStageAuditEvent(env, ctx, "lease.executed", {
    lease_id: request.lease_id,
    is_duplicate: isDuplicate,
  });

  return {
    success: true,
    outputs: execResult,
  };
}

/**
 * Dispatch to LiNKautowork for deterministic workflow execution.
 * Implements CONTRACTS_MVO.md §6.4.
 */
export async function dispatchToLinkAutowork(
  env: Env,
  ctx: DispatchContext,
  request: Omit<WorkflowInvokeRequest, "tenant_id" | "run_id" | "stage_id">,
): Promise<DispatchResult> {
  const fullRequest: WorkflowInvokeRequest = {
    tenant_id: ctx.tenant_id,
    run_id: ctx.run_id,
    stage_id: ctx.stage_id,
    ...request,
  };

  // MVO: LiNKautowork dispatch is a stub
  // Real implementation calls n8n gateway via HTTP

  const workflowRunId = `wf-${Date.now()}`;

  await writeStageAuditEvent(env, ctx, "workflow.invoked", {
    workflow_handle: request.workflow_handle,
    workflow_run_id: workflowRunId,
  });

  // Mock success
  const mockOutputs: Record<string, unknown> =
    request.workflow_handle === "autowork.websitefactory.render"
      ? { render_spec: request.inputs }
      : request.workflow_handle === "autowork.websitefactory.preview_serve"
        ? {
            preview_url: `/preview/${ctx.tenant_id}/${ctx.run_id}`,
            preview_artifact_ref: `storage://previews/${ctx.run_id}.zip`,
          }
        : {};

  await writeStageAuditEvent(env, ctx, "workflow.completed", {
    workflow_handle: request.workflow_handle,
    workflow_run_id: workflowRunId,
  });

  return {
    success: true,
    outputs: mockOutputs,
    workflow_run_id: workflowRunId,
  };
}

/**
 * Write a stage-level audit event to LiNKbrain.
 * Uses the SDK's writeBrainAuditEvent which calls linkbrain.write_audit_event RPC.
 */
export async function writeStageAuditEvent(
  env: Env,
  ctx: DispatchContext,
  action: string,
  payload: Record<string, unknown> = {},
): Promise<AuditWriteResult> {
  const event: AuditEvent = {
    event_id: crypto.randomUUID(),
    ts: new Date().toISOString(),
    tenant_id: ctx.tenant_id,
    plane: "linkaios",
    actor: {
      actor_kind: "kernel",
      actor_id: "linkaios.kernel",
    },
    action,
    subject: {
      run_id: ctx.run_id,
      stage_id: ctx.stage_id,
    },
    payload,
    schema_version: "1",
  };

  return writeBrainAuditEvent(env, event);
}

/**
 * Write a run-level audit event to LiNKbrain.
 */
export async function writeRunAuditEvent(
  env: Env,
  tenantId: string,
  runId: string,
  action: string,
  payload: Record<string, unknown> = {},
): Promise<AuditWriteResult> {
  const event: AuditEvent = {
    event_id: crypto.randomUUID(),
    ts: new Date().toISOString(),
    tenant_id: tenantId,
    plane: "linkaios",
    actor: {
      actor_kind: "kernel",
      actor_id: "linkaios.kernel",
    },
    action,
    subject: {
      run_id: runId,
    },
    payload,
    schema_version: "1",
  };

  return writeBrainAuditEvent(env, event);
}

/**
 * Dispatch the record_run stage to LiNKbrain.
 * This persists the run closure to LiNKbrain memory.
 */
export async function dispatchToLinkBrainRecordRun(
  env: Env,
  ctx: DispatchContext,
  outputs: Record<string, unknown>,
  auditEventIds: string[],
): Promise<DispatchResult> {
  // Write the final run.completed audit event
  const auditResult = await writeRunAuditEvent(
    env,
    ctx.tenant_id,
    ctx.run_id,
    "run.completed",
    {
      plugin_id: ctx.plugin_id,
      final_outputs_keys: Object.keys(outputs),
    },
  );

  // MVO: LiNKbrain memory persistence is stubbed
  // Real implementation would write to LiNKbrain memory system

  return {
    success: true,
    audit_event_id: auditResult.event_id,
  };
}
