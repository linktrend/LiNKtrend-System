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
import { getSupabaseAdmin } from "@/lib/supabase-admin";

function getEnv() {
  return {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    SUPABASE_SECRET_KEY: process.env.SUPABASE_SECRET_KEY!,
  };
}

export async function POST(req: Request) {
  const env = getEnv();

  // Auth check - require service role or authenticated user
  const authHeader = req.headers.get("authorization");
  const isService = authHeader === `Bearer ${process.env.BOT_KERNEL_API_SECRET}`;

  if (!isService) {
    // Check user auth via supabase session
    const supabase = getSupabaseAdmin();
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader?.replace("Bearer ", "") || ""
    );
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  // Parse body
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const { lead_input, requested_by } = body;
  if (!lead_input || typeof lead_input !== "object") {
    return NextResponse.json(
      { error: "Missing lead_input" },
      { status: 400 }
    );
  }

  try {
    // Intake work request
    const { workRequest, leadRecord, isExisting } = await intakeLeadWorkRequest(
      env,
      lead_input,
      requested_by || { actor_kind: "user", actor_id: "anonymous" }
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
