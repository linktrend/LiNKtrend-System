import {
  canApproveBrainInbox,
  canManageBilling,
  type AppActorKind,
  type AppRoleTier,
} from "@/lib/app-roles";

export const CLIENT_TRACE_STEP_IDS = [
  "lead_generation",
  "qualification",
  "template_selection",
  "website_build",
  "publish",
  "outreach",
  "close_recycle",
] as const;

export type ClientTraceStepId = (typeof CLIENT_TRACE_STEP_IDS)[number];

export type ClientTraceGateKind = "budget" | "knowledge" | "protected_side_effect";

export const CLIENT_TRACE_GATE_LABELS: Record<ClientTraceGateKind, string> = {
  budget: "Budget Approval",
  knowledge: "Knowledge Approval",
  protected_side_effect: "Protected Side Effect",
};

export type ClientRunTraceRefs = {
  leaseIds: string[];
  workflowRunIds: string[];
  auditEventIds: string[];
};

export type ClientRunTraceStage = {
  id: ClientTraceStepId;
  label: string;
  plane: "LiNKaios" | "LiNKbot" | "LinkSkills" | "LiNKautowork" | "LiNKbrain";
  status: "pending" | "running" | "succeeded" | "failed";
  refs: ClientRunTraceRefs;
  approvalGate?: ClientTraceGateKind;
};

export type ClientTraceApprovalGate = {
  id: string;
  kind: ClientTraceGateKind;
  label: string;
  stageId: ClientTraceStepId;
  status: "pending" | "granted";
  requiredRole: "Admin" | "Super Admin";
  route: string;
};

export type ClientRunTrace = {
  projectId: string;
  runId: string;
  title: string;
  stages: ClientRunTraceStage[];
  approvalGates: ClientTraceApprovalGate[];
};

function stageRefs(stageId: ClientTraceStepId, suffix: string): ClientRunTraceRefs {
  return {
    leaseIds: [`lease:cap.linksites.${stageId}:tenant-demo:${suffix}`],
    workflowRunIds: [`wf:autowork.linksites.${stageId}:tenant-demo:${suffix}`],
    auditEventIds: [`audit:linkbrain.linksites.${stageId}:tenant-demo:${suffix}`],
  };
}

function buildGate(
  kind: ClientTraceGateKind,
  stageId: ClientTraceStepId,
  status: ClientTraceApprovalGate["status"],
): ClientTraceApprovalGate {
  return {
    id: `approval:${kind}:${stageId}`,
    kind,
    label: CLIENT_TRACE_GATE_LABELS[kind],
    stageId,
    status,
    requiredRole: kind === "protected_side_effect" ? "Admin" : "Admin",
    route:
      kind === "budget"
        ? "/settings/billing"
        : kind === "knowledge"
          ? "/memory?tab=inbox"
          : "/work?filter=approvals",
  };
}

/**
 * Build the Client-facing LinkSites MVO trace spine used by the project Runs tab.
 *
 * The rows mirror the required business steps and expose the three governance
 * references operators must verify before approving side effects.
 */
export function buildClientRunTrace(projectId: string): ClientRunTrace {
  const runSuffix = `${projectId}:run-1`;
  const stages: ClientRunTraceStage[] = [
    {
      id: "lead_generation",
      label: "Lead Generation",
      plane: "LiNKbot",
      status: "succeeded",
      refs: stageRefs("lead_generation", runSuffix),
      approvalGate: "budget",
    },
    {
      id: "qualification",
      label: "Qualification",
      plane: "LiNKbot",
      status: "succeeded",
      refs: stageRefs("qualification", runSuffix),
    },
    {
      id: "template_selection",
      label: "Template Selection",
      plane: "LiNKbot",
      status: "succeeded",
      refs: stageRefs("template_selection", runSuffix),
    },
    {
      id: "website_build",
      label: "Website Build",
      plane: "LiNKautowork",
      status: "running",
      refs: stageRefs("website_build", runSuffix),
    },
    {
      id: "publish",
      label: "Publish",
      plane: "LiNKautowork",
      status: "pending",
      refs: stageRefs("publish", runSuffix),
      approvalGate: "protected_side_effect",
    },
    {
      id: "outreach",
      label: "Outreach",
      plane: "LiNKbot",
      status: "pending",
      refs: stageRefs("outreach", runSuffix),
      approvalGate: "protected_side_effect",
    },
    {
      id: "close_recycle",
      label: "Close Or Recycle",
      plane: "LiNKbrain",
      status: "pending",
      refs: stageRefs("close_recycle", runSuffix),
      approvalGate: "knowledge",
    },
  ];

  return {
    projectId,
    runId: `run:linksites:${runSuffix}`,
    title: "LinkSites Lead-To-Outreach Run",
    stages,
    approvalGates: [
      buildGate("budget", "lead_generation", "granted"),
      buildGate("knowledge", "close_recycle", "pending"),
      buildGate("protected_side_effect", "outreach", "pending"),
    ],
  };
}

/**
 * Resolve whether the current Client role can approve a trace gate.
 */
export function canApproveClientTraceGate(
  kind: AppActorKind,
  role: AppRoleTier,
  gateKind: ClientTraceGateKind,
): boolean {
  if (kind !== "licensee") return false;
  if (gateKind === "budget") return canManageBilling(kind, role);
  if (gateKind === "knowledge") return canApproveBrainInbox(kind, role);
  return role === "admin" || role === "super_admin";
}
