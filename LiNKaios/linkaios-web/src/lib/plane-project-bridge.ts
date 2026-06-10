import "server-only";

import { loadEnv } from "@linktrend/shared-config";

import { buildPlaneProjectUrl, isPlaneLiveConfigured } from "@/lib/kernel/plane-project-sync";
import { getPlaneProject } from "@/lib/kernel/plane-bootstrap";
import { planeLiveStateFromRemote, type PlaneProjectLiveState } from "@/lib/plane-project-status";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export type PlaneProjectBridge = {
  code: string;
  planeSyncStatus: "synced" | "pending";
  planeProjectId: string | null;
  /** Live Plane presence when API responds — archived when mapping exists but GET misses. */
  planeLiveState: PlaneProjectLiveState;
};

export async function loadPlaneBridgesForProjects(
  projectIds: string[],
): Promise<Record<string, PlaneProjectBridge>> {
  if (!isPlaneLiveConfigured() || projectIds.length === 0) {
    return {};
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .schema("linkskills")
    .from("plane_project_mappings")
    .select("lead_id, plane_project_id")
    .in("lead_id", projectIds);

  if (error || !data?.length) {
    return {};
  }

  const env = loadEnv();
  const out: Record<string, PlaneProjectBridge> = {};

  for (const row of data) {
    const leadId = String(row.lead_id);
    const planeProjectId = String(row.plane_project_id);
    const remote = await getPlaneProject(env, planeProjectId);
    const identifier = remote?.identifier?.trim() || planeProjectId;
    out[leadId] = {
      code: identifier,
      planeSyncStatus: remote ? "synced" : "pending",
      planeProjectId,
      planeLiveState: planeLiveStateFromRemote(Boolean(remote), true),
    };
  }

  return out;
}

export function planeHrefFromBridge(bridge: PlaneProjectBridge | undefined): string | null {
  if (!bridge?.planeProjectId) return null;
  return buildPlaneProjectUrl(bridge.planeProjectId, bridge.code);
}
