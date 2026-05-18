/**
 * Workflow Status Read Model
 *
 * Exposes LiNKautowork workflow status, idempotency, retry, and audit refs
 * for LiNKaios cockpit display per WP-217.
 *
 * This module provides read-only access to workflow run state for the
 * operational cockpit without allowing mutations.
 */

import type { WorkflowInvokeResult, FailureReport } from "@linktrend/linklogic-sdk";

export type WorkflowRunStatus = "pending" | "running" | "succeeded" | "failed" | "compensated";

export interface WorkflowRunView {
  workflow_run_id: string;
  tenant_id: string;
  run_id: string; // parent LiNKaios run_id
  stage_id: string;
  workflow_handle: string;
  status: WorkflowRunStatus;
  attempt: number;
  idempotency_key: string;
  lease_id?: string;
  audit_event_ids: string[];
  outputs?: Record<string, unknown>;
  failure?: FailureReport;
  started_at?: string;
  ended_at?: string;
  retry_exhausted?: boolean;
}

export interface WorkflowStatusQuery {
  byWorkflowRunId(workflowRunId: string): WorkflowRunView | undefined;
  byTenantAndRun(tenantId: string, runId: string): WorkflowRunView[];
  byIdempotencyKey(idempotencyKey: string): WorkflowRunView | undefined;
  listActive(tenantId?: string): WorkflowRunView[];
  listRecent(limit?: number): WorkflowRunView[];
}

// In-memory store for MVO (production would use persistent store)
const runViews = new Map<string, WorkflowRunView>();
const idempotencyToRunId = new Map<string, string>();

export function recordWorkflowRun(view: WorkflowRunView): void {
  runViews.set(view.workflow_run_id, view);
  idempotencyToRunId.set(view.idempotency_key, view.workflow_run_id);
}

export function updateWorkflowRun(
  workflowRunId: string,
  updates: Partial<WorkflowRunView>,
): WorkflowRunView | undefined {
  const existing = runViews.get(workflowRunId);
  if (!existing) return undefined;
  const updated = { ...existing, ...updates };
  runViews.set(workflowRunId, updated);
  return updated;
}

export const workflowStatusQuery: WorkflowStatusQuery = {
  byWorkflowRunId(workflowRunId: string): WorkflowRunView | undefined {
    return runViews.get(workflowRunId);
  },

  byTenantAndRun(tenantId: string, runId: string): WorkflowRunView[] {
    return Array.from(runViews.values()).filter(
      (v) => v.tenant_id === tenantId && v.run_id === runId,
    );
  },

  byIdempotencyKey(idempotencyKey: string): WorkflowRunView | undefined {
    const runId = idempotencyToRunId.get(idempotencyKey);
    if (!runId) return undefined;
    return runViews.get(runId);
  },

  listActive(tenantId?: string): WorkflowRunView[] {
    const activeStatuses: WorkflowRunStatus[] = ["pending", "running"];
    return Array.from(runViews.values()).filter(
      (v) =>
        activeStatuses.includes(v.status) &&
        (tenantId === undefined || v.tenant_id === tenantId),
    );
  },

  listRecent(limit = 100): WorkflowRunView[] {
    return Array.from(runViews.values())
      .sort((a, b) =>
        (b.started_at ?? b.ended_at ?? "") > (a.started_at ?? a.ended_at ?? "") ? 1 : -1,
      )
      .slice(0, limit);
  },
};

export function clearWorkflowStatusStore(): void {
  runViews.clear();
  idempotencyToRunId.clear();
}

/**
 * Build a WorkflowRunView from a WorkflowInvokeResult.
 * Used by the workflow-runner to record status after invocation.
 */
export function buildRunView(
  tenantId: string,
  runId: string,
  stageId: string,
  workflowHandle: string,
  idempotencyKey: string,
  result: WorkflowInvokeResult,
  attempt: number,
  leaseId?: string,
): WorkflowRunView {
  return {
    workflow_run_id: result.workflow_run_id,
    tenant_id: tenantId,
    run_id: runId,
    stage_id: stageId,
    workflow_handle: workflowHandle,
    status: result.status as WorkflowRunStatus,
    attempt,
    idempotency_key: idempotencyKey,
    lease_id: leaseId,
    audit_event_ids: result.audit_event_ids,
    outputs: result.outputs,
    failure: result.failure,
    retry_exhausted: result.failure?.details &&
      typeof result.failure.details === "object" &&
      "retry_exhausted" in result.failure.details
      ? result.failure.details.retry_exhausted === true
      : undefined,
  };
}
