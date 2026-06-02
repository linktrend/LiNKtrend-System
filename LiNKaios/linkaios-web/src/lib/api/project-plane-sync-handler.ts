import { NextResponse } from "next/server";

import { loadEnv } from "@linktrend/shared-config";

import { dualProjectMissionIdFields } from "@/lib/api/project-mission-id";
import { syncLinkaiosProjectToPlane } from "@/lib/kernel/plane-project-sync";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

type ProjectRow = {
  id: string;
  title: string;
  tenant_id: string | null;
  suite_id: string | null;
  module_ids: string[] | null;
  cadence: string | null;
};

async function loadProject(projectId: string): Promise<ProjectRow | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .schema("linkaios")
    .from("projects")
    .select("id, title, tenant_id, suite_id, module_ids, cadence")
    .eq("id", projectId)
    .maybeSingle();

  if (error || !data) return null;
  return data as ProjectRow;
}

/**
 * POST handler — sync LiNKaios project to Plane under cap.plane.execution_tracking (live mode).
 */
export async function postProjectPlaneSync(routeProjectId: string) {
  if (!routeProjectId?.trim()) {
    return NextResponse.json({ error: "Missing project id" }, { status: 400 });
  }

  const project = await loadProject(routeProjectId.trim());
  if (!project?.tenant_id || !project.suite_id) {
    return NextResponse.json(
      { error: "Project not found or missing tenant/suite metadata" },
      { status: 404 },
    );
  }

  const env = loadEnv();
  const result = await syncLinkaiosProjectToPlane(
    {
      tenant_id: project.tenant_id,
      linkaios_project_id: project.id,
      project_title: project.title,
      suite_id: project.suite_id,
      module_ids: project.module_ids ?? [],
      cadence: (project.cadence === "continuous" ? "continuous" : "once") as "once" | "continuous",
    },
    env,
  );

  const ids = dualProjectMissionIdFields(routeProjectId);

  if (result.status === "live" && !result.synced) {
    return NextResponse.json(
      {
        status: "error" as const,
        message: result.message,
        planeSyncStatus: "pending" as const,
        ...ids,
      },
      { status: 502 },
    );
  }

  return NextResponse.json({
    status: result.status,
    message: result.message,
    planeSyncStatus: result.synced ? ("synced" as const) : ("pending" as const),
    planeProjectId: result.plane_project_id,
    planeProjectIdentifier: result.plane_project_identifier,
    planeUrl: result.plane_url,
    ...ids,
  });
}
