"use client";

import { Activity, BarChart3, Clock, Filter, Layers, ArrowRight } from "lucide-react";

import type { TraceSummary, TraceFilter } from "@/lib/suite-integrations/linkapps/types/trace";
import {
  MOCK_TRACE_SUMMARIES,
  MOCK_TRACE_METRICS,
  MOCK_TRACE_QUERY_RESPONSE,
} from "@/lib/suite-integrations/linkapps/trace-fixtures";
import { TraceMetricCard } from "@/components/linkapps/sidebar/TraceMetricCard";
import { SummaryMetricCardGrid } from "@/components/summary-metric-card";

type TraceDetailRowProps = {
  label: string;
  value: string | number;
  unit?: string;
};

function TraceDetailRow(props: TraceDetailRowProps) {
  const { label, value, unit } = props;
  const displayValue = unit && typeof value === "number" ? `${value}${unit}` : value;

  return (
    <div className="flex items-center justify-between py-2 text-sm">
      <span className="text-zinc-500 dark:text-zinc-400">{label}</span>
      <span className="font-medium text-zinc-900 dark:text-zinc-100">{displayValue}</span>
    </div>
  );
}

function outcomeBadgeClass(outcome: TraceSummary["outcome"]): string {
  const base = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ";
  switch (outcome) {
    case "success":
      return base + "bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-900/20 dark:text-emerald-300 dark:ring-emerald-500/30";
    case "failure":
      return base + "bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-900/20 dark:text-red-300 dark:ring-red-500/30";
    case "partial":
      return base + "bg-amber-50 text-amber-800 ring-amber-600/20 dark:bg-amber-900/20 dark:text-amber-200 dark:ring-amber-500/30";
    case "in_progress":
      return base + "bg-sky-50 text-sky-700 ring-sky-600/20 dark:bg-sky-900/20 dark:text-sky-300 dark:ring-sky-500/30";
    case "cancelled":
      return base + "bg-zinc-100 text-zinc-700 ring-zinc-500/20 dark:bg-zinc-800 dark:text-zinc-300 dark:ring-zinc-600/30";
    default:
      return base + "bg-zinc-100 text-zinc-700 ring-zinc-500/20 dark:bg-zinc-800 dark:text-zinc-300 dark:ring-zinc-600/30";
  }
}

export type TracePanelProps = {
  /** Selected trace summary to display (optional) */
  selectedTrace?: TraceSummary | null;
  /** Current filter state */
  filter?: TraceFilter;
};

