import type { MissionRecord } from "@linktrend/shared-types";

import {
  planeProjectBoardHref,
  type PlaneBridgeConfig,
} from "@/lib/plane-links";
import { getSuiteById } from "@/lib/suites-page-copy";
import {
  DEMO_MISSION_DETAIL_SPECS,
  DEMO_MISSION_PLANE_BRIDGE,
} from "@/lib/ui-mocks/missions-fixtures";
import { projectsForModule } from "@/lib/ui-mocks/module-project-demo";

export type ProjectIndexRow = {
  id: string;
  title: string;
  status: string;
  suiteName: string;
  phaseName: string;
  activeIssue: string;
  planeSyncStatus: "synced" | "pending";
  planeProjectHref: string | null;
};

function rowFromBridge(
  id: string,
  title: string,
  status: string,
  planeCfg: PlaneBridgeConfig,
  bridge?: (typeof DEMO_MISSION_PLANE_BRIDGE)[string],
  suiteFallback?: string,
): ProjectIndexRow {
  return {
    id,
    title,
    status,
    suiteName: bridge?.moduleName ?? suiteFallback ?? "Unmapped suite",
    phaseName: bridge?.workflowName ?? "Phase pending",
    activeIssue: bridge?.activeIssue ?? "No active issue linked",
    planeSyncStatus: bridge?.planeSyncStatus ?? "pending",
    planeProjectHref: planeProjectBoardHref(planeCfg, bridge?.code ?? null),
  };
}

export function projectIndexRowFromMission(
  mission: MissionRecord,
  planeCfg: PlaneBridgeConfig,
  bridge?: (typeof DEMO_MISSION_PLANE_BRIDGE)[string],
): ProjectIndexRow {
  return rowFromBridge(String(mission.id), mission.title, mission.status, planeCfg, bridge);
}

/** All projects for a suite — fixture-backed for MVO demos. */
export function suiteProjectIndexRows(suiteId: string, planeCfg: PlaneBridgeConfig): ProjectIndexRow[] {
  const suiteLabel = getSuiteById(suiteId)?.name ?? suiteId;
  return projectsForModule(suiteId).map((project) => {
    const bridge = DEMO_MISSION_PLANE_BRIDGE[project.id];
    const spec = DEMO_MISSION_DETAIL_SPECS[project.id];
    return rowFromBridge(
      project.id,
      project.name,
      spec?.status ?? "running",
      planeCfg,
      bridge,
      bridge?.moduleName ?? suiteLabel,
    );
  });
}
