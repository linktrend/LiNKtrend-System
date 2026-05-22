"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { Download, Eye } from "lucide-react";

import { DataTableIconAction, DT } from "@/components/data-table";
import { StatusPill } from "@/components/ui/status-pill";
import { downloadCsv } from "@/lib/csv-download";
import {
  formatSessionCost,
  formatSessionDuration,
  type SessionLogRow,
} from "@/lib/session-logs";
import { BUTTON, DATA_TABLE } from "@/lib/ui-standards";

type StatusFilter = "all" | "completed" | "failed";
type DaysFilter = "7" | "30" | "90" | "all";

function formatWhen(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function statusTone(status: SessionLogRow["status"]) {
  return status === "failed" ? "danger" : "success";
}

export function WorkerSessionLogsTable(props: { rows: SessionLogRow[] }) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [daysFilter, setDaysFilter] = useState<DaysFilter>("30");
  const [channelFilter, setChannelFilter] = useState<string>("all");

  const channels = useMemo(() => {
    const set = new Set<string>();
    for (const row of props.rows) {
      if (row.channel) set.add(row.channel);
    }
    return [...set].sort();
  }, [props.rows]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const cutoff =
      daysFilter === "all"
        ? 0
        : Date.now() - Number(daysFilter) * 86_400_000;

    return props.rows.filter((row) => {
      if (daysFilter !== "all" && new Date(row.endedAt).getTime() < cutoff) return false;
      if (statusFilter !== "all" && row.status !== statusFilter) return false;
      if (channelFilter !== "all" && row.channel !== channelFilter) return false;
      if (!q) return true;
      const hay = [row.sessionTitle, row.projectTitle, row.channel, row.id].filter(Boolean).join(" ").toLowerCase();
      return hay.includes(q);
    });
  }, [props.rows, query, statusFilter, daysFilter, channelFilter]);

  function handleDownload() {
    downloadCsv(
      "linkbot-session-logs.csv",
      [
        "Session",
        "Channel",
        "Project",
        "Started",
        "Ended",
        "Duration",
        "User messages",
        "Assistant messages",
        "Tool calls",
        "Cost USD",
        "Transcript KB",
        "Status",
        "Session ID",
      ],
      filtered.map((row) => [
        row.sessionTitle,
        row.channel ?? "",
        row.projectTitle ?? "",
        row.startedAt,
        row.endedAt,
        formatSessionDuration(row.durationMs),
        String(row.userMessages),
        String(row.assistantMessages),
        String(row.toolCalls),
        row.costUsd != null ? String(row.costUsd) : "",
        row.transcriptSizeKb != null ? String(row.transcriptSizeKb) : "",
        row.status,
        row.id,
      ]),
    );
  }

  return (
    <section aria-label="Closed session logs" className={DATA_TABLE.shell}>
      <div className="space-y-3 border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Closed sessions</h2>
            <p className="mt-0.5 text-xs text-zinc-600 dark:text-zinc-400">
              OpenClaw-style JSONL transcript summaries — one row per ended session, not live trace events.
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
            placeholder="Search session, project, channel…"
            aria-label="Search session logs"
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
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            aria-label="Session status"
            className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-950"
          >
            <option value="all">All statuses</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
          </select>
          {channels.length > 0 ? (
            <select
              value={channelFilter}
              onChange={(e) => setChannelFilter(e.target.value)}
              aria-label="Channel"
              className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-950"
            >
              <option value="all">All channels</option>
              {channels.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          ) : null}
        </div>
      </div>

      <div className={DATA_TABLE.scrollBody}>
        <table className={`${DATA_TABLE.table} text-xs`}>
          <colgroup>
            <col className="w-[18%]" />
            <col className="w-[8%]" />
            <col className="w-[14%]" />
            <col className="w-[11%]" />
            <col className="w-[11%]" />
            <col className="w-[8%]" />
            <col className="w-[8%]" />
            <col className="w-[7%]" />
            <col className="w-[7%]" />
            <col className="w-[8%]" />
          </colgroup>
          <thead className={DT.theadBordered}>
            <tr>
              <th className={DT.thText}>Session</th>
              <th className={DT.thText}>Channel</th>
              <th className={DT.thText}>Project</th>
              <th className={DT.thText}>Started</th>
              <th className={DT.thText}>Ended</th>
              <th className={DT.thText}>Duration</th>
              <th className={DT.thText}>Messages</th>
              <th className={DT.thText}>Tools</th>
              <th className={DT.thText}>Cost</th>
              <th className={DT.thControl}>
                <div className={DT.controlInner}>Status</div>
              </th>
            </tr>
          </thead>
          <tbody className={DT.tbody}>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={10} className={DT.emptyCell}>
                  No closed sessions match these filters.
                </td>
              </tr>
            ) : (
              filtered.map((row) => (
                <tr key={row.id} className={DT.tr}>
                  <td className={`${DT.tdClip} font-medium text-zinc-900 dark:text-zinc-100`}>
                    <Link href={row.openHref} className={`${DT.tdTextSpan} underline-offset-2 hover:underline`} title={row.sessionTitle}>
                      {row.sessionTitle}
                    </Link>
                  </td>
                  <td className={DT.tdClip}>
                    <span className={DT.tdTextSpan}>{row.channel ?? "—"}</span>
                  </td>
                  <td className={DT.tdClip}>
                    <span className={DT.tdTextSpan}>{row.projectTitle ?? "—"}</span>
                  </td>
                  <td className={`${DT.tdClip} whitespace-nowrap text-zinc-500`}>{formatWhen(row.startedAt)}</td>
                  <td className={`${DT.tdClip} whitespace-nowrap text-zinc-500`}>{formatWhen(row.endedAt)}</td>
                  <td className={`${DT.tdClip} tabular-nums text-zinc-700 dark:text-zinc-300`}>
                    {formatSessionDuration(row.durationMs)}
                  </td>
                  <td className={`${DT.tdClip} tabular-nums text-zinc-700 dark:text-zinc-300`}>
                    {row.userMessages + row.assistantMessages}
                  </td>
                  <td className={`${DT.tdClip} tabular-nums text-zinc-700 dark:text-zinc-300`}>{row.toolCalls}</td>
                  <td className={`${DT.tdClip} tabular-nums text-zinc-700 dark:text-zinc-300`}>{formatSessionCost(row.costUsd)}</td>
                  <td className={DT.tdControl}>
                    <div className={DT.actionsRow}>
                      <StatusPill
                        label={row.status === "failed" ? "Failed" : "Completed"}
                        tone={statusTone(row.status)}
                      />
                      <DataTableIconAction icon={Eye} label={`Open ${row.sessionTitle}`} href={row.openHref} />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="border-t border-zinc-100 px-4 py-2 text-xs text-zinc-600 dark:border-zinc-800 dark:text-zinc-400">
        Showing {filtered.length} of {props.rows.length} closed sessions · transcripts stored as append-only JSONL per OpenClaw convention
      </div>
    </section>
  );
}
