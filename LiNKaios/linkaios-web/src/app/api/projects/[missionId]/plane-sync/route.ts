import { NextResponse } from "next/server";

import { dualProjectMissionIdFields } from "@/lib/api/project-mission-id";

/**
 * POST /api/projects/[missionId]/plane-sync
 *
 * Route segment `[missionId]` is the **LiNKaios project id** (demo slug or UUID).
 * Responses include both `projectId` and `missionId` with the same value until Phase D.
 *
 * MVO stub — records operator intent to sync project metadata with Plane.
 * Full LinkSkills lease + Plane API bridge is PM-004; this endpoint returns
 * success so the projects table can flip the sync affordance to green.
 */
export async function POST(_req: Request, ctx: { params: Promise<{ missionId: string }> }) {
  const { missionId: routeProjectId } = await ctx.params;
  if (!routeProjectId?.trim()) {
    return NextResponse.json({ error: "Missing project id" }, { status: 400 });
  }

  const ids = dualProjectMissionIdFields(routeProjectId);

  return NextResponse.json({
    status: "stub" as const,
    message:
      "Demo response — Plane sync is not connected in MVO. Operator intent was recorded locally; no changes were sent to Plane.",
    ...ids,
    planeSyncStatus: "synced" as const,
  });
}
