"use client";

import { CheckCircle2, XCircle, AlertCircle, Loader2, MinusCircle } from "lucide-react";

import type { TraceListItem, TraceOutcome } from "@/lib/suite-integrations/linkapps/types/trace";

export type TraceSummaryListProps = {
  /** List of trace items to display */
  items: TraceListItem[];
  /** Currently selected trace ID */
  selectedId: string | null;
  /** Callback when an item is selected */
  onSelect: (id: string) => void;
};

function outcomeIcon(outcome: TraceOutcome) {
  switch (outcome) {
    case "success":
      return <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" aria-hidden />;
    case "failure":
      return <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" aria-hidden />;
    case "partial":
      return <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" aria-hidden />;
    case "in_progress":
      return <Loader2 className="h-4 w-4 animate-spin text-sky-600 dark:text-sky-400" aria-hidden />;
    case "cancelled":
      return <MinusCircle className="h-4 w-4 text-zinc-500 dark:text-zinc-400" aria-hidden />;
    default:
      return <div className="h-4 w-4 rounded-full bg-zinc-300 dark:bg-zinc-600" aria-hidden />;
  }
}

function outcomeBadgeClass(outcome: TraceOutcome): string {
  const base = "inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium ";
  switch (outcome) {
    case "success":
      return base + "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200";
    case "failure":
      return base + "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200";
    case "partial":
      return base + "bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-100";
    case "in_progress":
      return base + "bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-200";
    case "cancelled":
      return base + "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300";
    default:
      return base + "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300";
  }
}

export function TraceSummaryList(props: TraceSummaryListProps) {
  const { items, selectedId, onSelect } = props;

  if (items.length === 0) {
    return (
      <div className="flex h-32 flex-col items-center justify-center px-4 text-center">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">No traces match the current filters.</p>
        <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">Try adjusting your filter criteria.</p>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-zinc-100 dark:divide-zinc-800" role="listbox" aria-label="Trace summaries">
      {items.map((item) => {
        const isSelected = selectedId === item.id;
        return (
          <li key={item.id} role="option" aria-selected={isSelected}>
            <button
              type="button"
              onClick={() => onSelect(item.id)}
              className={
                "flex w-full items-start gap-3 px-3 py-3 text-left transition-colors " +
                (isSelected
                  ? "bg-sky-50 dark:bg-sky-950/30"
                  : "hover:bg-zinc-50 dark:hover:bg-zinc-900/50")
              }
            >
              <div className="mt-0.5 shrink-0">{outcomeIcon(item.outcome)}</div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">{item.title}</p>
                  <span className="shrink-0 rounded-full bg-zinc-100 px-1.5 py-0.5 text-[10px] font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                    {item.count}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">{item.subtitle}</p>
                <div className="mt-2 flex items-center gap-2">
                  <span className={outcomeBadgeClass(item.outcome)}>{item.outcome.replace("_", " ")}</span>
                </div>
              </div>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
