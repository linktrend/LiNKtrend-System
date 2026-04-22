import type { SupabaseClient } from "@supabase/supabase-js";
import type { SkillRecord } from "@linktrend/shared-types";

import { cosineSimilarity } from "./brain-virtual-files.js";
import { embedTextGemini } from "./brain-embeddings.js";
import { getDeclaredToolsFromSkill } from "./declared-tools.js";
import { buildResolvedStepExecution, type ResolvedSkillStepExecution } from "./skill-step-execution.js";

export type SkillCategoryRow = {
  id: string;
  slug: string;
  title: string;
  one_line_description: string;
  intro_text: string;
  sort_order: number;
};

export type SkillSlimRow = Pick<
  SkillRecord,
  "id" | "name" | "version" | "status" | "metadata" | "created_at" | "updated_at" | "category_id" | "skill_mode" | "tags"
> & {
  default_model: string | null;
  default_declared_tools: string[];
};

export type SkillExecutionPackage = SkillRecord & {
  scripts: Array<{ id: string; filename: string; content: string }>;
  references: Array<{ id: string; label: string; kind: string; target: string; step_ordinal: number | null; extra: unknown }>;
  assets: Array<{ id: string; name: string; storage_uri: string; byte_size: number | null; step_ordinal: number | null }>;
  /** Whole-skill union for governance (defaults ∪ stepped overrides). */
  effective_declared_tools: string[];
  /** Stepped skills only: per-step scripts/refs/assets/tools after merging `step_recipe` and table `step_ordinal`. */
  resolved_steps: ResolvedSkillStepExecution[] | null;
};

export async function listSkillDiscoveryLayer1(client: SupabaseClient): Promise<{
  categories: Array<SkillCategoryRow & { skill_count: number }>;
  error: Error | null;
}> {
  const { data: cats, error } = await client
    .schema("linkaios")
    .from("skill_categories")
    .select("id, slug, title, one_line_description, intro_text, sort_order")
    .order("sort_order", { ascending: true });
  if (error) return { categories: [], error: new Error(error.message) };
  const list = (cats ?? []) as SkillCategoryRow[];
  const out: Array<SkillCategoryRow & { skill_count: number }> = [];
  for (const c of list) {
    const { count, error: cErr } = await client
      .schema("linkaios")
      .from("skills")
      .select("id", { count: "exact", head: true })
      .eq("category_id", c.id);
    if (cErr) return { categories: [], error: new Error(cErr.message) };
    out.push({ ...c, skill_count: count ?? 0 });
  }
  return { categories: out, error: null };
}

export async function listSkillsSlimInCategory(
  client: SupabaseClient,
  params: {
    categoryId?: string | null;
    q?: string;
    limit?: number;
    offset?: number;
    allowedNames?: string[] | null;
  },
): Promise<{ data: SkillSlimRow[]; error: Error | null }> {
  const limit = Math.min(params.limit ?? 80, 200);
  const offset = params.offset ?? 0;
  let q = client
    .schema("linkaios")
    .from("skills")
    .select(
      "id, name, version, status, metadata, created_at, updated_at, category_id, skill_mode, tags, default_model, default_declared_tools",
    )
    .order("updated_at", { ascending: false })
    .range(offset, offset + limit - 1);
  if (params.categoryId) {
    q = q.eq("category_id", params.categoryId);
  }
  const needle = params.q?.trim();
  if (needle) {
    q = q.ilike("name", `%${needle}%`);
  }
  const { data, error } = await q;
  if (error) return { data: [], error: new Error(error.message) };
  let rows = (data ?? []) as SkillSlimRow[];
  if (params.allowedNames?.length) {
    const allow = new Set(params.allowedNames.map((n) => n.toLowerCase()));
    rows = rows.filter((r) => allow.has(r.name.toLowerCase()));
  }
  return { data: rows, error: null };
}

