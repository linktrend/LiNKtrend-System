import { embedMissingBrainChunks } from "@linktrend/linklogic-sdk";
import { NextResponse } from "next/server";

import { getSupabaseAdmin } from "@/lib/supabase-admin";

function authorizeCron(req: Request): boolean {
  const secrets = [process.env.LINKAIOS_CRON_SECRET, process.env.CRON_SECRET].filter(Boolean) as string[];
  if (!secrets.length) return false;
  const auth = req.headers.get("authorization") ?? "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
  return Boolean(token && secrets.includes(token));
}

/**
 * Phase B embedding worker. POST (JSON body optional `{ "limit": number }`) or GET (Vercel Cron).
 * Auth: `Authorization: Bearer <LINKAIOS_CRON_SECRET>` or Vercel `CRON_SECRET` when matched to the same value.
 */
async function handleBrainEmbed(req: Request) {
  const key = process.env.GEMINI_API_KEY;
  if (!process.env.LINKAIOS_CRON_SECRET && !process.env.CRON_SECRET) {
    return NextResponse.json({ ok: false, error: "LINKAIOS_CRON_SECRET or CRON_SECRET must be set." }, { status: 503 });
  }
  if (!key) {
    return NextResponse.json({ ok: false, error: "GEMINI_API_KEY must be set." }, { status: 503 });
  }
  if (!authorizeCron(req)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  let limit = 32;
  if (req.method === "POST") {
    try {
      const j = (await req.json().catch(() => ({}))) as { limit?: number };
      if (typeof j.limit === "number" && j.limit > 0 && j.limit <= 200) limit = j.limit;
    } catch {
      /* empty body ok */
    }
  }
  const supabase = getSupabaseAdmin();
  const result = await embedMissingBrainChunks(supabase, { apiKey: key, limit });
  return NextResponse.json({ ok: true, ...result });
}

export async function POST(req: Request) {
  return handleBrainEmbed(req);
}

export async function GET(req: Request) {
  return handleBrainEmbed(req);
}
