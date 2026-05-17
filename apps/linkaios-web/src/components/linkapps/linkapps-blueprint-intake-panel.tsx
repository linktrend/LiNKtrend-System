import type { BlueprintIntakeFixture } from "@/lib/plugins/linkapps/types";

export function LinkappsBlueprintIntakePanel(props: { blueprint: BlueprintIntakeFixture }) {
  const { blueprint } = props;
  return (
    <section
      className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
      aria-labelledby="linkapps-blueprint-heading"
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 id="linkapps-blueprint-heading" className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            Blueprint intake
          </h2>
          <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
            Maps manifest panel <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">linkapps.blueprint_intake</code>
          </p>
        </div>
        <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
          {blueprint.state}
        </span>
      </div>
      <dl className="mt-4 grid gap-3 text-xs sm:grid-cols-2">
        <div>
          <dt className="font-medium text-zinc-500 dark:text-zinc-400">venture_id</dt>
          <dd className="mt-0.5 font-mono text-zinc-900 dark:text-zinc-100">{blueprint.ventureId}</dd>
        </div>
        <div>
          <dt className="font-medium text-zinc-500 dark:text-zinc-400">app_name / slug</dt>
          <dd className="mt-0.5 text-zinc-900 dark:text-zinc-100">
            {blueprint.appName}{" "}
            <span className="font-mono text-zinc-600 dark:text-zinc-300">({blueprint.appSlug})</span>
          </dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="font-medium text-zinc-500 dark:text-zinc-400">blueprint_ref</dt>
          <dd className="mt-0.5 font-mono text-[11px] leading-snug text-zinc-900 dark:text-zinc-100">{blueprint.blueprintRef}</dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="font-medium text-zinc-500 dark:text-zinc-400">prd_ref</dt>
          <dd className="mt-0.5 font-mono text-[11px] leading-snug text-zinc-900 dark:text-zinc-100">{blueprint.prdRef}</dd>
        </div>
      </dl>
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          disabled
          className="cursor-not-allowed rounded border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs font-medium text-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-500"
          title="Mock only — no upload"
        >
          Bind blueprint (mock)
        </button>
      </div>
    </section>
  );
}
