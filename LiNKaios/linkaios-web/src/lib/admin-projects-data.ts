import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { resolveLicensorTenantId } from "@/lib/admin-linkskills-tenant";
import {
  adminProjectTypeLabel,
  classifyAdminProjectType,
  type AdminProjectType,
  type AdminProjectTypeLabel,
} from "@/lib/admin-project-types";
import type { ProjectIndexRow } from "@/lib/project-index-rows";
import { getPlaneBridgeConfig, planeProjectBoardHref } from "@/lib/plane-links";
import { loadPlaneBridgesForProjects } from "@/lib/plane-project-bridge";
import { isPlaneLiveConfigured } from "@/lib/kernel/plane-project-sync";

export type { AdminProjectType, AdminProjectTypeLabel };

export type AdminProjectIndexRow = ProjectIndexRow & {
  projectType: AdminProjectType;
  projectTypeLabel: AdminProjectTypeLabel;
};

type AdminProjectDbRow = {
  id: string;
  title: string;
  status: string;
  suite_id: string | null;
  module_ids: string[] | null;
};

function rowFromDb(
  row: AdminProjectDbRow,
  planeCfg: ReturnType<typeof getPlaneBridgeConfig>,
  bridge?: { code: string | null; planeSyncStatus: "synced" | "pending" },
): AdminProjectIndexRow {
  const projectType = classifyAdminProjectType(row.suite_id, row.module_ids);
  return {
    id: row.id,
    title: row.title,
    status: row.status,
    suiteName: adminProjectTypeLabel(projectType),
    phaseName: "Phase pending",
    activeIssue: "No active issue linked",
    planeSyncStatus: bridge?.planeSyncStatus ?? "pending",
    planeProjectHref: planeProjectBoardHref(planeCfg, bridge?.code ?? null),
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
    return rowFromDb(
      row,
      planeCfg,
      liveBridge
        ? { code: liveBridge.code, planeSyncStatus: liveBridge.planeSyncStatus }
        : undefined,
    );
  });

  return { rows, error: null };
}

/** Project picker options for Admin LiNKbrain program-memory tab. */
export async function loadAdminProgramPickerOptions(
  supabase: SupabaseClient,
): Promise<{ id: string; title: string }[]> {
  const { rows } = await loadAdminProjectIndexRows(supabase);
  return rows.map((row) => ({ id: row.id, title: row.title }));
}
