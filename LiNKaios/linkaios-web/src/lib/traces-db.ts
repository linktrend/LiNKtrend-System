/**
 * Canonical linkaios.traces queries (Mission → Project terminology wave).
 * DB column is `project_id`; legacy callers may still refer to mission_id in app types.
 */

import type { SupabaseClient } from "@linktrend/db";

/** Row shape returned from linkaios.traces selects. */
export type TraceRow = {
  id: string;
  event_type: string;
  project_id: string | null;
  created_at: string;
  payload: unknown;
};

/** @deprecated Use project_id on {@link TraceRow}. */
export type TraceRowLegacy = TraceRow & { mission_id: string | null };

export const TRACE_LIST_COLUMNS = "id, event_type, project_id, created_at, payload" as const;
export const TRACE_LOG_COLUMNS = "event_type, project_id, created_at" as const;

/** Map DB row to legacy shape for gradual migration of UI helpers. */
export function traceRowToLegacy(row: TraceRow): TraceRowLegacy {
  return { ...row, mission_id: row.project_id };
}

function tracesTable(supabase: SupabaseClient) {
  return supabase.schema("linkaios").from("traces");
}

export async function fetchRecentTraces(
  supabase: SupabaseClient,
  opts: { limit?: number; projectId?: string | null; eventType?: string; eventPrefix?: string } = {},
): Promise<{ rows: TraceRow[]; error: string | null }> {
  const limit = opts.limit ?? 50;
  let q = tracesTable(supabase)
    .select(TRACE_LIST_COLUMNS)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (opts.projectId) {
    q = q.eq("project_id", opts.projectId);
  }
  if (opts.eventType) {
    q = q.eq("event_type", opts.eventType);
  } else if (opts.eventPrefix) {
    q = q.like("event_type", `${opts.eventPrefix}%`);
  }

  const { data, error } = await q;
  if (error) return { rows: [], error: error.message };
  return { rows: (data ?? []) as TraceRow[], error: null };
}

export async function fetchTracesInRange(
  supabase: SupabaseClient,
  opts: {
    fromIso: string;
    toIso: string;
    limit?: number;
    projectId?: string | null;
    projectIds?: string[] | null;
  },
): Promise<{ rows: TraceRow[]; error: string | null }> {
  let q = tracesTable(supabase)
    .select(TRACE_LIST_COLUMNS)
    .gte("created_at", opts.fromIso)
    .lte("created_at", opts.toIso)
    .order("created_at", { ascending: false })
    .limit(opts.limit ?? 8000);

  if (opts.projectId && opts.projectId !== "all") {
    q = q.eq("project_id", opts.projectId);
  } else if (opts.projectIds?.length) {
    q = q.in("project_id", opts.projectIds);
  }

  const { data, error } = await q;
  if (error) return { rows: [], error: error.message };
  return { rows: (data ?? []) as TraceRow[], error: null };
}
