import { getSkillExecutionPackage } from "@linktrend/linklogic-sdk";
import { NextResponse } from "next/server";

import { getSupabaseAdmin } from "@/lib/supabase-admin";

function unauthorized() {
  return NextResponse.json({ error: "unauthorized" }, { status: 401 });
}

/**
 * Layer 3: full skill execution package (body + scripts + refs). Bot/service auth.
 */
export async function POST(req: Request) {
  const secret = process.env.BOT_SKILLS_API_SECRET ?? process.env.BOT_BRAIN_API_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "BOT_SKILLS_API_SECRET or BOT_BRAIN_API_SECRET is not configured" }, { status: 503 });
  }
  const auth = req.headers.get("authorization") ?? "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
  if (!token || token !== secret) return unauthorized();

  const body = (await req.json().catch(() => null)) as { id?: unknown; name?: unknown; version?: unknown } | null;
  const id = typeof body?.id === "string" && body.id.trim() ? body.id.trim() : undefined;
  const name = typeof body?.name === "string" && body.name.trim() ? body.name.trim().toLowerCase() : undefined;
  const version = typeof body?.version === "number" ? body.version : undefined;
  if (!id && !name) {
    return NextResponse.json({ error: "id or name is required" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await getSkillExecutionPackage(supabase, { id, name, version });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json(data);
}
