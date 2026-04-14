import { createSupabaseServiceClient } from "@linktrend/db";
import { log } from "@linktrend/observability";
import type { Env } from "@linktrend/shared-config";

function retentionDays(env: Env): number {
  const raw = env.PRISM_RETENTION_DAYS;
  if (raw == null || raw === "") return 14;
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 1) return 14;
  return Math.min(Math.floor(n), 3650);
}

/**
 * Deletes old `sidecar_heartbeat` rows from `prism.cleanup_events` (service role).
 */
export async function pruneOldHeartbeats(env: Env): Promise<void> {
  const days = retentionDays(env);
  const cutoff = new Date(Date.now() - days * 86_400_000).toISOString();
  const client = createSupabaseServiceClient(env);

  const { error, count } = await client
    .schema("prism")
    .from("cleanup_events")
    .delete({ count: "exact" })
    .eq("action", "sidecar_heartbeat")
    .lt("created_at", cutoff);

  if (error) {
    log("warn", "heartbeat retention prune failed", {
      service: "prism-defender",
      message: error.message,
    });
    return;
  }
  if (count && count > 0) {
    log("info", "pruned old sidecar heartbeats", {
      service: "prism-defender",
      deleted: count,
      retentionDays: days,
    });
  }
}