export async function getSkillExecutionPackage(
  client: SupabaseClient,
  params: { id?: string; name?: string; version?: number },
): Promise<{ data: SkillExecutionPackage | null; error: Error | null }> {
  let skillRow: SkillRecord | null = null;
  let sErr: Error | null = null;
  if (params.id) {
    const r = await client.schema("linkaios").from("skills").select("*").eq("id", params.id).maybeSingle();
    sErr = r.error ? new Error(r.error.message) : null;
    skillRow = (r.data ?? null) as SkillRecord | null;
  } else if (params.name) {
    const name = params.name.trim().toLowerCase();
    let q = client.schema("linkaios").from("skills").select("*").eq("name", name);
    if (typeof params.version === "number") {
      q = q.eq("version", params.version);
    } else {
      q = q.eq("status", "approved").order("version", { ascending: false }).limit(1);
    }
    const r = await q.maybeSingle();
    sErr = r.error ? new Error(r.error.message) : null;
    skillRow = (r.data ?? null) as SkillRecord | null;
  } else {
    return { data: null, error: new Error("id or name is required") };
  }
  if (sErr) return { data: null, error: sErr };
  if (!skillRow) return { data: null, error: null };
  const skill = skillRow as SkillRecord;
  const sid = String(skill.id);
  const [{ data: scripts, error: scErr }, { data: refs, error: rErr }, { data: assets, error: aErr }] = await Promise.all([
    client.schema("linkaios").from("skill_scripts").select("id, filename, content").eq("skill_id", sid),
    client
      .schema("linkaios")
      .from("skill_references")
      .select("id, label, kind, target, step_ordinal, extra")
      .eq("skill_id", sid),
    client.schema("linkaios").from("skill_assets").select("id, name, storage_uri, byte_size, step_ordinal").eq("skill_id", sid),
  ]);
  if (scErr || rErr || aErr) {
    return {
      data: null,
      error: new Error(scErr?.message ?? rErr?.message ?? aErr?.message ?? "child load failed"),
    };
  }
  const effective = getDeclaredToolsFromSkill(skill);
  const scriptRows = (scripts ?? []) as SkillExecutionPackage["scripts"];
  const refRows = (refs ?? []) as SkillExecutionPackage["references"];
  const assetRows = (assets ?? []) as SkillExecutionPackage["assets"];
  const resolved_steps = buildResolvedStepExecution({
    skill,
    scripts: scriptRows,
    references: refRows,
    assets: assetRows,
  });
  return {
    data: {
      ...skill,
      scripts: scriptRows,
      references: refRows,
      assets: assetRows,
      effective_declared_tools: effective,
      resolved_steps,
    },
    error: null,
  };
}

export async function searchSkillsSlimByEmbedding(
  client: SupabaseClient,
  params: {
    query: string;
    apiKey: string;
    limit?: number;
    embedQuery?: (text: string) => Promise<number[] | null>;
  },
): Promise<{ data: Array<{ skill: SkillSlimRow; score: number }>; error: Error | null }> {
  const limit = params.limit ?? 20;
  const embed =
    params.embedQuery ??
    (async (text: string) => {
      const r = await embedTextGemini(text, params.apiKey);
      return "error" in r ? null : r.embedding;
    });
  const qv = (await embed(params.query.trim())) ?? null;
  const { data: embRows, error } = await client
    .schema("linkaios")
    .from("skill_slim_embeddings")
    .select("skill_id, embedding")
    .limit(2000);
  if (error) return { data: [], error: new Error(error.message) };
  if (!qv || !qv.length) return { data: [], error: null };
  const scored: Array<{ skillId: string; score: number }> = [];
  for (const row of embRows ?? []) {
    const r = row as { skill_id: string; embedding: number[] };
    if (!r.embedding || r.embedding.length !== qv.length) continue;
    scored.push({ skillId: r.skill_id, score: cosineSimilarity(qv, r.embedding) });
  }
  scored.sort((a, b) => b.score - a.score);
  const topIds = scored.slice(0, limit).map((s) => s.skillId);
  if (!topIds.length) return { data: [], error: null };
  const { data: skills, error: sErr } = await client
    .schema("linkaios")
    .from("skills")
    .select(
      "id, name, version, status, metadata, created_at, updated_at, category_id, skill_mode, tags, default_model, default_declared_tools",
    )
    .in("id", topIds);
  if (sErr) return { data: [], error: new Error(sErr.message) };
  const byId = new Map((skills ?? []).map((s) => [String((s as { id: string }).id), s as SkillSlimRow]));
  const data = scored
    .map((s) => {
      const sk = byId.get(s.skillId);
      return sk ? { skill: sk, score: s.score } : null;
    })
    .filter((x): x is { skill: SkillSlimRow; score: number } => x != null);
  return { data, error: null };
}
