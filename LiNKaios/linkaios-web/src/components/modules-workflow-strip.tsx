import { DomainStatusPill } from "@/components/ui/status-pill";
import type { WorkflowStageFixture } from "@/lib/ui-mocks/modules-catalog-demo";

export function ModulesWorkflowStrip(props: {
  title: string;
  subtitle: string;
  stages: WorkflowStageFixture[];
}) {
  return (
    <section
      className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950"
      aria-labelledby="modules-workflow-strip-heading"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h4 id="modules-workflow-strip-heading" className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            {props.title}
          </h4>
          <p className="mt-1 max-w-3xl text-sm text-zinc-600 dark:text-zinc-400">{props.subtitle}</p>
        </div>
        <span className="inline-flex items-center rounded-full border border-sky-200 bg-sky-50 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-sky-900 dark:border-sky-900/50 dark:bg-sky-950/40 dark:text-sky-100">
          Mock run snapshot
        </span>
      </div>

      <ol className="mt-4 flex gap-2 overflow-x-auto pb-1">
        {props.stages.map((stage) => (
          <li
            key={stage.stageId}
            className="min-w-[9.5rem] shrink-0 rounded-lg border border-zinc-200 bg-zinc-50/80 p-3 dark:border-zinc-700 dark:bg-zinc-900/40"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-semibold tabular-nums text-zinc-500 dark:text-zinc-400">
                {String(stage.order).padStart(2, "0")}
              </span>
              <DomainStatusPill domain="workflow" status={stage.status} />
            </div>
            <p className="mt-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">{stage.label}</p>
            <p className="mt-1 text-xs leading-5 text-zinc-600 dark:text-zinc-400">{stage.summary}</p>
            <p className="mt-2 text-[10px] font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              {stage.primaryPlane}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}
