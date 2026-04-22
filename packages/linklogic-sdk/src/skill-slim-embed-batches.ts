import type { SupabaseClient } from "@supabase/supabase-js";

import { embedTextGemini } from "./brain-embeddings.js";
import { SKILL_INDEX_METADATA_KEY } from "./skill-index-metadata.js";

export type SkillSlimEmbedBatchResult = {
  processed: number;
  errors: string[];
};

function buildSlimEmbedText(row: {
  name: string;
  metadata: Record<string, unknown> | null;
  default_declared_tools?: string[] | null;
}): string {
  const meta = (row.metadata ?? {}) as Record<string, unknown>;
  const idx = meta[SKILL_INDEX_METADATA_KEY] as Record<string, unknown> | undefined;
  const metaTools = meta.declared_tools;
  const toolText = Array.isArray(row.default_declared_tools)
    ? row.default_declared_tools.join(" ")
    : Array.isArray(metaTools)
      ? metaTools.map((t) => String(t)).join(" ")
      : "";
  const parts = [row.name, toolText, idx ? JSON.stringify(idx) : ""];
  return parts.join("\n").slice(0, 8000);
}

/**
 * Fill missing skill slim embeddings (bounded) using Gemini text-embedding-004.
 */
export async function embedMissingSkillSlimIndexes(
  client: SupabaseClient,
  params: { apiKey: string; limit?: number; modelLabel?: string },
): Promise<SkillSlimEmbedBatchResult> {
  const limit = params.limit ?? 24;
  const modelLabel = params.modelLabel ?? "models/text-embedding-004";
  const errors: string[] = [];
  const { data: skills, error } = await client
    .schema("linkaios")
    .from("skills")
    .select("id, name, metadata, default_declared_tools")
    .order("updated_at", { ascending: false })
    .limit(400);
  if (error) return { processed: 0, errors: [error.message] };
  const skillList = (skills ?? []) as Array<{
    id: string;
    name: string;
    metadata: Record<string, unknown> | null;
    default_declared_tools?: string[] | null;
  }>;
  if (!skillList.length) return { processed: 0, errors: [] };
  const ids = skillList.map((s) => s.id);
  const { data: haveRows, error: hErr } = await client
    .schema("linkaios")
    .from("skill_slim_embeddings")
    .select("skill_id")
    .in("skill_id", ids);
  if (hErr) return { processed: 0, errors: [hErr.message] };
  const have = new Set((haveRows ?? []).map((r: { skill_id: string }) => String(r.skill_id)));
  const missing = skillList.filter((s) => !have.has(s.id)).slice(0, limit);
  let processed = 0;
  for (const sk of missing) {
    const text = buildSlimEmbedText(sk);
    const r = await embedTextGemini(text, params.apiKey);
    if ("error" in r) {
      errors.push(`${sk.id}: ${r.error}`);
      continue;
    }
    const { error: uErr } = await client.schema("linkaios").from("skill_slim_embeddings").upsert(
      {
        skill_id: sk.id,
        model: modelLabel,
        dimensions: r.dimensions,
        embedding: r.embedding,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "skill_id" },
    );
    if (uErr) errors.push(`${sk.id}: ${uErr.message}`);
    else processed += 1;
  }
  return { processed, errors };
}
