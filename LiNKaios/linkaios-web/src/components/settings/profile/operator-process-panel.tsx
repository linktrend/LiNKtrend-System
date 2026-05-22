"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronRight, Search, X } from "lucide-react";

import type { ProcessCatalogCategory, ProcessCatalogGroup } from "@/lib/operator-process-catalog";
import {
  PROCESS_CATALOG_CATEGORIES,
  filterProcessCatalog,
} from "@/lib/operator-process-catalog";
import { InsetSelect } from "@/components/forms";
import { FIELD } from "@/lib/ui-standards";

type OperatorProcessPanelProps = {
  open: boolean;
  onClose: () => void;
  groups: ProcessCatalogGroup[];
  totalCount: number;
};

function CategorySection(props: { group: ProcessCatalogGroup; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(props.defaultOpen ?? false);

  return (
    <div className="border-b border-zinc-200/70 last:border-b-0 dark:border-zinc-800/70">
      <button
        type="button"
        className="flex w-full items-center justify-between gap-3 px-5 py-3 text-left transition hover:bg-zinc-50 dark:hover:bg-zinc-900/50"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
      >
        <span className="flex min-w-0 items-center gap-2">
          {open ? (
            <ChevronDown className="h-4 w-4 shrink-0 text-zinc-400" aria-hidden />
          ) : (
            <ChevronRight className="h-4 w-4 shrink-0 text-zinc-400" aria-hidden />
          )}
          <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{props.group.category}</span>
        </span>
        <span className="shrink-0 text-xs tabular-nums text-zinc-500 dark:text-zinc-400">
          {props.group.processes.length}
        </span>
      </button>
      {open ? (
        <ul className="space-y-0.5 px-5 pb-3">
          {props.group.processes.map((process) => (
            <li
              key={process.id}
              className="rounded-lg px-2 py-2 text-sm transition hover:bg-zinc-50 dark:hover:bg-zinc-900/40"
            >
              <p className="font-medium text-zinc-800 dark:text-zinc-200">{process.label}</p>
              {process.detail ? (
                <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">{process.detail}</p>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

export function OperatorProcessPanel(props: OperatorProcessPanelProps) {
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<ProcessCatalogCategory | "all">("all");

  const filteredGroups = useMemo(
    () => filterProcessCatalog(props.groups, query, categoryFilter),
    [props.groups, query, categoryFilter]
  );

  const visibleCount = useMemo(
    () => filteredGroups.reduce((sum, group) => sum + group.processes.length, 0),
    [filteredGroups]
  );

  useEffect(() => {
    if (!props.open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") props.onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [props.open, props.onClose]);

  useEffect(() => {
    if (!props.open) {
      setQuery("");
      setCategoryFilter("all");
    }
  }, [props.open]);

  if (!props.open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-label="Process directory">
      <button
        type="button"
        className="absolute inset-0 bg-zinc-900/20 backdrop-blur-[2px]"
        aria-label="Close process directory"
        onClick={props.onClose}
      />
      <aside className="relative flex h-full w-full max-w-md flex-col border-l border-zinc-200/80 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex items-start justify-between gap-3 border-b border-zinc-200/70 px-5 py-4 dark:border-zinc-800/70">
          <div>
            <h2 className="text-base font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
              Process directory
            </h2>
            <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
              {visibleCount} of {props.totalCount} processes
            </p>
          </div>
          <button
            type="button"
            className="rounded-lg p-2 text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-800 dark:hover:bg-zinc-900 dark:hover:text-zinc-200"
            aria-label="Close"
            onClick={props.onClose}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-3 border-b border-zinc-200/70 px-5 py-4 dark:border-zinc-800/70">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search processes…"
              className={`${FIELD.control} pl-9`}
            />
          </div>
          <InsetSelect
            fullWidth={false}
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value as ProcessCatalogCategory | "all")}
          >
            <option value="all">All categories</option>
            {PROCESS_CATALOG_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </InsetSelect>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {filteredGroups.length > 0 ? (
            filteredGroups.map((group, index) => (
              <CategorySection key={group.category} group={group} defaultOpen={index === 0} />
            ))
          ) : (
            <p className="px-5 py-8 text-sm text-zinc-500 dark:text-zinc-400">No processes match your filters.</p>
          )}
        </div>
      </aside>
    </div>
  );
}
