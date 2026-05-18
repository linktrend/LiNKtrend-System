"use server";

import { revalidatePath } from "next/cache";

import { assertCommandCentreWriter } from "@/lib/command-centre-writer-gate";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** Marks a worker session as stopped (same end state as SDK `closeWorkerSession`). */
export async function stopWorkerSessionAction(sessionId: string): Promise<{ ok: boolean; error?: string }> {
  if (!UUID_RE.test(sessionId)) {
    return { ok: false, error: "Invalid session id." };
  }

  const gate = await assertCommandCentreWriter();
  if (!gate.ok) {
    return { ok: false, error: gate.error };
  }

  const now = new Date().toISOString();
  const { data: rows, error: selErr } = await gate.supabase
    .schema("bot_runtime")
    .from("worker_sessions")
    .select("id, status, agent_id")
    .eq("id", sessionId)
    .limit(1);

  if (selErr) {
    return { ok: false, error: "Could not read session." };
  }
  const row = rows?.[0] as { id: string; status: string; agent_id: string } | undefined;
  if (!row) {
    return { ok: false, error: "Session not found." };
  }

  const st = String(row.status).toLowerCase();
  if (st === "stopped" || st === "failed") {
    return { ok: true };
  }

  const { error: updErr } = await gate.supabase
    .schema("bot_runtime")
    .from("worker_sessions")
    .update({
      status: "stopped",
      ended_at: now,
    })
    .eq("id", sessionId);

  if (updErr) {
    return { ok: false, error: "Could not update session. Check permissions and RLS." };
  }

  revalidatePath("/work/sessions");
  revalidatePath("/settings/advanced");
  revalidatePath(`/workers/${row.agent_id}/sessions/${sessionId}`);
  return { ok: true };
}
