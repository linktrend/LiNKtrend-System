import type { Env } from "@linktrend/shared-config";
import { createSupabaseServiceClient } from "@linktrend/db";
import { log } from "@linktrend/observability";

export type PrismSessionEndDetail = Record<string, unknown>;

/**
 * Best-effort PRISM telemetry when a worker session ends.
 */
export async function recordPrismSessionEnd(
  env: Env,
  params: { workerSessionId?: string | null; detail?: PrismSessionEndDetail },
): Promise<void> {
  try {
    const client = createSupabaseServiceClient(env);
    const { error } = await client.schema("prism").from("cleanup_events").insert({
      worker_session_id: params.workerSessionId ?? null,
      action: "worker_session_end",
      path_pattern: null,
      detail: params.detail ?? {},
    });
    if (error) {
      log("warn", "recordPrismSessionEnd insert failed", { service: "linklogic-sdk", message: error.message });
    }
  } catch (e) {
    log("warn", "recordPrismSessionEnd failed", { service: "linklogic-sdk", error: String(e) });
  }
}
