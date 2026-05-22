"use client";

import { useMemo, useState } from "react";

import { Download } from "lucide-react";

import { DT } from "@/components/data-table";
import { downloadCsv } from "@/lib/csv-download";
import { BUTTON, DATA_TABLE } from "@/lib/ui-standards";

export type AuditTraceRow = {
  event_type: string;
  mission_id: string | null;
  mission_title: string | null;
  created_at: string;
};

type DaysFilter = "7" | "30" | "90" | "all";

function formatWhen(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export function LinkbrainAuditTable(props: { rows: AuditTraceRow[] }) {
  const [query, setQuery] = useState("");
  const [projectFilter, setProjectFilter] = useState<string>("all");
  const [daysFilter, setDaysFilter] = useState<DaysFilter>("30");

  const projects = useMemo(() => {
    const map = new Map<string, string>();
    for (const row of props.rows) {
      if (!row.mission_id) continue;
      map.set(row.mission_id, row.mission_title ?? row.mission_id);
    }
    return [...map.entries()].sort((a, b) => a[1].localeCompare(b[1]));
  }, [props.rows]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const cutoff =
      daysFilter === "all" ? 0 : Date.now() - Number(daysFilter) * 86_400_000;

    return props.rows.filter((row) => {
      if (daysFilter !== "all" && new Date(row.created_at).getTime() < cutoff) return false;
      if (projectFilter !== "all" && row.mission_id !== projectFilter) return false;
      if (!q) return true;
      const hay = [row.event_type, row.mission_title, row.mission_id].filter(Boolean).join(" ").toLowerCase();
      return hay.includes(q);
    });
  }, [props.rows, query, projectFilter, daysFilter]);

  function handleDownload() {
    downloadCsv(
      "linkbrain-audit-traces.csv",
      ["Event", "Project", "Project ID", "Time"],
      filtered.map((row) => [
        row.event_type,
        row.mission_title ?? "",
        row.mission_id ?? "",
        row.created_at,
      ]),
    );
  }

  return (
    <section className="space-y-3">
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Append-only governed trace log for this tenant — capability runs, approvals, and automations recorded as trace
        events. New rows are added continuously as work executes.
      </p>

      <div className={DATA_TABLE.shell}>
        <div className="space-y-3 border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Trace log</h2>
              <p className="mt-0.5 text-xs text-zinc-600 dark:text-zinc-400">
                Loaded {props.rows.length} most recent events · filter or export the visible slice
              </p>
            </div>
            <button type="button" onClick={handleDownload} className={`${BUTTON.secondaryCompact} inline-flex gap-2`}>
              <Download className="h-4 w-4 shrink-0" aria-hidden />
              Download CSV
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter event type…"
              aria-label="Filter event type"
              className="min-w-[12rem] flex-1 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100"
            />
            <select
              value={daysFilter}
              onChange={(e) => setDaysFilter(e.target.value as DaysFilter)}
              aria-label="Time window"
              className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-950"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
              <option value="all">All loaded</option>
            </select>
            {projects.length > 0 ? (
              <select
                value={projectFilter}
                onChange={(e) => setProjectFilter(e.target.value)}
                aria-label="Project"
                className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-950"
              >
                <option value="all">All projects</option>
                {projects.map(([id, title]) => (
                  <option key={id} value={id}>
                    {title}
                  </option>
                ))}
              </select>
            ) : null}
          </div>
        </div>

        <div className={DATA_TABLE.scrollBody}>
          <table className={`${DATA_TABLE.table} text-xs`}>
              <colgroup>
                <col className="w-[40%]" />
                <col className="w-[35%]" />
                <col className="w-[25%]" />
              </colgroup>
              <thead className={DT.theadBordered}>
                <tr>
                  <th className={DT.thTextInset}>Event</th>
                  <th className={DT.thTextInset}>Project</th>
                  <th className={DT.thTextInset}>Time</th>
                </tr>
              </thead>
              <tbody className={DT.tbody}>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={3} className={DT.emptyCell}>
                      No trace events match these filters.
                    </td>
                  </tr>
                ) : (
                  filtered.map((row, index) => (
                    <tr key={`${row.event_type}-${row.created_at}-${index}`} className={DT.tr}>
                      <td className={DT.tdClipInset}>
                        <span className={`${DT.tdTextSpan} font-mono text-xs`}>{row.event_type}</span>
                      </td>
                      <td className={DT.tdClipInset}>
                        <span className={DT.tdTextSpan}>{row.mission_title ?? row.mission_id ?? "—"}</span>
                      </td>
                      <td className={DT.tdClipInset}>
                        <span className={`${DT.tdTextSpan} text-xs text-zinc-600 dark:text-zinc-400`}>
                          {formatWhen(row.created_at)}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
        </div>

        <div className="border-t border-zinc-100 px-4 py-2 text-xs text-zinc-600 dark:border-zinc-800 dark:text-zinc-400">
          Showing {filtered.length} of {props.rows.length} loaded traces
        </div>
      </div>
    </section>
  );
}
