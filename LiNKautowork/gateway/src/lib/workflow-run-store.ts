import type { WorkflowInvokeRequest, WorkflowInvokeResult } from "@linktrend/linklogic-sdk";
import {
  buildRunView,
  recordWorkflowRun,
  type WorkflowRunView,
} from "./workflow-status.js";
import {
  NoopWorkflowRunPersistence,
  SupabaseWorkflowRunPersistence,
  type WorkflowRunPersistence,
} from "./workflow-run-persistence.js";

let persistenceOverride: WorkflowRunPersistence | undefined;

export function setWorkflowRunPersistenceForTesting(store: WorkflowRunPersistence | undefined): void {
  persistenceOverride = store;
}

function resolvePersistence(): WorkflowRunPersistence {
  if (persistenceOverride) return persistenceOverride;
  if (process.env.LINKAUTOWORK_PERSIST_RUNS === "0") {
    return new NoopWorkflowRunPersistence();
  }
  const url = process.env.LINKAUTOWORK_SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.LINKAUTOWORK_SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) {
    return new NoopWorkflowRunPersistence();
  }
  return new SupabaseWorkflowRunPersistence({
    schema: (name: string) => ({
      from: (table: string) => ({
        upsert: async (row: Record<string, unknown>, options?: { onConflict?: string }) => {
          const { createClient } = await import("@supabase/supabase-js");
          const client = createClient(url, key, { auth: { persistSession: false } });
          const { error } = await client.schema(name).from(table).upsert(row, options);
          return { error: error ? { message: error.message } : null };
        },
      }),
    }),
  });
}

export async function publishWorkflowRun(
  request: WorkflowInvokeRequest,
  result: WorkflowInvokeResult,
  startedAt: string,
  attempt = 1,
): Promise<WorkflowRunView> {
  const view = buildRunView(
    request.tenant_id,
    request.run_id,
    request.stage_id,
    request.workflow_handle,
    request.idempotency_key,
    result,
    attempt,
    request.lease_id,
  );
  view.started_at = startedAt;
  view.ended_at = new Date().toISOString();
  recordWorkflowRun(view);
  try {
    await resolvePersistence().upsertRun(view);
  } catch (error) {
    console.warn(
      "[linkautowork] workflow_runs persistence skipped:",
      error instanceof Error ? error.message : error,
    );
  }
  return view;
}
