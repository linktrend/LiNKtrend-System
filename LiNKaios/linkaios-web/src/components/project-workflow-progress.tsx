/** Workflow completion bar for project detail. */
export function ProjectWorkflowProgress(props: { percent: number }) {
  const clamped = Math.min(100, Math.max(0, Math.round(props.percent)));

  return (
    <section aria-labelledby="project-progress-bar-heading">
      <h2
        id="project-progress-bar-heading"
        className="text-sm font-semibold text-zinc-700 dark:text-zinc-300"
      >
        Progress Bar
      </h2>
      <div className="mt-2 rounded-xl border border-zinc-200 bg-white px-4 py-4 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="relative">
          <div className="relative mb-1">
            <div className="flex justify-between text-[10px] tabular-nums text-zinc-400 dark:text-zinc-500">
              <span>0%</span>
              <span>100%</span>
            </div>
            <span
              className="absolute top-0 -translate-x-1/2 text-[10px] font-medium tabular-nums text-zinc-700 dark:text-zinc-300"
              style={{ left: `${clamped}%` }}
            >
              {clamped}%
            </span>
          </div>
          <div
            className="relative h-2 overflow-visible rounded-full bg-zinc-100 dark:bg-zinc-800"
            role="progressbar"
            aria-valuenow={clamped}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-labelledby="project-progress-bar-heading"
          >
            <div
              className="h-full rounded-full bg-emerald-600 transition-[width] dark:bg-emerald-500"
              style={{ width: `${clamped}%` }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
