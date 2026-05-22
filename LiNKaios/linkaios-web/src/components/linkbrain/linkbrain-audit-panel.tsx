import { LinkbrainAuditTable, type AuditTraceRow } from "@/components/linkbrain/linkbrain-audit-table";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isUiMocksEnabled } from "@/lib/ui-mocks/flags";
import { DEMO_TRACE_ROWS } from "@/lib/ui-mocks/traces-demo";

const MISSION_ID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const DEMO_MISSION_TITLES = new Map<string, string>([
  ["00000000-0000-4000-8000-00000000d101", "Northwind modernisation"],
  ["00000000-0000-4000-8000-00000000d102", "SMB Website Builder"],
]);

export async function LinkbrainAuditPanel() {
  const supabase = await createSupabaseServerClient();
  const uiMocksEnabled = isUiMocksEnabled();

  let raw: { event_type: string; mission_id: string | null; created_at: string }[] = [];

  const { data, error } = await supabase
    .schema("linkaios")
    .from("traces")
    .select("event_type, mission_id, created_at")
    .order("created_at", { ascending: false })
    .limit(500);

  if (error && !uiMocksEnabled) {
    return <p className="text-sm text-red-700 dark:text-red-300">Audit trace log could not be loaded.</p>;
  }

  raw = (data ?? []) as { event_type: string; mission_id: string | null; created_at: string }[];

  if (uiMocksEnabled && raw.length === 0) {
    raw = DEMO_TRACE_ROWS;
  }

  const missionIds = [...new Set(raw.map((r) => r.mission_id).filter(Boolean))] as string[];
  const missionTitles = new Map<string, string>(DEMO_MISSION_TITLES);
  if (missionIds.length > 0) {
    const { data: missions } = await supabase.schema("linkaios").from("missions").select("id, title").in("id", missionIds);
    for (const m of missions ?? []) {
      const row = m as { id: string; title: string };
      missionTitles.set(String(row.id), row.title);
    }
  }

  const rows: AuditTraceRow[] = raw.map((row) => ({
    event_type: row.event_type,
    mission_id: row.mission_id,
    mission_title:
      row.mission_id && MISSION_ID_RE.test(row.mission_id)
        ? (missionTitles.get(row.mission_id) ?? row.mission_id)
        : (row.mission_id ?? null),
    created_at: row.created_at,
  }));

  return <LinkbrainAuditTable rows={rows} />;
}
