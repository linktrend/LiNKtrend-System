import { isUiMocksEnabled } from "@/lib/ui-mocks/flags";
import { DEMO_WORK_ALERTS } from "@/lib/ui-mocks/work-alert-fixtures";
import { traceToWorkAlert, type WorkAlert } from "@/lib/work-alerts";
import { createSupabaseServerClient } from "@/lib/supabase/server";

import { ShellPageHeaderClient } from "@/components/shell-page-header-client";
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
      <ShellPageHeaderClient
        title="Alerts"
        subtitle="Problems and warnings that may need you to review or fix something."
      />
      <div className="mt-8">
        {error ? (
          <p className="mb-4 text-sm text-amber-800 dark:text-amber-200">Alerts could not be loaded from system logs.</p>
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
