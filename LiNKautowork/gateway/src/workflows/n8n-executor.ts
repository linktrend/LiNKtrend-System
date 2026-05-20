import type { WorkflowContext } from "../types/index.js";
import type { WorkflowInvokeRequest } from "@linktrend/linklogic-sdk";
import type { N8nClient } from "../lib/n8n-client.js";

export const SAMPLE_N8N_WORKFLOW_TEMPLATE = {
  name: "linkautowork-dev-template",
  nodes: [
    {
      id: "1",
      name: "Webhook",
      type: "n8n-nodes-base.webhook",
      typeVersion: 1,
      position: [240, 300],
      parameters: {
        path: "linkautowork-dev-template",
        httpMethod: "POST",
      },
    },
    {
      id: "2",
      name: "Respond",
      type: "n8n-nodes-base.respondToWebhook",
      typeVersion: 1,
      position: [540, 300],
      parameters: {
        respondWith: "json",
        responseBody: "={{ { ok: true, received: $json } }}",
      },
    },
  ],
  connections: {
    Webhook: {
      main: [[{ node: "Respond", type: "main", index: 0 }]],
    },
  },
};

export async function executeViaN8n(
  request: WorkflowInvokeRequest,
  context: WorkflowContext & { attempt: number },
  client: N8nClient,
): Promise<{
  outputs: Record<string, unknown>;
  audit_event_ids: string[];
}> {
  const workflowId = request.workflow_handle;
  const payload = {
    tenant_id: request.tenant_id,
    run_id: request.run_id,
    stage_id: request.stage_id,
    lease_id: request.lease_id,
    idempotency_key: request.idempotency_key,
    inputs: request.inputs,
    workflow_run_id: context.workflow_run_id,
    attempt: context.attempt,
  };
  const execution = await client.executeWorkflow(workflowId, payload);
  return {
    outputs: {
      n8n_execution_id: execution.executionId,
      n8n_result: execution.result ?? null,
      n8n_workflow_id: workflowId,
    },
    audit_event_ids: [],
  };
}

