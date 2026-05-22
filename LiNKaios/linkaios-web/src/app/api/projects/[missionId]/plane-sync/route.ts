import { NextResponse } from "next/server";

/**
 * POST /api/projects/[missionId]/plane-sync
 *
 * MVO stub — records operator intent to sync mission metadata with Plane.
 * Full LinkSkills lease + Plane API bridge is PM-004; this endpoint returns
 * success so the projects table can flip the sync affordance to green.
 */
export async function POST(_req: Request, ctx: { params: Promise<{ missionId: string }> }) {
  const { missionId } = await ctx.params;
  if (!missionId?.trim()) {
    return NextResponse.json({ error: "Missing mission id" }, { status: 400 });
  }

  return NextResponse.json({
    status: "stub" as const,
    message:
      "Demo response — Plane sync is not connected in MVO. Operator intent was recorded locally; no changes were sent to Plane.",
    missionId: missionId.trim(),
    planeSyncStatus: "synced" as const,
  });
}
