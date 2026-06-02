import type { AuditEvent, WorkflowInvokeRequest, WorkflowInvokeResult } from "@linktrend/linklogic-sdk";
import { writeBrainAuditEvent } from "@linktrend/linklogic-sdk";
import type { Env } from "@linktrend/shared-config";

let bootstrapped = false;

type AutoworkGatewayModule = typeof import("@linktrend/autowork-gateway");

async function loadAutoworkGateway(): Promise<AutoworkGatewayModule> {
  return import("@linktrend/autowork-gateway");
}

async function writeAutoworkAudit(env: Env, event: AuditEvent): Promise<{ event_id: string }> {
  return writeBrainAuditEvent(env, event);
}

export async function ensureLinkAutoworkWorkflows(env: Env): Promise<void> {
  if (bootstrapped) return;
  const gw = await loadAutoworkGateway();
  gw.clearWorkflowRegistry();
  gw.bootstrapWebsiteFactoryWorkflows({
    writeAuditEvent: (event) => writeAutoworkAudit(env, event),
  });
  bootstrapped = true;
}

export async function resetLinkAutoworkWorkflowsForTesting(): Promise<void> {
  bootstrapped = false;
  const gw = await loadAutoworkGateway();
  gw.clearWorkflowRegistry();
}

export async function invokeLinkAutoworkWorkflow(
  env: Env,
  request: WorkflowInvokeRequest,
): Promise<WorkflowInvokeResult> {
  const gw = await loadAutoworkGateway();
  await ensureLinkAutoworkWorkflows(env);
  if (!gw.listRegisteredWorkflows().includes(request.workflow_handle)) {
    return {
      workflow_run_id: crypto.randomUUID(),
      status: "failed",
      audit_event_ids: [],
      failure: {
        code: "WORKFLOW_NOT_FOUND",
        plane: "linkautowork",
        message: `Workflow not registered: ${request.workflow_handle}`,
        retryable: false,
        occurred_at: new Date().toISOString(),
      },
    };
  }
  return gw.invokeWorkflow(request, {
    writeAuditEvent: (event) => writeAutoworkAudit(env, event),
  });
}
