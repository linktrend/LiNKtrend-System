/**
 * GET /api/kernel/approvals
 * POST /api/kernel/approvals/[id]/decide
 *
 * Approval hooks for require_approval stages.
 * Implements CONTRACTS_MVO.md §4.4, §7.
 */

import { NextResponse } from "next/server";
import { listPendingApprovals, decideApproval, ApprovalError } from "@/lib/kernel";
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

  // Get tenant_id from query
  const url = new URL(req.url);
  const tenantId = url.searchParams.get("tenant_id");

  if (!tenantId) {
    return NextResponse.json(
      { error: "Missing tenant_id query parameter" },
      { status: 400 }
    );
  }

  try {
    const approvals = await listPendingApprovals(env, tenantId);

    return NextResponse.json({
      approvals: approvals.map((a) => ({
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

  // Auth check
  const authHeader = req.headers.get("authorization");
  const isService = authHeader === `Bearer ${process.env.BOT_KERNEL_API_SECRET}`;

  let userId = "service";
  if (!isService) {
    const supabase = getSupabaseAdmin();
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader?.replace("Bearer ", "") || ""
    );

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    userId = user.id;
  }

  const url = new URL(req.url);
  const approvalId = url.searchParams.get("approval_id");

  if (!approvalId) {
    return NextResponse.json(
      { error: "Missing approval_id query parameter" },
      { status: 400 }
    );
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
      decided_by_actor_id: userId,
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
