import type { SupabaseClient } from "@supabase/supabase-js";
import type { SkillRecord } from "@linktrend/shared-types";

import { getDeclaredToolsFromSkill } from "./declared-tools.js";

const SKILL_LIST_SLIM =
  "id, name, version, status, metadata, created_at, updated_at, category_id, default_model, skill_mode, step_recipe, default_declared_tools, tags";

export async function listSkills(
  client: SupabaseClient,
  params: { limit?: number } = {},
): Promise<{ data: SkillRecord[]; error: Error | null }> {
  const limit = params.limit ?? 200;
  const { data, error } = await client
    .schema("linkaios")
    .from("skills")
    .select(SKILL_LIST_SLIM)
    .order("updated_at", { ascending: false })
    .limit(limit);
  const rows = (data ?? []) as Omit<SkillRecord, "body_markdown">[];
  return {
    data: rows.map((r) => ({ ...r, body_markdown: "" }) as SkillRecord),
    error: error ? new Error(error.message) : null,
  };
}

export async function getSkillById(
  client: SupabaseClient,
  id: string,
): Promise<{ data: SkillRecord | null; error: Error | null }> {
  const { data, error } = await client.schema("linkaios").from("skills").select("*").eq("id", id).maybeSingle();
  return { data: (data ?? null) as SkillRecord | null, error: error ? new Error(error.message) : null };
}

/** Approved skills whose `declared_tools` includes `toolName` (bounded scan). */
export async function listApprovedSkillsDeclaringTool(
  client: SupabaseClient,
  toolName: string,
  params: { limit?: number } = {},
): Promise<{ data: Pick<SkillRecord, "id" | "name" | "version" | "status">[]; error: Error | null }> {
  const limit = params.limit ?? 500;
  const needle = toolName.trim();
  if (!needle) {
    return { data: [], error: null };
  }
  const { data, error } = await client
    .schema("linkaios")
    .from("skills")
    .select("id,name,version,status,metadata")
    .eq("status", "approved")
    .order("name", { ascending: true })
    .limit(limit);
  if (error) {
    return { data: [], error: new Error(error.message) };
  }
  const rows = (data ?? []) as SkillRecord[];
  const filtered = rows.filter((s) => getDeclaredToolsFromSkill(s).includes(needle));
  const dataOut = filtered.map((s) => ({
    id: s.id,
    name: s.name,
    version: s.version,
    status: s.status,
  }));
  return { data: dataOut, error: null };
}
