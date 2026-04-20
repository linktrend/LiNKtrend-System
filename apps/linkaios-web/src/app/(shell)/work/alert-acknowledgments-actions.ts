"use server";

import { revalidatePath } from "next/cache";

import { assertCommandCentreWriter } from "@/lib/command-centre-writer-gate";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function acknowledgeTraceAlertAction(alertId: string): Promise<{ ok: boolean; error?: string }> {
  if (!alertId.startsWith("trace-")) {
    return { ok: true };
  }
  const traceId = alertId.slice("trace-".length);
  if (!UUID_RE.test(traceId)) {
    return { ok: false, error: "Invalid alert reference." };
  }

  const gate = await assertCommandCentreWriter();
  if (!gate.ok) {
    return { ok: false, error: gate.error };
  }

  const {
    data: { user },
  } = await gate.supabase.auth.getUser();

  const { error } = await gate.supabase
    .schema("linkaios")
    .from("trace_alert_acknowledgments")
    .upsert(
      {
        trace_id: traceId,
        resolved_at: new Date().toISOString(),
        resolved_by: user?.id ?? null,
      },
      { onConflict: "trace_id" },
    );

  if (error) {
    return { ok: false, error: "Could not save resolve state. Confirm migration 014 is applied." };
  }

  revalidatePath("/work/alerts");
  return { ok: true };
}
