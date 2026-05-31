import { postProjectPlaneSync } from "@/lib/api/project-plane-sync-handler";

/**
 * POST /api/projects/[missionId]/plane-sync
 *
 * @deprecated Route segment `[missionId]` — use `/api/projects/[projectId]/plane-sync`.
 * Segment value is the **LiNKaios project id** (demo slug or UUID).
 * Responses include both `projectId` and `missionId` with the same value until Phase D.
 */
export async function POST(_req: Request, ctx: { params: Promise<{ missionId: string }> }) {
  const { missionId: routeProjectId } = await ctx.params;
  return postProjectPlaneSync(routeProjectId);
}
