"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";

import { fetchMetricsSnapshot, type MetricsSnapshot } from "@/app/(shell)/metrics/actions";
import type { NamedAmount } from "@/lib/metrics-snapshot";
import { screenTabLinkClass, TABS } from "@/lib/ui-standards";

export type MetricsFilterOption = { id: string; label: string };

type RangeDays = 1 | 7 | 30;
type MetricsGroupTab = "health" | "cost" | "usage";
type TraceStatusFilter = "all" | "success" | "errors";

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
                {formatUsd(r.cost)} · {formatTokens(r.tokens)} AI usage units · {r.traces} runs
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
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [groupTab, setGroupTab] = useState<MetricsGroupTab>("health");
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

  const groupTabs: { id: MetricsGroupTab; label: string }[] = [
    { id: "health", label: "Health" },
    { id: "cost", label: "Cost" },
    { id: "usage", label: "Usage" },
  ];

  const kb = snapshot.kpiBase;
  const runs = snapshot.totalTraces;
  const successRatePct = runs > 0 ? (kb.successTraceEstimate / runs) * 100 : null;

  const loadIssue = props.loadError || refreshError;

  return (
    <div className="space-y-6">
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
      <section aria-label="Summary" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Total cost</p>
          <p className="mt-2 text-2xl font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">{formatUsd(snapshot.totalCostUsd)}</p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Success rate</p>
          <p className="mt-2 text-2xl font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">
            {successRatePct != null ? `${successRatePct.toFixed(1)}%` : "—"}
          </p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Runs</p>
          <p className="mt-2 text-2xl font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">{runs}</p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Failures</p>
          <p className="mt-2 text-2xl font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">{snapshot.errorEvents}</p>
        </div>
      </section>

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
        </div>

        {filtersOpen ? (
          <div className="mt-3 grid max-h-[min(50vh,14rem)] gap-3 overflow-y-auto sm:grid-cols-2 lg:grid-cols-3">
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
        ) : null}
      </section>

      {/* 3. Grouped metrics */}
      <nav className={TABS.row} aria-label="Metrics groups">
        {groupTabs.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={groupTab === t.id}
            onClick={() => setGroupTab(t.id)}
            className={screenTabLinkClass(groupTab === t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {groupTab === "cost" ? (
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
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">AI usage / day</p>
              {snapshot.tokensByDay.length === 0 ? (
                <p className="mt-4 text-sm text-zinc-500">No usage fields in this window.</p>
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
            title="Cost · AI usage · runs by project"
            rows={snapshot.costByMission}
            emptyHint="No project linkage in this window."
          />
        </section>
      ) : null}

      {groupTab === "usage" ? (
        <section className="space-y-6">
          <div className="space-y-3">
            <RankedCostTable
              title="Cost · AI usage · runs by LiNKbot"
              rows={snapshot.costByAgent}
              emptyHint="No LiNKbot linkage in this window."
            />
          </div>
          <div className="space-y-3">
            <RankedCostTable
              title="Cost · AI usage · runs by model"
              rows={snapshot.costByModel}
              emptyHint="No model metadata on runs in this window."
            />
          </div>
          <div className="space-y-3">
            {toolSlices.length === 0 ? (
              <p className="text-sm text-zinc-500">No matching event types in this window.</p>
            ) : (
              <EventTypeBars slices={toolSlices} />
            )}
          </div>
        </section>
      ) : null}

      {groupTab === "health" ? (
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
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Workload mix</p>
              <CategoryBars rows={snapshot.observabilityCategories} />
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
    </div>
  );
}
