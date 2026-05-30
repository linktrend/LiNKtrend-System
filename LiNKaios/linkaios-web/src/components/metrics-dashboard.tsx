"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";

import { fetchMetricsSnapshot, type MetricsSnapshot } from "@/app/(shell)/metrics/actions";
import { InsetSelect } from "@/components/forms";
import { useAppSurface } from "@/components/app-surface-provider";
import { RecentRunsTable } from "@/components/metrics-recent-runs-table";
import type { NamedAmount } from "@/lib/metrics-snapshot";
import {
  buildKpiCards,
  KPI_VIEW_LABELS,
  type KpiViewId,
} from "@/lib/metrics-kpi-views";
import { metricsViewFromSearch } from "@/lib/metrics-nav";
import { buildLicensorCostKpiCards, LICENSOR_COST_VIEW_QUESTION } from "@/lib/metrics-licensor-kpi-views";
import { MetricsKpiSummaryGrid, SummaryMetricCardSection } from "@/components/summary-metric-card";
import {
  DEFAULT_METRICS_SCOPE,
  DEMO_METRICS_SCOPE_OPTIONS,
  type MetricsFilterOption,
  type MetricsScopeState,
} from "@/lib/metrics-scope-filters";
import { METRICS_ACTIVITY_CATEGORY_OPTIONS, type MetricsActivityCategory } from "@/lib/metrics-filters";
import { demoMetricsSnapshotFiltered } from "@/lib/ui-mocks/metrics-demo-snapshot";
import { DomainStatusPill } from "@/components/ui/status-pill";
import { formatMetricsCardTitle, screenTabLinkClass, TABLE, TABS, FIELD, FORM } from "@/lib/ui-standards";

export type { MetricsFilterOption } from "@/lib/metrics-scope-filters";

type RangeDays = 1 | 7 | 30;

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

const CHART_COLORS = ["bg-violet-500", "bg-sky-500", "bg-emerald-500", "bg-amber-500", "bg-rose-500", "bg-indigo-500"];

const METRICS_SECTION_TITLE = "text-xs font-semibold text-zinc-500 dark:text-zinc-400";

function MetricsSectionTitle(props: { children: string }) {
  return <p className={METRICS_SECTION_TITLE}>{formatMetricsCardTitle(props.children)}</p>;
}

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
  const title = formatMetricsCardTitle(props.title);
  if (props.rows.length === 0) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
        <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">{title}</p>
        <p className="mt-3 text-sm text-zinc-500">{props.emptyHint}</p>
      </div>
    );
  }
  const maxCost = Math.max(...props.rows.map((r) => r.cost), 1e-12);
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">{title}</p>
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

function SkillToolBreakdown(props: { snapshot: MetricsSnapshot }) {
  const hasSkill = props.snapshot.costBySkill.length > 0;
  const hasTool = props.snapshot.costByTool.length > 0;
  if (!hasSkill && !hasTool) {
    return (
      <section
        aria-label="Skill and tool usage"
        className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50/80 p-6 text-sm text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900/40 dark:text-zinc-400"
      >
        No skill or tool identifiers in run payloads for this window. Scope filters and trace enrichment will populate
        these tables as LinkSkills and capabilities emit structured metadata.
      </section>
    );
  }
  return (
    <section aria-label="Skill and tool usage" className="space-y-3">
      <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Skill &amp; tool breakdown</h2>
      <div className="grid gap-4 lg:grid-cols-2">
        <RankedCostTable
          title="Usage by skill"
          rows={props.snapshot.costBySkill}
          emptyHint="No skill_id on runs in this window."
        />
        <RankedCostTable
          title="Usage by tool"
          rows={props.snapshot.costByTool}
          emptyHint="No tool_name on runs in this window."
        />
      </div>
    </section>
  );
}

function ScopeFilterSelect(props: {
  label: string;
  value: string;
  options: MetricsFilterOption[];
  disabled?: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <label className={FORM.fieldStack}>
      <span className={`${FIELD.label} text-xs text-zinc-600 dark:text-zinc-400`}>{props.label}</span>
      <InsetSelect
        compact
        value={props.value}
        disabled={props.disabled}
        onChange={(e) => props.onChange(e.target.value)}
      >
        {props.options.map((o) => (
          <option key={o.id} value={o.id}>
            {o.label}
          </option>
        ))}
      </InsetSelect>
    </label>
  );
}

