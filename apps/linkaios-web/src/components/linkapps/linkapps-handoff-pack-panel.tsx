import type { HandoffPackFixture } from "@/lib/plugins/linkapps/types";

export function LinkappsHandoffPackPanel(props: { handoff: HandoffPackFixture }) {
  const { handoff } = props;
  return (
    <section
      className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
      aria-labelledby="linkapps-handoff-heading"
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 id="linkapps-handoff-heading" className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            Handoff pack
          </h2>
          <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
            Phase 5.7 output surface · manifest <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">handoff_pack</code> / spinoff
            queue linkage.
          </p>
        </div>
        <button
          type="button"
          disabled
          className="cursor-not-allowed rounded border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-400 dark:border-zinc-700 dark:text-zinc-500"
          title="Fixture only"
        >
          Download (mock)
        </button>
      </div>

      <dl className="mt-4 space-y-3 text-xs">
        <div>
          <dt className="font-medium text-zinc-500 dark:text-zinc-400">handoff_package_ref</dt>
          <dd className="mt-0.5 font-mono text-[11px] text-zinc-900 dark:text-zinc-100">{handoff.handoffPackageRef}</dd>
        </div>
        <div>
          <dt className="font-medium text-zinc-500 dark:text-zinc-400">preview_urls</dt>
          <dd className="mt-1 space-y-1">
            {handoff.previewUrls.map((u) => (
              <p key={u} className="break-all font-mono text-[11px] text-sky-700 dark:text-sky-300">
                {u}
              </p>
            ))}
          </dd>
        </div>
        <div>
          <dt className="font-medium text-zinc-500 dark:text-zinc-400">deployment_refs</dt>
          <dd className="mt-1 space-y-1">
            {handoff.deploymentRefs.map((r) => (
              <p key={r} className="font-mono text-[11px] text-zinc-800 dark:text-zinc-200">
                {r}
              </p>
            ))}
          </dd>
        </div>
        <div>
          <dt className="font-medium text-zinc-500 dark:text-zinc-400">audit_event_ids</dt>
          <dd className="mt-1 space-y-1">
            {handoff.auditEventIds.map((id) => (
              <p key={id} className="font-mono text-[11px] text-zinc-800 dark:text-zinc-200">
                {id}
              </p>
            ))}
          </dd>
        </div>
      </dl>

      <p className="mt-4 text-[11px] text-zinc-500 dark:text-zinc-400">
        Spinoff queue (<code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">linkapps.spinoff_queue</code>): enqueue blocked in MVO UI.
      </p>
    </section>
  );
}
