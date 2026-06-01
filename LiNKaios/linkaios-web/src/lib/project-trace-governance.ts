export type ProjectTraceStepStatus = "completed" | "running" | "pending" | "blocked";

export type ProjectTraceStep = {
  id: string;
  order: number;
  phase: string;
  issue: string;
  status: ProjectTraceStepStatus;
  linkskillsLeaseRef: string | null;
  linkautoworkWorkflowRef: string | null;
  linkbrainAuditRef: string | null;
  sideEffect: string | null;
  updatedAt: string;
};

export type ProjectApprovalGateKind = "budget" | "knowledge" | "protected_side_effect";

export type ProjectApprovalGate = {
  id: string;
  kind: ProjectApprovalGateKind;
  label: string;
  status: "approved" | "pending" | "review" | "rejected";
  allowedRoles: string[];
  requiresPrincipal: boolean;
  policyRef: string;
  linkedStepId: string | null;
};

export type ProjectTraceSurface = {
  projectId: string;
  steps: ProjectTraceStep[];
  approvalGates: ProjectApprovalGate[];
};

const REQUIRED_GATE_KINDS: ProjectApprovalGateKind[] = [
  "budget",
  "knowledge",
  "protected_side_effect",
];

function minutesAgo(minutes: number): string {
  return new Date(Date.now() - minutes * 60_000).toISOString();
}

function defaultApprovalGates(projectId: string, linkedStepId: string | null): ProjectApprovalGate[] {
  return [
    {
      id: `${projectId}-budget-gate`,
      kind: "budget",
      label: "Budget approval",
      status: "approved",
      allowedRoles: ["Company Admin", "Principal"],
      requiresPrincipal: true,
      policyRef: "company.policy.budget_approval",
      linkedStepId,
    },
    {
      id: `${projectId}-knowledge-gate`,
      kind: "knowledge",
      label: "Knowledge inclusion",
      status: "review",
      allowedRoles: ["Company Admin", "Operator"],
      requiresPrincipal: false,
      policyRef: "company.policy.knowledge_review",
      linkedStepId,
    },
    {
      id: `${projectId}-protected-side-effect-gate`,
      kind: "protected_side_effect",
      label: "Protected side effect",
      status: "pending",
      allowedRoles: ["Principal"],
      requiresPrincipal: true,
      policyRef: "company.policy.protected_side_effects",
      linkedStepId,
    },
  ];
}

export function demoProjectTraceSurface(projectId: string): ProjectTraceSurface {
  if (projectId !== "demo-smb") {
    return {
      projectId,
      steps: [],
      approvalGates: defaultApprovalGates(projectId, null),
    };
  }

  const steps: ProjectTraceStep[] = [
    {
      id: "lead-discovery",
      order: 1,
      phase: "Lead Discovery",
      issue: "Governed Mock Lead",
      status: "completed",
      linkskillsLeaseRef: "lease:lead-search-demo",
      linkautoworkWorkflowRef: "workflow:lead-import",
      linkbrainAuditRef: "audit:lead-intake",
      sideEffect: "Lead record created",
      updatedAt: minutesAgo(140),
    },
    {
      id: "qualification",
      order: 2,
      phase: "Qualification",
      issue: "Business Type And Industry",
      status: "completed",
      linkskillsLeaseRef: "lease:research-enrichment",
      linkautoworkWorkflowRef: "workflow:qualification-check",
      linkbrainAuditRef: "audit:qualification-context",
      sideEffect: "Enrichment bundle saved",
      updatedAt: minutesAgo(118),
    },
    {
      id: "template-selection",
      order: 3,
      phase: "Template Selection",
      issue: "LinkSites Template Match",
      status: "completed",
      linkskillsLeaseRef: "lease:template-registry-read",
      linkautoworkWorkflowRef: "workflow:template-match",
      linkbrainAuditRef: "audit:template-selection",
      sideEffect: "Template guidance attached",
      updatedAt: minutesAgo(96),
    },
    {
      id: "website-build",
      order: 4,
      phase: "Website Build",
      issue: "Custom Copy And Media",
      status: "running",
      linkskillsLeaseRef: "lease:site-build-artifacts",
      linkautoworkWorkflowRef: "workflow:artifact-package",
      linkbrainAuditRef: "audit:builder-output",
      sideEffect: "Preview artifact package written",
      updatedAt: minutesAgo(72),
    },
    {
      id: "publish",
      order: 5,
      phase: "Publish",
      issue: "Payload Sync And Temp URL",
      status: "pending",
      linkskillsLeaseRef: "lease:payload-local-sync",
      linkautoworkWorkflowRef: "workflow:preview-publish",
      linkbrainAuditRef: "audit:publish-readiness",
      sideEffect: "Payload CMS sync",
      updatedAt: minutesAgo(44),
    },
    {
      id: "outreach",
      order: 6,
      phase: "Outreach",
      issue: "Draft Outreach Approval",
      status: "pending",
      linkskillsLeaseRef: "lease:outreach-draft",
      linkautoworkWorkflowRef: "workflow:outreach-gate",
      linkbrainAuditRef: "audit:outreach-draft",
      sideEffect: "Protected send held for approval",
      updatedAt: minutesAgo(22),
    },
  ];

  return {
    projectId,
    steps,
    approvalGates: defaultApprovalGates(projectId, "outreach"),
  };
}