export function MetricsDashboard(props: {
  initialSnapshot: MetricsSnapshot;
  loadError?: string | null;
  agents: MetricsFilterOption[];
  missions: MetricsFilterOption[];
  demoMode?: boolean;
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isAdmin } = useAppSurface();
  const viewFromUrl = metricsViewFromSearch(searchParams.toString());
  const [pending, startTransition] = useTransition();
  const [snapshot, setSnapshot] = useState<MetricsSnapshot>(props.initialSnapshot);
  const [days, setDays] = useState<RangeDays>(30);
  const [agent, setAgent] = useState("all");
  const [mission, setMission] = useState("all");
  const [modelContains, setModelContains] = useState("");
  const [missionTitleContains, setMissionTitleContains] = useState("");
  const [activityCategory, setActivityCategory] = useState<MetricsActivityCategory>("all");
  const [scope, setScope] = useState<MetricsScopeState>(DEFAULT_METRICS_SCOPE);
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [viewTab, setViewTab] = useState<KpiViewId>(viewFromUrl);
  const [refreshError, setRefreshError] = useState<string | null>(null);
  const skipFetchOnce = useRef(false);

  useEffect(() => {
    setViewTab(viewFromUrl);
  }, [viewFromUrl]);

  const selectView = useCallback(
    (view: KpiViewId) => {
      setViewTab(view);
      const params = new URLSearchParams(searchParams.toString());
      if (view === "cost") {
        params.delete("view");
      } else {
        params.set("view", view);
      }
      const qs = params.toString();
      router.replace(qs ? `/metrics?${qs}` : "/metrics", { scroll: false });
    },
    [router, searchParams],
  );

  const runFetch = useCallback(() => {
    if (props.demoMode) {
      setRefreshError(null);
      setSnapshot(
        demoMetricsSnapshotFiltered({
          scope,
          days,
          missionId: mission === "all" ? null : mission,
          agentId: agent === "all" ? null : agent,
          modelContains: modelContains.trim() || null,
          missionTitleContains: missionTitleContains.trim() || null,
          activityCategory,
        }),
      );
      return;
    }
    startTransition(() => {
      void (async () => {
        const r = await fetchMetricsSnapshot({
          days,
          missionId: mission === "all" ? null : mission,
          agentId: agent === "all" ? null : agent,
          modelContains: modelContains.trim() || null,
          missionTitleContains: missionTitleContains.trim() || null,
          activityCategory,
          scope,
        });
        if (!r.ok) {
          setRefreshError(r.error ?? "Metrics could not be refreshed.");
          return;
        }
        setRefreshError(null);
        setSnapshot(r.data);
      })();
    });
  }, [days, agent, mission, modelContains, missionTitleContains, activityCategory, scope, props.demoMode]);

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

  const kpiCards = useMemo(() => {
    if (isAdmin && viewTab === "cost") return buildLicensorCostKpiCards(snapshot);
    return buildKpiCards(viewTab, snapshot);
  }, [isAdmin, viewTab, snapshot]);

  const kpiQuestion =
    isAdmin && viewTab === "cost" ? LICENSOR_COST_VIEW_QUESTION : KPI_VIEW_LABELS[viewTab].question;

  const viewTabs: { id: KpiViewId; label: string }[] = [
    { id: "cost", label: "Cost" },
    { id: "performance", label: "Performance" },
    { id: "reliability", label: "Reliability" },
  ];

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
          <div className="mt-3 space-y-4">
            <div className="grid max-h-[min(50vh,14rem)] gap-3 overflow-y-auto sm:grid-cols-2 lg:grid-cols-3">
              <ScopeFilterSelect
                label="Time range"
                value={String(days)}
                disabled={pending}
                options={[
                  { id: "1", label: "Last 24 hours" },
                  { id: "7", label: "Last 7 days" },
                  { id: "30", label: "Last 30 days" },
                ]}
                onChange={(v) => setDays(Number(v) as RangeDays)}
              />
              <ScopeFilterSelect
                label="Project"
                value={mission}
                disabled={pending}
                options={props.missions}
                onChange={setMission}
              />
              <ScopeFilterSelect
                label="LiNKbot"
                value={agent}
                disabled={pending}
                options={props.agents}
                onChange={setAgent}
              />
              <ScopeFilterSelect
                label="Model"
                value={modelContains}
                disabled={pending}
                options={[
                  { id: "", label: "All" },
                  ...modelOptions.filter(Boolean).map((m) => ({ id: m, label: m })),
                ]}
                onChange={setModelContains}
              />
              <label className={`flex flex-col ${FORM.fieldStack}`}>
                <span className={`${FIELD.label} text-xs text-zinc-600 dark:text-zinc-400`}>Project title contains</span>
                <input
                  type="search"
                  placeholder="Substring match"
                  className="rounded-lg border border-zinc-200 bg-white px-2 py-1.5 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                  value={missionTitleContains}
                  disabled={pending}
                  onChange={(e) => setMissionTitleContains(e.target.value)}
                />
              </label>
              <ScopeFilterSelect
                label="Activity type"
                value={activityCategory}
                disabled={pending}
                options={METRICS_ACTIVITY_CATEGORY_OPTIONS}
                onChange={(v) => setActivityCategory(v as MetricsActivityCategory)}
              />
            </div>
            <div className="rounded-lg border border-dashed border-zinc-300 bg-white/60 p-3 dark:border-zinc-700 dark:bg-zinc-900/30">
              <p className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
                Scope
                {props.demoMode ? (
                  <span className="ml-2 font-normal normal-case text-zinc-400">· mock dimensions active</span>
                ) : (
                  <span className="ml-2 font-normal normal-case text-zinc-400">· filters payload metadata when present</span>
                )}
              </p>
              <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                <ScopeFilterSelect
                  label="Suite"
                  value={scope.suite}
                  options={DEMO_METRICS_SCOPE_OPTIONS.suite}
                  disabled={pending}
                  onChange={(suite) => setScope((s) => ({ ...s, suite }))}
                />
                <ScopeFilterSelect
                  label="Module"
                  value={scope.module}
                  options={DEMO_METRICS_SCOPE_OPTIONS.module}
                  disabled={pending}
                  onChange={(module) => setScope((s) => ({ ...s, module }))}
                />
                <ScopeFilterSelect
                  label="Phase"
                  value={scope.phase}
                  options={DEMO_METRICS_SCOPE_OPTIONS.phase}
                  disabled={pending}
                  onChange={(phase) => setScope((s) => ({ ...s, phase }))}
                />
                <ScopeFilterSelect
                  label="Issue"
                  value={scope.issue}
                  options={DEMO_METRICS_SCOPE_OPTIONS.issue}
                  disabled={pending}
                  onChange={(issue) => setScope((s) => ({ ...s, issue }))}
                />
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
            onClick={() => selectView(t.id)}
            className={screenTabLinkClass(viewTab === t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <SummaryMetricCardSection
        title={KPI_VIEW_LABELS[viewTab].title}
        sentenceTitle
        aria-label={`${KPI_VIEW_LABELS[viewTab].title} KPIs`}
      >
        <p className="mb-3 text-sm text-zinc-600 dark:text-zinc-400">{kpiQuestion}</p>
        <MetricsKpiSummaryGrid cards={kpiCards} />
      </SummaryMetricCardSection>

      <SkillToolBreakdown snapshot={snapshot} />

      {viewTab === "cost" ? (
        <section className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
              <MetricsSectionTitle>Runs / day</MetricsSectionTitle>
              {snapshot.tracesByDay.length === 0 ? (
                <p className="mt-4 text-sm text-zinc-500">No data.</p>
              ) : (
                <DailyCountBars rows={snapshot.tracesByDay} colorClass="bg-violet-500/90 dark:bg-violet-400/90" label="Run count" />
              )}
            </div>
            <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
              <MetricsSectionTitle>Tokens / day</MetricsSectionTitle>
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
              <MetricsSectionTitle>Cost / day</MetricsSectionTitle>
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
              <MetricsSectionTitle>Runs / day</MetricsSectionTitle>
              {snapshot.tracesByDay.length === 0 ? (
                <p className="mt-4 text-sm text-zinc-500">No data.</p>
              ) : (
                <DailyCountBars rows={snapshot.tracesByDay} colorClass="bg-violet-500/90 dark:bg-violet-400/90" label="Run count" />
              )}
            </div>
            <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
              <MetricsSectionTitle>Tokens / day</MetricsSectionTitle>
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
              <MetricsSectionTitle>Cost / day</MetricsSectionTitle>
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
              <MetricsSectionTitle>Failure-oriented events</MetricsSectionTitle>
              {failureSlices.length === 0 ? (
                <p className="mt-4 text-sm text-zinc-500">No error-shaped top event types.</p>
              ) : (
                <EventTypeBars slices={failureSlices} />
              )}
            </div>
            <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
              <MetricsSectionTitle>Error bucket</MetricsSectionTitle>
              <CategoryBars rows={snapshot.observabilityCategories.filter((c) => c.id === "error")} />
            </div>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
              <MetricsSectionTitle>Tool / MCP events</MetricsSectionTitle>
              {toolSlices.length === 0 ? (
                <p className="mt-4 text-sm text-zinc-500">No tool-shaped event types in this window.</p>
              ) : (
                <EventTypeBars slices={toolSlices} />
              )}
            </div>
            <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
              <MetricsSectionTitle>Top event types</MetricsSectionTitle>
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
