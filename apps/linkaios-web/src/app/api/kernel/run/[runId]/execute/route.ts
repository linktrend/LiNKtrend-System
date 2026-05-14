/**
 * POST /api/kernel/run/[runId]/execute
 *
 * Execute a run through its stages.
 * Implements CONTRACTS_MVO.md §4 Run lifecycle.
 */

import { NextResponse } from "next/server";
import { executeRun, getRunTrace } from "@/lib/kernel";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

function getEnv() {
  return {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    SUPABASE_SECRET_KEY: process.env.SUPABASE_SECRET_KEY!,
  };
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ runId: string }> }
) {
  const env = getEnv();
  const { runId } = await params;

  // Auth check
  const authHeader = req.headers.get("authorization");
  const isService = authHeader === `Bearer ${process.env.BOT_KERNEL_API_SECRET}`;

  if (!isService) {
    const supabase = getSupabaseAdmin();
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader?.replace("Bearer ", "") || ""
    );
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    // Execute run
    const run = await executeRun(env, runId);

    // Return trace view
    const trace = await getRunTrace(env, runId);

    return NextResponse.json({
      run_id: run.run_id,
      status: run.status,
      started_at: run.started_at,
      ended_at: run.ended_at,
      stages: trace?.stages.map((s) => ({
        stage_id: s.stage_id,
        responsible_plane: s.responsible_plane,
        status: s.status,
        attempt: s.attempt,
        refs: s.refs,
      })),
      outputs: run.outputs,
    });
  } catch (err) {
    console.error("Run execution error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal error" },
      { status: 500 }
    );
  }
}
