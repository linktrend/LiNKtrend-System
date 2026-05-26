import { formatCardTitle } from "@/lib/ui-standards";

/** Section title for worker detail tabs. */
export function WorkerTabSectionHeader(props: {
  title: string;
  subtitle: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="min-w-0 flex-1">
        <h2 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">{formatCardTitle(props.title)}</h2>
        <p className="mt-1 max-w-2xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">{props.subtitle}</p>
      </div>
      {props.actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{props.actions}</div> : null}
    </div>
  );
}
