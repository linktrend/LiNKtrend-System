import { LinkbrainAuditTable, type AuditTraceRow } from "@/components/linkbrain/linkbrain-audit-table";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isUiMocksEnabled } from "@/lib/ui-mocks/flags";
import { DEMO_TRACE_ROWS } from "@/lib/ui-mocks/traces-demo";

const MISSION_ID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const DEMO_MISSION_TITLES = new Map<string, string>([
  ["00000000-0000-4000-8000-00000000d101", "Northwind modernisation"],
  ["00000000-0000-4000-8000-00000000d102", "SMB Website Builder"],
  ["00000000-0000-4000-8000-00000000d201", "Website Factory — lead pipeline"],
  ["00000000-0000-4000-8000-00000000d301", "Litigation intake automation"],
]);

const COLLECTIVE_AUDIT_FIXTURES: AuditTraceRow[] = [
  {
    event_type: "brain.collective.inbox_received",
    mission_id: "00000000-0000-4000-8000-00000000d201",
    mission_title: "Website Factory — lead pipeline",
    licensee_id: "xyz-marketing",
    licensee_name: "XYZ Marketing Group",
    created_at: new Date(Date.now() - 86_400_000).toISOString(),
  },
  {
    event_type: "brain.collective.approved",
    mission_id: "00000000-0000-4000-8000-00000000d301",
    mission_title: "Litigation intake automation",
    licensee_id: "lexos-legal",
    licensee_name: "LEXOS Legal LLP",
    created_at: new Date(Date.now() - 172_800_000).toISOString(),
  },
  {
    event_type: "brain.collective.retrieval",
    mission_id: null,
    mission_title: null,
    licensee_id: "harbor-dental",
    licensee_name: "Harbor Dental Co-op",
    created_at: new Date(Date.now() - 259_200_000).toISOString(),
  },
];

export async function LinkbrainAuditPanel(props: { licensorCollective?: boolean }) {
  const supabase = await createSupabaseServerClient();
  const uiMocksEnabled = isUiMocksEnabled();

  let raw: { event_type: string; mission_id: string | null; created_at: string }[] = [];

  const { data, error } = await supabase
    .schema("linkaios")
    .from("traces")
    .select("event_type, mission_id, created_at")
    .order("created_at", { ascending: false })
    .limit(500);

  if (error && !uiMocksEnabled && !props.licensorCollective) {
    return <p className="text-sm text-red-700 dark:text-red-300">Audit trace log could not be loaded.</p>;
  }

  raw = (data ?? []) as { event_type: string; mission_id: string | null; created_at: string }[];

  if ((uiMocksEnabled || props.licensorCollective) && raw.length === 0) {
    raw = DEMO_TRACE_ROWS;
  }

  const missionIds = [...new Set(raw.map((r) => r.mission_id).filter(Boolean))] as string[];
  const missionTitles = new Map<string, string>(DEMO_MISSION_TITLES);
  if (missionIds.length > 0) {
    const { data: missions } = await supabase.schema("linkaios").from("projects").select("id, title").in("id", missionIds);
    for (const m of missions ?? []) {
      const row = m as { id: string; title: string };
      missionTitles.set(String(row.id), row.title);
    }
  }

  let rows: AuditTraceRow[] = raw.map((row) => ({
    event_type: row.event_type,
    mission_id: row.mission_id,
    mission_title:
      row.mission_id && MISSION_ID_RE.test(row.mission_id)
        ? (missionTitles.get(row.mission_id) ?? row.mission_id)
        : (row.mission_id ?? null),
    created_at: row.created_at,
  }));

  if (props.licensorCollective) {
    rows = [...COLLECTIVE_AUDIT_FIXTURES, ...rows.map((r, i) => {
      const fixture = COLLECTIVE_AUDIT_FIXTURES[i % COLLECTIVE_AUDIT_FIXTURES.length]!;
      return {
        ...r,
        licensee_id: fixture.licensee_id,
        licensee_name: fixture.licensee_name,
      };
    })];
  }

  return <LinkbrainAuditTable rows={rows} licensorCollective={props.licensorCollective} />;
}
