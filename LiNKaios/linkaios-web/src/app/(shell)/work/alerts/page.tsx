import { AlertCircle } from "lucide-react";
import { Suspense } from "react";

import { fetchRecentTraces } from "@/lib/traces-db";
import { IntegrationWarningBanner } from "@/components/integration-warning-banner";
import { ShellPageHeaderClient } from "@/components/shell-page-header-client";
import { isUiMocksEnabled } from "@/lib/ui-mocks/flags";
import { DEMO_WORK_ALERTS } from "@/lib/ui-mocks/work-alert-fixtures";
import { traceToWorkAlert, type WorkAlert } from "@/lib/work-alerts";
import { createSupabaseServerClient } from "@/lib/supabase/server";

import { WorkEmptyState } from "../work-empty-state";
import { AlertsInbox } from "../alerts-inbox";

export const dynamic = "force-dynamic";

export default async function WorkAlertsPage() {
  const supabase = await createSupabaseServerClient();
  const uiMocksEnabled = isUiMocksEnabled();
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

  const fixtureAlerts = uiMocksEnabled ? DEMO_WORK_ALERTS : [];
  const merged = [...fixtureAlerts, ...fromDb].sort(
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
  const hasFixtureRows = fixtureAlerts.length > 0;
  const blockingLoadFailure = !uiMocksEnabled && traceLoadFailed && fromDb.length === 0;

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
        {traceLoadFailed && (uiMocksEnabled || hasFixtureRows) ? (
          <IntegrationWarningBanner
            title="Live system logs are unavailable — fixture alerts shown below"
            reason={error ?? "The traces query did not succeed."}
            retryHint="Check Supabase connectivity and schema exposure (linkaios.traces), then use Refresh in the toolbar. Your inbox is not empty — review fixture rows while integration is restored."
          />
        ) : null}
        <Suspense fallback={<p className="text-sm text-zinc-500">Loading alerts…</p>}>
          <AlertsInbox
            items={merged}
            traceAckPersistenceEnabled={traceAckPersistenceEnabled}
            initialResolvedIds={initialResolvedIds}
          />
        </Suspense>
      </div>
    </main>
  );
}
