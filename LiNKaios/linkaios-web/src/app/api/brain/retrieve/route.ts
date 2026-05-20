import { NextResponse } from "next/server";

import {
  embedTextGemini,
  retrieveBrainContextForPath,
  type BrainRetrieveStage,
  type BrainScope,
} from "@linktrend/linklogic-sdk";

import { getSupabaseAdmin } from "@/lib/supabase-admin";

function unauthorized() {
  return NextResponse.json({ error: "unauthorized" }, { status: 401 });
}

function parseScope(v: unknown): BrainScope {
  if (v === "mission" || v === "agent") return v;
  return "company";
}

function parseStage(v: unknown): BrainRetrieveStage | undefined {
  if (v === "orientation" || v === "index_cards" || v === "chunks" || v === "full") return v;
  return undefined;
}

/**
 * Bot bridge: progressive disclosure retrieval (index cards + ranked chunks).
 * Auth: `Authorization: Bearer <BOT_BRAIN_API_SECRET>`.
 * Uses `GEMINI_API_KEY` when set to embed the query; otherwise chunks fall back to document order.
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
    query?: unknown;
    missionId?: unknown;
    agentId?: unknown;
    topK?: unknown;
    stage?: unknown;
  } | null;
  const logicalPath = typeof body?.logicalPath === "string" ? body.logicalPath.trim() : "";
  const query = typeof body?.query === "string" ? body.query : "";
  if (!logicalPath) {
    return NextResponse.json({ error: "logicalPath is required" }, { status: 400 });
  }

  const scope = parseScope(body?.scope);
  const missionId = typeof body?.missionId === "string" && body.missionId.trim() ? body.missionId.trim() : null;
  const agentId = typeof body?.agentId === "string" && body.agentId.trim() ? body.agentId.trim() : null;
  const topK = typeof body?.topK === "number" && body.topK > 0 && body.topK <= 24 ? body.topK : 6;

  const geminiKey = process.env.GEMINI_API_KEY;
  const embedQuery = geminiKey
    ? async (text: string) => {
        const r = await embedTextGemini(text, geminiKey);
        return "error" in r ? null : r.embedding;
      }
    : async () => null;

  const supabase = getSupabaseAdmin();
  /** When omitted, prefer index cards without chunk bodies unless callers explicitly widen. */
  const stage = parseStage(body?.stage) ?? "index_cards";
  const result = await retrieveBrainContextForPath(supabase, {
    scope,
    logicalPath,
    missionId: scope === "mission" ? missionId : null,
    agentId: scope === "agent" ? agentId : null,
    query,
    topK,
    embedQuery,
    stage,
  });

  return NextResponse.json(result);
}
