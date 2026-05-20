import type { CapabilityLeaseRowFixture } from "@/lib/plugins/linkapps/types";

function phaseClass(phase: CapabilityLeaseRowFixture["phase"]): string {
  const base = "rounded-full px-2 py-0.5 text-[11px] font-medium ";
  if (phase === "denied") return base + "bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-200";
  if (phase === "executed") return base + "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200";
  if (phase === "granted") return base + "bg-amber-100 text-amber-900 dark:bg-amber-950/40 dark:text-amber-100";
  return base + "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200";
}

export function LinkappsCapabilityLeasesPanel(props: { leases: CapabilityLeaseRowFixture[] }) {
  return (
    <section
      className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
      aria-labelledby="linkapps-leases-heading"
    >
      <h2 id="linkapps-leases-heading" className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
        Capability leases
      </h2>
      <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
        Mock-first posture per WP-108. UI never issues leases in MVO.
      </p>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[32rem] border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-zinc-200 text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
              <th className="py-2 pr-3 font-medium">lease_id</th>
              <th className="py-2 pr-3 font-medium">SKU label</th>
              <th className="py-2 pr-3 font-medium">phase</th>
              <th className="py-2 font-medium">retryable</th>
            </tr>
          </thead>
          <tbody>
            {props.leases.map((row) => (
              <tr key={row.leaseId} className="border-b border-zinc-100 dark:border-zinc-800">
                <td className="py-2 pr-3 font-mono text-[11px] text-zinc-900 dark:text-zinc-100">{row.leaseId}</td>
                <td className="py-2 pr-3 font-mono text-[11px] text-zinc-800 dark:text-zinc-200">{row.skuLabel}</td>
                <td className="py-2 pr-3">
                  <span className={phaseClass(row.phase)}>{row.phase}</span>
                </td>
                <td className="py-2 text-zinc-700 dark:text-zinc-300">{row.retryable ? "yes" : "no"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
