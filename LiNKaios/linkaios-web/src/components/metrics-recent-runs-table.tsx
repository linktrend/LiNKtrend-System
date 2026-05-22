"use client";

import Link from "next/link";
import { useState } from "react";

import { ExternalLink } from "lucide-react";

import type { MetricsSnapshot } from "@/app/(shell)/metrics/actions";
import { DataTableIconAction, DataTableShell, DT } from "@/components/data-table";
import { DomainStatusPill } from "@/components/ui/status-pill";
import { WorkInboxModal } from "@/components/work-inbox-modal";
import { DATA_TABLE } from "@/lib/ui-standards";

type RunRow = MetricsSnapshot["runs"][number];

function isErrorEvent(eventType: string) {
  const t = eventType.toLowerCase();
  return t.includes("error") || t.includes("fail") || t.includes("denied") || t.includes("blocked");
}

function durationMsFromPayload(p: Record<string, unknown>): number | null {
  for (const k of ["duration_ms", "latency_ms", "total_duration_ms", "elapsed_ms", "response_time_ms"]) {
    const v = p[k];
    if (typeof v === "number" && Number.isFinite(v) && v >= 0) return v;
  }
  return null;
}

function formatDuration(ms: number | null) {
  if (ms == null || !Number.isFinite(ms)) return "—";
  if (ms >= 3600_000) return `${(ms / 3600_000).toFixed(1)}h`;
  if (ms >= 60_000) return `${(ms / 60_000).toFixed(1)}m`;
  if (ms >= 1000) return `${(ms / 1000).toFixed(1)}s`;
  return `${Math.round(ms)}ms`;
}

function formatUsd(n: number) {
  return n.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 4 });
}

function formatTokens(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 10_000) return `${(n / 1_000).toFixed(1)}k`;
  return n.toLocaleString();
}

export function RecentRunsTable(props: {
  snapshot: MetricsSnapshot;
  hideProjectColumn?: boolean;
  tracesHref?: string;
  sectionTitle?: string;
}) {
  const rows = props.snapshot.runs.slice(0, 20);
  const [selected, setSelected] = useState<RunRow | null>(null);
  const tracesHref = props.tracesHref ?? "/traces";
  const sectionTitle = props.sectionTitle ?? "Recent runs";

  if (rows.length === 0) {
    return (
      <section className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50/80 p-6 text-sm text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900/40 dark:text-zinc-400">
        No runs in this window. Adjust filters or wait for LiNKbot and automation activity.
      </section>
    );
  }

  const selectedErr = selected ? isErrorEvent(selected.event_type) : false;
  const selectedDur = selected ? durationMsFromPayload(selected.payload) : null;
  const projectScoped = props.hideProjectColumn === true;

  return (
    <>
      <section aria-label="Recent runs" className={DATA_TABLE.shell}>
        <div className="border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{sectionTitle}</h2>
        </div>
        <div className={DATA_TABLE.scrollBody}>
          <table className={`${DATA_TABLE.table} text-xs`}>
            <colgroup>
              {projectScoped ? (
                <>
                  <col className="w-[17%]" />
                  <col className="w-[28%]" />
                  <col className="w-[45%]" />
                  <col className="w-[10%]" />
                </>
              ) : (
                <>
                  <col className="w-[12%]" />
                  <col className="w-[16%]" />
                  <col className="w-[30%]" />
                  <col className="w-[30%]" />
                  <col className="w-[12%]" />
                </>
              )}
            </colgroup>
            <thead className={DT.theadBordered}>
              <tr>
                <th className={DT.thControl}>
                  <div className={DT.controlInner}>Status</div>
                </th>
                <th className={DT.thText}>Time</th>
                <th className={DT.thText}>Event</th>
                {!props.hideProjectColumn ? <th className={DT.thText}>Project</th> : null}
                <th className={DT.thControl}>
                  <div className={DT.controlInner}>Details</div>
                </th>
              </tr>
            </thead>
            <tbody className={DT.tbody}>
              {rows.map((r) => {
                const err = isErrorEvent(r.event_type);
                return (
                  <tr key={r.id} className={DT.tr}>
                    <td className={DT.tdControl}>
                      <div className={DT.controlInner}>
                        <DomainStatusPill domain="metric" status={err ? "failed" : "ok"} equalWidth />
                      </div>
                    </td>
                    <td className={`${DT.tdClip} whitespace-nowrap text-zinc-500`}>
                      {new Date(r.created_at).toLocaleString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className={DT.tdClip}>
                      <span className={`${DT.tdTextSpan} font-mono`} title={r.event_type}>
                        {r.event_type}
                      </span>
                    </td>
                    {!props.hideProjectColumn ? (
                      <td className={DT.tdClip}>
                        <span className={DT.tdTextSpan} title={r.mission_title ?? undefined}>
                          {r.mission_title ?? "—"}
                        </span>
                      </td>
                    ) : null}
                    <td className={DT.tdControl}>
                      <div className={DT.controlInner}>
                        <DataTableIconAction
                          icon={ExternalLink}
                          label="Open run details"
                          onClick={() => setSelected(r)}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="border-t border-zinc-100 px-4 py-2 dark:border-zinc-800">
          <Link href={tracesHref} className="text-xs font-medium text-zinc-600 underline-offset-2 hover:underline dark:text-zinc-400">
            Open system logs →
          </Link>
        </div>
      </section>

      <WorkInboxModal
        open={selected != null}
        onClose={() => setSelected(null)}
        title={selected ? selected.event_type : ""}
        subtitle={selected ? new Date(selected.created_at).toLocaleString() : undefined}
      >
        {selected ? (
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-xs font-semibold text-zinc-500">Status</dt>
              <dd className="mt-1">
                <DomainStatusPill domain="metric" status={selectedErr ? "failed" : "ok"} equalWidth />
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-zinc-500">Project</dt>
              <dd className="mt-1 text-zinc-800 dark:text-zinc-200">{selected.mission_title ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-zinc-500">LiNKbot</dt>
              <dd className="mt-1 text-zinc-800 dark:text-zinc-200">{selected.agent_name ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-zinc-500">Model</dt>
              <dd className="mt-1 text-zinc-800 dark:text-zinc-200">{selected.model ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-zinc-500">Tokens</dt>
              <dd className="mt-1 tabular-nums text-zinc-800 dark:text-zinc-200">
                {selected.tokens != null ? formatTokens(selected.tokens) : "—"}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-zinc-500">Cost</dt>
              <dd className="mt-1 tabular-nums text-zinc-800 dark:text-zinc-200">
                {selected.cost_usd != null ? formatUsd(selected.cost_usd) : "—"}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-zinc-500">Duration</dt>
              <dd className="mt-1 tabular-nums text-zinc-800 dark:text-zinc-200">{formatDuration(selectedDur)}</dd>
            </div>
          </dl>
        ) : null}
      </WorkInboxModal>
    </>
  );
}
