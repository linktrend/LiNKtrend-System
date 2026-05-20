"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";

import { fetchMetricsSnapshot, type MetricsSnapshot } from "@/app/(shell)/metrics/actions";
import type { NamedAmount } from "@/lib/metrics-snapshot";
import {
  buildKpiCards,
  KPI_VIEW_LABELS,
  type KpiCard,
  type KpiTone,
  type KpiViewId,
} from "@/lib/metrics-kpi-views";
import { DomainStatusPill } from "@/components/ui/status-pill";
import { screenTabLinkClass, TABS } from "@/lib/ui-standards";

export type MetricsFilterOption = { id: string; label: string };

type RangeDays = 1 | 7 | 30;
type TraceStatusFilter = "all" | "success" | "errors";

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

function kpiToneClass(tone: KpiTone) {
  if (tone === "bad") return "border-red-200 bg-red-50/80 dark:border-red-900/50 dark:bg-red-950/25";
  if (tone === "warn") return "border-amber-200 bg-amber-50/80 dark:border-amber-900/50 dark:bg-amber-950/25";
  return "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950";
}

function KpiCardGrid(props: { cards: KpiCard[]; viewLabel: string; viewQuestion: string }) {
  return (
    <section aria-label={`${props.viewLabel} KPIs`}>
      <div className="mb-3">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{props.viewLabel}</h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">{props.viewQuestion}</p>
      </div>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
        {props.cards.map((c) => (
          <div key={c.slot} className={`rounded-xl border p-3 shadow-sm ${kpiToneClass(c.tone)}`}>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{c.label}</p>
            <p className="mt-1 text-lg font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">{c.value}</p>
            <p className="mt-0.5 text-[11px] leading-snug text-zinc-600 dark:text-zinc-400">{c.context}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function RecentRunsTable(props: { snapshot: MetricsSnapshot }) {
  const rows = props.snapshot.runs.slice(0, 20);
  if (rows.length === 0) {
    return (
      <section className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50/80 p-6 text-sm text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900/40 dark:text-zinc-400">
        No runs in this window. Adjust filters or wait for LiNKbot and automation activity.
      </section>
    );
  }

  return (
    <section aria-label="Recent runs" className="rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <div className="border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Recent runs</h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">Latest trace events — drill into System logs for payload detail.</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-xs">
          <thead>
            <tr className="border-b border-zinc-100 text-[11px] uppercase tracking-wide text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
              <th className="px-4 py-2 font-semibold">Time</th>
              <th className="px-4 py-2 font-semibold">Event</th>
              <th className="px-4 py-2 font-semibold">Project</th>
              <th className="px-4 py-2 font-semibold">LiNKbot</th>
              <th className="px-4 py-2 font-semibold">Model</th>
              <th className="px-4 py-2 font-semibold text-right">Tokens</th>
              <th className="px-4 py-2 font-semibold text-right">Cost</th>
              <th className="px-4 py-2 font-semibold text-right">Duration</th>
              <th className="px-4 py-2 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {rows.map((r) => {
              const err = isErrorEvent(r.event_type);
              const dur = durationMsFromPayload(r.payload);
              return (
                <tr key={r.id} className="text-zinc-700 dark:text-zinc-300">
                  <td className="whitespace-nowrap px-4 py-2 tabular-nums text-zinc-500">
                    {new Date(r.created_at).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </td>
                  <td className="max-w-[10rem] truncate px-4 py-2 font-mono" title={r.event_type}>
                    {r.event_type}
                  </td>
                  <td className="max-w-[9rem] truncate px-4 py-2">{r.mission_title ?? "—"}</td>
                  <td className="max-w-[8rem] truncate px-4 py-2">{r.agent_name ?? "—"}</td>
                  <td className="max-w-[8rem] truncate px-4 py-2">{r.model ?? "—"}</td>
                  <td className="px-4 py-2 text-right tabular-nums">{r.tokens != null ? formatTokens(r.tokens) : "—"}</td>
                  <td className="px-4 py-2 text-right tabular-nums">{r.cost_usd != null ? formatUsd(r.cost_usd) : "—"}</td>
                  <td className="px-4 py-2 text-right tabular-nums">{formatDuration(dur)}</td>
                  <td className="px-4 py-2">
                    <DomainStatusPill domain="metric" status={err ? "failed" : "ok"} equalWidth />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="border-t border-zinc-100 px-4 py-2 dark:border-zinc-800">
        <Link href="/traces" className="text-xs font-medium text-zinc-600 underline-offset-2 hover:underline dark:text-zinc-400">
          Open system logs →
        </Link>
      </div>
    </section>
  );
}

function formatUsd(n: number) {
  return n.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 4 });
}

function formatTokens(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 10_000) return `${(n / 1_000).toFixed(1)}k`;
  return n.toLocaleString();
}

const CHART_COLORS = ["bg-violet-500", "bg-sky-500", "bg-emerald-500", "bg-amber-500", "bg-rose-500", "bg-indigo-500"];

function DailyCountBars(props: { rows: { day: string; count: number }[]; colorClass: string; label: string }) {
  const max = Math.max(...props.rows.map((r) => r.count), 1);
  return (
    <div className="mt-3">
      <div className="flex h-40 items-end gap-1 border-b border-zinc-200 pb-1 dark:border-zinc-700">
        {props.rows.map((r) => (
          <div key={r.day} className="flex min-w-0 flex-1 flex-col items-center gap-1">
            <div
              className={`w-full max-w-[14px] rounded-t opacity-90 ${props.colorClass}`}
              style={{ height: `${Math.max(4, (r.count / max) * 100)}%` }}
              title={`${r.day}: ${r.count}`}
            />
            <span className="truncate text-[9px] text-zinc-500 dark:text-zinc-400" title={r.day}>
              {r.day.slice(5)}
            </span>
          </div>
        ))}
      </div>
      <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">{props.label}</p>
    </div>
  );
}

function DailyFloatBars(props: { rows: { day: string; cost: number }[]; label: string }) {
  const max = Math.max(...props.rows.map((r) => r.cost), 1e-9);
  return (
    <div className="mt-3">
      <div className="flex h-40 items-end gap-1 border-b border-zinc-200 pb-1 dark:border-zinc-700">
        {props.rows.map((r) => (
          <div key={r.day} className="flex min-w-0 flex-1 flex-col items-center gap-1">
            <div
              className="w-full max-w-[14px] rounded-t bg-amber-500/90 dark:bg-amber-400/90"
              style={{ height: `${Math.max(4, (r.cost / max) * 100)}%` }}
              title={`${r.day}: ${formatUsd(r.cost)}`}
            />
            <span className="truncate text-[9px] text-zinc-500 dark:text-zinc-400" title={r.day}>
              {r.day.slice(5)}
            </span>
          </div>
        ))}
      </div>
      <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">{props.label}</p>
    </div>
  );
}

function EventTypeBars(props: { slices: { name: string; count: number }[] }) {
  const max = Math.max(...props.slices.map((s) => s.count), 1);
  return (
    <ul className="mt-3 space-y-2">
      {props.slices.map((s, i) => (
        <li key={s.name} className="text-sm">
          <div className="flex justify-between gap-2 text-xs">
            <span className="min-w-0 truncate font-medium text-zinc-800 dark:text-zinc-200" title={s.name}>
              <span className={`mr-2 inline-block h-2 w-2 rounded-sm ${CHART_COLORS[i % CHART_COLORS.length]}`} aria-hidden />
              {s.name}
            </span>
            <span className="shrink-0 tabular-nums text-zinc-600 dark:text-zinc-400">{s.count}</span>
          </div>
          <div className="mt-1 h-2 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
            <div
              className={`h-full rounded-full ${CHART_COLORS[i % CHART_COLORS.length]}`}
              style={{ width: `${Math.max(4, (s.count / max) * 100)}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

function CategoryBars(props: { rows: { id: string; label: string; count: number }[] }) {
  const max = Math.max(...props.rows.map((r) => r.count), 1);
  return (
    <ul className="mt-3 space-y-2">
      {props.rows.map((s) => (
        <li key={s.id} className="text-sm">
          <div className="flex justify-between gap-2 text-xs">
            <span className="min-w-0 font-medium text-zinc-800 dark:text-zinc-200">{s.label}</span>
            <span className="shrink-0 tabular-nums text-zinc-600 dark:text-zinc-400">{s.count}</span>
          </div>
          <div className="mt-1 h-2 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
            <div className="h-full rounded-full bg-teal-500/90" style={{ width: `${Math.max(4, (s.count / max) * 100)}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

function RankedCostTable(props: { title: string; rows: NamedAmount[]; emptyHint: string }) {
  if (props.rows.length === 0) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{props.title}</p>
        <p className="mt-3 text-sm text-zinc-500">{props.emptyHint}</p>
      </div>
    );
  }
  const maxCost = Math.max(...props.rows.map((r) => r.cost), 1e-12);
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{props.title}</p>
      <ul className="mt-3 max-h-72 space-y-2 overflow-y-auto">
        {props.rows.map((r, idx) => (
          <li key={`${r.name}-${idx}`} className="text-xs">
            <div className="flex justify-between gap-2">
              <span className="min-w-0 truncate font-medium text-zinc-800 dark:text-zinc-200" title={r.name}>
                {r.name}
              </span>
              <span className="shrink-0 tabular-nums text-zinc-600 dark:text-zinc-400">
                {formatUsd(r.cost)} · {formatTokens(r.tokens)} tokens · {r.traces} runs
              </span>
            </div>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
              <div className="h-full rounded-full bg-indigo-500/85" style={{ width: `${Math.max(6, (r.cost / maxCost) * 100)}%` }} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function MetricsDashboard(props: {
  initialSnapshot: MetricsSnapshot;
  loadError?: string | null;
  agents: MetricsFilterOption[];
  missions: MetricsFilterOption[];
  demoMode?: boolean;
  initialEventTypeFilter?: string | null;
}) {
  const [pending, startTransition] = useTransition();
  const [snapshot, setSnapshot] = useState<MetricsSnapshot>(props.initialSnapshot);
  const [days, setDays] = useState<RangeDays>(30);
  const [agent, setAgent] = useState("all");
  const [mission, setMission] = useState("all");
  const [eventTypeContains, setEventTypeContains] = useState(props.initialEventTypeFilter ?? "");
  const [modelContains, setModelContains] = useState("");
  const [missionTitleContains, setMissionTitleContains] = useState("");
  const [traceStatus, setTraceStatus] = useState<TraceStatusFilter>("all");
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [viewTab, setViewTab] = useState<KpiViewId>("cost");
  const [refreshError, setRefreshError] = useState<string | null>(null);
  const skipFetchOnce = useRef(false);

  const runFetch = useCallback(() => {
    startTransition(() => {
      void (async () => {
        const r = await fetchMetricsSnapshot({
          days,
          missionId: mission === "all" ? null : mission,
          agentId: agent === "all" ? null : agent,
          eventTypeContains: eventTypeContains.trim() || null,
          modelContains: modelContains.trim() || null,
          missionTitleContains: missionTitleContains.trim() || null,
          traceStatus,
        });
        if (!r.ok) {
          setRefreshError(r.error ?? "Metrics could not be refreshed.");
          return;
        }
        setRefreshError(null);
        setSnapshot(r.data);
      })();
    });
  }, [days, agent, mission, eventTypeContains, modelContains, missionTitleContains, traceStatus]);

  useEffect(() => {
    if (!skipFetchOnce.current) {
      skipFetchOnce.current = true;
      return;
    }
    const id = setTimeout(runFetch, 320);
    return () => clearTimeout(id);
  }, [runFetch]);

  const modelOptions = useMemo(() => {
    const set = new Set<string>();
    for (const m of snapshot.costByModel) {
      if (m.name && m.name !== "Other (combined)") set.add(m.name);
    }
    return ["", ...[...set].sort().slice(0, 24)];
  }, [snapshot.costByModel]);

  const toolSlices = useMemo(
    () =>
      snapshot.eventTypeSlices.filter((s) => {
        const n = s.name.toLowerCase();
        return n.includes("tool") || n.includes("mcp") || n.includes("invoke");
      }),
    [snapshot.eventTypeSlices],
  );

  const failureSlices = useMemo(
    () =>
      snapshot.eventTypeSlices.filter((s) => {
        const n = s.name.toLowerCase();
        return n.includes("error") || n.includes("fail") || n.includes("denied") || n.includes("timeout");
      }),
    [snapshot.eventTypeSlices],
  );

  const kpiCards = useMemo(() => buildKpiCards(viewTab, snapshot), [viewTab, snapshot]);

  const viewTabs: { id: KpiViewId; label: string }[] = [
    { id: "cost", label: "Cost" },
    { id: "performance", label: "Performance" },
    { id: "reliability", label: "Reliability" },
  ];

  const loadIssue = props.loadError || refreshError;

  return (
    <div className="space-y-6">
      {props.demoMode ? (
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center rounded-full border border-zinc-300 bg-zinc-50 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200">
            Mock sample data
          </span>
        </div>
      ) : null}
      {loadIssue ? (
        <div
          role="status"
          className="rounded-lg border border-amber-200 bg-amber-50/90 px-3 py-2 text-sm text-amber-950 dark:border-amber-800 dark:bg-amber-950/35 dark:text-amber-100"
        >
          <p className="font-medium">Metrics data did not load completely.</p>
          <p className="mt-1 text-xs leading-relaxed opacity-90">
            What you see may be empty or stale — this is different from a genuine &quot;no activity&quot; period. Try refreshing the page; if it continues, check connectivity and that traces or related tables are reachable.
          </p>
        </div>
      ) : null}

      {/* Filters */}
      <section
        className="sticky top-0 z-20 -mx-1 rounded-xl border border-zinc-200 bg-zinc-50/95 px-3 py-2 shadow-sm backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/90"
        aria-label="Filters"
      >
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setFiltersOpen((o) => !o)}
            className="rounded-md border border-zinc-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-zinc-800 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
          >
            Filters {filtersOpen ? "▴" : "▾"}
          </button>
          {pending ? <span className="text-[11px] text-zinc-500">Updating…</span> : null}
          <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
            {snapshot.totalTraces} runs · {snapshot.distinctMissions} projects · {snapshot.distinctAgents} LiNKbots
          </span>
        </div>

        {filtersOpen ? (
          <div className="mt-3 space-y-4">
            <div className="grid max-h-[min(50vh,14rem)] gap-3 overflow-y-auto sm:grid-cols-2 lg:grid-cols-3">
              <label className="flex flex-col text-xs font-medium text-zinc-600 dark:text-zinc-400">
                Time range
                <select
                  className="mt-1 rounded-lg border border-zinc-200 bg-white px-2 py-1.5 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                  value={String(days)}
                  disabled={pending}
                  onChange={(e) => setDays(Number(e.target.value) as RangeDays)}
                >
                  <option value="1">Last 24 hours</option>
                  <option value="7">Last 7 days</option>
                  <option value="30">Last 30 days</option>
                </select>
              </label>
              <label className="flex flex-col text-xs font-medium text-zinc-600 dark:text-zinc-400">
                Project
                <select
                  className="mt-1 rounded-lg border border-zinc-200 bg-white px-2 py-1.5 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                  value={mission}
                  disabled={pending}
                  onChange={(e) => setMission(e.target.value)}
                >
                  {props.missions.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col text-xs font-medium text-zinc-600 dark:text-zinc-400">
                LiNKbot
                <select
                  className="mt-1 rounded-lg border border-zinc-200 bg-white px-2 py-1.5 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                  value={agent}
                  disabled={pending}
                  onChange={(e) => setAgent(e.target.value)}
                >
                  {props.agents.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col text-xs font-medium text-zinc-600 dark:text-zinc-400">
                Model contains
                <select
                  className="mt-1 rounded-lg border border-zinc-200 bg-white px-2 py-1.5 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                  value={modelContains}
                  disabled={pending}
                  onChange={(e) => setModelContains(e.target.value)}
                >
                  <option value="">All models</option>
                  {modelOptions
                    .filter(Boolean)
                    .map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                </select>
              </label>
              <label className="flex flex-col text-xs font-medium text-zinc-600 dark:text-zinc-400">
                Project title contains
                <input
                  type="search"
                  placeholder="Substring match"
                  className="mt-1 rounded-lg border border-zinc-200 bg-white px-2 py-1.5 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                  value={missionTitleContains}
                  disabled={pending}
                  onChange={(e) => setMissionTitleContains(e.target.value)}
                />
              </label>
              <label className="flex flex-col text-xs font-medium text-zinc-600 dark:text-zinc-400">
                Run status
                <select
                  className="mt-1 rounded-lg border border-zinc-200 bg-white px-2 py-1.5 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                  value={traceStatus}
                  disabled={pending}
                  onChange={(e) => setTraceStatus(e.target.value as TraceStatusFilter)}
                >
                  <option value="all">All</option>
                  <option value="success">Success-like (hide errors)</option>
                  <option value="errors">Errors only</option>
                </select>
              </label>
              <label className="flex min-w-[12rem] flex-col text-xs font-medium text-zinc-600 dark:text-zinc-400 sm:col-span-2 lg:col-span-3">
                Event type contains
                <input
                  type="search"
                  placeholder="Filter by event text"
                  className="mt-1 rounded-lg border border-zinc-200 bg-white px-2 py-1.5 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                  value={eventTypeContains}
                  disabled={pending}
                  onChange={(e) => setEventTypeContains(e.target.value)}
                />
              </label>
            </div>
            <div className="rounded-lg border border-dashed border-zinc-300 bg-white/60 p-3 dark:border-zinc-700 dark:bg-zinc-900/30">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Scope (coming soon)</p>
              <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
                {["Module", "Project type", "Workflow", "Issue", "Automation"].map((label) => (
                  <label key={label} className="flex flex-col text-xs text-zinc-500 dark:text-zinc-400">
                    {label}
                    <select disabled className="mt-1 cursor-not-allowed rounded-lg border border-zinc-200 bg-zinc-100 px-2 py-1.5 text-sm opacity-70 dark:border-zinc-700 dark:bg-zinc-900">
                      <option>All</option>
                    </select>
                  </label>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </section>

      <nav className={TABS.row} aria-label="Metrics views">
        {viewTabs.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={viewTab === t.id}
            onClick={() => setViewTab(t.id)}
            className={screenTabLinkClass(viewTab === t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <KpiCardGrid cards={kpiCards} viewLabel={KPI_VIEW_LABELS[viewTab].title} viewQuestion={KPI_VIEW_LABELS[viewTab].question} />

      {viewTab === "cost" ? (
        <section className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Runs / day</p>
              {snapshot.tracesByDay.length === 0 ? (
                <p className="mt-4 text-sm text-zinc-500">No data.</p>
              ) : (
                <DailyCountBars rows={snapshot.tracesByDay} colorClass="bg-violet-500/90 dark:bg-violet-400/90" label="Run count" />
              )}
            </div>
            <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Tokens / day</p>
              {snapshot.tokensByDay.length === 0 ? (
                <p className="mt-4 text-sm text-zinc-500">No token fields in this window.</p>
              ) : (
                <DailyCountBars
                  rows={snapshot.tokensByDay.map((d) => ({ day: d.day, count: d.tokens }))}
                  colorClass="bg-emerald-500/90 dark:bg-emerald-400/90"
                  label="Estimated tokens from payloads"
                />
              )}
            </div>
            <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Cost / day</p>
              {snapshot.costByDay.length === 0 ? (
                <p className="mt-4 text-sm text-zinc-500">No cost data in this window.</p>
              ) : (
                <DailyFloatBars rows={snapshot.costByDay} label="Reported spend" />
              )}
            </div>
          </div>
          <RankedCostTable
            title="Cost · tokens · runs by project"
            rows={snapshot.costByMission}
            emptyHint="No project linkage in this window."
          />
        </section>
      ) : null}

      {viewTab === "performance" ? (
        <section className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Runs / day</p>
              {snapshot.tracesByDay.length === 0 ? (
                <p className="mt-4 text-sm text-zinc-500">No data.</p>
              ) : (
                <DailyCountBars rows={snapshot.tracesByDay} colorClass="bg-violet-500/90 dark:bg-violet-400/90" label="Run count" />
              )}
            </div>
            <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Tokens / day</p>
              {snapshot.tokensByDay.length === 0 ? (
                <p className="mt-4 text-sm text-zinc-500">No token fields in this window.</p>
              ) : (
                <DailyCountBars
                  rows={snapshot.tokensByDay.map((d) => ({ day: d.day, count: d.tokens }))}
                  colorClass="bg-emerald-500/90 dark:bg-emerald-400/90"
                  label="Estimated tokens from payloads"
                />
              )}
            </div>
            <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Cost / day</p>
              {snapshot.costByDay.length === 0 ? (
                <p className="mt-4 text-sm text-zinc-500">No cost data in this window.</p>
              ) : (
                <DailyFloatBars rows={snapshot.costByDay} label="Reported spend" />
              )}
            </div>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <RankedCostTable title="Usage by LiNKbot" rows={snapshot.costByAgent} emptyHint="No LiNKbot linkage in this window." />
            <RankedCostTable title="Usage by model" rows={snapshot.costByModel} emptyHint="No model metadata on runs in this window." />
          </div>
        </section>
      ) : null}

      {viewTab === "reliability" ? (
        <section className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Failure-oriented events</p>
              {failureSlices.length === 0 ? (
                <p className="mt-4 text-sm text-zinc-500">No error-shaped top event types.</p>
              ) : (
                <EventTypeBars slices={failureSlices} />
              )}
            </div>
            <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Error bucket</p>
              <CategoryBars rows={snapshot.observabilityCategories.filter((c) => c.id === "error")} />
            </div>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Tool / MCP events</p>
              {toolSlices.length === 0 ? (
                <p className="mt-4 text-sm text-zinc-500">No tool-shaped event types in this window.</p>
              ) : (
                <EventTypeBars slices={toolSlices} />
              )}
            </div>
            <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Top event types</p>
              {snapshot.eventTypeSlices.length === 0 ? (
                <p className="mt-4 text-sm text-zinc-500">No data.</p>
              ) : (
                <EventTypeBars slices={snapshot.eventTypeSlices.slice(0, 10)} />
              )}
            </div>
          </div>
        </section>
      ) : null}

      <RecentRunsTable snapshot={snapshot} />
    </div>
  );
}
