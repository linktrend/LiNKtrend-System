import Link from "next/link";

export type WorkerDetailHeaderModel = {
  id: string;
  displayName: string;
  role: string;
  description: string;
  registryLabel: string;
  operationalSummary: string;
  currentActivity: string;
  isDemo?: boolean;
};

export function WorkerDetailHeader(props: { model: WorkerDetailHeaderModel }) {
  const m = props.model;
  return (
    <header className="border-b border-zinc-200 pb-8 dark:border-zinc-800">
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        <Link href="/workers" className="text-sky-700 underline dark:text-sky-400">
          LiNKbots
        </Link>
        <span className="mx-2">/</span>
        <span className="text-zinc-900 dark:text-zinc-100">{m.displayName}</span>
      </p>
      <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">{m.displayName}</h1>
          <p className="mt-1 text-sm font-semibold text-violet-800 dark:text-violet-300">Role · {m.role}</p>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">{m.description}</p>
          {m.isDemo ? (
            <p className="mt-2 text-xs font-medium text-amber-800 dark:text-amber-200">Sample profile — replace with live worker data.</p>
          ) : null}
          <details className="mt-3 text-xs text-zinc-400 dark:text-zinc-500">
            <summary className="cursor-pointer select-none text-zinc-500 dark:text-zinc-400">Technical id</summary>
            <p className="mt-1 font-mono text-[11px]">{m.id}</p>
          </details>
        </div>
        <div className="w-full shrink-0 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 lg:max-w-sm">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Status</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-zinc-500 dark:text-zinc-400">Registry</dt>
              <dd className="text-right font-medium text-zinc-900 dark:text-zinc-100">{m.registryLabel}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-zinc-500 dark:text-zinc-400">Presence</dt>
              <dd className="text-right font-medium text-zinc-900 dark:text-zinc-100">{m.operationalSummary}</dd>
            </div>
            <div className="flex flex-col gap-1">
              <dt className="text-zinc-500 dark:text-zinc-400">Current activity</dt>
              <dd className="text-sm leading-snug text-zinc-800 dark:text-zinc-200">{m.currentActivity}</dd>
            </div>
          </dl>
        </div>
      </div>
    </header>
  );
}
