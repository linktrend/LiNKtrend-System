import type { WorkflowInvokeRequest, WorkflowInvokeResult } from "@linktrend/linklogic-sdk";
import type { WorkflowRunView } from "./workflow-status.js";

export interface WorkflowRunPersistence {
  upsertRun(view: WorkflowRunView): Promise<void>;
}

/** No-op persistence for unit tests and local runs without Supabase. */
export class NoopWorkflowRunPersistence implements WorkflowRunPersistence {
  async upsertRun(): Promise<void> {
    return;
  }
}

type SupabaseInsertClient = {
  schema: (name: string) => {
    from: (table: string) => {
      upsert: (
        row: Record<string, unknown>,
        options?: { onConflict?: string },
      ) => Promise<{ error: { message: string } | null }>;
    };
  };
};

/**
 * Persists workflow runs for LiNKaios cockpit / trace surfaces (linkautowork.workflow_runs).
 */
export class SupabaseWorkflowRunPersistence implements WorkflowRunPersistence {
  constructor(private readonly client: SupabaseInsertClient) {}

  async upsertRun(view: WorkflowRunView): Promise<void> {
    const { error } = await this.client.schema("linkautowork").from("workflow_runs").upsert(
      {
        workflow_run_id: view.workflow_run_id,
        workflow_handle: view.workflow_handle,
        status: view.status,
        tenant_id: view.tenant_id,
        run_id: view.run_id,
        stage_id: view.stage_id,
        lease_id: view.lease_id ?? null,
        idempotency_key: view.idempotency_key,
        invoked_at: view.started_at ?? new Date().toISOString(),
        completed_at: view.ended_at ?? null,
        audit_event_ids: view.audit_event_ids,
        failure_message: view.failure?.message ?? null,
        outputs: view.outputs ?? null,
      },
      { onConflict: "workflow_run_id" },
    );
    if (error) {
      throw new Error(`workflow_runs upsert failed: ${error.message}`);
    }
  }
}

export function viewFromInvoke(
  request: WorkflowInvokeRequest,
  result: WorkflowInvokeResult,
  startedAt: string,
  endedAt: string,
): WorkflowRunView {
  return {
    workflow_run_id: result.workflow_run_id,
    tenant_id: request.tenant_id,
    run_id: request.run_id,
    stage_id: request.stage_id,
    workflow_handle: request.workflow_handle,
    status:
      result.status === "succeeded"
        ? "succeeded"
        : result.status === "compensated"
          ? "compensated"
          : "failed",
    attempt: 1,
    idempotency_key: request.idempotency_key,
    lease_id: request.lease_id,
    audit_event_ids: result.audit_event_ids,
    outputs: result.outputs,
    failure: result.failure,
    started_at: startedAt,
    ended_at: endedAt,
    retry_exhausted: Boolean(result.failure?.details?.retry_exhausted),
  };
}
