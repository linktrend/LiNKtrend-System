/**
 * Workflow runner — orchestrates workflow invocation per CONTRACTS_MVO.md §6.4.
 *
 * - Maintains registry of workflow handlers by handle string.
 * - Manages idempotency (ensures same idempotency_key returns same result).
 * - Emits required audit events: workflow.invoked, workflow.completed/failed/compensated.
 * - Returns WorkflowInvokeResult compatible with LiNKaios kernel expectations.
 */

import { randomUUID } from "node:crypto";
import type {
  WorkflowInvokeRequest,
  WorkflowInvokeResult,
  WorkflowRunStatus,
  AuditEvent,
  FailureReport,
} from "@linktrend/linklogic-sdk";
import type { WorkflowContext, WorkflowDefinition } from "../types/index.js";
import { createAuditEmitter } from "./audit-emitter.js";
import { ExponentialBackoffPolicy, sleepMs } from "./retry-policy.js";
import { N8nHttpClient, type N8nClient } from "./n8n-client.js";
import { executeViaN8n } from "../workflows/n8n-executor.js";

/**
 * In-memory result cache for idempotency (MVO stub).
 * Post-MVO: replace with persistent storage keyed by idempotency_key.
 */
const idempotencyCache = new Map<string, WorkflowInvokeResult>();

/**
 * Registry of all workflow handlers.
 */
const workflowRegistry = new Map<string, WorkflowDefinition>();
let n8nClientOverride: N8nClient | undefined;

/**
 * Register a workflow definition.
 */
export function registerWorkflow(definition: WorkflowDefinition): void {
  if (workflowRegistry.has(definition.handle)) {
    throw new Error(`Workflow already registered: ${definition.handle}`);
  }
  workflowRegistry.set(definition.handle, definition);
}

/**
 * Get a registered workflow definition.
 */
export function getWorkflow(handle: string): WorkflowDefinition | undefined {
  return workflowRegistry.get(handle);
}

/**
 * List all registered workflow handles.
 */
export function listRegisteredWorkflows(): string[] {
  return Array.from(workflowRegistry.keys());
}

/**
 * Execute a workflow invocation request.
 *
 * This is the main entry point from LiNKaios kernel (autowork.workflow.invoke).
 */
