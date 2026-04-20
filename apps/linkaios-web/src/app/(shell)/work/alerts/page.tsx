import { isUiMocksEnabled } from "@/lib/ui-mocks/flags";
import { DEMO_WORK_ALERTS } from "@/lib/ui-mocks/work-alert-fixtures";
import { traceToWorkAlert, type WorkAlert } from "@/lib/work-alerts";
import { createSupabaseServerClient } from "@/lib/supabase/server";

import { AlertsInbox } from "../alerts-inbox";

export const dynamic = "force-dynamic";

export default async function WorkAlertsPage() {
  const supabase = await createSupabaseServerClient();
  const uiMocksEnabled = isUiMocksEnabled();
  const { data: traces, error } = await supabase
    .schema("linkaios")
    .from("traces")
    .select("id, event_type, mission_id, created_at, payload")
    .order("created_at", { ascending: false })
    .limit(50);

  const fromDb: WorkAlert[] =
    error || !traces?.length
      ? []
      : traces.map((t) =>
          traceToWorkAlert({
            id: String(t.id),
            event_type: String(t.event_type),
            mission_id: t.mission_id as string | null,
            created_at: String(t.created_at),
            payload: t.payload,
          }),
        );

  const merged = [...(uiMocksEnabled ? DEMO_WORK_ALERTS : []), ...fromDb].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  const traceIds = fromDb.filter((a) => a.id.startsWith("trace-")).map((a) => a.id.replace(/^trace-/, ""));
  let traceAckPersistenceEnabled = false;
  let initialResolvedIds: string[] = [];
  if (traceIds.length > 0) {
    const { data: ackRows, error: ackErr } = await supabase
      .schema("linkaios")
      .from("trace_alert_acknowledgments")
      .select("trace_id")
      .in("trace_id", traceIds);
    if (!ackErr && ackRows) {
      traceAckPersistenceEnabled = true;
      initialResolvedIds = ackRows.map((r) => `trace-${String((r as { trace_id: string }).trace_id)}`);
    }
  }

  return (
    <main>
      <header className="border-b border-zinc-200 pb-8 dark:border-zinc-800">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">Alerts</h1>
      </header>
      <div className="mt-8">
        {error ? (
          <p className="mb-4 text-sm text-amber-800 dark:text-amber-200">Alerts could not be loaded from system logs.</p>
        ) : null}
        {!error && fromDb.some((a) => a.id.startsWith("trace-")) && !traceAckPersistenceEnabled ? (
          <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50/80 px-3 py-2 text-xs text-amber-950 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-100" role="status">
            Alert resolve state is not persisted yet (missing <code className="rounded bg-white/60 px-1 dark:bg-black/20">014_trace_alert_acknowledgments</code> migration or
            insufficient access). Resolves are kept in this browser session only.
          </p>
        ) : null}
        <AlertsInbox
          items={merged}
          traceAckPersistenceEnabled={traceAckPersistenceEnabled}
          initialResolvedIds={initialResolvedIds}
        />
      </div>
    </main>
  );
}
