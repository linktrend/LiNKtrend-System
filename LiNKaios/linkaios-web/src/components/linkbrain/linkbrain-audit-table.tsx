"use client";

import { useMemo, useState } from "react";

import { Download } from "lucide-react";

import { DT } from "@/components/data-table";
import { InsetSelect } from "@/components/forms";
import { useLicensorScope } from "@/components/role-preview-provider";
import { downloadCsv } from "@/lib/csv-download";
import { matchesLicenseeRegistryId } from "@/lib/licensor-view-scope";
import { BUTTON, DATA_TABLE } from "@/lib/ui-standards";

export type AuditTraceRow = {
  event_type: string;
  mission_id: string | null;
  mission_title: string | null;
  licensee_id?: string | null;
  licensee_name?: string | null;
  /** When true, row is studio/admin context (not tenant licensee). */
  admin_context?: boolean;
  created_at: string;
};

type DaysFilter = "7" | "30";
type OriginFilter = "all" | "admin" | "licensee";

function formatWhen(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export function LinkbrainAuditTable(props: { rows: AuditTraceRow[]; licensorCollective?: boolean }) {
  const [query, setQuery] = useState("");
  const [projectFilter, setProjectFilter] = useState<string>("all");
  const [daysFilter, setDaysFilter] = useState<DaysFilter>("30");
  const [originFilter, setOriginFilter] = useState<OriginFilter>("all");
  const { scope: viewScope } = useLicensorScope();

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
    const cutoff = Date.now() - Number(daysFilter) * 86_400_000;

    return props.rows.filter((row) => {
      if (new Date(row.created_at).getTime() < cutoff) return false;
      if (projectFilter !== "all" && row.mission_id !== projectFilter) return false;
      if (
        props.licensorCollective &&
        row.licensee_id &&
        !matchesLicenseeRegistryId(viewScope, row.licensee_id)
      ) {
        return false;
      }
      if (props.licensorCollective && originFilter === "admin" && !row.admin_context) return false;
      if (props.licensorCollective && originFilter === "licensee" && row.admin_context) return false;
      if (!q) return true;
      const hay = [row.event_type, row.mission_title, row.mission_id].filter(Boolean).join(" ").toLowerCase();
      return hay.includes(q);
    });
  }, [props.rows, query, projectFilter, daysFilter, originFilter, props.licensorCollective, viewScope]);

  function handleDownload() {
    downloadCsv(
      "linkbrain-audit-traces.csv",
      props.licensorCollective
        ? ["Event", "Licensee", "Project", "Project ID", "Time"]
        : ["Event", "Project", "Project ID", "Time"],
      filtered.map((row) =>
        props.licensorCollective
          ? [
              row.event_type,
              row.licensee_name ?? "",
              row.mission_title ?? "",
              row.mission_id ?? "",
              row.created_at,
            ]
          : [row.event_type, row.mission_title ?? "", row.mission_id ?? "", row.created_at],
      ),
    );
  }

  return (
    <section className="space-y-3">
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        {props.licensorCollective
          ? "Append-only collective audit — capability runs, approvals, and automations with declared licensee source."
          : "Append-only governed trace log for this tenant — capability runs, approvals, and automations recorded as trace events. New rows are added continuously as work executes."}
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
            <div className="shrink-0 max-w-[13rem]">
              <InsetSelect
                compact
                value={daysFilter}
                onChange={(e) => setDaysFilter(e.target.value as DaysFilter)}
                aria-label="Time window"
              >
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
              </InsetSelect>
            </div>
            {props.licensorCollective ? (
              <div className="shrink-0 max-w-[13rem]">
                <InsetSelect
                  compact
                  value={originFilter}
                  onChange={(e) => setOriginFilter(e.target.value as OriginFilter)}
                  aria-label="Context"
                >
                  <option value="all">All contexts</option>
                  <option value="admin">Admin</option>
                  <option value="licensee">Licensees</option>
                </InsetSelect>
              </div>
            ) : null}
            {projects.length > 0 ? (
              <div className="shrink-0 max-w-[13rem]">
                <InsetSelect
                  compact
                  value={projectFilter}
                  onChange={(e) => setProjectFilter(e.target.value)}
                  aria-label="Project"
                >
                  <option value="all">All projects</option>
                  {projects.map(([id, title]) => (
                    <option key={id} value={id}>
                      {title}
                    </option>
                  ))}
                </InsetSelect>
              </div>
            ) : null}
          </div>
        </div>

        <div className={DATA_TABLE.scrollBody}>
          <table className={`${DATA_TABLE.table} text-xs`}>
              <colgroup>
                <col className={props.licensorCollective ? "w-[28%]" : "w-[40%]"} />
                {props.licensorCollective ? <col className="w-[22%]" /> : null}
                <col className={props.licensorCollective ? "w-[28%]" : "w-[35%]"} />
                <col className={props.licensorCollective ? "w-[22%]" : "w-[25%]"} />
              </colgroup>
              <thead className={DT.theadBordered}>
                <tr>
                  <th className={DT.thTextInset}>Event</th>
                  {props.licensorCollective ? <th className={DT.thTextInset}>Licensee</th> : null}
                  <th className={DT.thTextInset}>Project</th>
                  <th className={DT.thTextInset}>Time</th>
                </tr>
              </thead>
              <tbody className={DT.tbody}>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={props.licensorCollective ? 4 : 3} className={DT.emptyCell}>
                      No trace events match these filters.
                    </td>
                  </tr>
                ) : (
                  filtered.map((row, index) => (
                    <tr key={`${row.event_type}-${row.created_at}-${index}`} className={DT.tr}>
                      <td className={DT.tdClipInset}>
                        <span className={`${DT.tdTextSpan} font-mono text-xs`}>{row.event_type}</span>
                      </td>
                      {props.licensorCollective ? (
                        <td className={DT.tdClipInset}>
                          <span className={DT.tdTextSpan}>{row.licensee_name ?? "—"}</span>
                        </td>
                      ) : null}
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
