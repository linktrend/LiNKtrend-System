/**
 * Client trace and approval surface — LTS-003.
 * Traceability: PPD §4 approvals; §5 governance traces.
 */

import {
  canApproveBrainInbox,
  canApproveProjectBudget,
  canApproveProtectedSideEffect,
  type AppActorKind,
  type AppRoleTier,
} from "@/lib/app-roles";
import type { RunOverview, RunStageView } from "@/lib/cockpit/cockpit-types";
import { LINKSITES_MVO_STAGES } from "@/lib/ui-mocks/modules-catalog-demo";

export type ClientTraceApprovalGateType = "budget" | "knowledge" | "protected_side_effect";

export type ClientTraceApprovalGate = {
  id: string;
  label: string;
  type: ClientTraceApprovalGateType;
  stageId: string;
  requiredRoleLabel: string;
};

export type ClientTraceStep = {
  id: string;
  label: string;
  responsiblePlane: string;
  status: string;
  leaseIds: string[];
  workflowRunIds: string[];
  auditEventIds: string[];
  approvalGateType: ClientTraceApprovalGateType | null;
};

export type ClientProjectTraceSurface = {
  projectId: string;
  runId: string;
  steps: ClientTraceStep[];
  approvalGates: ClientTraceApprovalGate[];
};

export type ProjectTraceRunRef = {
  traceRowId: string;
  runId: string | null;
};

export function projectTraceHref(projectId: string): string {
  return `/projects/${encodeURIComponent(projectId)}?tab=traces`;
}

export function canApproveBudgetGate(kind: AppActorKind, role: AppRoleTier): boolean {
  return canApproveProjectBudget(kind, role);
}

export function canApproveKnowledgeGate(kind: AppActorKind, role: AppRoleTier): boolean {
  return kind === "licensee" && canApproveBrainInbox(kind, role);
}

export function canApproveProtectedSideEffectGate(kind: AppActorKind, role: AppRoleTier): boolean {
  return kind === "licensee" && canApproveProtectedSideEffect(kind, role);
}

export function canApproveClientTraceGate(
  kind: AppActorKind,
  role: AppRoleTier,
  gateType: ClientTraceApprovalGateType,
): boolean {
  if (gateType === "budget") return canApproveBudgetGate(kind, role);
  if (gateType === "knowledge") return canApproveKnowledgeGate(kind, role);
  return canApproveProtectedSideEffectGate(kind, role);
}

export function assertProjectTraceSurfaceComplete(checks: {
  hasLeaseRefs: boolean;
  hasWorkflowRefs: boolean;
  hasAuditRefs: boolean;
  hasBudgetGate: boolean;
  hasKnowledgeGate: boolean;
  hasProtectedSideEffectGate: boolean;
}): { ok: boolean; missing: string[] } {
  const missing: string[] = [];
  if (!checks.hasLeaseRefs) missing.push("trace_lease_refs");
  if (!checks.hasWorkflowRefs) missing.push("trace_workflow_refs");
  if (!checks.hasAuditRefs) missing.push("trace_audit_refs");
  if (!checks.hasBudgetGate) missing.push("budget_gate");
  if (!checks.hasKnowledgeGate) missing.push("knowledge_gate");
  if (!checks.hasProtectedSideEffectGate) missing.push("protected_side_effect_gate");
  return { ok: missing.length === 0, missing };
}

function gateTypeForDemoStage(stageId: string): ClientTraceApprovalGateType | null {
  if (stageId.endsWith("lead_generation")) return "budget";
  if (stageId.endsWith("template_selection")) return "knowledge";
  if (stageId.endsWith("publish") || stageId.endsWith("outreach")) return "protected_side_effect";
  return null;
}

function stageSlug(stageId: string): string {
  return stageId.replace(/^linksites\./, "").replace(/[^a-z0-9_]+/gi, "_");
}

function demoRefs(projectId: string, stageId: string) {
  const slug = stageSlug(stageId);
  return {
    leaseIds: [`lease:cap.linksites.${slug}:${projectId}`],
    workflowRunIds: [`wf:autowork.linksites.${slug}:${projectId}`],
    auditEventIds: [`audit:linkbrain.linksites.${slug}:${projectId}`],
  };
}

export function buildDemoProjectTraceSurface(projectId: string): ClientProjectTraceSurface {
  const steps: ClientTraceStep[] = LINKSITES_MVO_STAGES.map((stage) => {
    const refs = demoRefs(projectId, stage.stageId);
    return {
      id: stage.stageId,
      label: stage.label,
      responsiblePlane: stage.primaryPlane,
      status: stage.status === "completed" ? "succeeded" : stage.status,
      ...refs,
      approvalGateType: gateTypeForDemoStage(stage.stageId),
    };
  });

  const approvalGates: ClientTraceApprovalGate[] = [
    {
      id: "budget_gate",
      label: "Budget Approval",
      type: "budget",
      stageId: "linksites.lead_generation",
      requiredRoleLabel: "Licensee Admin Or Super Admin",
    },
    {
      id: "knowledge_gate",
      label: "Knowledge Approval",
      type: "knowledge",
      stageId: "linksites.template_selection",
      requiredRoleLabel: "Admin Or Super Admin",
    },
    {
      id: "publish_side_effect_gate",
      label: "Publish Side Effect Approval",
      type: "protected_side_effect",
      stageId: "linksites.publish",
      requiredRoleLabel: "Admin Or Super Admin",
    },
    {
      id: "outreach_side_effect_gate",
      label: "Outreach Side Effect Approval",
      type: "protected_side_effect",
      stageId: "linksites.outreach",
      requiredRoleLabel: "Admin Or Super Admin",
    },
  ];

  return {
    projectId,
    runId: `run:${projectId}:linksites-mvo`,
    steps,
    approvalGates,
  };
}

export function selectProjectTraceRun(
  runs: RunOverview[],
  refs: ProjectTraceRunRef[],
): RunOverview | null {
  const runIds = new Set(refs.map((ref) => ref.runId).filter((id): id is string => Boolean(id)));
  if (runIds.size === 0) return null;
  return runs.find((run) => runIds.has(run.run_id)) ?? null;
}

function traceStepFromRunStage(stage: RunStageView): ClientTraceStep {
  return {
    id: stage.stage_id,
    label: stage.display_name,
    responsiblePlane: stage.responsible_plane,
    status: stage.status,
    leaseIds: stage.lease_ids,
    workflowRunIds: stage.workflow_run_ids,
    auditEventIds: stage.audit_event_ids,
    approvalGateType: gateTypeForDemoStage(stage.stage_id),
  };
}

export function projectTraceSurfaceFromRun(projectId: string, run: RunOverview | null): ClientProjectTraceSurface {
  const demoGates = buildDemoProjectTraceSurface(projectId).approvalGates;
  if (!run) {
    return {
      projectId,
      runId: "",
      steps: [],
      approvalGates: demoGates,
    };
  }
  return {
    projectId,
    runId: run.run_id,
    steps: run.stages.map(traceStepFromRunStage),
    approvalGates: demoGates,
  };
}
