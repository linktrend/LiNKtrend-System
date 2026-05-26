import { LeaseSummaryStatsGrid } from "@/components/summary-metric-card";
import {
  DataTable,
  DataTableBody,
  DataTableEmptyRow,
  DataTableHead,
  DataTableRow,
  DataTableShell,
  DT,
} from "@/components/data-table";
import { DomainStatusPill, StatusPill } from "@/components/ui/status-pill";
import { loadLeaseStatus } from "@/lib/cockpit";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isUiMocksEnabled } from "@/lib/ui-mocks/flags";
import { DEMO_LEASE_ROWS } from "@/lib/ui-mocks/leases-demo";

function leaseStatusForPill(raw: string): string {
  if (raw === "granted" || raw === "executed") return "active";
  if (raw === "denied") return "revoked";
  if (raw === "requires_approval") return "pending";
  return raw;
}

export async function LinkskillsLeasesPanel(props?: { missionId?: string | null }) {
  const missionId = props?.missionId?.trim() || null;
  const supabase = await createSupabaseServerClient();
  const tenantId = "default";
  const mocksOn = isUiMocksEnabled();

  let leases = await loadLeaseStatus(supabase, tenantId, { time_range: "24h" });

  if (mocksOn && leases.length === 0) {
    leases = missionId ? DEMO_LEASE_ROWS.filter((l) => l.mission_id === missionId) : DEMO_LEASE_ROWS;
  } else if (missionId) {
    const { fetchMetricsSnapshot } = await import("@/app/(shell)/metrics/actions");
    const metrics = await fetchMetricsSnapshot({ days: 30, missionId, agentId: null });
    const runIds = new Set(
      (metrics.ok ? metrics.data.runs : [])
        .map((r) => r.id)
        .filter((id): id is string => Boolean(id)),
    );
    leases = leases.filter((l) => l.run_id != null && runIds.has(l.run_id));
  }

  const scoped = missionId != null;
  const sectionTitle = scoped ? "Leases for this project" : "Leases from the last 24 hours";
  const sectionBlurb = scoped
    ? "Capability grants and denials recorded for runs tied to this project in the rolling window."
    : "Rows ordered by decision time — granted, executed, denied, and pending approvals recorded for this tenant in the rolling window.";

  const grantedCount = leases.filter((l) => l.status === "granted" || l.status === "executed").length;
  const deniedCount = leases.filter((l) => l.status === "denied").length;
  const trippedCount = leases.filter((l) => l.kill_switch_state === "tripped").length;

  return (
    <div className="space-y-6">
      {!scoped ? (
        <LeaseSummaryStatsGrid
          total={leases.length}
          granted={grantedCount}
          denied={deniedCount}
          tripped={trippedCount}
        />
      ) : null}

      <section className="space-y-2">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <h2 className="text-lg font-medium text-zinc-800 dark:text-zinc-100">{sectionTitle}</h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">{leases.length} row(s)</p>
        </div>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">{sectionBlurb}</p>
        <DataTableShell scrollableBody>
          <DataTable>
            <colgroup>
              <col className="w-[22%]" />
              <col className="w-[12%]" />
              <col className="w-[18%]" />
              <col className="w-[14%]" />
              <col className="w-[17%]" />
              <col className="w-[17%]" />
            </colgroup>
            <DataTableHead>
              <tr>
                <th className={DT.thTextInset}>Capability</th>
                <th className={DT.thControl}>
                  <div className={DT.controlInner}>Status</div>
                </th>
                <th className={DT.thTextInset}>Run</th>
                <th className={DT.thControl}>
                  <div className={DT.controlInner}>Kill switch</div>
                </th>
                <th className={DT.thTextInset}>Requested</th>
                <th className={DT.thTextInset}>Expires</th>
              </tr>
            </DataTableHead>
            <DataTableBody>
              {leases.length === 0 ? (
                <DataTableEmptyRow colSpan={6}>
                  {scoped ? "No lease activity for this project in the last 24 hours." : "No lease activity in the last 24 hours."}
                </DataTableEmptyRow>
              ) : (
                leases.map((l) => (
                  <DataTableRow key={l.lease_id}>
                    <td className={`${DT.tdClipInset} font-mono text-xs text-zinc-900 dark:text-zinc-100`}>
                      <span className={DT.tdTextSpan}>{l.capability}</span>
                    </td>
                    <td className={DT.tdControl}>
                      <div className={DT.controlInner}>
                        <DomainStatusPill domain="lease" status={leaseStatusForPill(l.status)} equalWidth />
                      </div>
                    </td>
                    <td className={`${DT.tdClipInset} font-mono text-xs`}>
                      <span className={DT.tdTextSpan}>{l.run_id?.slice(0, 12) ?? "—"}</span>
                    </td>
                    <td className={DT.tdControl}>
                      <div className={DT.controlInner}>
                        <StatusPill
                          label={l.kill_switch_state === "tripped" ? "Tripped" : "Open"}
                          tone={l.kill_switch_state === "tripped" ? "danger" : "success"}
                          equalWidth
                        />
                      </div>
                    </td>
                    <td className={DT.tdClipInset}>
                      <span className={`${DT.tdTextSpan} text-xs text-zinc-600 dark:text-zinc-400`}>
                        {new Date(l.requested_at).toLocaleString()}
                      </span>
                    </td>
                    <td className={DT.tdClipInset}>
                      <span className={`${DT.tdTextSpan} text-xs text-zinc-600 dark:text-zinc-400`}>
                        {l.expires_at ? new Date(l.expires_at).toLocaleString() : "—"}
                      </span>
                    </td>
                  </DataTableRow>
                ))
              )}
            </DataTableBody>
          </DataTable>
        </DataTableShell>
      </section>
    </div>
  );
}
