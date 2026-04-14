import type { SupabaseClient } from "@supabase/supabase-js";
import type { SkillRecord } from "@linktrend/shared-types";

export async function listSkills(
  client: SupabaseClient,
  params: { limit?: number } = {},
): Promise<{ data: SkillRecord[]; error: Error | null }> {
  const limit = params.limit ?? 200;
  const { data, error } = await client
    .schema("linkaios")
    .from("skills")
    .select("*")
    .order("updated_at", { ascending: false })
    .limit(limit);
  return { data: (data ?? []) as SkillRecord[], error: error ? new Error(error.message) : null };
}
