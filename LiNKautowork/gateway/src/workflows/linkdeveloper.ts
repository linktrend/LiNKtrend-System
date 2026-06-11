/**
 * LiNKdeveloper factory workflow handles — adapter keys + workflow-map hooks.
 */

import { randomUUID } from "node:crypto";
import type { AuditEvent, WorkflowInvokeRequest } from "@linktrend/linklogic-sdk";
import { createAuditEmitter, type AuditEmitter } from "../lib/audit-emitter.js";
import { registerWorkflow } from "../lib/workflow-runner.js";
import type { WorkflowContext, WorkflowHandler, WorkflowInvokeResult } from "../types/index.js";

export const LINKDEVELOPER_RUN_VALIDATION_HANDLE = "autowork.linkdeveloper.run_validation";
export const LINKDEVELOPER_STATUS_SYNC_HANDLE = "autowork.linkdeveloper.status_sync";
export const LINKDEVELOPER_STARTER_GENERATION_HANDLE = "autowork.linkdeveloper.starter_generation";
export const LINKDEVELOPER_NOTIFICATION_HANDLE = "autowork.linkdeveloper.notification";
export const LINKDEVELOPER_REPORT_GENERATION_HANDLE = "autowork.linkdeveloper.report_generation";
export const LINKDEVELOPER_RUN_TASK_HANDLE = "autowork.linkdeveloper.run_task";
export const LINKDEVELOPER_DEPLOY_SCAFFOLD_HANDLE = "autowork.linkdeveloper.deploy_scaffold";

export const LINKDEVELOPER_PRODUCT_RUN_BOOTSTRAP_HANDLE =
  "autowork.linkdeveloper.product_run_bootstrap";
export const LINKDEVELOPER_ISSUE_DISPATCH_HANDLE = "autowork.linkdeveloper.issue_dispatch";
export const LINKDEVELOPER_VALIDATION_RECORD_HANDLE = "autowork.linkdeveloper.validation_record";
export const LINKDEVELOPER_ARTIFACT_WRITE_HANDLE = "autowork.linkdeveloper.artifact_write";

const SERVICE_STEP_PATH: Record<string, string> = {
  [LINKDEVELOPER_PRODUCT_RUN_BOOTSTRAP_HANDLE]: "/v1/autowork/product_run_bootstrap",
  [LINKDEVELOPER_ISSUE_DISPATCH_HANDLE]: "/v1/autowork/issue_dispatch",
  [LINKDEVELOPER_VALIDATION_RECORD_HANDLE]: "/v1/autowork/validation_record",
  [LINKDEVELOPER_ARTIFACT_WRITE_HANDLE]: "/v1/autowork/artifact_write",
  [LINKDEVELOPER_RUN_VALIDATION_HANDLE]: "/v1/autowork/run_validation",
  [LINKDEVELOPER_STATUS_SYNC_HANDLE]: "/v1/autowork/status_sync",
  [LINKDEVELOPER_STARTER_GENERATION_HANDLE]: "/v1/autowork/starter_generation",
  [LINKDEVELOPER_NOTIFICATION_HANDLE]: "/v1/autowork/notification",
  [LINKDEVELOPER_REPORT_GENERATION_HANDLE]: "/v1/autowork/report_generation",
  [LINKDEVELOPER_RUN_TASK_HANDLE]: "/v1/autowork/run_task",
  [LINKDEVELOPER_DEPLOY_SCAFFOLD_HANDLE]: "/v1/autowork/deploy_scaffold",
};

const LEASE_REQUIRED_HANDLES = new Set<string>([
  LINKDEVELOPER_VALIDATION_RECORD_HANDLE,
  LINKDEVELOPER_ARTIFACT_WRITE_HANDLE,
  LINKDEVELOPER_RUN_VALIDATION_HANDLE,
  LINKDEVELOPER_DEPLOY_SCAFFOLD_HANDLE,
]);

function linkdeveloperApiBase(): string {
  return (process.env.LINKDEVELOPER_SERVICE_URL ?? "http://127.0.0.1:3101").replace(/\/$/, "");
}

async function invokeLinkdeveloperApi(
  apiPath: string,
  body: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  const res = await fetch(`${linkdeveloperApiBase()}${apiPath}`, {
    method: "POST",
    headers: { "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(Number(process.env.LINKDEVELOPER_API_TIMEOUT_MS ?? 120_000)),
  });
  const text = await res.text();
  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(text) as Record<string, unknown>;
  } catch {
    parsed = { ok: false, error: text.slice(0, 2000) };
  }
  if (!res.ok) {
    throw new Error(
      `LiNKdeveloper API ${apiPath} failed (${res.status}): ${String(parsed.error ?? text).slice(0, 500)}`,
    );
  }
  return parsed;
}

