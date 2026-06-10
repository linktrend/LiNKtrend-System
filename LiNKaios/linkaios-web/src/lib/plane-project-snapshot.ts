import "server-only";

import { loadEnv } from "@linktrend/shared-config";

import { resolveLicensorTenantId } from "@/lib/admin-linkskills-tenant";
import { adminProcessById, adminProcessesForSuite } from "@/lib/admin-suite-templates";
import {
  planeApiRequest,
  planeV1WorkspacePath,
  resolvePlaneApiConfig,
} from "@/lib/kernel/plane-api-client";
import { isPlaneLiveConfigured } from "@/lib/kernel/plane-project-sync";
import type { ProjectTrackedItem } from "@/lib/project-tracked-items";
import { processesForModule, type ModulePhaseTemplate, type SuiteModuleTemplate } from "@/lib/ui-mocks/modules-catalog-demo";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

type PlaneWorkItem = {
  id: string;
  name?: string;
  state?: string | { group?: string; name?: string };
  updated_at?: string;
  completed_at?: string | null;
};

type PlaneModule = {
  id: string;
  name?: string;
};

export type PlaneProjectSnapshot = {
  planeProjectId: string | null;
  phases: ProjectTrackedItem[];
  issues: ProjectTrackedItem[];
  linkbotRoles: { id: string; display_name: string; role: string }[];
  automationTitles: { id: string; title: string }[];
  error: string | null;
};

function unwrapPlaneList<T>(body: unknown): T[] {
  if (Array.isArray(body)) return body as T[];
  if (body && typeof body === "object" && Array.isArray((body as { results?: T[] }).results)) {
    return (body as { results: T[] }).results;
  }
  return [];
}

function normalizePlaneStatus(state: PlaneWorkItem["state"]): string {
  const raw =
    typeof state === "string"
      ? state
      : typeof state === "object" && state
        ? state.group ?? state.name ?? "pending"
        : "pending";
  const value = raw.toLowerCase().replace(/\s+/g, "_");
  if (value.includes("progress") || value === "started" || value === "in_progress") return "running";
  if (value.includes("done") || value === "completed" || value === "complete") return "completed";
  if (value.includes("cancel")) return "skipped";
  return "pending";
}

function aggregatePhaseStatus(issueStatuses: string[]): string {
  if (issueStatuses.some((status) => status === "running")) return "running";
  if (issueStatuses.length > 0 && issueStatuses.every((status) => status === "completed")) return "completed";
  if (issueStatuses.some((status) => status === "skipped")) return "skipped";
  return "pending";
}

function moduleTemplatesForProject(
  suiteId: string | null | undefined,
  moduleIds: string[],
): SuiteModuleTemplate[] {
  const fromClientCatalogue = moduleIds
    .map((id) => processesForModule(suiteId ?? "").find((process) => process.id === id))
    .filter((process): process is SuiteModuleTemplate => Boolean(process));

  if (fromClientCatalogue.length > 0) {
    return fromClientCatalogue;
  }

  const fromAdminById = moduleIds
    .map((id) => adminProcessById(id))
    .filter((process): process is SuiteModuleTemplate => Boolean(process));
  if (fromAdminById.length > 0) {
    return fromAdminById;
  }

  if (suiteId) {
    const adminSuiteProcesses = adminProcessesForSuite(suiteId).filter((process) =>
      moduleIds.length === 0 ? true : moduleIds.includes(process.id),
    );
    if (adminSuiteProcesses.length > 0) {
      return adminSuiteProcesses;
    }
    return processesForModule(suiteId).filter((process) =>
      moduleIds.length === 0 ? true : moduleIds.includes(process.id),
    );
  }

  return [];
}

function matchWorkItemByTitle(workItems: PlaneWorkItem[], title: string): PlaneWorkItem | undefined {
  const normalized = title.trim().toLowerCase();
  return workItems.find((item) => (item.name ?? "").trim().toLowerCase() === normalized);
}

function buildTrackedFromTemplate(
  modules: SuiteModuleTemplate[],
  workItems: PlaneWorkItem[],
): { phases: ProjectTrackedItem[]; issues: ProjectTrackedItem[] } {
  const phases: ProjectTrackedItem[] = [];
  const issues: ProjectTrackedItem[] = [];

  for (const moduleTemplate of modules) {
    for (const phase of moduleTemplate.workflows) {
      const phaseIssueStatuses: string[] = [];

      for (const issue of phase.issues) {
        const remote = matchWorkItemByTitle(workItems, issue.title);
        const status = remote ? normalizePlaneStatus(remote.state) : "pending";
        phaseIssueStatuses.push(status);
        issues.push({
          id: remote?.id ?? issue.id,
          title: issue.title,
          status,
          detail: issue.description ?? phase.summary,
          updatedAt: remote?.updated_at ?? remote?.completed_at ?? null,
        });
      }

      phases.push({
        id: phase.id,
        title: phase.name,
        status: aggregatePhaseStatus(phaseIssueStatuses),
        detail: phase.summary,
        updatedAt: null,
      });
    }
  }

  return { phases, issues };
}

