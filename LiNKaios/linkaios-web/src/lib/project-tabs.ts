const TABS = [
  "overview",
  "modules",
  "phases",
  "issues",
  "agents",
  "runs",
  "leases",
  "traces",
] as const;

export type ProjectTabId = (typeof TABS)[number];

export const PROJECT_TAB_DEFS: { id: ProjectTabId; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "modules", label: "Modules" },
  { id: "phases", label: "Phases" },
  { id: "issues", label: "Issues" },
  { id: "agents", label: "LiNKbots & Automations" },
  { id: "runs", label: "Runs" },
  { id: "leases", label: "Leases" },
  { id: "traces", label: "Traces" },
];

export const PROJECT_DEFAULT_TAB: ProjectTabId = "overview";

export function projectTabHref(missionId: string, tab: ProjectTabId): string {
  return tab === PROJECT_DEFAULT_TAB ? `/projects/${missionId}` : `/projects/${missionId}?tab=${tab}`;
}

export function projectTabLabel(tab: ProjectTabId): string {
  return PROJECT_TAB_DEFS.find((entry) => entry.id === tab)?.label ?? tab;
}

export function parseProjectTab(raw: string | string[] | undefined): ProjectTabId {
  const v = Array.isArray(raw) ? raw[0] : raw;
  if (v === "activity" || v === "run") return "runs";
  if (v === "tools") return "leases";
  if (v === "trace" || v === "audit") return "traces";
  if (v === "work-items" || v === "workflows" || v === "phases") return "phases";
  if (v === "processes" || v === "project-types") return "modules";
  if (v === "cycles") return "runs";
  if (v && (TABS as readonly string[]).includes(v)) return v as ProjectTabId;
  return "overview";
}