export function TracePanel(props: TracePanelProps) {
  const { selectedTrace, filter } = props;

  // Use first mock trace as default if none selected
  const trace = selectedTrace ?? MOCK_TRACE_SUMMARIES[0]!;
  const hasSelection = !!selectedTrace;

  return (
    <div className="space-y-6">
      {/* Header */}
      <section
        className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
        aria-label="Trace overview"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-50 dark:bg-sky-900/20">
              <Activity className="h-5 w-5 text-sky-600 dark:text-sky-400" aria-hidden />
            </div>
            <div>
              <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">Trace Details</h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {hasSelection ? "Selected trace aggregation" : "Default trace view (fixture data)"}
              </p>
            </div>
          </div>
          <span className={outcomeBadgeClass(trace.outcome)}>{trace.outcome.replace("_", " ")}</span>
        </div>
      </section>

      {/* Metrics grid */}
      <section aria-label="Trace metrics">
        <SummaryMetricCardGrid className="gap-4">
          {MOCK_TRACE_METRICS.map((metric) => (
            <TraceMetricCard key={metric.label} metric={metric} />
          ))}
        </SummaryMetricCardGrid>
      </section>

      {/* Selected trace details */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Trace details card */}
        <section
          className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
          aria-label="Selected trace details"
        >
          <h3 className="flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            <Layers className="h-4 w-4 text-zinc-500" aria-hidden />
            Aggregation Details
          </h3>
          <div className="mt-4 divide-y divide-zinc-100 dark:divide-zinc-800">
            <TraceDetailRow label="Aggregation Job ID" value={trace.aggregationJobId} />
            <TraceDetailRow label="Schema Version" value={trace.schemaVersion} />
            <TraceDetailRow label="Vertical" value={trace.verticalKey} />
            <TraceDetailRow label="Stage" value={trace.stageSlug} />
            <TraceDetailRow label="Outcome" value={trace.outcome} />
          </div>
        </section>

        {/* Temporal details card */}
        <section
          className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
          aria-label="Temporal details"
        >
          <h3 className="flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            <Clock className="h-4 w-4 text-zinc-500" aria-hidden />
            Time Window
          </h3>
          <div className="mt-4 divide-y divide-zinc-100 dark:divide-zinc-800">
            <TraceDetailRow label="Bucket Start" value={new Date(trace.bucketStart).toLocaleString()} />
            <TraceDetailRow label="Bucket End" value={new Date(trace.bucketEnd).toLocaleString()} />
            <TraceDetailRow label="Trace Count" value={trace.count} />
          </div>
        </section>

        {/* Statistics card */}
        <section
          className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
          aria-label="Statistics"
        >
          <h3 className="flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            <BarChart3 className="h-4 w-4 text-zinc-500" aria-hidden />
            Performance Metrics
          </h3>
          <div className="mt-4 divide-y divide-zinc-100 dark:divide-zinc-800">
            <TraceDetailRow label="Average Duration" value={Math.round(trace.avgDurationMs)} unit="ms" />
            <TraceDetailRow label="P95 Latency" value={Math.round(trace.p95LatencyMs)} unit="ms" />
            <TraceDetailRow label="Failure Rate" value={(trace.failureRate * 100).toFixed(1)} unit="%" />
          </div>
        </section>

        {/* Active filters card */}
        <section
          className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
          aria-label="Active filters"
        >
          <h3 className="flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            <Filter className="h-4 w-4 text-zinc-500" aria-hidden />
            Applied Filters
          </h3>
          <div className="mt-4">
            {filter && Object.keys(filter).length > 0 ? (
              <div className="space-y-2">
                {filter.verticalKeys?.length ? (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-zinc-500 dark:text-zinc-400">Verticals:</span>
                    <span className="font-medium text-zinc-900 dark:text-zinc-100">
                      {filter.verticalKeys.join(", ")}
                    </span>
                  </div>
                ) : null}
                {filter.stageSlugs?.length ? (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-zinc-500 dark:text-zinc-400">Stages:</span>
                    <span className="font-medium text-zinc-900 dark:text-zinc-100">
                      {filter.stageSlugs.join(", ")}
                    </span>
                  </div>
                ) : null}
                {filter.outcomes?.length ? (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-zinc-500 dark:text-zinc-400">Outcomes:</span>
                    <span className="font-medium text-zinc-900 dark:text-zinc-100">
                      {filter.outcomes.join(", ")}
                    </span>
                  </div>
                ) : null}
                {filter.bucket ? (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-zinc-500 dark:text-zinc-400">Bucket:</span>
                    <span className="font-medium text-zinc-900 dark:text-zinc-100">{filter.bucket}</span>
                  </div>
                ) : null}
              </div>
            ) : (
              <p className="text-sm text-zinc-500 dark:text-zinc-400">No active filters.</p>
            )}
          </div>
        </section>
      </div>

      {/* Response metadata */}
      <section
        className="rounded-lg border border-zinc-200 bg-zinc-50/50 p-3 dark:border-zinc-800 dark:bg-zinc-900/30"
        aria-label="Response metadata"
      >
        <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
          <span>Schema version: {MOCK_TRACE_QUERY_RESPONSE.schemaVersion}</span>
          <span>Total traces: {MOCK_TRACE_QUERY_RESPONSE.totalCount}</span>
        </div>
      </section>

      {/* Integration hint */}
      <div className="rounded-lg border border-dashed border-zinc-300 bg-zinc-50/50 p-4 dark:border-zinc-700 dark:bg-zinc-900/30">
        <p className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400">
          <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          This panel displays privacy-safe trace aggregates per WP-116. No tenant IDs, PII, or customer data is shown.
        </p>
      </div>
    </div>
  );
}
