export type MetricsFilterOption = { id: string; label: string };

/** Canonical metrics scope dimensions (LiNKaios terminology). */
export type MetricsScopeKey = "suite" | "module" | "phase" | "issue";

export type MetricsScopeState = {
  suite: string;
  module: string;
  phase: string;
  issue: string;
};

export const DEFAULT_METRICS_SCOPE: MetricsScopeState = {
  suite: "all",
  module: "all",
  phase: "all",
  issue: "all",
};

/** Mock scope dimensions for Phase B filter stubs (UIUX-MET-M001). */
export const DEMO_METRICS_SCOPE_OPTIONS: Record<MetricsScopeKey, MetricsFilterOption[]> = {
  suite: [
    { id: "all", label: "All suites" },
    { id: "linksites", label: "LinkSites" },
    { id: "lexos-litigation", label: "LEXOS · Litigation" },
    { id: "linkapps", label: "LiNKapps" },
  ],
  module: [
    { id: "all", label: "All modules" },
    { id: "website-factory", label: "Website factory" },
    { id: "content-channel", label: "Content channel" },
    { id: "app-build", label: "App build" },
  ],
  phase: [
    { id: "all", label: "All phases" },
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

/** @deprecated Legacy scope keys — map to {@link MetricsScopeState} canonical fields. */
export type LegacyMetricsScopeKey = "module" | "projectType" | "workflow" | "issue";

/** @deprecated Use {@link MetricsScopeState} with suite/module/phase/issue keys. */
export type LegacyMetricsScopeState = {
  module: string;
  projectType: string;
  workflow: string;
  issue: string;
};

/** Convert legacy scope state (module/projectType/workflow) to canonical suite/module/phase. */
export function toCanonicalMetricsScope(
  scope: Partial<MetricsScopeState & LegacyMetricsScopeState>,
): MetricsScopeState {
  const hasLegacyShape = "projectType" in scope || "workflow" in scope;
  if (hasLegacyShape) {
    const legacy = scope as LegacyMetricsScopeState;
    return {
      suite: legacy.module ?? "all",
      module: legacy.projectType ?? "all",
      phase: legacy.workflow ?? "all",
      issue: legacy.issue ?? "all",
    };
  }
  return {
    suite: scope.suite ?? "all",
    module: scope.module ?? "all",
    phase: scope.phase ?? "all",
    issue: scope.issue ?? "all",
  };
}

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

  if (scope.suite !== "all") {
    const m = pick(["suite_id", "module_id", "module"]);
    if (m !== scope.suite) return false;
  }
  if (scope.module !== "all") {
    const pt = pick(["module_template_id", "project_type", "process_type"]);
    if (pt !== scope.module) return false;
  }
  if (scope.phase !== "all") {
    const w = pick(["phase_id", "workflow_id", "workflow"]);
    if (w !== scope.phase) return false;
  }
  if (scope.issue !== "all") {
    const i = pick(["issue_id", "issue"]);
    if (i !== scope.issue) return false;
  }
  return true;
}
