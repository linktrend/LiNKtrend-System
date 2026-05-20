"use client";

import { CircleHelp, Clock3 } from "lucide-react";

import { BUTTON } from "@/lib/ui-standards";

/** Shared page title row — title matches breadcrumb; refresh/help on the right when provided. */
export function ShellPageHeader(props: {
  title: string;
  subtitle: string;
  refreshedLabel?: string | null;
  onRefresh?: () => void;
  onHelpClick?: () => void;
  actions?: React.ReactNode;
}) {
  const { title, subtitle, refreshedLabel, onRefresh, onHelpClick, actions } = props;

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
          onClick={onHelpClick}
          disabled={!onHelpClick}
          title={onHelpClick ? "Page help for this screen" : "Page help not available"}
          className="inline-flex min-h-8 items-center justify-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-2.5 py-1 text-xs font-medium text-zinc-700 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-70 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-900"
          aria-label={onHelpClick ? "Open page help" : "Page help not available"}
        >
          <CircleHelp className="h-4 w-4 shrink-0" aria-hidden />
          Help
        </button>
      </div>
    </header>
  );
}