function extractProductRunId(request: WorkflowInvokeRequest): string | undefined {
  return (
    (request.inputs.product_run_id as string | undefined) ??
    (request.run_id as string | undefined)
  );
}

function createLinkdeveloperHandler(
  auditEmitter: AuditEmitter,
  handle: string,
  displayName: string,
): WorkflowHandler {
  const apiPath = SERVICE_STEP_PATH[handle] ?? "/v1/autowork/run_task";
  return async (request: WorkflowInvokeRequest, _ctx: WorkflowContext): Promise<WorkflowInvokeResult> => {
    const workflowRunId = randomUUID();
    const invokedEventId = await auditEmitter.emitInvoked(request, workflowRunId);
    const productRunId = extractProductRunId(request);
    const issueId =
      (request.inputs.issue_id as string | undefined) ?? request.stage_id ?? request.run_id;

    const requestBody: Record<string, unknown> = {
      tenant_id: request.tenant_id,
      product_run_id: productRunId,
      issue_id: issueId,
      run_id: request.run_id,
      stage_id: request.stage_id,
      workflow_handle: handle,
      parameters: request.inputs.parameters ?? request.inputs,
    };

    let apiResult: Record<string, unknown> | undefined;
    let serviceReachable = true;
    try {
      apiResult = await invokeLinkdeveloperApi(apiPath, requestBody);
    } catch (err) {
      serviceReachable = false;
      const message = err instanceof Error ? err.message : String(err);
      const outputs = {
        status: "completed",
        workflow_handle: handle,
        operation: displayName,
        product_run_id: productRunId,
        issue_id: issueId,
        service_reachable: false,
        fallback: "passthrough",
        note: message.slice(0, 500),
      };
      const completedEventId = await auditEmitter.emitCompleted(
        request,
        workflowRunId,
        outputs,
        invokedEventId,
      );
      return {
        workflow_run_id: workflowRunId,
        status: "completed",
        outputs,
        audit_event_ids: [invokedEventId, completedEventId],
      };
    }

    const outputs = {
      status: "completed",
      workflow_handle: handle,
      operation: displayName,
      product_run_id: productRunId,
      issue_id: issueId,
      service_reachable: serviceReachable,
      api: apiResult,
    };
    const completedEventId = await auditEmitter.emitCompleted(
      request,
      workflowRunId,
      outputs,
      invokedEventId,
    );
    return {
      workflow_run_id: workflowRunId,
      status: "completed",
      outputs,
      audit_event_ids: [invokedEventId, completedEventId],
    };
  };
}

export function bootstrapLinkdeveloperWorkflows(deps: {
  writeAuditEvent: (event: AuditEvent) => Promise<{ event_id: string }>;
}): void {
  const auditEmitter = createAuditEmitter(deps.writeAuditEvent);

  const handles: Array<[string, string]> = [
    [LINKDEVELOPER_PRODUCT_RUN_BOOTSTRAP_HANDLE, "LiNKdeveloper product run bootstrap"],
    [LINKDEVELOPER_ISSUE_DISPATCH_HANDLE, "LiNKdeveloper issue dispatch"],
    [LINKDEVELOPER_VALIDATION_RECORD_HANDLE, "LiNKdeveloper validation record"],
    [LINKDEVELOPER_ARTIFACT_WRITE_HANDLE, "LiNKdeveloper artifact write"],
    [LINKDEVELOPER_RUN_VALIDATION_HANDLE, "LiNKdeveloper run validation"],
    [LINKDEVELOPER_STATUS_SYNC_HANDLE, "LiNKdeveloper status sync"],
    [LINKDEVELOPER_STARTER_GENERATION_HANDLE, "LiNKdeveloper starter generation"],
    [LINKDEVELOPER_NOTIFICATION_HANDLE, "LiNKdeveloper notification"],
    [LINKDEVELOPER_REPORT_GENERATION_HANDLE, "LiNKdeveloper report generation"],
    [LINKDEVELOPER_RUN_TASK_HANDLE, "LiNKdeveloper run task"],
    [LINKDEVELOPER_DEPLOY_SCAFFOLD_HANDLE, "LiNKdeveloper deploy scaffold"],
  ];

  for (const [handle, displayName] of handles) {
    registerWorkflow({
      handle,
      display_name: displayName,
      description: "LiNKdeveloper automation — invokes LiNKdeveloper service API with governed fallback",
      requires_lease: LEASE_REQUIRED_HANDLES.has(handle),
      handler: createLinkdeveloperHandler(auditEmitter, handle, displayName),
    });
  }
}
