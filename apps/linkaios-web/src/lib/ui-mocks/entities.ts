import type { AgentRecord, MissionRecord } from "@linktrend/shared-types";

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
export const DEMO_SIDEBAR_MISSIONS: MissionRecord[] = [
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

export function isDemoAgentId(id: string): boolean {
  return id === "demo-lisa" || id === "demo-eric";
}

const DEMO_MISSION_PAGE_IDS = new Set<string>([
  ...DEMO_SIDEBAR_MISSIONS.map((m) => String(m.id)),
  "demo-mission-1",
  "demo-mission-2",
]);

export function isDemoMissionId(id: string): boolean {
  return DEMO_MISSION_PAGE_IDS.has(id);
}
