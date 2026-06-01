import {
  getRegisteredDemoProjectProcessIds,
} from "@/lib/projects/demo-project-registry";
import { MODULES_CATALOG_DEMO } from "@/lib/ui-mocks/modules-catalog-demo";
import { MODULE_PROJECTS } from "@/lib/ui-mocks/module-project-demo";
import {
  DEMO_PROJECT_DETAIL_SPECS,
  DEMO_PROJECT_PLANE_BRIDGE,
} from "@/lib/ui-mocks/projects-fixtures";

export type ProjectModuleRow = {
  order: number;
  templateId: string;
  name: string;
  summary: string;
  phaseCount: number;
  issueCount: number;
  continuous: boolean;
  suiteName: string | null;
};

function issueCountForProcess(processId: string): number {
  const process = MODULES_CATALOG_DEMO.processes.find((p) => p.id === processId);
  if (!process) return 0;
  return process.workflows.reduce((sum, wf) => sum + wf.issues.length, 0);
}

function rowFromProcess(processId: string, order: number): ProjectModuleRow | null {
  const process = MODULES_CATALOG_DEMO.processes.find((p) => p.id === processId);
  if (!process) return null;
  const suite = MODULES_CATALOG_DEMO.modules.find((m) => m.id === process.moduleId);
  return {
    order,
    templateId: process.id,
    name: process.name,
    summary: process.summary,
    phaseCount: process.workflows.length,
    issueCount: issueCountForProcess(process.id),
    continuous: process.rerunsAutomatically,
    suiteName: suite?.name ?? null,
  };
}

function fallbackRow(projectId: string): ProjectModuleRow | null {
  const bridge = DEMO_PROJECT_PLANE_BRIDGE[projectId];
  const spec = DEMO_PROJECT_DETAIL_SPECS[projectId];
  const moduleLabel = bridge?.projectTypeName ?? spec?.projectTypeName;
  const suiteLabel = bridge?.moduleName ?? spec?.moduleName;
  if (!moduleLabel) return null;

  const byName = MODULES_CATALOG_DEMO.processes.find(
    (p) => p.name === moduleLabel || p.name.toLowerCase().includes(moduleLabel.toLowerCase().slice(0, 8)),
  );
  if (byName) return rowFromProcess(byName.id, 1);

  return {
    order: 1,
    templateId: `${projectId}-module`,
    name: moduleLabel,
    summary: spec?.description ?? "Module bound to this project from the suite catalogue.",
    phaseCount: 0,
    issueCount: 0,
    continuous: false,
    suiteName: suiteLabel ?? null,
  };
}

/** Modules included in a live project — ordered list from fixtures or bridge fallback. */
export function demoProjectModules(projectId: string): ProjectModuleRow[] {
  const registeredProcessIds = getRegisteredDemoProjectProcessIds(projectId);
  if (registeredProcessIds) {
    return registeredProcessIds
      .map((id, index) => rowFromProcess(id, index + 1))
      .filter((row): row is ProjectModuleRow => row != null);
  }

  const fixture = MODULE_PROJECTS.find((p) => p.id === projectId);
  if (fixture) {
    return fixture.processIds
      .map((id, index) => rowFromProcess(id, index + 1))
      .filter((row): row is ProjectModuleRow => row != null);
  }
  const fallback = fallbackRow(projectId);
  return fallback ? [fallback] : [];
}
