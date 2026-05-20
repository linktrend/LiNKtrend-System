import { CircleHelp } from "lucide-react";

/** Section title for worker detail tabs — includes Help placeholder per app-wide pattern. */
export function WorkerTabSectionHeader(props: { title: string; subtitle: string }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="min-w-0 flex-1">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{props.title}</h2>
        <p className="mt-1 max-w-2xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">{props.subtitle}</p>
      </div>
      <button
        type="button"
        disabled
        title="Page help assistant — coming soon"
        className="inline-flex min-h-8 shrink-0 items-center justify-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-2.5 py-1 text-xs font-medium text-zinc-500 opacity-70 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-400"
        aria-label="Tab help (coming soon)"
      >
        <CircleHelp className="h-4 w-4 shrink-0" aria-hidden />
        Help
      </button>
    </div>
  );
}
