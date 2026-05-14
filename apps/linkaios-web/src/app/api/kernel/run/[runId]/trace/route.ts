/**
 * GET /api/kernel/run/[runId]/trace
 *
 * Read-only trace view for a run (no PII).
 * Implements CONTRACTS_MVO.md §4 Status + Trace surfaces.
 */

import { NextResponse } from "next/server";
import { getRunTrace, buildPreviewOutput } from "@/lib/kernel";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

function getEnv() {
  return {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    SUPABASE_SECRET_KEY: process.env.SUPABASE_SECRET_KEY!,
  };
}

export async function GET(
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
    const trace = await getRunTrace(env, runId);

    if (!trace) {
      return NextResponse.json(
        { error: "Run not found" },
        { status: 404 }
      );
    }

    // Build PreviewOutput per CONTRACTS_MVO.md §9
    const previewOutput = buildPreviewOutput(trace.run);

    return NextResponse.json({
      run: {
        run_id: trace.run.run_id,
        tenant_id: trace.run.tenant_id,
        plugin_id: trace.run.plugin_id,
        status: trace.run.status,
        started_at: trace.run.started_at,
        ended_at: trace.run.ended_at,
      },
      stages: trace.stages.map((s) => ({
        stage_id: s.stage_id,
        responsible_plane: s.responsible_plane,
        status: s.status,
        attempt: s.attempt,
        started_at: s.started_at,
        ended_at: s.ended_at,
        refs: {
          lease_ids: s.refs?.lease_ids || [],
          workflow_run_ids: s.refs?.workflow_run_ids || [],
          audit_event_ids: s.refs?.audit_event_ids || [],
        },
      })),
      approvals: trace.approvals.map((a) => ({
        approval_id: a.approval_id,
        stage_id: a.stage_id,
        capability_id: a.capability_id,
        status: a.status,
        requested_at: a.requested_at,
        decided_at: a.decided_at,
        decided_by: a.decided_by_actor_id,
      })),
      preview_output: previewOutput,
    });
  } catch (err) {
    console.error("Trace view error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal error" },
      { status: 500 }
    );
  }
}
