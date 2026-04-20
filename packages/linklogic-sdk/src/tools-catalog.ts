import type { ToolRecord } from "@linktrend/shared-types";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function listTools(
  client: SupabaseClient,
  params: { limit?: number } = {},
): Promise<{ data: ToolRecord[]; error: Error | null }> {
  const limit = params.limit ?? 400;
  const { data, error } = await client
    .schema("linkaios")
    .from("tools")
    .select("*")
    .order("updated_at", { ascending: false })
    .limit(limit);
  return { data: (data ?? []) as ToolRecord[], error: error ? new Error(error.message) : null };
}

export async function getToolById(
  client: SupabaseClient,
  id: string,
): Promise<{ data: ToolRecord | null; error: Error | null }> {
  const { data, error } = await client.schema("linkaios").from("tools").select("*").eq("id", id).maybeSingle();
  return { data: (data ?? null) as ToolRecord | null, error: error ? new Error(error.message) : null };
}
