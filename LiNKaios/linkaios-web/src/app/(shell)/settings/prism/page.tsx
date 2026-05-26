import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireLicensorOperator } from "@/lib/licensor-access";
import { PrismSummaryStatsGrid } from "@/components/summary-metric-card";
import {
  DataTable,
  DataTableBody,
  DataTableEmptyRow,
  DataTableHead,
  DataTableRow,
  DataTableShell,
  DT,
} from "@/components/data-table";

export const dynamic = "force-dynamic";

function formatAge(iso: string | null): string {
  if (!iso) return "—";
  const t = new Date(iso).getTime();
  if (!Number.isFinite(t)) return "—";
  const sec = Math.max(0, Math.floor((Date.now() - t) / 1000));
  if (sec < 60) return `${sec}s ago`;
  if (sec < 3600) return `${Math.floor(sec / 60)}m ago`;
  if (sec < 86_400) return `${Math.floor(sec / 3600)}h ago`;
  return `${Math.floor(sec / 86_400)}d ago`;
}

export default async function SettingsPrismPage() {
  await requireLicensorOperator();

  const supabase = await createSupabaseServerClient();

  const since24h = new Date(Date.now() - 86_400_000).toISOString();

  const [hbRes, failRes, recentRes] = await Promise.all([
    supabase
      .schema("prism")
      .from("cleanup_events")
      .select("created_at")
      .eq("action", "sidecar_heartbeat")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .schema("prism")
      .from("cleanup_events")
      .select("id", { count: "exact", head: true })
      .eq("action", "fs_cleanup_failed")
      .gte("created_at", since24h),
    supabase
      .schema("prism")
      .from("cleanup_events")
      .select("id, created_at, action, worker_session_id, detail")
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  const lastHeartbeatAt =
    hbRes.data && typeof hbRes.data.created_at === "string" ? hbRes.data.created_at : null;
  const fsFailures24h = typeof failRes.count === "number" ? failRes.count : 0;
  const recent = recentRes.data ?? [];

  return (
    <div className="mt-6 space-y-8">
      <PrismSummaryStatsGrid
        lastHeartbeatAge={formatAge(lastHeartbeatAt)}
        lastHeartbeatAt={lastHeartbeatAt}
        fsFailures24h={fsFailures24h}
        heartbeatError={!!hbRes.error}
        failuresError={!!failRes.error}
      />

      <div>
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Recent cleanup events</h3>
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">Latest 20 rows</p>
        <DataTableShell scrollableBody className="mt-3">
          <DataTable size="sm">
            <colgroup>
              <col className="w-[22%]" />
              <col className="w-[18%]" />
              <col className="w-[20%]" />
              <col className="w-[40%]" />
            </colgroup>
            <DataTableHead bordered>
              <tr>
                <th className={DT.thText}>Time</th>
                <th className={DT.thText}>Action</th>
                <th className={DT.thText}>Session</th>
                <th className={DT.thText}>Detail</th>
              </tr>
            </DataTableHead>
            <DataTableBody>
              {recent.length === 0 ? (
                <DataTableEmptyRow colSpan={4}>No events yet.</DataTableEmptyRow>
              ) : (
                recent.map((row) => (
                  <DataTableRow key={String(row.id)}>
                    <td className={`${DT.tdClip} font-mono text-zinc-600 dark:text-zinc-400`}>
                      <span className={DT.tdTextSpan}>
                        {typeof row.created_at === "string" ? row.created_at : "—"}
                      </span>
                    </td>
                    <td className={DT.tdClip}>
                      <span className={DT.tdTextSpan}>{String(row.action ?? "")}</span>
                    </td>
                    <td className={`${DT.tdClip} font-mono`}>
                      <span className={DT.tdTextSpan}>
                        {row.worker_session_id ? String(row.worker_session_id) : "—"}
                      </span>
                    </td>
                    <td className={`${DT.tdClip} font-mono`}>
                      <span className={DT.tdTextSpan}>
                        {row.detail != null ? JSON.stringify(row.detail) : "{}"}
                      </span>
                    </td>
                  </DataTableRow>
                ))
              )}
            </DataTableBody>
          </DataTable>
        </DataTableShell>
        {recentRes.error ? (
          <p className="mt-2 text-sm text-amber-700 dark:text-amber-400">{recentRes.error.message}</p>
        ) : null}
      </div>
    </div>
  );
}