function assigneesFromModules(modules: SuiteModuleTemplate[]): {
  linkbotRoles: PlaneProjectSnapshot["linkbotRoles"];
  automationTitles: PlaneProjectSnapshot["automationTitles"];
} {
  const linkbotRoles: PlaneProjectSnapshot["linkbotRoles"] = [];
  const automationTitles: PlaneProjectSnapshot["automationTitles"] = [];
  const seenLinkbots = new Set<string>();
  const seenAutomations = new Set<string>();

  for (const moduleTemplate of modules) {
    for (const phase of moduleTemplate.workflows) {
      for (const issue of phase.issues) {
        for (const executor of issue.executors) {
          if (executor.kind === "agent" || executor.kind === "hybrid") {
            if (!seenLinkbots.has(executor.name)) {
              seenLinkbots.add(executor.name);
              linkbotRoles.push({
                id: `${moduleTemplate.id}:${executor.name}`,
                display_name: executor.name,
                role: executor.description ?? issue.title,
              });
            }
          }
          if (executor.kind === "automation" || executor.kind === "hybrid") {
            if (!seenAutomations.has(executor.name)) {
              seenAutomations.add(executor.name);
              automationTitles.push({
                id: `${moduleTemplate.id}:${executor.name}`,
                title: executor.name,
              });
            }
          }
        }
      }
    }
  }

  return { linkbotRoles, automationTitles };
}

async function resolvePlaneProjectId(linkaiosProjectId: string): Promise<string | null> {
  const tenantId = await resolveLicensorTenantId();
  if (!tenantId) return null;

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .schema("linkskills")
    .from("plane_project_mappings")
    .select("plane_project_id")
    .eq("tenant_id", tenantId)
    .eq("lead_id", linkaiosProjectId)
    .maybeSingle();

  if (error || !data?.plane_project_id) {
    return null;
  }
  return String(data.plane_project_id);
}

async function fetchPlaneWorkItems(planeProjectId: string): Promise<PlaneWorkItem[]> {
  const env = loadEnv();
  const config = resolvePlaneApiConfig(env);
  const body = await planeApiRequest<unknown>(
    config,
    "GET",
    planeV1WorkspacePath(config, `/projects/${planeProjectId}/work-items/`),
  );
  return unwrapPlaneList<PlaneWorkItem>(body);
}

async function fetchPlaneModules(planeProjectId: string): Promise<PlaneModule[]> {
  const env = loadEnv();
  const config = resolvePlaneApiConfig(env);
  const body = await planeApiRequest<unknown>(
    config,
    "GET",
    planeV1WorkspacePath(config, `/projects/${planeProjectId}/modules/`),
  );
  return unwrapPlaneList<PlaneModule>(body);
}

/**
 * Load Plane-backed phases/issues for a LiNKaios project when live mode is configured.
 * Falls back to suite template rows with pending status when Plane is not linked yet.
 */
export async function loadPlaneProjectSnapshot(input: {
  projectId: string;
  suiteId?: string | null;
  moduleIds?: string[];
}): Promise<PlaneProjectSnapshot> {
  const modules = moduleTemplatesForProject(input.suiteId, input.moduleIds ?? []);
  const assignees = assigneesFromModules(modules);

  if (!isPlaneLiveConfigured()) {
    const templateOnly = buildTrackedFromTemplate(modules, []);
    return {
      planeProjectId: null,
      phases: templateOnly.phases,
      issues: templateOnly.issues,
      linkbotRoles: assignees.linkbotRoles,
      automationTitles: assignees.automationTitles,
      error: null,
    };
  }

  const planeProjectId = await resolvePlaneProjectId(input.projectId);
  if (!planeProjectId) {
    const templateOnly = buildTrackedFromTemplate(modules, []);
    return {
      planeProjectId: null,
      phases: templateOnly.phases,
      issues: templateOnly.issues,
      linkbotRoles: assignees.linkbotRoles,
      automationTitles: assignees.automationTitles,
      error: null,
    };
  }

  try {
    const [workItems] = await Promise.all([
      fetchPlaneWorkItems(planeProjectId),
      fetchPlaneModules(planeProjectId),
    ]);
    const tracked = buildTrackedFromTemplate(modules, workItems);
    return {
      planeProjectId,
      phases: tracked.phases,
      issues: tracked.issues,
      linkbotRoles: assignees.linkbotRoles,
      automationTitles: assignees.automationTitles,
      error: null,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Plane snapshot fetch failed";
    const templateOnly = buildTrackedFromTemplate(modules, []);
    return {
      planeProjectId,
      phases: templateOnly.phases,
      issues: templateOnly.issues,
      linkbotRoles: assignees.linkbotRoles,
      automationTitles: assignees.automationTitles,
      error: message,
    };
  }
}

/** Exported for tests — map template phases without Plane network I/O. */
export function buildPlaneSnapshotFromTemplates(
  modules: SuiteModuleTemplate[],
  workItems: PlaneWorkItem[] = [],
): Pick<PlaneProjectSnapshot, "phases" | "issues" | "linkbotRoles" | "automationTitles"> {
  const tracked = buildTrackedFromTemplate(modules, workItems);
  const assignees = assigneesFromModules(modules);
  return {
    phases: tracked.phases,
    issues: tracked.issues,
    linkbotRoles: assignees.linkbotRoles,
    automationTitles: assignees.automationTitles,
  };
}

export type { ModulePhaseTemplate };
