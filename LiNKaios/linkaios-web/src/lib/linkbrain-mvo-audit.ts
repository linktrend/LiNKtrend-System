/**
 * LiNKbrain MVO audit union queries for operator audit tab (LTS-020 / LTS-021).
 */

import type { SupabaseClient } from "@supabase/supabase-js";

export type MvoAuditEventRow = {
  event_id: string;
  ts: string;
  plane: string;
  action: string;
  actor_kind: string;
  actor_id: string;
  run_id: string | null;
  stage_id: string | null;
  payload: Record<string, unknown>;
};

export async function fetchMvoAuditEventsForRun(
  client: SupabaseClient,
  runId: string,
  opts?: { limit?: number },
): Promise<{ rows: MvoAuditEventRow[]; error: string | null }> {
  const limit = opts?.limit ?? 200;
  const { data, error } = await client
    .schema("linkbrain")
    .from("audit_events")
    .select("event_id, ts, plane, action, actor_kind, actor_id, subject, payload")
    .filter("subject->>run_id", "eq", runId)
    .order("ts", { ascending: true })
    .limit(limit);

  if (error) {
    return { rows: [], error: error.message };
  }

  const rows = (data ?? []).map((raw) => {
    const row = raw as Record<string, unknown>;
    const subject = (row.subject as Record<string, unknown>) ?? {};
    return {
      event_id: String(row.event_id),
      ts: String(row.ts),
      plane: String(row.plane),
      action: String(row.action),
      actor_kind: String(row.actor_kind),
      actor_id: String(row.actor_id),
      run_id: subject.run_id ? String(subject.run_id) : null,
      stage_id: subject.stage_id ? String(subject.stage_id) : null,
      payload: (row.payload as Record<string, unknown>) ?? {},
    };
  });

  return { rows, error: null };
}
