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
  params: {
    missionId?: string | null;
    classification?: string | null;
    /** Entries whose mission is led by this agent (`missions.primary_agent_id`). */
    agentId?: string | null;
    /** Company-wide rows: `mission_id` is null. */
    unscopedOnly?: boolean;
    limit?: number;
  } = {},
): Promise<{ data: MemoryEntryRow[]; error: Error | null }> {
  const limit = params.limit ?? 200;

  if (params.agentId?.trim()) {
    const aid = params.agentId.trim();
    const { data: mids, error: mErr } = await client
      .schema("linkaios")
      .from("missions")
      .select("id")
      .eq("primary_agent_id", aid)
      .limit(500);
    if (mErr) {
      return { data: [], error: new Error(mErr.message) };
    }
    const ids = (mids ?? []).map((r) => String((r as { id: string }).id));
    if (ids.length === 0) {
      return { data: [], error: null };
    }
    let q = client
      .schema("linkaios")
      .from("memory_entries")
      .select("id, mission_id, classification, body, metadata, created_at")
      .in("mission_id", ids)
      .order("created_at", { ascending: false })
      .limit(limit);
    if (params.classification?.trim()) {
      q = q.eq("classification", params.classification.trim());
    }
    const { data, error } = await q;
    return { data: (data ?? []) as MemoryEntryRow[], error: error ? new Error(error.message) : null };
  }

  let q = client
    .schema("linkaios")
    .from("memory_entries")
    .select("id, mission_id, classification, body, metadata, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (params.unscopedOnly) {
    q = q.is("mission_id", null);
  } else if (params.missionId) {
    q = q.eq("mission_id", params.missionId);
  }

  if (params.classification?.trim()) {
    q = q.eq("classification", params.classification.trim());
  }

  const { data, error } = await q;
  return { data: (data ?? []) as MemoryEntryRow[], error: error ? new Error(error.message) : null };
}
