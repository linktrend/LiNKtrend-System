/**
 * Execute a granted lease through the canonical capability handler registry.
 */

import { createSupabaseServiceClient } from "@linktrend/db";
import type { Env } from "@linktrend/shared-config";
import type { LeaseExecuteRequest, LeaseExecuteResult } from "@linktrend/linklogic-sdk";
import { executeLease } from "./lease-lifecycle.js";
import { CapabilityExecutionError, getCapabilityHandler } from "./capability-handlers.js";

export function resolveCapabilityFromIdempotencyKey(idempotency_key: string): string {
  const parts = idempotency_key.split(":");
  if (parts.length >= 3 && parts[parts.length - 1] === "exec") {
    return parts.slice(2, -1).join(":");
  }
  if (parts.length >= 3) {
    return parts.slice(2).join(":");
  }
  return parts[parts.length - 1] ?? "";
}

export async function executeGrantedLease(
  env: Env,
  request: LeaseExecuteRequest,
): Promise<LeaseExecuteResult> {
  const client = createSupabaseServiceClient(env);
  const capabilityId = resolveCapabilityFromIdempotencyKey(request.idempotency_key);
  const handler = getCapabilityHandler(capabilityId);

  if (!handler) {
    return {
      lease_id: request.lease_id,
      capability: capabilityId,
      result: {},
      ledger_entry_id: request.lease_id,
      audit_event_id: "",
      failure: {
        code: "MANIFEST_CAPABILITY_UNKNOWN",
        plane: "linkskills",
        message: `No handler registered for capability "${capabilityId}"`,
        retryable: false,
        occurred_at: new Date().toISOString(),
      },
    };
  }

  return executeLease(client, env, request, (args, context) =>
    handler(client, args, context as never),
  );
}

export function mapCapabilityExecutionError(error: unknown): CapabilityExecutionError | null {
  return error instanceof CapabilityExecutionError ? error : null;
}
