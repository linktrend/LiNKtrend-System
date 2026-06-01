/**
 * Client MVO operator flow — sign-in, Suite subscribe, Project launch, Run progress.
 * Traceability: PPD §4 Client; §5 MVO surfaces (LTS-002).
 */

export type ClientMvoFlowStep = {
  id: string;
  label: string;
  route: string;
  description: string;
};

export const LINKSITES_SUITE_ID = "linksites";

/** Ordered client path for LinkSites MVO demo. */
export const CLIENT_MVO_FLOW_STEPS: ClientMvoFlowStep[] = [
  {
    id: "sign_in",
    label: "Sign in",
    route: "/login",
    description: "Licensee authenticates via LiNKaios Client login",
  },
  {
    id: "subscribe_suite",
    label: "Subscribe to LinkSites",
    route: `/suites/${LINKSITES_SUITE_ID}?tab=subscribe`,
    description: "Enable LinkSites Suite on the tenant workspace",
  },
  {
    id: "launch_project",
    label: "Launch project",
    route: `/projects/new?suite=${LINKSITES_SUITE_ID}`,
    description: "Create a Project for one lead with suite modules and cadence",
  },
  {
    id: "run_progress",
    label: "Run progress",
    route: "/projects/{projectId}?tab=runs",
    description: "Project detail Runs tab shows orchestration progress entry points",
  },
  {
    id: "trace_approvals",
    label: "Trace approvals",
    route: "/projects/{projectId}?tab=traces",
    description: "Project detail Traces tab shows leases, automations, audits, and approval gates",
  },
];

export function suiteSubscribeHref(suiteId: string): string {
  return `/suites/${encodeURIComponent(suiteId)}?tab=subscribe`;
}

export function projectLaunchHref(suiteId: string): string {
  return `/projects/new?suite=${encodeURIComponent(suiteId)}`;
}

export function projectRunProgressHref(projectId: string): string {
  return `/projects/${encodeURIComponent(projectId)}?tab=runs`;
}

export function projectTraceApprovalHref(projectId: string): string {
  return `/projects/${encodeURIComponent(projectId)}?tab=traces`;
}

export function clientFlowStep(id: string): ClientMvoFlowStep | undefined {
  return CLIENT_MVO_FLOW_STEPS.find((step) => step.id === id);
}

export function assertClientMvoFlowComplete(checks: {
  canSignIn: boolean;
  linksitesSubscribed: boolean;
  canLaunchProject: boolean;
  hasRunProgressEntry: boolean;
  hasTraceApprovalEntry?: boolean;
}): { ok: boolean; missing: string[] } {
  const missing: string[] = [];
  if (!checks.canSignIn) missing.push("sign_in");
  if (!checks.linksitesSubscribed) missing.push("subscribe_suite");
  if (!checks.canLaunchProject) missing.push("launch_project");
  if (!checks.hasRunProgressEntry) missing.push("run_progress");
  if (checks.hasTraceApprovalEntry === false) missing.push("trace_approvals");
  return { ok: missing.length === 0, missing };
}
