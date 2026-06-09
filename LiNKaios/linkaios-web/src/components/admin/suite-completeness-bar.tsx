/** Compact composition completeness bar for suite tables and builder headers. */
export function SuiteCompletenessBar(props: { percent: number; className?: string }) {
  const clamped = Math.min(100, Math.max(0, Math.round(props.percent)));

  return (
    <div className={props.className}>
      <div className="mb-1 flex items-center justify-between gap-2 text-[10px] tabular-nums text-zinc-500 dark:text-zinc-400">
        <span className="sr-only">Composition completeness</span>
        <span aria-hidden>{clamped}%</span>
      </div>
      <div
        className="h-1.5 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800"
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Composition ${clamped} percent complete`}
      >
        <div
          className="h-full rounded-full bg-emerald-600 transition-[width] dark:bg-emerald-500"
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
