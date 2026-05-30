import type { AgentRecord, ProjectRecord } from "@linktrend/shared-types";

const nowIso = () => new Date().toISOString();

/** Demo LiNKbots merged into shell lists when UI mocks are enabled. */
export const DEMO_SIDEBAR_AGENTS: AgentRecord[] = [
  {
    id: "demo-lisa",
    display_name: "Lisa (CEO)",
    status: "active",
    created_at: nowIso(),
    updated_at: nowIso(),
  },
  {
    id: "demo-eric",
    display_name: "Eric (CTO)",
    status: "active",
    created_at: nowIso(),
    updated_at: nowIso(),
  },
];

/** Demo projects for overview and metrics filters when UI mocks are enabled. */
export const DEMO_SIDEBAR_PROJECTS: ProjectRecord[] = [
  {
    id: "demo-smb",
    title: "SMB Website Builder",
    status: "running",
    primary_agent_id: "demo-lisa",
    created_at: nowIso(),
    updated_at: nowIso(),
  },
  {
    id: "demo-ai-edu",
    title: "Ai Edu Channel",
    status: "assigned",
    primary_agent_id: "demo-eric",
    created_at: nowIso(),
    updated_at: nowIso(),
  },
];

/** @deprecated Use {@link DEMO_SIDEBAR_PROJECTS}. */
export const DEMO_SIDEBAR_MISSIONS = DEMO_SIDEBAR_PROJECTS;

export function isDemoAgentId(id: string): boolean {
  return id === "demo-lisa" || id === "demo-eric";
}

const DEMO_PROJECT_PAGE_IDS = new Set<string>([
  ...DEMO_SIDEBAR_PROJECTS.map((m) => String(m.id)),
  "demo-mission-1",
  "demo-mission-2",
]);

/** Stub projects created via POST /api/projects use the proj- prefix. */
export function isStubCreatedProjectId(id: string): boolean {
  return id.startsWith("proj-");
}

export function isDemoProjectId(id: string): boolean {
  return DEMO_PROJECT_PAGE_IDS.has(id) || isStubCreatedProjectId(id);
}

/** @deprecated Use {@link isDemoProjectId}. */
export const isDemoMissionId = isDemoProjectId;