function workflowStatusToStepStatus(status: string): ProjectTraceStepStatus {
  const normalized = status.toLowerCase();
  if (normalized === "completed" || normalized === "succeeded" || normalized === "success") return "completed";
  if (normalized === "running" || normalized === "queued") return "running";
  if (normalized === "failed" || normalized === "blocked" || normalized === "cancelled") return "blocked";
  return "pending";
}

export async function loadProjectTraceSurface(projectId: string): Promise<ProjectTraceSurface> {
  const { isUiMocksEnabled } = await import("@/lib/ui-mocks/flags");
  if (isUiMocksEnabled()) {
    return demoProjectTraceSurface(projectId);
  }

  const [{ fetchMetricsSnapshot }, { loadLeaseStatus, loadWorkflowRunStatus }, { createSupabaseServerClient }] =
    await Promise.all([
      import("@/app/(shell)/metrics/actions"),
      import("@/lib/cockpit"),
      import("@/lib/supabase/server"),
    ]);
  const supabase = await createSupabaseServerClient();
  const tenantId = "default";
  const [metrics, leases, workflows] = await Promise.all([
    fetchMetricsSnapshot({ days: 30, missionId: projectId, agentId: null }),
    loadLeaseStatus(supabase, tenantId, { time_range: "24h" }),
    loadWorkflowRunStatus(supabase, tenantId),
  ]);

  const runIds = new Set(
    (metrics.ok ? metrics.data.runs : [])
      .map((run) => run.id)
      .filter((id): id is string => Boolean(id)),
  );
  const projectWorkflows = workflows.filter((workflow) => workflow.run_id != null && runIds.has(workflow.run_id));
  const projectLeases = leases.filter((lease) => lease.run_id != null && runIds.has(lease.run_id));

  const steps = projectWorkflows.slice(0, 12).map<ProjectTraceStep>((workflow, index) => {
    const lease =
      (workflow.lease_id ? projectLeases.find((candidate) => candidate.lease_id === workflow.lease_id) : null) ??
      projectLeases.find((candidate) => candidate.run_id === workflow.run_id) ??
      null;
    return {
      id: workflow.stage_id ?? workflow.workflow_run_id,
      order: index + 1,
      phase: workflow.stage_id ?? "Run Step",
      issue: workflow.workflow_handle,
      status: workflowStatusToStepStatus(workflow.status),
      linkskillsLeaseRef: lease?.lease_id ?? workflow.lease_id ?? null,
      linkautoworkWorkflowRef: workflow.workflow_run_id,
      linkbrainAuditRef: workflow.audit_event_ids[0] ?? lease?.audit_event_id ?? null,
      sideEffect: lease?.capability ?? null,
      updatedAt: workflow.completed_at ?? workflow.invoked_at,
    };
  });

  return {
    projectId,
    steps,
    approvalGates: defaultApprovalGates(projectId, steps.find((step) => step.id === "outreach")?.id ?? steps.at(-1)?.id ?? null),
  };
}

export function assertProjectTraceSurfaceComplete(surface: ProjectTraceSurface): {
  ok: boolean;
  missing: string[];
} {
  const missing: string[] = [];

  for (const step of surface.steps) {
    if (!step.linkskillsLeaseRef) missing.push(`step:${step.id}:linkskillsLeaseRef`);
    if (!step.linkautoworkWorkflowRef) missing.push(`step:${step.id}:linkautoworkWorkflowRef`);
    if (!step.linkbrainAuditRef) missing.push(`step:${step.id}:linkbrainAuditRef`);
  }

  const gatesByKind = new Map(surface.approvalGates.map((gate) => [gate.kind, gate]));
  for (const kind of REQUIRED_GATE_KINDS) {
    const gate = gatesByKind.get(kind);
    if (!gate) {
      missing.push(`gate:${kind}`);
      continue;
    }
    if (gate.allowedRoles.length === 0) missing.push(`gate:${gate.id}:allowedRoles`);
  }

  return { ok: missing.length === 0, missing };
}
