import { afterEach, describe, expect, it, vi } from "vitest";
import type { WorkflowInvokeRequest } from "@linktrend/linklogic-sdk";
import { clearWorkflowRegistry, getWorkflow } from "../lib/workflow-runner.js";
import {
  LINKDEVELOPER_RUN_VALIDATION_HANDLE,
  LINKDEVELOPER_PRODUCT_RUN_BOOTSTRAP_HANDLE,
  bootstrapLinkdeveloperWorkflows,
} from "./linkdeveloper.js";

const auditEvents: Array<Record<string, unknown>> = [];

function makeRequest(handle: string): WorkflowInvokeRequest {
  return {
    tenant_id: "00000000-0000-0000-0000-000000000001",
    run_id: "run-1",
    stage_id: "stage-1",
    workflow_handle: handle,
    inputs: {
      product_run_id: "pr-1",
      issue_id: "issue-1",
      parameters: { objective: "smoke" },
    },
    lease_id: "lease-1",
    idempotency_key: "run-1:stage-1:test",
  };
}

afterEach(() => {
  clearWorkflowRegistry();
  auditEvents.length = 0;
  vi.restoreAllMocks();
  delete process.env.LINKDEVELOPER_SERVICE_URL;
});

describe("linkdeveloper workflows", () => {
  it("registers all adapter and workflow-map handles", () => {
    bootstrapLinkdeveloperWorkflows({
      writeAuditEvent: async (event) => {
        auditEvents.push(event as Record<string, unknown>);
        return { event_id: `evt-${auditEvents.length}` };
      },
    });

    expect(getWorkflow(LINKDEVELOPER_RUN_VALIDATION_HANDLE)).toBeDefined();
    expect(getWorkflow(LINKDEVELOPER_PRODUCT_RUN_BOOTSTRAP_HANDLE)).toBeDefined();
    expect(getWorkflow("autowork.linkdeveloper.artifact_write")).toBeDefined();
  });

  it("completes with governed passthrough when LiNKdeveloper service is unreachable", async () => {
    process.env.LINKDEVELOPER_SERVICE_URL = "http://127.0.0.1:1";
    bootstrapLinkdeveloperWorkflows({
      writeAuditEvent: async (event) => {
        auditEvents.push(event as Record<string, unknown>);
        return { event_id: `evt-${auditEvents.length}` };
      },
    });

    const workflow = getWorkflow(LINKDEVELOPER_RUN_VALIDATION_HANDLE);
    expect(workflow).toBeDefined();

    const result = await workflow!.handler(makeRequest(LINKDEVELOPER_RUN_VALIDATION_HANDLE), {
      tenant_id: "00000000-0000-0000-0000-000000000001",
    });

    expect(result.status).toBe("completed");
    expect(result.outputs?.service_reachable).toBe(false);
    expect(result.outputs?.fallback).toBe("passthrough");
    expect(result.audit_event_ids.length).toBeGreaterThanOrEqual(2);
  });

  it("returns API payload when LiNKdeveloper service responds", async () => {
    const fetchMock = vi.fn(async () => ({
      ok: true,
      status: 200,
      text: async () => JSON.stringify({ ok: true, validation_id: "val-1" }),
    }));
    vi.stubGlobal("fetch", fetchMock);
    process.env.LINKDEVELOPER_SERVICE_URL = "http://127.0.0.1:3101";

    bootstrapLinkdeveloperWorkflows({
      writeAuditEvent: async (event) => {
        auditEvents.push(event as Record<string, unknown>);
        return { event_id: `evt-${auditEvents.length}` };
      },
    });

    const workflow = getWorkflow(LINKDEVELOPER_PRODUCT_RUN_BOOTSTRAP_HANDLE);
    const result = await workflow!.handler(
      makeRequest(LINKDEVELOPER_PRODUCT_RUN_BOOTSTRAP_HANDLE),
      { tenant_id: "00000000-0000-0000-0000-000000000001" },
    );

    expect(result.status).toBe("completed");
    expect(result.outputs?.service_reachable).toBe(true);
    expect(result.outputs?.api).toEqual({ ok: true, validation_id: "val-1" });
    expect(fetchMock).toHaveBeenCalledOnce();
  });
});
