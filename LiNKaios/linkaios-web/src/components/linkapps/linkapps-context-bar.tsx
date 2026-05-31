import type { FactoryRunContext } from "@/lib/suite-integrations/linkapps/types";

function statusChipClass(status: FactoryRunContext["status"]): string {
  const base =
    "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset tabular-nums ";
  if (status === "running") return base + "bg-sky-50 text-sky-800 ring-sky-200 dark:bg-sky-950/50 dark:text-sky-200 dark:ring-sky-700";
  if (status === "succeeded") return base + "bg-emerald-50 text-emerald-800 ring-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-200 dark:ring-emerald-700";
  if (status === "partial") return base + "bg-amber-50 text-amber-900 ring-amber-200 dark:bg-amber-950/35 dark:text-amber-100 dark:ring-amber-700";
  return base + "bg-red-50 text-red-800 ring-red-200 dark:bg-red-950/40 dark:text-red-200 dark:ring-red-800";
}

export function LinkappsContextBar(props: { context: FactoryRunContext }) {
  const { context } = props;
  return (
    <section
      className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
      aria-label="Run context"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">LiNKapps factory run</h2>
          <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">Fixture-only scaffold — no provisioning.</p>
        </div>
        <span className={statusChipClass(context.status)}>{context.status}</span>
      </div>
      <dl className="mt-4 grid gap-3 text-xs sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <dt className="font-medium text-zinc-500 dark:text-zinc-400">tenant_id</dt>
          <dd className="mt-0.5 font-mono text-zinc-900 dark:text-zinc-100">{context.tenantId}</dd>
        </div>
        <div>
          <dt className="font-medium text-zinc-500 dark:text-zinc-400">run_id</dt>
          <dd className="mt-0.5 font-mono text-zinc-900 dark:text-zinc-100">{context.runId}</dd>
        </div>
        <div>
          <dt className="font-medium text-zinc-500 dark:text-zinc-400">trace_id</dt>
          <dd className="mt-0.5 font-mono text-zinc-900 dark:text-zinc-100">{context.traceId}</dd>
        </div>
        <div>
          <dt className="font-medium text-zinc-500 dark:text-zinc-400">venture_id</dt>
          <dd className="mt-0.5 font-mono text-zinc-900 dark:text-zinc-100">{context.ventureId}</dd>
        </div>
      </dl>
    </section>
  );
}
