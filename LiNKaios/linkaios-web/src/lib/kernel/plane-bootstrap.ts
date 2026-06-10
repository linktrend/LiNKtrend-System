import type { Env } from "@linktrend/shared-config";

import { adminProcessById, adminProcessesForSuite } from "@/lib/admin-suite-templates";
import { processesForModule } from "@/lib/ui-mocks/modules-catalog-demo";
import type { ModulePhaseTemplate, SuiteModuleTemplate } from "@/lib/ui-mocks/modules-catalog-demo";

import {
  planeApiRequest,
  planeV1WorkspacePath,
  resolvePlaneApiConfig,
  type PlaneApiConfig,
} from "./plane-api-client";

export type PlaneBootstrapInput = {
  tenant_id: string;
  linkaios_project_id: string;
  project_title: string;
  suite_id: string;
  module_ids: string[];
  cadence: "once" | "continuous";
};

export type PlaneBootstrapResult = {
  plane_project_id: string;
  plane_project_identifier: string;
  plane_cycle_id: string | null;
  plane_module_ids: string[];
  plane_issue_ids: string[];
  /** First created issue — satisfies legacy plane.task_id contract. */
  task_id: string;
  created: boolean;
};

type PlaneProjectResponse = {
  id: string;
  identifier?: string;
  name?: string;
};

type PlaneModuleResponse = { id: string };
type PlaneIssueResponse = { id: string };
type PlaneCycleResponse = { id: string };

function slugifyIdentifier(title: string, projectId: string): string {
  const fromTitle = title
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "")
    .slice(0, 8);
  const suffix = projectId.replace(/-/g, "").slice(0, 4).toUpperCase();
  const base = fromTitle || "LINKAIOS";
  return `${base}${suffix}`.slice(0, 12);
}

function cycleWindow(): { start_date: string; end_date: string; name: string } {
  const start = new Date();
  const end = new Date(start);
  end.setDate(end.getDate() + 14);
  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  return {
    name: `Run ${fmt(start)}`,
    start_date: fmt(start),
    end_date: fmt(end),
  };
}

function modulesForBootstrap(suiteId: string, moduleIds: string[]): SuiteModuleTemplate[] {
  const fromClientCatalogue = processesForModule(suiteId).filter(
    (process) => process.published && moduleIds.includes(process.id),
  );
  if (fromClientCatalogue.length > 0) {
    return fromClientCatalogue;
  }

  const fromAdminById = moduleIds
    .map((id) => adminProcessById(id))
    .filter((process): process is SuiteModuleTemplate => Boolean(process));
  if (fromAdminById.length > 0) {
    return fromAdminById;
  }

  const adminSuiteFallback = adminProcessesForSuite(suiteId).filter((process) => process.published);
  if (adminSuiteFallback.length > 0) {
    return adminSuiteFallback.slice(0, 1);
  }

  return processesForModule(suiteId).filter((process) => process.published).slice(0, 1);
}

async function createPlaneProject(
  config: PlaneApiConfig,
  input: PlaneBootstrapInput,
): Promise<PlaneProjectResponse> {
  const identifier = slugifyIdentifier(input.project_title, input.linkaios_project_id);
  const project = await planeApiRequest<PlaneProjectResponse>(
    config,
    "POST",
    planeV1WorkspacePath(config, "/projects/"),
    {
      name: input.project_title,
      identifier,
      description: `LiNKaios project ${input.linkaios_project_id}`,
    },
  );

  await planeApiRequest<PlaneProjectResponse>(
    config,
    "PATCH",
    planeV1WorkspacePath(config, `/projects/${project.id}/`),
    {
      module_view: true,
      cycle_view: true,
    },
  );

  return project;
}

async function createPlaneModule(
  config: PlaneApiConfig,
  planeProjectId: string,
  moduleTemplate: SuiteModuleTemplate,
): Promise<PlaneModuleResponse> {
  return planeApiRequest<PlaneModuleResponse>(
    config,
    "POST",
    planeV1WorkspacePath(config, `/projects/${planeProjectId}/modules/`),
    {
      name: moduleTemplate.name,
      description: moduleTemplate.summary,
    },
  );
}

async function createPlaneWorkItem(
  config: PlaneApiConfig,
  planeProjectId: string,
  phase: ModulePhaseTemplate,
  issueTitle: string,
  description?: string,
): Promise<PlaneIssueResponse> {
  return planeApiRequest<PlaneIssueResponse>(
    config,
    "POST",
    planeV1WorkspacePath(config, `/projects/${planeProjectId}/work-items/`),
    {
      name: issueTitle,
      description_html: description ? `<p>${description}</p>` : `<p>${phase.summary}</p>`,
    },
  );
}

async function linkWorkItemToModule(
  config: PlaneApiConfig,
  planeProjectId: string,
  planeModuleId: string,
  issueId: string,
): Promise<void> {
  await planeApiRequest(
    config,
    "POST",
    planeV1WorkspacePath(config, `/projects/${planeProjectId}/modules/${planeModuleId}/module-issues/`),
    { issues: [issueId] },
  );
}

async function createPlaneCycle(
  config: PlaneApiConfig,
  planeProjectId: string,
): Promise<PlaneCycleResponse> {
  const window = cycleWindow();
  return planeApiRequest<PlaneCycleResponse>(
    config,
    "POST",
    planeV1WorkspacePath(config, `/projects/${planeProjectId}/cycles/`),
    {
      ...window,
      project_id: planeProjectId,
    },
  );
}

/**
 * Bootstrap an empty Plane project with modules, work-items, and a Run cycle from suite templates.
 */
export async function bootstrapPlaneProjectFromSuite(
  env: Env,
  input: PlaneBootstrapInput,
): Promise<PlaneBootstrapResult> {
  const config = resolvePlaneApiConfig(env);
  const project = await createPlaneProject(config, input);
  const planeProjectId = project.id;
  const planeProjectIdentifier = project.identifier ?? slugifyIdentifier(input.project_title, input.linkaios_project_id);

  const moduleTemplates = modulesForBootstrap(input.suite_id, input.module_ids);
  const planeModuleIds: string[] = [];
  const planeIssueIds: string[] = [];

  for (const moduleTemplate of moduleTemplates) {
    const planeModule = await createPlaneModule(config, planeProjectId, moduleTemplate);
    planeModuleIds.push(planeModule.id);

    for (const phase of moduleTemplate.workflows) {
      for (const issue of phase.issues) {
        const created = await createPlaneWorkItem(
          config,
          planeProjectId,
          phase,
          issue.title,
          issue.description,
        );
        planeIssueIds.push(created.id);
        await linkWorkItemToModule(config, planeProjectId, planeModule.id, created.id);
      }
    }
  }

  const cycle = await createPlaneCycle(config, planeProjectId);

  return {
    plane_project_id: planeProjectId,
    plane_project_identifier: planeProjectIdentifier,
    plane_cycle_id: cycle?.id ?? null,
    plane_module_ids: planeModuleIds,
    plane_issue_ids: planeIssueIds,
    task_id: planeIssueIds[0] ?? planeProjectId,
    created: true,
  };
}

export async function getPlaneProject(
  env: Env,
  planeProjectId: string,
): Promise<PlaneProjectResponse | null> {
  const config = resolvePlaneApiConfig(env);
  try {
    return await planeApiRequest<PlaneProjectResponse>(
      config,
      "GET",
      planeV1WorkspacePath(config, `/projects/${planeProjectId}/`),
    );
  } catch {
    return null;
  }
}
