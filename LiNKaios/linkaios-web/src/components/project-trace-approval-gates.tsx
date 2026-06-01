"use client";

import { useAppRole } from "@/components/role-preview-provider";
import { StatusPill } from "@/components/ui/status-pill";
import {
  canApproveClientTraceGate,
  type ClientTraceApprovalGate,
} from "@/lib/client-trace-flow";
import { BUTTON } from "@/lib/ui-standards";

const GATE_PILL_LABELS = ["Allowed", "Needs admin"] as const;

export function ProjectTraceApprovalGates(props: { gates: ClientTraceApprovalGate[] }) {
  const { kind, role } = useAppRole();

  if (props.gates.length === 0) {
    return null;
  }

  return (
    <section aria-labelledby="project-trace-approvals-heading" className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <h2 id="project-trace-approvals-heading" className="text-lg font-medium text-zinc-800 dark:text-zinc-100">
          Approval Gates
        </h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">{props.gates.length} gate(s)</p>
      </div>
      <ul className="divide-y divide-zinc-200 rounded-xl border border-zinc-200 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-950">
        {props.gates.map((gate) => {
          const allowed = canApproveClientTraceGate(kind, role, gate.type);
          return (
            <li key={gate.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-4 text-sm">
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-zinc-900 dark:text-zinc-100">{gate.label}</p>
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  Stage: <span className="font-mono">{gate.stageId}</span> · Required: {gate.requiredRoleLabel}
                </p>
              </div>
              <div className="flex shrink-0 flex-wrap items-center gap-2">
                <StatusPill
                  label={allowed ? "Allowed" : "Needs admin"}
                  tone={allowed ? "success" : "warning"}
                  equalWidthLabels={GATE_PILL_LABELS}
                />
                <button type="button" className={allowed ? BUTTON.approveOutlineRow : BUTTON.secondaryRow} disabled={!allowed}>
                  Approve
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
