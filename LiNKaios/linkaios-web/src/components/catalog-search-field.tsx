"use client";

import { Search } from "lucide-react";

import { BUTTON } from "@/lib/ui-standards";

const searchInputClass =
  "min-w-0 flex-1 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 disabled:opacity-60 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100";

export function CatalogSearchField(props: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
  placeholder: string;
  pending?: boolean;
  pendingLabel?: string;
  searchLabel?: string;
}) {
  const canSearch = props.value.trim().length >= 2 && !props.pending;

  return (
    <div className="flex min-w-0 flex-wrap items-center gap-2">
      <span className="shrink-0 text-sm font-medium text-zinc-900 dark:text-zinc-100">{props.label}</span>
      <input
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            if (canSearch) props.onSearch();
          }
        }}
        disabled={props.pending}
        placeholder={props.placeholder}
        aria-label={props.label}
        className={searchInputClass}
      />
      <button
        type="button"
        disabled={!canSearch}
        onClick={props.onSearch}
        className={`${BUTTON.primaryRow} inline-flex shrink-0 gap-2`}
      >
        <Search className="h-4 w-4 shrink-0" aria-hidden />
        {props.pending ? (props.pendingLabel ?? "Searching…") : (props.searchLabel ?? "Search")}
      </button>
    </div>
  );
}
