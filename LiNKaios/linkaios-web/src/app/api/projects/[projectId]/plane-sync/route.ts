import { postProjectPlaneSync } from "@/lib/api/project-plane-sync-handler";

/**
 * POST /api/projects/[projectId]/plane-sync
 *
 * Canonical route segment — `[projectId]` is the LiNKaios project id (demo slug or UUID).
 * Legacy clients may use `/api/projects/[missionId]/plane-sync` until Phase D.
 */
export async function POST(_req: Request, ctx: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await ctx.params;
  return postProjectPlaneSync(projectId);
}
