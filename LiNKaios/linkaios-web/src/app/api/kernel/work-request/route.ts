/**
 * POST /api/kernel/work-request
 *
 * Create a work request for websitefactory.lead_to_preview.
 * Implements CONTRACTS_MVO.md §3 lead intake, §4.1 work_request.
 */

import { NextResponse } from "next/server";
import {
  intakeLeadWorkRequest,
  createRun,
  LeadValidationError,
} from "@/lib/kernel";
import { canAccessKernelScope, resolveKernelActor } from "@/lib/kernel/api-auth";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

function getEnv() {
  return {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    SUPABASE_SECRET_KEY: process.env.SUPABASE_SECRET_KEY!,
  };
}

export async function POST(req: Request) {
  const env = getEnv();

  const supabase = getSupabaseAdmin();
  const kernelAccessDeps = {
    getRunScope: async () => null,
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

  // Parse body
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const { lead_input } = body;
  if (!lead_input || typeof lead_input !== "object") {
    return NextResponse.json(
      { error: "Missing lead_input" },
      { status: 400 }
    );
  }
  const tenantId = typeof lead_input.tenant_id === "string" ? lead_input.tenant_id : null;
  if (!tenantId) {
    return NextResponse.json(
      { error: "Missing lead_input.tenant_id" },
      { status: 400 }
    );
  }
  if (!(await canAccessKernelScope(actor, { kind: "tenant", tenantId }, kernelAccessDeps))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const requestedBy =
    actor.kind === "service"
      ? { actor_kind: "system" as const, actor_id: actor.actorId }
      : { actor_kind: "user" as const, actor_id: actor.actorId };

  try {
    // Intake work request
    const { workRequest, leadRecord, isExisting } = await intakeLeadWorkRequest(
      env,
      lead_input,
      requestedBy
    );

    // Create run from work request
    const { run, isExisting: isExistingRun } = await createRun(env, workRequest);

    return NextResponse.json({
      work_request_id: workRequest.work_request_id,
      run_id: run.run_id,
      tenant_id: run.tenant_id,
      plugin_id: run.plugin_id,
      status: run.status,
      is_existing: isExisting || isExistingRun,
      lead_id: leadRecord.lead_id,
      stages: run.stages.map((s) => ({
        stage_id: s.stage_id,
        responsible_plane: s.responsible_plane,
        status: s.status,
      })),
    });
  } catch (err) {
    if (err instanceof LeadValidationError) {
      return NextResponse.json(
        {
          error: "Lead validation failed",
          code: err.code,
          issues: err.issues,
        },
        { status: 400 }
      );
    }
    console.error("Work request error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal error" },
      { status: 500 }
    );
  }
}
