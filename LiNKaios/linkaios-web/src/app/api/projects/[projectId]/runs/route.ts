import { NextResponse } from "next/server";

import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type SpineRow = {
  project_id: string;
  project_title: string;
  tenant_id: string | null;
  run_id: string | null;
  run_status: string | null;
  run_started_at: string | null;
  run_ended_at: string | null;
  lease_ids: string[] | null;
  workflow_run_ids: string[] | null;
  audit_event_ids: string[] | null;
  trace_count: number | null;
};

/**
 * GET /api/projects/[projectId]/runs
 *
 * Returns project ↔ run spine rows with trace ref joins (LTS-001).
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ projectId: string }> },
) {
  const { projectId } = await params;

  if (!process.env.SUPABASE_SECRET_KEY || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  const sessionClient = await createSupabaseServerClient();
  const {
    data: { user },
  } = await sessionClient.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.schema("linkaios").rpc("get_project_run_spine", {
    p_project_id: projectId,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const rows = (data ?? []) as SpineRow[];
  if (rows.length === 0) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const head = rows[0];
  const runs = rows
    .filter((r) => r.run_id)
    .map((r) => ({
      run_id: r.run_id,
      status: r.run_status,
      started_at: r.run_started_at,
      ended_at: r.run_ended_at,
      refs: {
        lease_ids: r.lease_ids ?? [],
        workflow_run_ids: r.workflow_run_ids ?? [],
        audit_event_ids: r.audit_event_ids ?? [],
      },
    }));

  return NextResponse.json({
    project_id: head.project_id,
    title: head.project_title,
    tenant_id: head.tenant_id,
    trace_count: head.trace_count ?? 0,
    runs,
  });
}
