/**
 * POST /api/kernel/run/[runId]/execute
 *
 * Execute a run through its stages.
 * Implements CONTRACTS_MVO.md §4 Run lifecycle.
 */

import { NextResponse } from "next/server";
import { executeRun, getRunTrace } from "@/lib/kernel";
import { canAccessKernelScope, resolveKernelActor } from "@/lib/kernel/api-auth";
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

  const supabase = getSupabaseAdmin();
  const kernelAccessDeps = {
    getRunScope: async (targetRunId: string) => {
      const { data: run } = await supabase
        .schema("linkaios_kernel").from("runs")
        .select("tenant_id, work_request_id")
        .eq("run_id", targetRunId)
        .maybeSingle();
      if (!run?.work_request_id) return null;
      const { data: workRequest } = await supabase
        .schema("linkaios_kernel").from("work_requests")
        .select("requested_by_actor_id")
        .eq("work_request_id", run.work_request_id as string)
        .maybeSingle();
      if (!workRequest?.requested_by_actor_id || !run.tenant_id) return null;
      return {
        tenantId: run.tenant_id as string,
        requestedByActorId: workRequest.requested_by_actor_id as string,
      };
    },
    getApprovalScope: async () => null,
    userOwnsTenantScope: async (actorId: string, tenantId: string) => {
      const { data } = await supabase
        .schema("linkaios_kernel").from("work_requests")
        .select("work_request_id")
        .eq("tenant_id", tenantId)
        .eq("requested_by_actor_id", actorId)
        .limit(1);
      return Array.isArray(data) && data.length > 0;
    },
  };
  const actor = await resolveKernelActor(req, {
    getUserByAccessToken: async (accessToken) => {
      const { data: { user }, error } = await supabase.auth.getUser(accessToken);
      if (error || !user) return null;
      return { id: user.id };
    },
  });
  if (!actor) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!(await canAccessKernelScope(actor, { kind: "run", runId }, kernelAccessDeps))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
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
