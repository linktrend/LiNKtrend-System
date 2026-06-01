import {
  DataTable,
  DataTableBody,
  DataTableEmptyRow,
  DataTableHead,
  DataTableRow,
  DataTableShell,
  DT,
} from "@/components/data-table";
import { DomainStatusPill, StatusPill } from "@/components/ui/status-pill";
import { resolveProjectIdFromProps } from "@/lib/api/project-mission-id";
import {
  loadProjectTraceSurface,
  type ProjectApprovalGate,
  type ProjectTraceStep,
  type ProjectTraceStepStatus,
} from "@/lib/project-trace-governance";

const TRACE_STEP_PILL_LABELS = ["Completed", "Running", "Pending", "Blocked"] as const;
const APPROVAL_PILL_LABELS = ["Approved", "Pending", "Review", "Rejected"] as const;

function stepStatusTone(status: ProjectTraceStepStatus): "success" | "active" | "warning" | "danger" {
  if (status === "completed") return "success";
  if (status === "running") return "active";
  if (status === "blocked") return "danger";
  return "warning";
}

function stepStatusLabel(status: ProjectTraceStepStatus): string {
  if (status === "completed") return "Completed";
  if (status === "running") return "Running";
  if (status === "blocked") return "Blocked";
  return "Pending";
}

function formatRef(ref: string | null): string {
  if (!ref) return "Missing";
  if (ref.length <= 24) return ref;
  return `${ref.slice(0, 18)}...`;
}

function TraceRefCell(props: { refValue: string | null }) {
  if (!props.refValue) {
    return (
      <StatusPill
        label="Missing"
        tone="danger"
        equalWidthLabels={["Present", "Missing"]}
      />
    );
  }

  return (
    <span className={`${DT.tdTextSpan} font-mono text-xs`} title={props.refValue}>
      {formatRef(props.refValue)}
    </span>
  );
}

function ProjectTraceStepsTable(props: { rows: ProjectTraceStep[] }) {
  return (
    <DataTableShell scrollableBody>
      <DataTable size="sm">
        <colgroup>
          <col className="w-[14%]" />
          <col className="w-[10%]" />
          <col className="w-[18%]" />
          <col className="w-[16%]" />
          <col className="w-[14%]" />
          <col className="w-[14%]" />
          <col className="w-[14%]" />
        </colgroup>
        <DataTableHead>
          <tr>
            <th className={DT.thTextInset}>Phase</th>
            <th className={DT.thControl}>
              <div className={DT.controlInner}>Status</div>
            </th>
            <th className={DT.thTextInset}>Issue</th>
            <th className={DT.thTextInset}>Side Effect</th>
            <th className={DT.thTextInset}>LinkSkills Lease</th>
            <th className={DT.thTextInset}>LiNKautowork Workflow</th>
            <th className={DT.thTextInset}>LiNKbrain Audit</th>
          </tr>
        </DataTableHead>
        <DataTableBody>
          {props.rows.length === 0 ? (
            <DataTableEmptyRow colSpan={7}>No project trace steps are available yet.</DataTableEmptyRow>
          ) : (
            props.rows.map((step) => (
              <DataTableRow key={step.id}>
                <td className={DT.tdClipInset}>
                  <span className={DT.tdTextSpan} title={step.phase}>
                    {step.phase}
                  </span>
                </td>
                <td className={DT.tdControl}>
                  <div className={DT.controlInner}>
                    <StatusPill
                      label={stepStatusLabel(step.status)}
                      tone={stepStatusTone(step.status)}
                      equalWidthLabels={TRACE_STEP_PILL_LABELS}
                    />
                  </div>
                </td>
                <td className={DT.tdClipInset}>
                  <span className={DT.tdTextSpan} title={step.issue}>
                    {step.issue}
                  </span>
                </td>
                <td className={DT.tdClipInset}>
                  <span className={DT.tdTextSpan} title={step.sideEffect ?? undefined}>
                    {step.sideEffect ?? "-"}
                  </span>
                </td>
                <td className={DT.tdClipInset}>
                  <TraceRefCell refValue={step.linkskillsLeaseRef} />
                </td>
                <td className={DT.tdClipInset}>
                  <TraceRefCell refValue={step.linkautoworkWorkflowRef} />
                </td>
                <td className={DT.tdClipInset}>
                  <TraceRefCell refValue={step.linkbrainAuditRef} />
                </td>
              </DataTableRow>
            ))
          )}
        </DataTableBody>
      </DataTable>
    </DataTableShell>
  );
}

