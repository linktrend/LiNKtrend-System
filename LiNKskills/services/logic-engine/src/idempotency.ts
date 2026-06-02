import { createHash } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";

export type IdempotencyCheckResult =
  | { state: "new" }
  | { state: "replay"; result: Record<string, unknown>; ledger_entry_id?: string }
  | { state: "conflict"; reason: string };

export function buildLeaseIdempotencyKey(run_id: string, stage_id: string, capability: string): string {
  return `${run_id}:${stage_id}:${capability}`;
}

export function isValidLeaseIdempotencyKey(key: string, run_id: string, stage_id: string, capability: string): boolean {
  return key === buildLeaseIdempotencyKey(run_id, stage_id, capability);
}

function sortValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortValue);
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const key of Object.keys(value as Record<string, unknown>).sort()) {
      out[key] = sortValue((value as Record<string, unknown>)[key]);
    }
    return out;
  }
  return value;
}

export function hashPayload(payload: Record<string, unknown>): string {
  const normalized = JSON.stringify(sortValue(payload));
  return createHash("sha256").update(normalized).digest("hex");
}

export async function checkIdempotency(
  client: SupabaseClient,
  tenant_id: string,
  idempotency_key: string,
  capability: string,
  payload: Record<string, unknown>,
): Promise<IdempotencyCheckResult> {
  const payload_hash = hashPayload(payload);

  const { data, error } = await client
    .schema("linkskills")
    .from("idempotency_cache")
    .select("payload_hash, result, ledger_entry_id, expires_at")
    .eq("tenant_id", tenant_id)
    .eq("idempotency_key", idempotency_key)
    .eq("capability", capability)
    .maybeSingle();

  if (error) {
    return { state: "conflict", reason: `Idempotency lookup failed: ${error.message}` };
  }

  if (!data) return { state: "new" };
  if (!("payload_hash" in data)) return { state: "new" };

  if (new Date(data.expires_at).getTime() <= Date.now()) {
    return { state: "new" };
  }

  if (data.payload_hash !== payload_hash) {
    return { state: "conflict", reason: "Same idempotency key used with a different payload" };
  }

  const replay: IdempotencyCheckResult = {
    state: "replay",
    result: (data.result ?? {}) as Record<string, unknown>,
  };
  if (data.ledger_entry_id) {
    replay.ledger_entry_id = data.ledger_entry_id as string;
  }
  return replay;
}

export async function storeIdempotencyResult(
  client: SupabaseClient,
  tenant_id: string,
  idempotency_key: string,
  capability: string,
  payload: Record<string, unknown>,
  result: Record<string, unknown>,
  ledger_entry_id?: string,
): Promise<void> {
  const payload_hash = hashPayload(payload);
  const expires_at = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

  const cache_key = `${tenant_id}:${idempotency_key}:${capability}`;

  const { error } = await client
    .schema("linkskills")
    .from("idempotency_cache")
    .upsert(
      {
        cache_key,
        tenant_id,
        idempotency_key,
        capability,
        payload_hash,
        result,
        ledger_entry_id: ledger_entry_id ?? null,
        expires_at,
      },
      { onConflict: "cache_key" },
    );

  if (error) {
    throw new Error(`Failed to persist idempotency cache: ${error.message}`);
  }
}
