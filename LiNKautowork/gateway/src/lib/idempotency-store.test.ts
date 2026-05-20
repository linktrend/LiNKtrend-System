import { join } from "node:path";
import { tmpdir } from "node:os";
import { describe, expect, it } from "vitest";
import type { WorkflowInvokeResult } from "@linktrend/linklogic-sdk";
import {
  clearFileIdempotencyStore,
  FileIdempotencyStore,
  hashIdempotencyKey,
} from "./idempotency-store.js";

function sampleResult(workflowRunId: string): WorkflowInvokeResult {
  return {
    workflow_run_id: workflowRunId,
    status: "succeeded",
    outputs: { ok: true },
    audit_event_ids: ["evt-1", "evt-2"],
  };
}

describe("idempotency store", () => {
  it("returns cached result after simulated restart", async () => {
    const filePath = join(tmpdir(), `idempotency-store-${Date.now()}.json`);
    const keyHash = hashIdempotencyKey("run-1:stage-1:autowork.websitefactory.render");
    const expected = sampleResult("run-abc");

    const processAStore = new FileIdempotencyStore(filePath);
    await processAStore.cacheResult(
      keyHash,
      "tenant-1",
      "autowork.websitefactory.render",
      expected.workflow_run_id,
      expected,
    );

    const processBStore = new FileIdempotencyStore(filePath);
    const cached = await processBStore.getCachedResult(keyHash);

    expect(cached).toEqual(expected);
    clearFileIdempotencyStore(filePath);
  });

  it("cleans up expired entries", async () => {
    const filePath = join(tmpdir(), `idempotency-store-${Date.now()}-cleanup.json`);
    const store = new FileIdempotencyStore(filePath);
    const keyHash = hashIdempotencyKey("cleanup-key");
    await store.cacheResult(
      keyHash,
      "tenant-1",
      "autowork.websitefactory.render",
      "run-cleanup",
      sampleResult("run-cleanup"),
      -1,
    );

    const removed = await store.cleanupExpired(new Date());
    const cached = await store.getCachedResult(keyHash);

    expect(removed).toBe(1);
    expect(cached).toBeUndefined();
    clearFileIdempotencyStore(filePath);
  });
});
