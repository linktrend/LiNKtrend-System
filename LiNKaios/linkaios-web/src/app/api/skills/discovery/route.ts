import {
  listSkillDiscoveryLayer1,
  listSkillsSlimInCategory,
  searchSkillsSlimByEmbedding,
} from "@linktrend/linklogic-sdk";
import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Authenticated LiNKskills staged discovery (Layer 1 categories, Layer 2 slim list).
 */
export async function GET(req: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const layer = url.searchParams.get("layer") ?? "1";
  if (layer === "1") {
    const { categories, error } = await listSkillDiscoveryLayer1(supabase);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ layer: 1, categories });
  }
  if (layer === "2") {
    const categoryId = url.searchParams.get("categoryId");
    const q = url.searchParams.get("q") ?? undefined;
    const { data, error } = await listSkillsSlimInCategory(supabase, {
      categoryId: categoryId && categoryId !== "all" ? categoryId : null,
      q: q ?? undefined,
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ layer: 2, skills: data });
  }
  if (layer === "semantic" || layer === "3") {
    const q = (url.searchParams.get("q") ?? "").trim();
    if (!q) {
      return NextResponse.json({ error: "Missing q (natural-language query for embedding search)" }, { status: 400 });
    }
    const apiKey = process.env.GEMINI_API_KEY?.trim();
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not configured (required for semantic skill search)" },
        { status: 503 },
      );
    }
    const limitRaw = url.searchParams.get("limit");
    const limit = limitRaw && /^[0-9]+$/.test(limitRaw) ? Math.min(50, Math.max(1, Number(limitRaw))) : 20;
    const { data, error } = await searchSkillsSlimByEmbedding(supabase, { query: q, apiKey, limit });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ layer: "semantic", query: q, results: data });
  }
  return NextResponse.json({ error: "Invalid layer (use 1, 2, or semantic)" }, { status: 400 });
}
