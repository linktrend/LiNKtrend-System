import { createSupabaseServiceClient } from "@linktrend/db";
import { log } from "@linktrend/observability";
import type { Env } from "@linktrend/shared-config";

/**
 * Acknowledges closed worker sessions in `prism.swept_sessions` and logs `cleanup_events`.
 * Requires migration `008` (table + RLS). Safe to run repeatedly; skips already swept ids.
 */
export async function sweepWorkerResidue(env: Env, params: { batch: number }): Promise<number> {
  const client = createSupabaseServiceClient(env);

  const { data: sweptRows, error: sweptErr } = await client
    .schema("prism")
    .from("swept_sessions")
    .select("worker_session_id")
    .limit(10_000);

  if (sweptErr) {
    log("warn", "residue sweep skipped (swept_sessions unavailable?)", {
      service: "prism-defender",
      message: sweptErr.message,
    });
    return 0;
  }

  const swept = new Set((sweptRows ?? []).map((r) => String(r.worker_session_id)));

  const { data: sessions, error: sessErr } = await client
    .schema("bot_runtime")
    .from("worker_sessions")
    .select("id, status, ended_at")
    .in("status", ["stopped", "failed"])
    .not("ended_at", "is", null)
    .order("ended_at", { ascending: true })
    .limit(params.batch * 4);

  if (sessErr) {
    log("warn", "residue sweep session query failed", {
      service: "prism-defender",
      message: sessErr.message,
    });
    return 0;
  }

  const candidates = (sessions ?? []).filter((s) => s.id && !swept.has(String(s.id))).slice(0, params.batch);

  let n = 0;
  for (const s of candidates) {
    const { error: evErr } = await client.schema("prism").from("cleanup_events").insert({
      worker_session_id: s.id,
      action: "residue_sweep_ack",
      detail: {
        sessionStatus: s.status,
        ended_at: s.ended_at,
      },
    });
    if (evErr) {
      log("warn", "cleanup_events insert failed", { service: "prism-defender", message: evErr.message });
      continue;
    }

    const { error: swErr } = await client
      .schema("prism")
      .from("swept_sessions")
      .upsert(
        { worker_session_id: s.id, detail: { source: "prism-defender" } },
        { onConflict: "worker_session_id" },
      );
    if (swErr) {
      log("warn", "swept_sessions insert failed", { service: "prism-defender", message: swErr.message });
      continue;
    }
    n += 1;
  }

  if (n > 0) {
    log("info", "residue sweep completed", { service: "prism-defender", acknowledged: n });
  }
  return n;
}
