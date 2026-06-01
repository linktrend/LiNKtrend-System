"use client";

import Link from "next/link";

import { DT } from "@/components/data-table";
import { DomainStatusPill } from "@/components/ui/status-pill";
import { useAppRole } from "@/components/role-preview-provider";
import {
  canApproveClientTraceGate,
  CLIENT_TRACE_GATE_LABELS,
  type ClientRunTrace,
  type ClientRunTraceRefs,
} from "@/lib/client-run-trace";
import { DATA_TABLE } from "@/lib/ui-standards";

function RefList(props: { label: string; values: string[]; hrefFor: (value: string) => string }) {
  return (
    <div className="space-y-1">
      <div className="text-[0.6875rem] font-semibold text-zinc-500 dark:text-zinc-400">{props.label}</div>
      <ul className="space-y-1">
        {props.values.map((value) => (
          <li key={value}>
            <Link
              href={props.hrefFor(value)}
              className="block truncate font-mono text-[0.6875rem] text-zinc-700 underline-offset-2 hover:underline dark:text-zinc-300"
              title={value}
            >
              {value}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function TraceRefs(props: { projectId: string; refs: ClientRunTraceRefs }) {
  return (
    <div className="grid gap-3 md:grid-cols-3">
      <RefList
        label="LinkSkills Lease"
        values={props.refs.leaseIds}
        hrefFor={(value) => `/skills/leases?lease=${encodeURIComponent(value)}`}
      />
      <RefList
        label="LiNKautowork Workflow"
        values={props.refs.workflowRunIds}
        hrefFor={(value) =>
          `/projects/${encodeURIComponent(props.projectId)}?tab=agents&workflow=${encodeURIComponent(value)}`
        }
      />
      <RefList
        label="LiNKbrain Audit"
        values={props.refs.auditEventIds}
        hrefFor={(value) => `/memory?tab=audit&event=${encodeURIComponent(value)}`}
      />
    </div>
  );
}

function ApprovalGateCell(props: { gate?: keyof typeof CLIENT_TRACE_GATE_LABELS }) {
  const { kind, role } = useAppRole();
  if (!props.gate) {
    return <span className="text-xs text-zinc-500 dark:text-zinc-400">No gate</span>;
  }

  const canApprove = canApproveClientTraceGate(kind, role, props.gate);
  return (
    <div className="space-y-1">
      <DomainStatusPill domain="approval" status={canApprove ? "review" : "pending"} equalWidth />
      <div className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
        {CLIENT_TRACE_GATE_LABELS[props.gate]}
      </div>
      <div className="text-[0.6875rem] text-zinc-500 dark:text-zinc-400">
        {canApprove ? "Current Role Can Approve" : "Admin Approval Required"}
      </div>
    </div>
  );
}

function ApprovalSurface(props: { trace: ClientRunTrace }) {
  const { kind, role } = useAppRole();
  return (
    <section className={DATA_TABLE.shell} aria-label="Side-effect approval gates">
      <div className="border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Approval Gates</h2>
      </div>
      <div className="grid gap-3 p-4 md:grid-cols-3">
        {props.trace.approvalGates.map((gate) => {
          const canApprove = canApproveClientTraceGate(kind, role, gate.kind);
          return (
            <article key={gate.id} className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{gate.label}</h3>
                  <p className="mt-1 font-mono text-xs text-zinc-500 dark:text-zinc-400">{gate.stageId}</p>
                </div>
                <DomainStatusPill domain="approval" status={gate.status === "granted" ? "approved" : "pending"} equalWidth />
              </div>
              <div className="mt-3 text-xs text-zinc-600 dark:text-zinc-300">
                {canApprove ? "Your role can review this gate." : `${gate.requiredRole} required.`}
              </div>
              <Link
                href={gate.route}
                className="mt-3 inline-flex text-xs font-semibold text-zinc-700 underline-offset-2 hover:underline dark:text-zinc-300"
              >
                Open Gate
              </Link>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export function ProjectRunTraceSpine(props: { trace: ClientRunTrace }) {
  return (
    <div className="space-y-4">
      <section aria-label="Run trace spine" className={DATA_TABLE.shell}>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
          <div>
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Run Trace</h2>
            <p className="mt-1 font-mono text-xs text-zinc-500 dark:text-zinc-400">{props.trace.runId}</p>
          </div>
          <DomainStatusPill domain="run" status="running" equalWidth />
        </div>
        <div className={DATA_TABLE.scrollBody}>
          <table className={`${DATA_TABLE.table} text-xs`}>
            <colgroup>
              <col className="w-[18%]" />
              <col className="w-[12%]" />
              <col className="w-[13%]" />
              <col className="w-[42%]" />
              <col className="w-[15%]" />
            </colgroup>
            <thead className={DT.theadBordered}>
              <tr>
                <th className={DT.thText}>Step</th>
                <th className={DT.thText}>Plane</th>
                <th className={DT.thControl}>
                  <div className={DT.controlInner}>Status</div>
                </th>
                <th className={DT.thText}>Governance Refs</th>
                <th className={DT.thControl}>
                  <div className={DT.controlInner}>Gate</div>
                </th>
              </tr>
            </thead>
            <tbody className={DT.tbody}>
              {props.trace.stages.map((stage) => (
                <tr key={stage.id} className={DT.trMultiline}>
                  <td className={DT.tdClip}>
                    <span className={`${DT.tdTextSpan} font-semibold`} title={stage.label}>
                      {stage.label}
                    </span>
                  </td>
                  <td className={DT.tdClip}>
                    <span className={DT.tdTextSpan} title={stage.plane}>
                      {stage.plane}
                    </span>
                  </td>
                  <td className={DT.tdControl}>
                    <div className={DT.controlInner}>
                      <DomainStatusPill domain="run" status={stage.status} equalWidth />
                    </div>
                  </td>
                  <td className={DT.td}>
                    <TraceRefs projectId={props.trace.projectId} refs={stage.refs} />
                  </td>
                  <td className={DT.tdControl}>
                    <ApprovalGateCell gate={stage.approvalGate} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <ApprovalSurface trace={props.trace} />
    </div>
  );
}