export async function invokeWorkflow(
  request: WorkflowInvokeRequest,
  deps: {
    writeAuditEvent: (event: AuditEvent) => Promise<{ event_id: string }>;
  },
): Promise<WorkflowInvokeResult> {
  const workflow = workflowRegistry.get(request.workflow_handle);
  const auditEmitter = createAuditEmitter(deps.writeAuditEvent);

  if (!workflow) {
    const workflow_run_id = randomUUID();
    const invokedEventId = await auditEmitter.emitInvoked(request, workflow_run_id);
    const failure = {
      code: "WORKFLOW_NOT_FOUND",
      plane: "linkautowork" as const,
      message: `Workflow not registered: ${request.workflow_handle}`,
      retryable: false,
      occurred_at: new Date().toISOString(),
    };
    const failedEventId = await auditEmitter.emitFailed(
      request,
      workflow_run_id,
      { code: failure.code, message: failure.message, retryable: failure.retryable },
      invokedEventId,
    );
    return {
      workflow_run_id,
      status: "failed",
      audit_event_ids: [invokedEventId, failedEventId],
      failure,
    };
  }

  // Check idempotency cache
  const cached = idempotencyCache.get(request.idempotency_key);
  if (cached) {
    // Return exact cached result per idempotency contract
    // The original workflow_run_id must be preserved
    return cached;
  }

  // Check lease requirement
  if (workflow.requires_lease && !request.lease_id) {
    const workflow_run_id = randomUUID();
    const invokedEventId = await auditEmitter.emitInvoked(request, workflow_run_id);
    const failure = {
      code: "LEASE_REQUEST_INVALID",
      plane: "linkautowork" as const,
      message: `Workflow ${request.workflow_handle} requires a lease_id`,
      retryable: false,
      occurred_at: new Date().toISOString(),
    };
    const failedEventId = await auditEmitter.emitFailed(
      request,
      workflow_run_id,
      { code: failure.code, message: failure.message, retryable: failure.retryable },
      invokedEventId,
    );
    return {
      workflow_run_id,
      status: "failed",
      audit_event_ids: [invokedEventId, failedEventId],
      failure,
    };
  }

  const workflow_run_id = randomUUID();
  const retryPolicy = new ExponentialBackoffPolicy();
  const handler = workflow.handler;
  const useN8nMode = process.env.AUTOWORK_MODE === "n8n";
  const attemptAuditEventIds: string[] = [];

  for (let attempt = 1; attempt <= retryPolicy.maxAttempts; attempt += 1) {
    const context = {
      env: {},
      tenant_id: request.tenant_id,
      run_id: request.run_id,
      stage_id: request.stage_id,
      workflow_run_id,
      lease_id: request.lease_id,
      idempotency_key: request.idempotency_key,
      attempt,
    } as WorkflowContext & { attempt: number };

    try {
      const result = useN8nMode
        ? await executeViaN8n(request, context, getN8nClient())
        : await handler(request, context);

      if ("failure" in result) {
        attemptAuditEventIds.push(...result.audit_event_ids);
        const failure: FailureReport = {
          ...result.failure,
          plane: "linkautowork",
          occurred_at: new Date().toISOString(),
        };
        const shouldRetry = retryPolicy.shouldRetry(failure, attempt);
        if (!shouldRetry) {
          const status: WorkflowRunStatus = "failed";
          const finalResult: WorkflowInvokeResult = {
            workflow_run_id,
            status,
            audit_event_ids: attemptAuditEventIds,
            failure: attempt >= retryPolicy.maxAttempts
              ? { ...failure, details: { ...(failure.details ?? {}), retry_exhausted: true } }
              : failure,
          };
          idempotencyCache.set(request.idempotency_key, finalResult);
          return finalResult;
        }

        await sleepMs(retryPolicy.getDelayMs(attempt));
        continue;
      }

      const status: WorkflowRunStatus = "succeeded";
      const finalResult: WorkflowInvokeResult = {
        workflow_run_id,
        status,
        outputs: result.outputs as Record<string, unknown>,
        audit_event_ids: attemptAuditEventIds.length > 0
          ? [...attemptAuditEventIds, ...result.audit_event_ids]
          : result.audit_event_ids,
      };
      idempotencyCache.set(request.idempotency_key, finalResult);
      return finalResult;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unexpected workflow error";
      const failure: FailureReport = {
        code: "WORKFLOW_STEP_FAILED",
        plane: "linkautowork",
        message: errorMessage,
        retryable: true,
        occurred_at: new Date().toISOString(),
      };

      const shouldRetry = retryPolicy.shouldRetry(failure, attempt);
      if (!shouldRetry) {
        const auditEmitterInternal = createAuditEmitter(deps.writeAuditEvent);
        const invokedEventId = await auditEmitterInternal.emitInvoked(request, workflow_run_id);
        const failedEventId = await auditEmitterInternal.emitFailed(
          request,
          workflow_run_id,
          { code: failure.code, message: failure.message, retryable: failure.retryable },
          invokedEventId,
        );

        const finalResult: WorkflowInvokeResult = {
          workflow_run_id,
          status: "failed",
          audit_event_ids: [invokedEventId, failedEventId],
          failure: attempt >= retryPolicy.maxAttempts
            ? { ...failure, details: { retry_exhausted: true } }
            : failure,
        };
        idempotencyCache.set(request.idempotency_key, finalResult);
        return finalResult;
      }

      await sleepMs(retryPolicy.getDelayMs(attempt));
    }
  }

  const exhaustedFailure: FailureReport = {
    code: "WORKFLOW_STEP_FAILED",
    plane: "linkautowork",
    message: "Retry attempts exhausted",
    retryable: false,
    details: { retry_exhausted: true },
    occurred_at: new Date().toISOString(),
  };
  const fallbackResult: WorkflowInvokeResult = {
    workflow_run_id,
    status: "failed",
    audit_event_ids: [],
    failure: exhaustedFailure,
  };
  idempotencyCache.set(request.idempotency_key, fallbackResult);
  return fallbackResult;
}

// makeErrorResult is no longer used - errors now emit proper audit events inline

/**
 * Clear the idempotency cache (useful for testing).
 */
export function clearIdempotencyCache(): void {
  idempotencyCache.clear();
}

/**
 * Get a cached result by idempotency key (useful for testing/debugging).
 */
export function getCachedResult(idempotencyKey: string): WorkflowInvokeResult | undefined {
  return idempotencyCache.get(idempotencyKey);
}

/**
 * Clear the workflow registry (useful for testing).
 */
export function clearWorkflowRegistry(): void {
  workflowRegistry.clear();
}

/**
 * Unregister a specific workflow (useful for testing).
 */
export function unregisterWorkflow(handle: string): void {
  workflowRegistry.delete(handle);
}

export async function checkN8nHealth(): Promise<boolean> {
  return getN8nClient().checkHealth();
}

export function setN8nClientForTesting(client: N8nClient | undefined): void {
  n8nClientOverride = client;
}

function getN8nClient(): N8nClient {
  if (n8nClientOverride) {
    return n8nClientOverride;
  }
  return new N8nHttpClient({
    baseUrl: process.env.N8N_BASE_URL ?? "http://127.0.0.1:5678",
    apiKey: process.env.N8N_API_KEY,
  });
}
