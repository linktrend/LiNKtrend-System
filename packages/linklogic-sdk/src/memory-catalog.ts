import type { SupabaseClient } from "@supabase/supabase-js";

export type MemoryEntryRow = {
  id: string;
  mission_id: string | null;
  classification: string;
  body: string;
  metadata: Record<string, unknown>;
  created_at: string;
};

export async function listMemoryEntries(
  client: SupabaseClient,
  params: { missionId?: string | null; limit?: number } = {},
): Promise<{ data: MemoryEntryRow[]; error: Error | null }> {
  const limit = params.limit ?? 200;
  let q = client
    .schema("linkaios")
    .from("memory_entries")
    .select("id, mission_id, classification, body, metadata, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (params.missionId) {
    q = q.eq("mission_id", params.missionId);
  }
  const { data, error } = await q;
  return { data: (data ?? []) as MemoryEntryRow[], error: error ? new Error(error.message) : null };
}
