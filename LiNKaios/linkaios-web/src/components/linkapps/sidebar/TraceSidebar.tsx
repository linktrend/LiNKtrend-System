"use client";

import { useState, useCallback } from "react";
import { Activity, Filter } from "lucide-react";

import type { TraceFilter, TraceSidebarState } from "@/lib/suite-integrations/linkapps/types/trace";
import { MOCK_TRACE_LIST_ITEMS, MOCK_TRACE_METRICS } from "@/lib/suite-integrations/linkapps/trace-fixtures";

import { TraceFilterPanel } from "./TraceFilterPanel";
import { TraceSummaryList } from "./TraceSummaryList";
import { TraceMetricCard } from "./TraceMetricCard";

export type TraceSidebarProps = {
  /** Initial filter state */
  initialFilter?: TraceFilter;
  /** Callback when filter changes */
  onFilterChange?: (filter: TraceFilter) => void;
  /** Callback when trace is selected */
  onTraceSelect?: (traceId: string) => void;
  /** Selected trace ID (controlled) */
  selectedTraceId?: string | null;
};

export function TraceSidebar(props: TraceSidebarProps) {
  const { initialFilter, onFilterChange, onTraceSelect, selectedTraceId: controlledSelectedId } = props;

  const [state, setState] = useState<TraceSidebarState>({
    filter: initialFilter ?? {},
    selectedTraceId: controlledSelectedId ?? null,
    isLoading: false,
    error: null,
  });

  const [showFilters, setShowFilters] = useState(true);

  const handleFilterChange = useCallback(
    (filter: TraceFilter) => {
      setState((prev) => ({ ...prev, filter }));
      onFilterChange?.(filter);
    },
    [onFilterChange],
  );

  const handleTraceSelect = useCallback(
    (traceId: string) => {
      setState((prev) => ({ ...prev, selectedTraceId: traceId }));
      onTraceSelect?.(traceId);
    },
    [onTraceSelect],
  );

  return (
    <aside
      className="flex h-full w-80 shrink-0 flex-col overflow-hidden border-r border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950"
      aria-label="Trace sidebar"
    >
      {/* Header */}
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-zinc-200 px-4 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-sky-600 dark:text-sky-400" aria-hidden />
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Traces</h2>
        </div>
        <button
          type="button"
          onClick={() => setShowFilters((s) => !s)}
          className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
          aria-expanded={showFilters}
          aria-controls="trace-filters"
        >
          <Filter className="h-3.5 w-3.5" aria-hidden />
          {showFilters ? "Hide" : "Show"}
        </button>
      </div>

      {/* Metrics row */}
      <div className="grid grid-cols-2 gap-2 border-b border-zinc-200 p-3 dark:border-zinc-800">
        {MOCK_TRACE_METRICS.slice(0, 4).map((metric) => (
          <TraceMetricCard key={metric.label} metric={metric} compact />
        ))}
      </div>

      {/* Filter panel */}
      {showFilters ? (
        <div id="trace-filters" className="shrink-0 border-b border-zinc-200 dark:border-zinc-800">
          <TraceFilterPanel filter={state.filter} onChange={handleFilterChange} />
        </div>
      ) : null}

      {/* Trace list */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        <TraceSummaryList
          items={MOCK_TRACE_LIST_ITEMS}
          selectedId={state.selectedTraceId}
          onSelect={handleTraceSelect}
        />
      </div>

      {/* Footer */}
      <div className="shrink-0 border-t border-zinc-200 bg-zinc-50/80 px-3 py-2 text-xs text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/40 dark:text-zinc-400">
        {MOCK_TRACE_LIST_ITEMS.length} traces · Fixture data only
      </div>
    </aside>
  );
}
