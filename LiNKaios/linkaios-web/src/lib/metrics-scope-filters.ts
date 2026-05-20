export type MetricsFilterOption = { id: string; label: string };

export type MetricsScopeKey = "module" | "projectType" | "workflow" | "issue";

export type MetricsScopeState = {
  module: string;
  projectType: string;
  workflow: string;
  issue: string;
};

export const DEFAULT_METRICS_SCOPE: MetricsScopeState = {
  module: "all",
  projectType: "all",
  workflow: "all",
  issue: "all",
};

/** Mock scope dimensions for Phase B filter stubs (UIUX-MET-M001). */
export const DEMO_METRICS_SCOPE_OPTIONS: Record<MetricsScopeKey, MetricsFilterOption[]> = {
  module: [
    { id: "all", label: "All modules" },
    { id: "linksites", label: "LinkSites" },
    { id: "lexos-litigation", label: "LEXOS · Litigation" },
    { id: "linkapps", label: "LiNKapps" },
  ],
  projectType: [
    { id: "all", label: "All project types" },
    { id: "website-factory", label: "Website factory" },
    { id: "content-channel", label: "Content channel" },
    { id: "app-build", label: "App build" },
  ],
  workflow: [
    { id: "all", label: "All workflows" },
    { id: "lead-to-preview", label: "Lead → preview site" },
    { id: "copy-generation", label: "Copy generation" },
    { id: "publish-handoff", label: "Publish handoff" },
  ],
  issue: [
    { id: "all", label: "All issues" },
    { id: "issue-142", label: "ISS-142 · Template selection" },
    { id: "issue-158", label: "ISS-158 · CRM sync stub" },
    { id: "issue-201", label: "ISS-201 · Preview deploy" },
  ],
};

export function scopePayloadMatches(
  payload: Record<string, unknown>,
  scope: MetricsScopeState,
): boolean {
  const pick = (keys: string[]) => {
    for (const k of keys) {
      const v = payload[k];
      if (typeof v === "string" && v.trim()) return v.trim();
    }
    return null;
  };

  if (scope.module !== "all") {
    const m = pick(["module_id", "module"]);
    if (m !== scope.module) return false;
  }
  if (scope.projectType !== "all") {
    const pt = pick(["project_type", "process_type"]);
    if (pt !== scope.projectType) return false;
  }
  if (scope.workflow !== "all") {
    const w = pick(["workflow_id", "workflow"]);
    if (w !== scope.workflow) return false;
  }
  if (scope.issue !== "all") {
    const i = pick(["issue_id", "issue"]);
    if (i !== scope.issue) return false;
  }
  return true;
}
