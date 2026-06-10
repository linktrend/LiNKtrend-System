import { AlertCircle } from "lucide-react";
import { fetchRecentTraces } from "@/lib/traces-db";
import { ShellPageHeaderClient } from "@/components/shell-page-header-client";
import { resolveLicenseeRegistry } from "@/lib/licensee-registry";
import { loadSupportTicketsFromDb } from "@/lib/support-tickets-db.server";
import { supportTicketToWorkAlert } from "@/lib/support-tickets";
import { traceToWorkAlert, type WorkAlert } from "@/lib/work-alerts";
import { createSupabaseServerClient } from "@/lib/supabase/server";

import { WorkEmptyState } from "../work-empty-state";
import { AlertsInboxBoundary } from "../alerts-inbox-boundary";

export const dynamic = "force-dynamic";

export default async function WorkAlertsPage() {
  const supabase = await createSupabaseServerClient();
  const { rows: traces, error } = await fetchRecentTraces(supabase, { limit: 50 });

  const fromDb: WorkAlert[] =
    error || !traces.length
      ? []
      : traces.map((t) =>
          traceToWorkAlert({
            id: String(t.id),
            event_type: String(t.event_type),
            project_id: t.project_id,
            created_at: String(t.created_at),
            payload: t.payload,
          }),
        );

  let supportLoaded: Awaited<ReturnType<typeof loadSupportTicketsFromDb>> = {
    tickets: [],
    mode: "shadow",
    tableReady: false,
    loadError: null,
    chatwootSyncReady: false,
    chatwootSyncError: null,
  };
  let supportAlerts: WorkAlert[] = [];
  try {
    supportLoaded = await loadSupportTicketsFromDb(supabase, { openOnly: true });
    supportAlerts = supportLoaded.tickets.map((t) =>
      supportTicketToWorkAlert(t, resolveLicenseeRegistry(t.licenseeId)?.name ?? t.licenseeId),
    );
  } catch (error) {
    supportLoaded = {
      ...supportLoaded,
      loadError: error instanceof Error ? error.message : "Support tickets could not be loaded.",
    };
  }

  const merged = [...fromDb, ...supportAlerts].sort(
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

  const traceLoadFailed = Boolean(error);
  const blockingLoadFailure = traceLoadFailed && fromDb.length === 0;

  if (blockingLoadFailure) {
    const reason = error ?? "System logs could not be queried.";
    const schemaHint = reason.includes("schema") || reason.toLowerCase().includes("pgrst");
    return (
      <main>
        <ShellPageHeaderClient
          title="Alerts"
          subtitle="Problems and warnings that may need you to review or fix something."
        />
        <div className="mt-8">
          <WorkEmptyState
            icon={AlertCircle}
            title="Alerts could not be loaded"
            description={
              schemaHint
                ? "The database may not be fully set up yet. Confirm Supabase schemas are exposed and migrations have run, then refresh."
                : reason
            }
            actions={[
              { kind: "link", label: "Open system logs", href: "/settings/traces", variant: "secondary" },
              { kind: "link", label: "Platform settings", href: "/settings/platform", variant: "secondary" },
            ]}
          />
        </div>
      </main>
    );
  }

  return (
    <main>
      <ShellPageHeaderClient
        title="Alerts"
        subtitle="Problems and warnings that may need you to review or fix something."
      />
      <div className="mt-8 space-y-4">
        {traceLoadFailed ? (
          <p className="rounded-lg border border-amber-200 bg-amber-50/90 px-3 py-2 text-sm text-amber-950 dark:border-amber-800 dark:bg-amber-950/35 dark:text-amber-100" role="status">
            Live system logs are unavailable: {error ?? "The traces query did not succeed."}
          </p>
        ) : null}
        <AlertsInboxBoundary
          items={merged}
          traceAckPersistenceEnabled={traceAckPersistenceEnabled}
          initialResolvedIds={initialResolvedIds}
          supportTicketsPersistenceEnabled={supportLoaded.tableReady}
        />
      </div>
    </main>
  );
}
