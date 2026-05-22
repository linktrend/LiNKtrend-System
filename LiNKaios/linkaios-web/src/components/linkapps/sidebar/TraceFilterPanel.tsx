"use client";

import { useCallback } from "react";
import { Calendar, Layers, X } from "lucide-react";

import type { TraceFilter, VerticalKey, StageSlug, TraceOutcome, TimeBucket } from "@/lib/plugins/linkapps/types/trace";
import {
  VERTICAL_OPTIONS,
  STAGE_OPTIONS,
  OUTCOME_OPTIONS,
} from "@/lib/plugins/linkapps/trace-fixtures";

export type TraceFilterPanelProps = {
  /** Current filter state */
  filter: TraceFilter;
  /** Callback when filter changes */
  onChange: (filter: TraceFilter) => void;
};

export function TraceFilterPanel(props: TraceFilterPanelProps) {
  const { filter, onChange } = props;

  const toggleVertical = useCallback(
    (key: VerticalKey) => {
      const current = filter.verticalKeys ?? [];
      const next = current.includes(key) ? current.filter((k) => k !== key) : [...current, key];
      onChange({ ...filter, verticalKeys: next.length ? next : undefined });
    },
    [filter, onChange],
  );

  const toggleStage = useCallback(
    (slug: StageSlug) => {
      const current = filter.stageSlugs ?? [];
      const next = current.includes(slug) ? current.filter((s) => s !== slug) : [...current, slug];
      onChange({ ...filter, stageSlugs: next.length ? next : undefined });
    },
    [filter, onChange],
  );

  const toggleOutcome = useCallback(
    (outcome: TraceOutcome) => {
      const current = filter.outcomes ?? [];
      const next = current.includes(outcome)
        ? current.filter((o) => o !== outcome)
        : [...current, outcome];
      onChange({ ...filter, outcomes: next.length ? next : undefined });
    },
    [filter, onChange],
  );

  const setBucket = useCallback(
    (bucket: TimeBucket) => {
      onChange({ ...filter, bucket });
    },
    [filter, onChange],
  );

  const clearAll = useCallback(() => {
    onChange({});
  }, [onChange]);

  const hasActiveFilters =
    (filter.verticalKeys?.length ?? 0) > 0 ||
    (filter.stageSlugs?.length ?? 0) > 0 ||
    (filter.outcomes?.length ?? 0) > 0;

  return (
    <div className="space-y-3 p-3">
      {/* Header with clear */}
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400">
          <Layers className="h-3.5 w-3.5" aria-hidden />
          Filters
        </span>
        {hasActiveFilters ? (
          <button
            type="button"
            onClick={clearAll}
            className="flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
          >
            <X className="h-3 w-3" aria-hidden />
            Clear
          </button>
        ) : null}
      </div>

      {/* Vertical filter */}
      <div className="space-y-1.5">
        <span className="text-[10px] font-medium text-zinc-500 dark:text-zinc-500">
          Vertical
        </span>
        <div className="flex flex-wrap gap-1">
          {VERTICAL_OPTIONS.map((opt) => {
            const active = filter.verticalKeys?.includes(opt.value);
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => toggleVertical(opt.value)}
                className={
                  "rounded px-2 py-1 text-[10px] font-medium transition-colors " +
                  (active
                    ? "bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-200"
                    : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700")
                }
                aria-pressed={active}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Stage filter */}
      <div className="space-y-1.5">
        <span className="text-[10px] font-medium text-zinc-500 dark:text-zinc-500">
          Stage
        </span>
        <div className="flex flex-wrap gap-1">
          {STAGE_OPTIONS.map((opt) => {
            const active = filter.stageSlugs?.includes(opt.value);
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => toggleStage(opt.value)}
                className={
                  "rounded px-2 py-1 text-[10px] font-medium transition-colors " +
                  (active
                    ? "bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-200"
                    : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700")
                }
                aria-pressed={active}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Outcome filter */}
      <div className="space-y-1.5">
        <span className="text-[10px] font-medium text-zinc-500 dark:text-zinc-500">
          Outcome
        </span>
        <div className="flex flex-wrap gap-1">
          {OUTCOME_OPTIONS.map((opt) => {
            const active = filter.outcomes?.includes(opt.value);
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => toggleOutcome(opt.value)}
                className={
                  "rounded px-2 py-1 text-[10px] font-medium transition-colors " +
                  (active
                    ? `bg-${opt.color}-100 text-${opt.color}-800 dark:bg-${opt.color}-900/40 dark:text-${opt.color}-200`
                    : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700")
                }
                aria-pressed={active}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Time bucket */}
      <div className="space-y-1.5">
        <span className="flex items-center gap-1 text-[10px] font-medium text-zinc-500 dark:text-zinc-500">
          <Calendar className="h-3 w-3" aria-hidden />
          Bucket
        </span>
        <div className="flex gap-1">
          {(["hour", "day", "week"] as TimeBucket[]).map((bucket) => {
            const active = filter.bucket === bucket;
            return (
              <button
                key={bucket}
                type="button"
                onClick={() => setBucket(bucket)}
                className={
                  "flex-1 rounded px-2 py-1 text-[10px] font-medium capitalize transition-colors " +
                  (active
                    ? "bg-zinc-800 text-white dark:bg-zinc-200 dark:text-zinc-900"
                    : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700")
                }
                aria-pressed={active}
              >
                {bucket}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
