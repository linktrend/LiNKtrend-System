import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { AuditEvent, WorkflowInvokeRequest } from "@linktrend/linklogic-sdk";
import { N8nHttpClient } from "./n8n-client.js";
import {
  clearIdempotencyCache,
  clearWorkflowRegistry,
  invokeWorkflow,
  registerWorkflow,
  setN8nClientForTesting,
} from "./workflow-runner.js";
import { N8nWebhookRegistry } from "./n8n-webhook-handler.js";

const originalFetch = global.fetch;
const originalMode = process.env.AUTOWORK_MODE;

function baseRequest(idempotency_key: string): WorkflowInvokeRequest {
  return {
    tenant_id: "tenant-1",
    run_id: "run-1",
    stage_id: "stage-1",
    workflow_handle: "autowork.test.n8n",
    inputs: { hello: "world" },
    idempotency_key,
  };
}

function createMockAuditWriter() {
  const events: AuditEvent[] = [];
  return {
    write: async (event: AuditEvent) => {
      events.push(event);
      return { event_id: event.event_id };
    },
    getEvents: () => events,
  };
}

describe("N8nHttpClient", () => {
  beforeEach(() => {
    clearIdempotencyCache();
    clearWorkflowRegistry();
    setN8nClientForTesting(undefined);
  });

  afterEach(() => {
    global.fetch = originalFetch;
    if (originalMode === undefined) {
      delete process.env.AUTOWORK_MODE;
    } else {
      process.env.AUTOWORK_MODE = originalMode;
    }
  });

  it("imports and executes workflow via mocked n8n API", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ id: "wf-123" }), { status: 200 }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ executionId: "exec-456", data: { ok: true } }), { status: 200 }),
      );
    global.fetch = fetchMock as typeof fetch;

    const client = new N8nHttpClient({ baseUrl: "http://127.0.0.1:5678", apiKey: "dev-key" });
    const imported = await client.importWorkflow({ name: "template" });
    const executed = await client.executeWorkflow(imported.workflowId, { k: "v" });

    expect(imported.workflowId).toBe("wf-123");
    expect(executed.executionId).toBe("exec-456");
    expect(executed.result).toEqual({ ok: true });
  });

  it("dispatches to n8n when AUTOWORK_MODE=n8n", async () => {
    process.env.AUTOWORK_MODE = "n8n";
    const executeWorkflow = vi.fn().mockResolvedValue({ executionId: "exec-999", result: { ok: true } });
    setN8nClientForTesting({
      importWorkflow: vi.fn(),
      activateWorkflow: vi.fn(),
      executeWorkflow,
      checkHealth: vi.fn().mockResolvedValue(true),
    });

    registerWorkflow({
      handle: "autowork.test.n8n",
      display_name: "n8n test",
      description: "n8n dispatch test",
      requires_lease: false,
      handler: async () => ({
        outputs: { local: true },
        audit_event_ids: ["local-1", "local-2"],
      }),
    });

    const auditWriter = createMockAuditWriter();
    const result = await invokeWorkflow(baseRequest("n8n-mode-1"), { writeAuditEvent: auditWriter.write });

    expect(result.status).toBe("succeeded");
    expect(executeWorkflow).toHaveBeenCalledTimes(1);
    expect(result.outputs?.n8n_execution_id).toBe("exec-999");
    expect(result.outputs?.n8n_result).toEqual({ ok: true });
  });

  it("registers and resolves webhook callbacks", async () => {
    const registry = new N8nWebhookRegistry();
    const handler = vi.fn().mockResolvedValue(undefined);
    registry.registerWebhookHandler("/callback/test", handler);

    const handled = await registry.handleWebhook("/callback/test", {
      executionId: "exec-1",
      status: "success",
      result: { done: true },
    });
    const missed = await registry.handleWebhook("/missing", {
      executionId: "exec-2",
      status: "failed",
      error: "no handler",
    });

    expect(handled).toBe(true);
    expect(missed).toBe(false);
    expect(handler).toHaveBeenCalledTimes(1);
  });
});