function gateKindLabel(kind: ProjectApprovalGate["kind"]): string {
  if (kind === "budget") return "Budget";
  if (kind === "knowledge") return "Knowledge";
  return "Protected Side Effect";
}

function ProjectApprovalGatesTable(props: { rows: ProjectApprovalGate[] }) {
  return (
    <DataTableShell>
      <DataTable size="sm">
        <colgroup>
          <col className="w-[20%]" />
          <col className="w-[13%]" />
          <col className="w-[24%]" />
          <col className="w-[17%]" />
          <col className="w-[26%]" />
        </colgroup>
        <DataTableHead>
          <tr>
            <th className={DT.thTextInset}>Gate</th>
            <th className={DT.thControl}>
              <div className={DT.controlInner}>Status</div>
            </th>
            <th className={DT.thTextInset}>Allowed Roles</th>
            <th className={DT.thTextInset}>Step</th>
            <th className={DT.thTextInset}>Policy</th>
          </tr>
        </DataTableHead>
        <DataTableBody>
          {props.rows.length === 0 ? (
            <DataTableEmptyRow colSpan={5}>No approval gates are configured yet.</DataTableEmptyRow>
          ) : (
            props.rows.map((gate) => (
              <DataTableRow key={gate.id}>
                <td className={DT.tdClipInset}>
                  <span className={DT.tdTextSpan} title={gate.label}>
                    {gateKindLabel(gate.kind)}
                  </span>
                </td>
                <td className={DT.tdControl}>
                  <div className={DT.controlInner}>
                    <DomainStatusPill
                      domain="approval"
                      status={gate.status}
                      equalWidthLabels={APPROVAL_PILL_LABELS}
                    />
                  </div>
                </td>
                <td className={DT.tdClipInset}>
                  <span className={DT.tdTextSpan} title={gate.allowedRoles.join(", ")}>
                    {gate.allowedRoles.join(", ")}
                  </span>
                </td>
                <td className={DT.tdClipInset}>
                  <span className={`${DT.tdTextSpan} font-mono text-xs`} title={gate.linkedStepId ?? undefined}>
                    {gate.linkedStepId ?? "-"}
                  </span>
                </td>
                <td className={DT.tdClipInset}>
                  <span className={`${DT.tdTextSpan} font-mono text-xs`} title={gate.policyRef}>
                    {gate.policyRef}
                  </span>
                </td>
              </DataTableRow>
            ))
          )}
        </DataTableBody>
      </DataTable>
    </DataTableShell>
  );
}

export async function ProjectTracePanel(props: {
  projectId?: string;
  /** @deprecated Use projectId */
  missionId?: string;
}) {
  const projectId = resolveProjectIdFromProps(props);
  const surface = await loadProjectTraceSurface(projectId);

  return (
    <div className="space-y-8">
      <section className="space-y-3" aria-labelledby="project-trace-steps-heading">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <h2 id="project-trace-steps-heading" className="text-lg font-medium text-zinc-800 dark:text-zinc-100">
            Governance Trace
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">{surface.steps.length} step(s)</p>
        </div>
        <ProjectTraceStepsTable rows={surface.steps} />
      </section>

      <section className="space-y-3" aria-labelledby="project-approval-gates-heading">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <h2 id="project-approval-gates-heading" className="text-lg font-medium text-zinc-800 dark:text-zinc-100">
            Approval Gates
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">{surface.approvalGates.length} gate(s)</p>
        </div>
        <ProjectApprovalGatesTable rows={surface.approvalGates} />
      </section>
    </div>
  );
}
