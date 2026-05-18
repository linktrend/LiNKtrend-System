import { NextResponse } from "next/server";

import { getPublishedVirtualFileBody, type BrainScope } from "@linktrend/linklogic-sdk";

import { getSupabaseAdmin } from "@/lib/supabase-admin";

function unauthorized() {
  return NextResponse.json({ error: "unauthorized" }, { status: 401 });
}

function parseScope(v: unknown): BrainScope {
  if (v === "mission" || v === "agent") return v;
  return "company";
}

/**
 * Bot / OpenClaw bridge: returns the **published** virtual file body for a logical path.
 * Auth: `Authorization: Bearer <BOT_BRAIN_API_SECRET>`. Server uses service role to read.
 */
export async function POST(req: Request) {
  const secret = process.env.BOT_BRAIN_API_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "BOT_BRAIN_API_SECRET is not configured" }, { status: 503 });
  }
  const auth = req.headers.get("authorization") ?? "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
  if (!token || token !== secret) return unauthorized();

  const body = (await req.json().catch(() => null)) as {
    scope?: unknown;
    logicalPath?: unknown;
    missionId?: unknown;
    agentId?: unknown;
  } | null;
  const logicalPath = typeof body?.logicalPath === "string" ? body.logicalPath.trim() : "";
  if (!logicalPath) {
    return NextResponse.json({ error: "logicalPath is required" }, { status: 400 });
  }
  const scope = parseScope(body?.scope);
  const missionId = typeof body?.missionId === "string" && body.missionId.trim() ? body.missionId.trim() : null;
  const agentId = typeof body?.agentId === "string" && body.agentId.trim() ? body.agentId.trim() : null;

  const supabase = getSupabaseAdmin();
  const { body: text, fileId, error } = await getPublishedVirtualFileBody(supabase, {
    scope,
    logicalPath,
    missionId: scope === "mission" ? missionId : null,
    agentId: scope === "agent" ? agentId : null,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ fileId, body: text });
}
