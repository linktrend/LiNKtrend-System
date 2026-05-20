import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { AuditEvent, FailureReport, WorkflowInvokeRequest } from "@linktrend/linklogic-sdk";
import { ExponentialBackoffPolicy } from "./retry-policy.js";
import {
  clearIdempotencyCache,
  clearWorkflowRegistry,
  getMutableRunControllerForTesting,
  invokeWorkflow,
  registerWorkflow,
} from "./workflow-runner.js";

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

function baseRequest(idempotency_key: string): WorkflowInvokeRequest {
  return {
    tenant_id: "tenant-1",
    run_id: "1c7f4772-f341-4ce9-9861-acf077ce46dc",
    stage_id: "stage-1",
    workflow_handle: "autowork.test.retry",
    inputs: {},
    idempotency_key,
  };
}

describe("ExponentialBackoffPolicy", () => {
  it("applies 3 attempts and delays 1s, 4s, 16s", () => {
    const policy = new ExponentialBackoffPolicy();
    expect(policy.maxAttempts).toBe(3);
    expect(policy.delaysMs).toEqual([1000, 4000, 16000]);
    expect(policy.getDelayMs(1)).toBe(1000);
    expect(policy.getDelayMs(2)).toBe(4000);
    expect(policy.getDelayMs(3)).toBe(16000);
  });

  it("fails fast for non-retryable failure codes", () => {
    const policy = new ExponentialBackoffPolicy();
    const failure: FailureReport = {
      code: "LEASE_DENIED",
      plane: "linkautowork",
      message: "Denied",
      retryable: true,
      occurred_at: new Date().toISOString(),
    };
    expect(policy.shouldRetry(failure, 1)).toBe(false);
  });
});

describe("invokeWorkflow retry behavior", () => {
  beforeEach(() => {
    clearIdempotencyCache();
    clearWorkflowRegistry();
    getMutableRunControllerForTesting().clear();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("succeeds on first attempt", async () => {
    registerWorkflow({
      handle: "autowork.test.retry",
      display_name: "test",
      description: "test",
      requires_lease: false,
      handler: async () => ({
        outputs: { ok: true },
        audit_event_ids: ["a1", "a2"],
      }),
    });
    const auditWriter = createMockAuditWriter();
    const result = await invokeWorkflow(baseRequest("retry-1"), { writeAuditEvent: auditWriter.write });
    expect(result.status).toBe("succeeded");
    expect(result.outputs?.ok).toBe(true);
  });

  it("succeeds after retry on second attempt", async () => {
    vi.useFakeTimers();
    let attempt = 0;
    registerWorkflow({
      handle: "autowork.test.retry",
      display_name: "test",
      description: "test",
      requires_lease: false,
      handler: async () => {
        attempt += 1;
        if (attempt === 1) {
          return {
            failure: { code: "WORKFLOW_STEP_FAILED", message: "transient", retryable: true },
            audit_event_ids: ["f1", "f2"],
          };
        }
        return {
          outputs: { ok: true, attempt },
          audit_event_ids: ["s1", "s2"],
        };
      },
    });
    const auditWriter = createMockAuditWriter();
    const pending = invokeWorkflow(baseRequest("retry-2"), { writeAuditEvent: auditWriter.write });
    await vi.advanceTimersByTimeAsync(1000);
    const result = await pending;
    expect(result.status).toBe("succeeded");
    expect(attempt).toBe(2);
  });

  it("fails after max attempts and marks retry exhausted", async () => {
    vi.useFakeTimers();
    let attempt = 0;
    registerWorkflow({
      handle: "autowork.test.retry",
      display_name: "test",
      description: "test",
      requires_lease: false,
      handler: async () => {
        attempt += 1;
        return {
          failure: { code: "WORKFLOW_STEP_FAILED", message: "still failing", retryable: true },
          audit_event_ids: ["x1", "x2"],
        };
      },
    });
    const auditWriter = createMockAuditWriter();
    const pending = invokeWorkflow(baseRequest("retry-3"), { writeAuditEvent: auditWriter.write });
    await vi.advanceTimersByTimeAsync(1000 + 4000);
    const result = await pending;
    expect(attempt).toBe(3);
    expect(result.status).toBe("failed");
    expect(result.failure?.details?.retry_exhausted).toBe(true);
  });

  it("fails immediately for non-retryable code", async () => {
    let attempt = 0;
    registerWorkflow({
      handle: "autowork.test.retry",
      display_name: "test",
      description: "test",
      requires_lease: false,
      handler: async () => {
        attempt += 1;
        return {
          failure: { code: "LEASE_DENIED", message: "denied", retryable: true },
          audit_event_ids: ["n1", "n2"],
        };
      },
    });
    const auditWriter = createMockAuditWriter();
    const result = await invokeWorkflow(baseRequest("retry-4"), { writeAuditEvent: auditWriter.write });
    expect(result.status).toBe("failed");
    expect(result.failure?.code).toBe("LEASE_DENIED");
    expect(attempt).toBe(1);
  });

  it("queues new runs and fails while tenant is paused", async () => {
    registerWorkflow({
      handle: "autowork.test.retry",
      display_name: "test",
      description: "test",
      requires_lease: false,
      handler: async () => ({
        outputs: { ok: true },
        audit_event_ids: ["s1", "s2"],
      }),
    });

    const controller = getMutableRunControllerForTesting();
    controller.pauseTenant("tenant-1");
    const result = await invokeWorkflow(baseRequest("retry-5"), {
      writeAuditEvent: createMockAuditWriter().write,
    });

    expect(result.status).toBe("failed");
    expect(result.failure?.code).toBe("LEASE_DENIED");
    expect(controller.getQueueStatus("tenant-1").running).toHaveLength(0);
    expect(controller.getQueueStatus("tenant-1").queued).toHaveLength(0);
  });

  it("cancels in-flight run and marks as compensated", async () => {
    const controller = getMutableRunControllerForTesting();
    let observedRunId: string | undefined;
    let releaseHandler: (() => void) | undefined;
    const handlerGate = new Promise<void>((resolve) => {
      releaseHandler = resolve;
    });

    registerWorkflow({
      handle: "autowork.test.retry",
      display_name: "test",
      description: "test",
      requires_lease: false,
      handler: async (_request, context) => {
        observedRunId = context.workflow_run_id;
        await handlerGate;
        return {
          outputs: { ok: true },
          audit_event_ids: ["s1", "s2"],
        };
      },
    });

    const pending = invokeWorkflow(baseRequest("retry-6"), {
      writeAuditEvent: createMockAuditWriter().write,
    });

    await vi.waitFor(() => expect(observedRunId).toBeDefined());
    controller.cancelRun(observedRunId!);
    releaseHandler?.();
    const result = await pending;

    expect(result.status).toBe("compensated");
    expect(result.failure?.code).toBe("WORKFLOW_COMPENSATED");
  });
});
