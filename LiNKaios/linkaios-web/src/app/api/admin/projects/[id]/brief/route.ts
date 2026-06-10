import { NextResponse } from "next/server";

import { resolveLicensorTenantId } from "@/lib/admin-linkskills-tenant";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

const MAX_BRIEF_LENGTH = 8000;

/** PATCH /api/admin/projects/[id]/brief — update operator-editable project brief. */
export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id: projectId } = await ctx.params;
  const body = await req.json().catch(() => null);

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const brief = typeof (body as Record<string, unknown>).brief === "string" ? (body as { brief: string }).brief.trim() : null;
  if (brief === null) {
    return NextResponse.json({ error: "brief is required" }, { status: 400 });
  }
  if (brief.length > MAX_BRIEF_LENGTH) {
    return NextResponse.json({ error: `brief must be at most ${MAX_BRIEF_LENGTH} characters` }, { status: 400 });
  }

  const tenantId = await resolveLicensorTenantId();
  if (!tenantId) {
    return NextResponse.json({ error: "Licensor tenant is not available" }, { status: 503 });
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .schema("linkaios")
    .from("projects")
    .update({ brief, updated_at: new Date().toISOString() })
    .eq("id", projectId)
    .eq("tenant_id", tenantId)
    .select("id")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
