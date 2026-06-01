/**
 * Client governance traces and side-effect approval gates (LTS-003).
 * Traceability: PPD §4 approvals; §5 governance traces.
 */

export type GovernancePlane = "linkskills" | "linkautowork" | "linkbrain";

export type GovernancePlaneRef = {
  plane: GovernancePlane;
  ref_type: "lease" | "workflow_run" | "audit_event";
  ref_id: string;
};

export type GovernanceTraceStep = {
  stage_id: string;
  status: string;
  responsible_plane: string;
  refs: GovernancePlaneRef[];
};

export type SideEffectApprovalGate = "budget" | "protected_send" | "publish" | "knowledge_export";

export type KernelStageTraceInput = {
  stage_id: string;
  status: string;
  responsible_plane: string;
  refs?: {
    lease_ids?: string[];
    workflow_run_ids?: string[];
    audit_event_ids?: string[];
  };
};

const OPERATOR_ROLES = new Set(["tenant_admin", "licensor_operator", "principal"]);
const APPROVAL_GATES: Record<SideEffectApprovalGate, Set<string>> = {
  budget: OPERATOR_ROLES,
  protected_send: OPERATOR_ROLES,
  publish: new Set(["tenant_admin", "licensor_operator", "principal"]),
  knowledge_export: new Set(["tenant_admin", "principal"]),
};

/** Map kernel run trace stage refs to governed plane references. */
export function mapKernelStageToGovernanceTrace(stage: KernelStageTraceInput): GovernanceTraceStep {
  const refs: GovernancePlaneRef[] = [];
  for (const leaseId of stage.refs?.lease_ids ?? []) {
    refs.push({ plane: "linkskills", ref_type: "lease", ref_id: leaseId });
  }
  for (const runId of stage.refs?.workflow_run_ids ?? []) {
    refs.push({ plane: "linkautowork", ref_type: "workflow_run", ref_id: runId });
  }
  for (const eventId of stage.refs?.audit_event_ids ?? []) {
    refs.push({ plane: "linkbrain", ref_type: "audit_event", ref_id: eventId });
  }
  return {
    stage_id: stage.stage_id,
    status: stage.status,
    responsible_plane: stage.responsible_plane,
    refs,
  };
}

export function requiresRoleApproval(gate: SideEffectApprovalGate, role: string): boolean {
  return !APPROVAL_GATES[gate].has(role);
}

export function governanceTraceHref(projectId: string, runId?: string): string {
  const base = `/settings/traces?project=${encodeURIComponent(projectId)}`;
  return runId ? `${base}&run=${encodeURIComponent(runId)}` : base;
}

export function sideEffectApprovalsHref(projectId: string): string {
  return `/projects/${encodeURIComponent(projectId)}?tab=tools#pending-approvals`;
}

export function assertGovernanceTraceComplete(steps: GovernanceTraceStep[]): {
  ok: boolean;
  missing: string[];
} {
  const missing: string[] = [];
  if (steps.length === 0) missing.push("trace_steps");
  for (const step of steps) {
    const planes = new Set(step.refs.map((r) => r.plane));
    if (!planes.has("linkskills")) missing.push(`${step.stage_id}:lease_ref`);
    if (!planes.has("linkautowork")) missing.push(`${step.stage_id}:workflow_ref`);
    if (!planes.has("linkbrain")) missing.push(`${step.stage_id}:audit_ref`);
  }
  return { ok: missing.length === 0, missing: [...new Set(missing)] };
}
