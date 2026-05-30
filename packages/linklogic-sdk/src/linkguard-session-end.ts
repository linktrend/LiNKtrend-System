import type { Env } from "@linktrend/shared-config";
import { createSupabaseServiceClient } from "@linktrend/db";
import { log } from "@linktrend/observability";

export type LinkguardSessionEndDetail = Record<string, unknown>;

/**
 * Best-effort LiNKguard telemetry when a worker session ends.
 */
export async function recordLinkguardSessionEnd(
  env: Env,
  params: { workerSessionId?: string | null; detail?: LinkguardSessionEndDetail },
): Promise<void> {
  try {
    const client = createSupabaseServiceClient(env);
    const { error } = await client.schema("linkguard").from("cleanup_events").insert({
      worker_session_id: params.workerSessionId ?? null,
      action: "worker_session_end",
      path_pattern: null,
      detail: params.detail ?? {},
    });
    if (error) {
      log("warn", "recordLinkguardSessionEnd insert failed", { service: "linklogic-sdk", message: error.message });
    }
  } catch (e) {
    log("warn", "recordLinkguardSessionEnd failed", { service: "linklogic-sdk", error: String(e) });
  }
}
