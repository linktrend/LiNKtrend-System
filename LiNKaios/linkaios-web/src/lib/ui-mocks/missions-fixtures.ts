import type { MissionRecord } from "@linktrend/shared-types";

import { DEMO_SIDEBAR_MISSIONS } from "./entities";

const nowIso = () => new Date().toISOString();

export type DemoMissionDetailSpec = {
  id: string;
  title: string;
  tagline: string;
  status: string;
  moduleName: string;
  projectTypeName: string;
  workflowName: string;
  activeIssue: string;
  approvalGate: string;
  planeSyncStatus: "synced" | "pending";
  vendorOnlyNote?: string;
  leadId: string;
  leadName: string;
  openWorkItems: number;
  blockers: number;
  cycle: string;
};

/** Optional Plane-style bridge fields for the projects index when mocks are on. */
export const DEMO_MISSION_PLANE_BRIDGE: Record<
  string,
  {
    code: string;
    activeCycle: string;
    openWorkItems: number;
    blockers: number;
    moduleName: string;
    projectTypeName: string;
    workflowName: string;
    activeIssue: string;
    approvalGate: string;
    planeSyncStatus: "synced" | "pending";
  }
> = {
  "demo-smb": {
    code: "SMB",
    activeCycle: "2026.14",
    openWorkItems: 5,
    blockers: 1,
    moduleName: "LinkSites",
    projectTypeName: "WebsiteFactory MVO",
    workflowName: "Lead to preview handoff",
    activeIssue: "Preview QA blockers",
    approvalGate: "Project head review",
    planeSyncStatus: "synced",
  },
  "demo-ai-edu": {
    code: "EDU",
    activeCycle: "2026.13",
    openWorkItems: 2,
    blockers: 0,
    moduleName: "Linktrend Media",
    projectTypeName: "Curriculum campaign",
    workflowName: "Content production cycle",
    activeIssue: "Legal copy approval",
    approvalGate: "Vendor legal sign-off",
    planeSyncStatus: "synced",
  },
  "demo-mission-1": {
    code: "NW",
    activeCycle: "Q3 sprint",
    openWorkItems: 14,
    blockers: 2,
    moduleName: "LiNKapps",
    projectTypeName: "App relaunch",
    workflowName: "Migration release train",
    activeIssue: "Migration scope lock",
    approvalGate: "Executive release gate",
    planeSyncStatus: "pending",
  },
  "demo-mission-2": {
    code: "REL",
    activeCycle: "Hotfix window",
    openWorkItems: 3,
    blockers: 0,
    moduleName: "LEXOS Litigation",
    projectTypeName: "Matter operations",
    workflowName: "Intake to filing",
    activeIssue: "Client evidence intake",
    approvalGate: "Counsel approval",
    planeSyncStatus: "pending",
  },
};

export function demoMissionsFixtureRows(): MissionRecord[] {
  return [
    ...DEMO_SIDEBAR_MISSIONS,
    {
      id: "demo-mission-1",
      title: "Northwind modernisation",
      status: "running",
      primary_agent_id: "demo-lisa",
      created_at: nowIso(),
      updated_at: nowIso(),
    },
    {
      id: "demo-mission-2",
      title: "Platform reliability sprint",
      status: "assigned",
      primary_agent_id: "demo-eric",
      created_at: nowIso(),
      updated_at: nowIso(),
    },
  ];
}

export const DEMO_MISSION_DETAIL_SPECS: Record<string, DemoMissionDetailSpec> = {
  "demo-smb": {
    id: "demo-smb",
    title: "SMB Website Builder",
    tagline: "Fixture project for portfolio and delivery previews.",
    status: "running",
    moduleName: "LinkSites",
    projectTypeName: "WebsiteFactory MVO",
    workflowName: "Lead to preview handoff",
    activeIssue: "Preview QA blockers",
    approvalGate: "Project head review",
    planeSyncStatus: "synced",
    vendorOnlyNote: "Template internals are vendor-only.",
    leadId: "demo-lisa",
    leadName: "Lisa (CEO)",
    openWorkItems: 5,
    blockers: 1,
    cycle: "2026.14 · SMB rollout",
  },
  "demo-ai-edu": {
    id: "demo-ai-edu",
    title: "Ai Edu Channel",
    tagline: "Fixture project for curriculum and stakeholder comms.",
    status: "assigned",
    moduleName: "Linktrend Media",
    projectTypeName: "Curriculum campaign",
    workflowName: "Content production cycle",
    activeIssue: "Legal copy approval",
    approvalGate: "Vendor legal sign-off",
    planeSyncStatus: "synced",
    vendorOnlyNote: "Editorial automation settings are vendor-only.",
    leadId: "demo-eric",
    leadName: "Eric (CTO)",
    openWorkItems: 2,
    blockers: 0,
    cycle: "2026.13 · Curriculum refresh",
  },
  "demo-mission-1": {
    id: "demo-mission-1",
    title: "Northwind modernisation",
    tagline: "Fixture programme with mixed activity signals.",
    status: "running",
    moduleName: "LiNKapps",
    projectTypeName: "App relaunch",
    workflowName: "Migration release train",
    activeIssue: "Migration scope lock",
    approvalGate: "Executive release gate",
    planeSyncStatus: "pending",
    leadId: "demo-lisa",
    leadName: "Lisa (CEO)",
    openWorkItems: 14,
    blockers: 2,
    cycle: "Q3 sprint",
  },
  "demo-mission-2": {
    id: "demo-mission-2",
    title: "Platform reliability sprint",
    tagline: "Fixture infra programme with waiting-session patterns.",
    status: "assigned",
    moduleName: "LEXOS Litigation",
    projectTypeName: "Matter operations",
    workflowName: "Intake to filing",
    activeIssue: "Client evidence intake",
    approvalGate: "Counsel approval",
    planeSyncStatus: "pending",
    vendorOnlyNote: "Litigation strategy playbooks remain vendor-only.",
    leadId: "demo-eric",
    leadName: "Eric (CTO)",
    openWorkItems: 3,
    blockers: 0,
    cycle: "Hotfix window",
  },
};
