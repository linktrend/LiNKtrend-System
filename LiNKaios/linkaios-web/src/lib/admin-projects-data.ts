import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { resolveLicensorTenantId } from "@/lib/admin-linkskills-tenant";
import {
  adminModuleDisplayNames,
  adminSuiteDisplayName,
  adminLeadAgentDisplayName,
} from "@/lib/admin-project-suite-binding";
import {
  adminProjectTypeLabel,
  classifyAdminProjectType,
  type AdminProjectType,
  type AdminProjectTypeLabel,
} from "@/lib/admin-project-types";
import type { ProjectIndexRow } from "@/lib/project-index-rows";
import { getPlaneBridgeConfig, planeProjectBoardHref, planeWorkspaceProjectsHref } from "@/lib/plane-links";
import { loadPlaneBridgesForProjects, planeHrefFromBridge, type PlaneProjectBridge } from "@/lib/plane-project-bridge";
import { isPlaneLiveConfigured } from "@/lib/kernel/plane-project-sync";
import { resolveEffectiveProjectStatus } from "@/lib/plane-project-status";

export type { AdminProjectType, AdminProjectTypeLabel };

export type AdminProjectIndexRow = ProjectIndexRow & {
  projectType: AdminProjectType;
  projectTypeLabel: AdminProjectTypeLabel;
};

export type AdminProjectDetailRow = {
  id: string;
  title: string;
  status: string;
  suiteId: string | null;
  suiteDisplayName: string;
  moduleIds: string[];
  moduleDisplayNames: string;
  cadence: string | null;
  primaryAgentId: string | null;
  leadAgentLabel: string;
  brief: string | null;
  projectType: AdminProjectType;
  projectTypeLabel: AdminProjectTypeLabel;
  planeProjectHref: string | null;
  planeSyncStatus: "synced" | "pending";
};

type AdminProjectDbRow = {
  id: string;
  title: string;
  status: string;
  suite_id: string | null;
  module_ids: string[] | null;
  cadence: string | null;
  primary_agent_id?: string | null;
  brief?: string | null;
};

function resolveAdminPlaneProjectHref(
  planeCfg: ReturnType<typeof getPlaneBridgeConfig>,
  bridge?: PlaneProjectBridge,
): string | null {
  return (
    planeHrefFromBridge(bridge) ??
    planeProjectBoardHref(planeCfg, bridge?.code ?? null) ??
    planeWorkspaceProjectsHref(planeCfg)
  );
}

function effectiveStatus(row: AdminProjectDbRow, bridge?: PlaneProjectBridge): string {
  return resolveEffectiveProjectStatus(row.status, bridge?.planeLiveState ?? "unmapped");
}

function rowFromDb(
  row: AdminProjectDbRow,
  planeCfg: ReturnType<typeof getPlaneBridgeConfig>,
  bridge?: PlaneProjectBridge,
): AdminProjectIndexRow {
  const projectType = classifyAdminProjectType(row.suite_id, row.module_ids);
  return {
    id: row.id,
    title: row.title,
    status: effectiveStatus(row, bridge),
    suiteName: adminSuiteDisplayName(row.suite_id),
    phaseName: "Phase pending",
    activeIssue: "No active issue linked",
    planeSyncStatus: bridge?.planeSyncStatus ?? "pending",
    planeProjectHref: resolveAdminPlaneProjectHref(planeCfg, bridge),
    projectType,
    projectTypeLabel: adminProjectTypeLabel(projectType),
  };
}

/**
 * Load vendor-scoped projects for LiNKaios Admin — licensor tenant only, no demo fixtures.
 */
export async function loadAdminProjectIndexRows(
  supabase: SupabaseClient,
): Promise<{ rows: AdminProjectIndexRow[]; error: string | null }> {
  const tenantId = await resolveLicensorTenantId();
  if (!tenantId) {
    return { rows: [], error: null };
  }

  const { data, error } = await supabase
    .schema("linkaios")
    .from("projects")
    .select("id, title, status, suite_id, module_ids")
    .eq("tenant_id", tenantId)
    .order("updated_at", { ascending: false })
    .limit(200);

  if (error) {
    return { rows: [], error: error.message };
  }

  const dbRows = (data ?? []) as AdminProjectDbRow[];
  const planeCfg = getPlaneBridgeConfig();
  const planeLive = isPlaneLiveConfigured();
  const planeBridges =
    planeLive && dbRows.length > 0
      ? await loadPlaneBridgesForProjects(dbRows.map((row) => row.id))
      : {};

  const rows = dbRows.map((row) => {
    const liveBridge = planeBridges[row.id];
    return rowFromDb(row, planeCfg, liveBridge);
  });

  return { rows, error: null };
}

/** Load one vendor project scoped to the licensor tenant — returns null when out of scope. */
export async function loadAdminProjectById(
  supabase: SupabaseClient,
  projectId: string,
): Promise<{ project: AdminProjectDetailRow | null; error: string | null }> {
  const tenantId = await resolveLicensorTenantId();
  if (!tenantId) {
    return { project: null, error: null };
  }

  const { data, error } = await supabase
    .schema("linkaios")
    .from("projects")
    .select("id, title, status, suite_id, module_ids, cadence, primary_agent_id, brief")
    .eq("id", projectId)
    .eq("tenant_id", tenantId)
    .maybeSingle();

  if (error) {
    return { project: null, error: error.message };
  }

  if (!data) {
    return { project: null, error: null };
  }

  const row = data as AdminProjectDbRow;
  const planeCfg = getPlaneBridgeConfig();
  const planeLive = isPlaneLiveConfigured();
  const liveBridge =
    planeLive ? (await loadPlaneBridgesForProjects([row.id]))[row.id] : undefined;
  const projectType = classifyAdminProjectType(row.suite_id, row.module_ids);

  return {
    project: {
      id: row.id,
      title: row.title,
      status: effectiveStatus(row, liveBridge),
      suiteId: row.suite_id,
      suiteDisplayName: adminSuiteDisplayName(row.suite_id),
      moduleIds: row.module_ids ?? [],
      moduleDisplayNames: adminModuleDisplayNames(row.suite_id, row.module_ids ?? []),
      cadence: row.cadence,
      primaryAgentId: row.primary_agent_id ?? null,
      leadAgentLabel: adminLeadAgentDisplayName(projectType),
      brief: row.brief ?? null,
      projectType,
      projectTypeLabel: adminProjectTypeLabel(projectType),
      planeProjectHref: resolveAdminPlaneProjectHref(planeCfg, liveBridge),
      planeSyncStatus: liveBridge?.planeSyncStatus ?? "pending",
    },
    error: null,
  };
}

/** Project picker options for Admin LiNKbrain program-memory tab. */
export async function loadAdminProgramPickerOptions(
  supabase: SupabaseClient,
): Promise<{ id: string; title: string }[]> {
  const { rows } = await loadAdminProjectIndexRows(supabase);
  return rows.map((row) => ({ id: row.id, title: row.title }));
}
