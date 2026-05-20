/**
 * GET /api/kernel/approvals
 * POST /api/kernel/approvals/[id]/decide
 *
 * Approval hooks for require_approval stages.
 * Implements CONTRACTS_MVO.md §4.4, §7.
 */

import { NextResponse } from "next/server";
import { listPendingApprovals, decideApproval, ApprovalError } from "@/lib/kernel";
import { canAccessKernelScope, isKernelOperatorActor, resolveKernelActor } from "@/lib/kernel/api-auth";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

function getEnv() {
  return {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    SUPABASE_SECRET_KEY: process.env.SUPABASE_SECRET_KEY!,
  };
}

/**
 * GET /api/kernel/approvals?tenant_id=xxx
 * List pending approvals for a tenant.
 */
export async function GET(req: Request) {
  const env = getEnv();

  const supabase = getSupabaseAdmin();
  const kernelAccessDeps = {
    getRunScope: async (runId: string) => {
      const { data: run } = await supabase
        .schema("linkaios_kernel").from("runs")
        .select("tenant_id, work_request_id")
        .eq("run_id", runId)
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
    getApprovalScope: async (approvalId: string) => {
      const { data } = await supabase
        .schema("linkaios_kernel").from("approvals")
        .select("run_id, tenant_id, requested_by_actor_id")
        .eq("approval_id", approvalId)
        .maybeSingle();
      if (!data?.run_id || !data?.tenant_id || !data?.requested_by_actor_id) return null;
      return {
        runId: data.run_id as string,
        tenantId: data.tenant_id as string,
        requestedByActorId: data.requested_by_actor_id as string,
      };
    },
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

  // Get tenant_id from query
  const url = new URL(req.url);
  const tenantId = url.searchParams.get("tenant_id");

  if (!tenantId) {
    return NextResponse.json(
      { error: "Missing tenant_id query parameter" },
      { status: 400 }
    );
  }
  if (!isKernelOperatorActor(actor) && !(await canAccessKernelScope(actor, { kind: "tenant", tenantId }, kernelAccessDeps))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const approvals = await listPendingApprovals(env, tenantId);
    const visibleApprovals = isKernelOperatorActor(actor)
      ? approvals
      : approvals.filter((approval) => approval.requested_by_actor_id === actor.actorId);

    return NextResponse.json({
      approvals: visibleApprovals.map((a) => ({
        approval_id: a.approval_id,
        run_id: a.run_id,
        stage_id: a.stage_id,
        capability_id: a.capability_id,
        requested_at: a.requested_at,
        requested_by: a.requested_by_actor_id,
        expires_at: a.expires_at,
      })),
    });
  } catch (err) {
    console.error("List approvals error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/kernel/approvals?approval_id=xxx
 * Grant or reject an approval.
 */
export async function POST(req: Request) {
  const env = getEnv();

  const supabase = getSupabaseAdmin();
  const kernelAccessDeps = {
    getRunScope: async (runId: string) => {
      const { data: run } = await supabase
        .schema("linkaios_kernel").from("runs")
        .select("tenant_id, work_request_id")
        .eq("run_id", runId)
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
    getApprovalScope: async (approvalId: string) => {
      const { data } = await supabase
        .schema("linkaios_kernel").from("approvals")
        .select("run_id, tenant_id, requested_by_actor_id")
        .eq("approval_id", approvalId)
        .maybeSingle();
      if (!data?.run_id || !data?.tenant_id || !data?.requested_by_actor_id) return null;
      return {
        runId: data.run_id as string,
        tenantId: data.tenant_id as string,
        requestedByActorId: data.requested_by_actor_id as string,
      };
    },
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

  const url = new URL(req.url);
  const approvalId = url.searchParams.get("approval_id");

  if (!approvalId) {
    return NextResponse.json(
      { error: "Missing approval_id query parameter" },
      { status: 400 }
    );
  }
  if (!(await canAccessKernelScope(actor, { kind: "approval", approvalId }, kernelAccessDeps))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Parse body
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const { decision, reason } = body;
  if (!decision || !["granted", "rejected"].includes(decision)) {
    return NextResponse.json(
      { error: "Invalid decision. Must be 'granted' or 'rejected'" },
      { status: 400 }
    );
  }

  try {
    const approval = await decideApproval(env, {
      approval_id: approvalId,
      decision,
      decided_by_actor_id: actor.actorId,
      reason,
    });

    return NextResponse.json({
      approval_id: approval.approval_id,
      run_id: approval.run_id,
      stage_id: approval.stage_id,
      status: approval.status,
      decided_at: approval.decided_at,
      decided_by: approval.decided_by_actor_id,
      decision_reason: approval.decision_reason,
    });
  } catch (err) {
    if (err instanceof ApprovalError) {
      return NextResponse.json(
        { error: err.message },
        { status: 400 }
      );
    }
    console.error("Approval decision error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal error" },
      { status: 500 }
    );
  }
}
