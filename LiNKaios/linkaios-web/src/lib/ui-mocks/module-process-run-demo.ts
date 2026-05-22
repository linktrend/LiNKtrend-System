import {
  LINKSITES_MVO_STAGES,
  type ModuleProcess,
  type WorkflowStageFixture,
  type WorkflowStageStatus,
} from "@/lib/ui-mocks/modules-catalog-demo";

export type ModuleProcessRunStatus = WorkflowStageStatus;

export type ModuleProcessRunFixture = {
  processId: string;
  projectId: string;
  projectName: string;
  status: ModuleProcessRunStatus;
  /** Set for one-shot processes (`rerunsAutomatically: false`). */
  completionPercent: number | null;
};

export const MODULE_PROCESS_RUN_PILL_LABELS = ["Running", "Completed", "Pending", "Skipped", "Failed"] as const;

function runStatusFromStages(stages: WorkflowStageFixture[]): ModuleProcessRunStatus {
  if (stages.some((s) => s.status === "running")) return "running";
  if (stages.every((s) => s.status === "completed" || s.status === "skipped")) return "completed";
  if (stages.some((s) => s.status === "pending")) return "pending";
  return "pending";
}

const STATIC_PROCESS_RUNS: Record<string, Omit<ModuleProcessRunFixture, "processId">> = {
  "site-refresh": {
    projectId: "demo-linksites-audit",
    projectName: "Bright Smile SEO Audit",
    status: "pending",
    completionPercent: null,
  },
  "lead-qualification-pack": {
    projectId: "demo-lead-batch",
    projectName: "March Lead Batch",
    status: "running",
    completionPercent: 67,
  },
  "app-factory-operator": {
    projectId: "demo-mission-1",
    projectName: "Northwind Modernisation",
    status: "running",
    completionPercent: 38,
  },
  "lexos-matter-intake": {
    projectId: "demo-lexos-intake",
    projectName: "Harborview Matter Intake",
    status: "completed",
    completionPercent: 100,
  },
};

function fixtureForWebsiteFactory(): Omit<ModuleProcessRunFixture, "processId"> {
  return {
    projectId: "demo-smb",
    projectName: "SMB Website Builder",
    status: runStatusFromStages(LINKSITES_MVO_STAGES),
    completionPercent: null,
  };
}

/** MVO demo — current process run posture for module overview cards. */
export function processRunFixtureFor(process: ModuleProcess): ModuleProcessRunFixture {
  const base =
    process.id === "website-factory"
      ? fixtureForWebsiteFactory()
      : STATIC_PROCESS_RUNS[process.id] ?? {
          projectId: `demo-${process.id}`,
          projectName: process.name,
          status: "pending" as const,
          completionPercent: process.rerunsAutomatically ? null : 0,
        };

  return {
    processId: process.id,
    ...base,
    completionPercent: process.rerunsAutomatically ? null : (base.completionPercent ?? 0),
  };
}

export function processRunFixturesForModule(processes: ModuleProcess[]): ModuleProcessRunFixture[] {
  return processes.filter((p) => p.published).map(processRunFixtureFor);
}

export function processRunPreviewLine(projectName: string): string {
  return `Project: ${projectName}`;
}
