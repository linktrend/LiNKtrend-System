import { beforeEach, describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Env } from "@linktrend/shared-config";
import type { LeaseExecuteRequest } from "@linktrend/linklogic-sdk";
import { executeLease } from "./lease-lifecycle.js";
import { getCapabilityHandler } from "./capability-handlers.js";

vi.mock("./audit-events.js", () => ({
  emitLeaseRequested: vi.fn(),
  emitLeaseGranted: vi.fn(),
  emitLeaseDenied: vi.fn(),
  emitLeaseExecuted: vi.fn(),
  emitCapabilityOutput: vi.fn(),
}));

const mockEnv = {} as Env;

const baseLease = {
  lease_id: "lease-1",
  tenant_id: "tenant-1",
  run_id: "run-1",
  stage_id: "stage-1",
  capability_id: "cap.asset.generation",
  arguments: { mode: "mock", operation: "image.generate" },
  idempotency_key: "idem-1",
  actor_kind: "plugin",
  actor_id: "linksites",
  status: "granted",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
} as const;

function createMockClient(leaseOverride: Record<string, unknown>, recordExecutionResult?: unknown): SupabaseClient {
  const leaseRow = { ...baseLease, ...leaseOverride };

  return {
    schema: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn().mockResolvedValue({ data: leaseRow, error: null }),
    rpc: vi.fn().mockImplementation((fn: string) => {
      if (fn === "record_execution") {
        return { data: recordExecutionResult ?? [{ is_duplicate: false }], error: null };
      }
      return { data: null, error: null };
    }),
  } as unknown as SupabaseClient;
}

describe("LinkSites v2 lease execute behavior", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns existing result for idempotent replay", async () => {
    const client = createMockClient({
      status: "executed",
      execution_result: { output_ref: "result-1" },
      ledger_entry_id: "ledger-1",
      audit_event_id: "audit-1",
    });
    const request: LeaseExecuteRequest = { lease_id: "lease-1", idempotency_key: "idem-1" };

    const handler = getCapabilityHandler("cap.asset.generation");
    expect(handler).not.toBeNull();

    const result = await executeLease(
      client,
      mockEnv,
      request,
      (args, context) => handler!(client, args, context as never),
    );

    expect(result.result).toEqual({ output_ref: "result-1" });
    expect(result.ledger_entry_id).toBe("ledger-1");
    expect(result.audit_event_id).toBe("audit-1");
  });

  it("maps live-mode write refusal to LEASE_DENIED", async () => {
    const client = createMockClient({
      capability_id: "cap.asset.generation",
      arguments: { mode: "live", operation: "image.generate" },
    });
    const request: LeaseExecuteRequest = { lease_id: "lease-1", idempotency_key: "idem-1" };
    const handler = getCapabilityHandler("cap.asset.generation");
    expect(handler).not.toBeNull();

    const result = await executeLease(
      client,
      mockEnv,
      request,
      (args, context) => handler!(client, args, context as never),
    );

    expect(result.failure?.code).toBe("LEASE_DENIED");
  });

  it("maps invalid handler arguments to LEASE_REQUEST_INVALID", async () => {
    const client = createMockClient({
      capability_id: "cap.supabase.mirror_content",
      arguments: { mode: "mock" },
    });
    const request: LeaseExecuteRequest = { lease_id: "lease-1", idempotency_key: "idem-1" };
    const handler = getCapabilityHandler("cap.supabase.mirror_content");
    expect(handler).not.toBeNull();

    const result = await executeLease(
      client,
      mockEnv,
      request,
      (args, context) => handler!(client, args, context as never),
    );

    expect(result.failure?.code).toBe("LEASE_REQUEST_INVALID");
  });
});
