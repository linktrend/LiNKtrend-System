import type { CapabilityLeaseRowFixture } from "@/lib/suite-integrations/linkapps/types";
import {
  DataTable,
  DataTableBody,
  DataTableHead,
  DataTableRow,
  DataTableShell,
  DT,
} from "@/components/data-table";
import { StatusPill } from "@/components/ui/status-pill";

function leasePhaseTone(phase: CapabilityLeaseRowFixture["phase"]): "danger" | "success" | "warning" | "neutral" {
  if (phase === "denied") return "danger";
  if (phase === "executed") return "success";
  if (phase === "granted") return "warning";
  return "neutral";
}

function leasePhaseLabel(phase: CapabilityLeaseRowFixture["phase"]): string {
  return phase.charAt(0).toUpperCase() + phase.slice(1);
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
      <DataTableShell className="mt-4">
        <DataTable size="sm">
          <colgroup>
            <col className="w-[28%]" />
            <col className="w-[28%]" />
            <col className="w-[22%]" />
            <col className="w-[22%]" />
          </colgroup>
          <DataTableHead bordered>
            <tr>
              <th className={DT.thText}>Lease id</th>
              <th className={DT.thText}>SKU label</th>
              <th className={DT.thControl}>
                <div className={DT.controlInner}>Phase</div>
              </th>
              <th className={DT.thText}>Retryable</th>
            </tr>
          </DataTableHead>
          <DataTableBody>
            {props.leases.map((row) => (
              <DataTableRow key={row.leaseId}>
                <td className={`${DT.tdClip} font-mono text-[11px] text-zinc-900 dark:text-zinc-100`}>
                  <span className={DT.tdTextSpan}>{row.leaseId}</span>
                </td>
                <td className={`${DT.tdClip} font-mono text-[11px]`}>
                  <span className={DT.tdTextSpan}>{row.skuLabel}</span>
                </td>
                <td className={DT.tdControl}>
                  <div className={DT.controlInner}>
                    <StatusPill label={leasePhaseLabel(row.phase)} tone={leasePhaseTone(row.phase)} equalWidth />
                  </div>
                </td>
                <td className={DT.tdClip}>
                  <span className={DT.tdTextSpan}>{row.retryable ? "yes" : "no"}</span>
                </td>
              </DataTableRow>
            ))}
          </DataTableBody>
        </DataTable>
      </DataTableShell>
    </section>
  );
}
