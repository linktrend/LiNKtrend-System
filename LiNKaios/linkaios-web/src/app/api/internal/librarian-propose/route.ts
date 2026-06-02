import { NextResponse } from "next/server";

import { proposeLibrarianKnowledge } from "../../../../../../../LiNKbrain/librarian/persistence";
import type { LibrarianIngestInput } from "../../../../../../../LiNKbrain/librarian/knowledge-loop";

import { getSupabaseAdmin } from "@/lib/supabase-admin";

function authorizeInternal(req: Request): boolean {
  const secrets = [
    process.env.LINKAIOS_CRON_SECRET,
    process.env.CRON_SECRET,
    process.env.BOT_BRAIN_API_SECRET,
  ].filter(Boolean) as string[];
  if (!secrets.length) return false;
  const auth = req.headers.get("authorization") ?? "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
  return Boolean(token && secrets.includes(token));
}

/**
 * Event-driven librarian ingest (bot-runtime / kernel on run completion).
 */
export async function POST(req: Request) {
  if (!authorizeInternal(req)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  let body: LibrarianIngestInput;
  try {
    body = (await req.json()) as LibrarianIngestInput;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid json" }, { status: 400 });
  }

  if (!body.tenant_id || !body.run_id || !body.stage_id) {
    return NextResponse.json({ ok: false, error: "tenant_id, run_id, stage_id required" }, { status: 400 });
  }

  try {
    const admin = getSupabaseAdmin();
    const result = await proposeLibrarianKnowledge(admin, body);
    return NextResponse.json({
      ok: true,
      proposal: result.proposal,
      brain_file_version_id: result.brain_file_version_id,
      proposed_audit_event_id: result.proposed_audit_event_id,
      inbox_path: "/memory?tab=inbox&inbox_item=librarian",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "propose failed";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
