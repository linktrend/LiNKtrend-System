import { describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  buildLeaseIdempotencyKey,
  checkIdempotency,
  hashPayload,
  isValidLeaseIdempotencyKey,
} from "./idempotency.js";

function mockClientWithLookup(data: unknown, error: { message: string } | null = null): SupabaseClient {
  return {
    schema: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn().mockResolvedValue({ data, error }),
  } as unknown as SupabaseClient;
}

describe("idempotency service", () => {
  it("validates canonical lease idempotency key format", () => {
    const key = buildLeaseIdempotencyKey("run-1", "stage-1", "cap.research.public_web");
    expect(isValidLeaseIdempotencyKey(key, "run-1", "stage-1", "cap.research.public_web")).toBe(true);
    expect(isValidLeaseIdempotencyKey("wrong", "run-1", "stage-1", "cap.research.public_web")).toBe(false);
  });

  it("hashes payload deterministically independent of key order", () => {
    const a = hashPayload({ a: 1, b: { x: true, y: [2, 3] } });
    const b = hashPayload({ b: { y: [2, 3], x: true }, a: 1 });
    expect(a).toBe(b);
  });

  it("returns replay for same key and payload", async () => {
    const payload = { operation: "connectivity.probe", mode: "shadow" };
    const client = mockClientWithLookup({
      payload_hash: hashPayload(payload),
      result: { ok: true },
      ledger_entry_id: "ledger-1",
      expires_at: new Date(Date.now() + 60_000).toISOString(),
    });

    const res = await checkIdempotency(client, "tenant-1", "idem-1", "cap.research.public_web", payload);
    expect(res.state).toBe("replay");
  });

  it("returns conflict for same key with different payload", async () => {
    const payload = { operation: "connectivity.probe", mode: "shadow" };
    const client = mockClientWithLookup({
      payload_hash: hashPayload({ operation: "different" }),
      result: { ok: true },
      expires_at: new Date(Date.now() + 60_000).toISOString(),
    });

    const res = await checkIdempotency(client, "tenant-1", "idem-1", "cap.research.public_web", payload);
    expect(res.state).toBe("conflict");
  });
});
