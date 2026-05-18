import { Activity, CheckCircle2, Clock, Play, XCircle } from "lucide-react";
import Link from "next/link";

import { loadRunOverview } from "@/lib/cockpit";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { EntityTable } from "@/components/entity-table";
import { BUTTON } from "@/lib/ui-standards";

export const dynamic = "force-dynamic";

export default async function RunsPage() {
  const supabase = await createSupabaseServerClient();
  const tenantId = "default";

  const runs = await loadRunOverview(supabase, tenantId, { time_range: "24h" });

  const rows = runs.map((r) => ({
    run_id: r.run_id.slice(0, 8),
    type: r.work_request_type,
    plugin: r.plugin_id,
    status: r.status,
    stages: `${r.completed_stages}/${r.total_stages}`,
    leases: r.lease_count,
    started: new Date(r.started_at).toLocaleString(),
    duration:
      r.ended_at && r.started_at
        ? `${Math.round((new Date(r.ended_at).getTime() - new Date(r.started_at).getTime()) / 1000)}s`
        : r.status === "running"
          ? "Running..."
          : "—",
  }));

  const succeededCount = runs.filter((r) => r.status === "succeeded").length;
  const failedCount = runs.filter((r) => r.status === "failed").length;
  const runningCount = runs.filter((r) => r.status === "running").length;
  const pendingCount = runs.filter((r) => r.status === "pending" || r.status === "awaiting_approval").length;

  return (
    <main>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">Cross-Plane Runs</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Work request orchestration across LiNKaios, LiNKbot, LinkSkills, LiNKautowork, and LiNKbrain
        </p>
      </div>

      {/* Summary cards */}
      <div className="mb-6 grid gap-4 sm:grid-cols-5">
        <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
            <Activity className="h-4 w-4" />
            Total (24h)
          </div>
          <p className="mt-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-100">{runs.length}</p>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
            <Play className="h-4 w-4" />
            Running
          </div>
          <p className="mt-2 text-2xl font-semibold text-sky-600 dark:text-sky-400">{runningCount}</p>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
            <Clock className="h-4 w-4" />
            Pending
          </div>
          <p className="mt-2 text-2xl font-semibold text-amber-600 dark:text-amber-400">{pendingCount}</p>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
            <CheckCircle2 className="h-4 w-4" />
            Succeeded
          </div>
          <p className="mt-2 text-2xl font-semibold text-emerald-600 dark:text-emerald-400">{succeededCount}</p>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
            <XCircle className="h-4 w-4" />
            Failed
          </div>
          <p className="mt-2 text-2xl font-semibold text-red-600 dark:text-red-400">{failedCount}</p>
        </div>
      </div>

      <EntityTable
        title="Recent Runs (24h)"
        rows={rows as Record<string, unknown>[]}
        columns={["run_id", "type", "status", "stages", "leases", "started", "duration"]}
        columnHeaders={["Run ID", "Type", "Status", "Stages", "Leases", "Started", "Duration"]}
      />
    </main>
  );
}
