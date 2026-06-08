import type { SupabaseClient } from "@supabase/supabase-js";

export type MemoryEntryRow = {
  id: string;
  /** @deprecated DB column is `project_id`; populated on read for legacy callers. */
  mission_id: string | null;
  classification: string;
  body: string;
  metadata: Record<string, unknown>;
  created_at: string;
};

const MEMORY_ENTRY_COLUMNS = "id, project_id, classification, body, metadata, created_at" as const;

function mapMemoryEntryRow(raw: {
  id: string;
  project_id?: string | null;
  mission_id?: string | null;
  classification: string;
  body: string;
  metadata: Record<string, unknown>;
  created_at: string;
}): MemoryEntryRow {
  const projectId = raw.project_id ?? raw.mission_id ?? null;
  return {
    id: raw.id,
    mission_id: projectId,
    classification: raw.classification,
    body: raw.body,
    metadata: raw.metadata,
    created_at: raw.created_at,
  };
}

export async function listMemoryEntries(
  client: SupabaseClient,
  params: {
    missionId?: string | null;
    classification?: string | null;
    /** Entries whose mission is led by this agent (`missions.primary_agent_id`). */
    agentId?: string | null;
    /** Company-wide rows: `project_id` is null. */
    unscopedOnly?: boolean;
    limit?: number;
  } = {},
): Promise<{ data: MemoryEntryRow[]; error: Error | null }> {
  const limit = params.limit ?? 200;

  if (params.agentId?.trim()) {
    const aid = params.agentId.trim();
    const { data: mids, error: mErr } = await client
      .schema("linkaios")
      .from("projects")
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
      .select(MEMORY_ENTRY_COLUMNS)
      .in("project_id", ids)
      .order("created_at", { ascending: false })
      .limit(limit);
    if (params.classification?.trim()) {
      q = q.eq("classification", params.classification.trim());
    }
    const { data, error } = await q;
    return {
      data: (data ?? []).map((row) => mapMemoryEntryRow(row as Parameters<typeof mapMemoryEntryRow>[0])),
      error: error ? new Error(error.message) : null,
    };
  }

  let q = client
    .schema("linkaios")
    .from("memory_entries")
    .select(MEMORY_ENTRY_COLUMNS)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (params.unscopedOnly) {
    q = q.is("project_id", null);
  } else if (params.missionId) {
    q = q.eq("project_id", params.missionId);
  }

  if (params.classification?.trim()) {
    q = q.eq("classification", params.classification.trim());
  }

  const { data, error } = await q;
  return {
    data: (data ?? []).map((row) => mapMemoryEntryRow(row as Parameters<typeof mapMemoryEntryRow>[0])),
    error: error ? new Error(error.message) : null,
  };
}
