import { formatCardTitle, WORKER_DETAIL } from "@/lib/ui-standards";

/** Section title for worker detail tabs. */
export function WorkerTabSectionHeader(props: {
  title: string;
  subtitle: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="min-w-0 flex-1">
        <h2 className={WORKER_DETAIL.tabSectionTitle}>{formatCardTitle(props.title)}</h2>
        <p className={WORKER_DETAIL.tabSectionSubtitle}>{props.subtitle}</p>
      </div>
      {props.actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{props.actions}</div> : null}
    </div>
  );
}
