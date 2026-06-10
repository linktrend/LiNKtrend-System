"use client";

import { useMemo, useState } from "react";

import type { MetricsSnapshot } from "@/app/(shell)/metrics/actions";
import { RecentRunsTable } from "@/components/metrics-recent-runs-table";

export type RunsTimeWindow = "24h" | "7d" | "30d" | "all";

const WINDOW_OPTIONS: { id: RunsTimeWindow; label: string; days: number | null }[] = [
  { id: "24h", label: "Last 24 hours", days: 1 },
  { id: "7d", label: "Last 7 days", days: 7 },
  { id: "30d", label: "Last 30 days", days: 30 },
  { id: "all", label: "All time", days: null },
];

function filterSnapshot(base: MetricsSnapshot, window: RunsTimeWindow, projectId: string): MetricsSnapshot {
  const runs = base.runs.filter((r) => r.mission_id === projectId);
  if (window === "all") {
    return { ...base, runs, totalTraces: runs.length };
  }
  const days = WINDOW_OPTIONS.find((o) => o.id === window)?.days ?? 30;
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  const filtered = runs.filter((r) => new Date(r.created_at).getTime() >= cutoff);
  return { ...base, runs: filtered, totalTraces: filtered.length };
}

export function ProjectRunsPanelClient(props: {
  projectId: string;
  projectTitle: string;
  initialSnapshot: MetricsSnapshot;
}) {
  const [window, setWindow] = useState<RunsTimeWindow>("30d");
  const snapshot = useMemo(
    () => filterSnapshot(props.initialSnapshot, window, props.projectId),
    [props.initialSnapshot, window, props.projectId],
  );

  const sectionTitle =
    window === "all"
      ? "Runs (all time)"
      : `Runs (${WINDOW_OPTIONS.find((o) => o.id === window)?.label.toLowerCase() ?? "last 30 days"})`;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Each Run is one pass through project modules — continuous projects repeat Runs over time. Rows are governance
          traces from LiNKbot and automation activity for this project.
        </p>
        <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
          <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Window</span>
          <select
            value={window}
            onChange={(e) => setWindow(e.target.value as RunsTimeWindow)}
            className="rounded-lg border border-zinc-300 bg-white px-2 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          >
            {WINDOW_OPTIONS.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <RecentRunsTable
        snapshot={snapshot}
        hideProjectColumn={false}
        hideTracesLink
        sectionTitle={sectionTitle}
        projectTitleFallback={props.projectTitle}
      />
    </div>
  );
}
