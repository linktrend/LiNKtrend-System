"use client";

import { CircleHelp, Clock3 } from "lucide-react";

import { BUTTON } from "@/lib/ui-standards";

/** Shared page title row — title matches breadcrumb; refresh/help on the right when provided. */
export function ShellPageHeader(props: {
  title: string;
  subtitle: string;
  refreshedLabel?: string | null;
  onRefresh?: () => void;
  actions?: React.ReactNode;
}) {
  const { title, subtitle, refreshedLabel, onRefresh, actions } = props;

  return (
    <header className="flex flex-wrap items-start justify-between gap-4 border-b border-zinc-200 pb-6 dark:border-zinc-800">
      <div className="min-w-0 flex-1">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">{title}</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{subtitle}</p>
      </div>
      <div className="flex shrink-0 flex-wrap items-center gap-2">
        {actions}
        {refreshedLabel ? (
          <span className="inline-flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400" suppressHydrationWarning>
            <Clock3 className="h-3.5 w-3.5" aria-hidden />
            {refreshedLabel}
          </span>
        ) : null}
        {onRefresh ? (
          <button type="button" onClick={onRefresh} className={BUTTON.secondaryCompact}>
            Refresh
          </button>
        ) : null}
        <button
          type="button"
          disabled
          title="Page help assistant — coming soon"
          className="inline-flex min-h-8 items-center justify-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-2.5 py-1 text-xs font-medium text-zinc-500 opacity-70 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-400"
          aria-label="Page help (coming soon)"
        >
          <CircleHelp className="h-4 w-4 shrink-0" aria-hidden />
          Help
        </button>
      </div>
    </header>
  );
}
