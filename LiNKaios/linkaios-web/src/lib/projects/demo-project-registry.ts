import type { DemoMissionDetailSpec } from "@/lib/ui-mocks/missions-fixtures";

import type { CreateProjectRequest, ProjectCadence } from "./types";

export type RegisteredDemoProject = {
  id: string;
  request: CreateProjectRequest;
  suiteName: string;
  moduleNames: string[];
  createdAt: string;
  detailSpec: DemoMissionDetailSpec;
  planeBridge: {
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
  };
  processIds: string[];
};

const registry = new Map<string, RegisteredDemoProject>();

function planeCodeFromId(projectId: string): string {
  const slug = projectId.replace(/^proj-/, "").slice(0, 6).toUpperCase();
  return slug || "NEW";
}

function buildDetailSpec(input: {
  projectId: string;
  name: string;
  suiteName: string;
  moduleNames: string[];
  cadence: ProjectCadence;
  createdAt: string;
}): DemoMissionDetailSpec {
  const moduleLabel =
    input.moduleNames.length === 1
      ? input.moduleNames[0]!
      : `${input.moduleNames.length} modules from ${input.suiteName}`;

  return {
    id: input.projectId,
    title: input.name,
    tagline: "New project — LiNKaios orchestration and Plane bootstrap pending.",
    description: `Project created via POST /api/projects with ${input.moduleNames.join(", ")} from ${input.suiteName}. Plane provisioning is studio-managed.`,
    expectedOutputs: [
      "Empty Plane project with modules and issues from suite templates",
      "LiNKaios project record with orchestration trace visibility",
      "Capability leases for governed side effects",
    ],
    status: "assigned",
    moduleName: input.suiteName,
    projectTypeName: moduleLabel,
    workflowName: "Initial provisioning",
    activeIssue: "Awaiting Plane bootstrap",
    approvalGate: "Project head review",
    planeSyncStatus: "pending",
    leadId: "demo-lisa",
    leadName: "Lisa (CEO)",
    openWorkItems: 0,
    blockers: 0,
    cycle: input.cadence === "continuous" ? "Run 1 · Continuous" : "Single pass · Once",
  };
}

export function registerDemoProject(input: {
  projectId: string;
  request: CreateProjectRequest;
  suiteName: string;
  moduleNames: string[];
  processIds: string[];
  createdAt: string;
}): RegisteredDemoProject {
  const detailSpec = buildDetailSpec({
    projectId: input.projectId,
    name: input.request.name,
    suiteName: input.suiteName,
    moduleNames: input.moduleNames,
    cadence: input.request.cadence,
    createdAt: input.createdAt,
  });

  const entry: RegisteredDemoProject = {
    id: input.projectId,
    request: input.request,
    suiteName: input.suiteName,
    moduleNames: input.moduleNames,
    createdAt: input.createdAt,
    detailSpec,
    processIds: input.processIds,
    planeBridge: {
      code: planeCodeFromId(input.projectId),
      activeCycle: input.request.cadence === "continuous" ? "Run 1" : "Once",
      openWorkItems: 0,
      blockers: 0,
      moduleName: input.suiteName,
      projectTypeName: detailSpec.projectTypeName,
      workflowName: detailSpec.workflowName,
      activeIssue: detailSpec.activeIssue,
      approvalGate: detailSpec.approvalGate,
      planeSyncStatus: "pending",
    },
  };

  registry.set(input.projectId, entry);
  return entry;
}

export function getRegisteredDemoProject(projectId: string): RegisteredDemoProject | undefined {
  return registry.get(projectId);
}

export function isRegisteredDemoProjectId(projectId: string): boolean {
  return registry.has(projectId);
}

export function getRegisteredDemoProjectDetailSpec(projectId: string): DemoMissionDetailSpec | undefined {
  return registry.get(projectId)?.detailSpec;
}

export function getRegisteredDemoProjectProcessIds(projectId: string): string[] | undefined {
  return registry.get(projectId)?.processIds;
}

/** Test-only — reset in-memory registry between unit tests. */
export function clearDemoProjectRegistryForTests(): void {
  registry.clear();
}
