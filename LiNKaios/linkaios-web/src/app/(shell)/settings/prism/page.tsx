import { createSupabaseServerClient } from "@/lib/supabase/server";
import { TABLE } from "@/lib/ui-standards";

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
      <div>
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Data cleanup</h2>
        <p className="mt-1 max-w-2xl text-sm text-zinc-600 dark:text-zinc-400">
          Read-only health signals from the automated cleanup worker (heartbeat and recent cleanup activity).
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Last heartbeat
          </p>
          <p className="mt-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-100">{formatAge(lastHeartbeatAt)}</p>
          {lastHeartbeatAt ? (
            <p className="mt-1 font-mono text-xs text-zinc-500 dark:text-zinc-400">{lastHeartbeatAt}</p>
          ) : null}
          {hbRes.error ? (
            <p className="mt-2 text-sm text-amber-700 dark:text-amber-400">Heartbeat feed is temporarily unavailable.</p>
          ) : null}
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            FS cleanup failures (24h)
          </p>
          <p className="mt-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-100">{fsFailures24h}</p>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">Filesystem cleanup issues (24h)</p>
          {failRes.error ? (
            <p className="mt-2 text-sm text-amber-700 dark:text-amber-400">Cleanup metrics are temporarily unavailable.</p>
          ) : null}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Recent cleanup events</h3>
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">Latest 20 rows</p>
        <div className="mt-3 overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
          <table className="w-full min-w-[640px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/80">
                <th className={`px-3 py-2 font-medium text-zinc-700 dark:text-zinc-300 ${TABLE.thText}`}>Time</th>
                <th className={`px-3 py-2 font-medium text-zinc-700 dark:text-zinc-300 ${TABLE.thText}`}>Action</th>
                <th className={`px-3 py-2 font-medium text-zinc-700 dark:text-zinc-300 ${TABLE.thText}`}>Session</th>
                <th className={`px-3 py-2 font-medium text-zinc-700 dark:text-zinc-300 ${TABLE.thText}`}>Detail</th>
              </tr>
            </thead>
            <tbody>
              {recent.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-3 py-6 text-center text-zinc-500 dark:text-zinc-400">
                    No events yet.
                  </td>
                </tr>
              ) : (
                recent.map((row) => (
                  <tr
                    key={String(row.id)}
                    className="border-b border-zinc-100 dark:border-zinc-800/80 [&:last-child]:border-b-0"
                  >
                    <td className="whitespace-nowrap px-3 py-2 font-mono text-xs text-zinc-600 dark:text-zinc-400">
                      {typeof row.created_at === "string" ? row.created_at : "—"}
                    </td>
                    <td className="px-3 py-2 text-zinc-800 dark:text-zinc-200">{String(row.action ?? "")}</td>
                    <td className="max-w-[140px] truncate px-3 py-2 font-mono text-xs text-zinc-600 dark:text-zinc-400">
                      {row.worker_session_id ? String(row.worker_session_id) : "—"}
                    </td>
                    <td className="max-w-md truncate px-3 py-2 font-mono text-xs text-zinc-600 dark:text-zinc-400">
                      {row.detail != null ? JSON.stringify(row.detail) : "{}"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {recentRes.error ? (
          <p className="mt-2 text-sm text-amber-700 dark:text-amber-400">{recentRes.error.message}</p>
        ) : null}
      </div>
    </div>
  );
}
