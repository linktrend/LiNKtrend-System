import { LinkbrainAuditTable, type AuditTraceRow } from "@/components/linkbrain/linkbrain-audit-table";
import { buildAdminCollectiveAuditSeed } from "@/lib/admin-collective-brain-seed";
import { readAppSurfaceFromHeaders } from "@/lib/app-surface";
import { fetchMvoAuditEventsForRun } from "@/lib/linkbrain-mvo-audit";
import { fetchRecentTraces } from "@/lib/traces-db";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isUiMocksEnabledForSurface } from "@/lib/ui-mocks/flags";
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
    admin_context: false,
    created_at: new Date(Date.now() - 86_400_000).toISOString(),
  },
  {
    event_type: "brain.collective.approved",
    mission_id: "00000000-0000-4000-8000-00000000d301",
    mission_title: "Litigation intake automation",
    licensee_id: "lexos-legal",
    licensee_name: "LEXOS Legal LLP",
    admin_context: false,
    created_at: new Date(Date.now() - 172_800_000).toISOString(),
  },
  {
    event_type: "linkskills.lease.executed",
    mission_id: "00000000-0000-4000-8000-00000000a101",
    mission_title: "LiNKsuitegen — suite factory",
    licensee_id: "linktrend",
    licensee_name: "LiNKtrend Admin",
    admin_context: true,
    created_at: new Date(Date.now() - 259_200_000).toISOString(),
  },
];

function withAdminContext(row: AuditTraceRow): AuditTraceRow {
  if (row.admin_context != null) return row;
  const adminContext =
    row.licensee_id === "linktrend" ||
    row.event_type.includes(".admin.") ||
    row.event_type.startsWith("admin.");
  return { ...row, admin_context: adminContext };
}

export async function LinkbrainAuditPanel(props: {
  licensorCollective?: boolean;
  /** When set, merges canonical linkbrain.audit_events for this LinkSites run (MVO union). */
  mvoRunId?: string | null;
}) {
  const supabase = await createSupabaseServerClient();
  const surface = await readAppSurfaceFromHeaders();
  const uiMocksEnabled = isUiMocksEnabledForSurface(surface);

  const { rows: traceRows, error } = await fetchRecentTraces(supabase, { limit: 500 });

  if (error && !uiMocksEnabled && !props.licensorCollective) {
    return <p className="text-sm text-red-700 dark:text-red-300">Audit trace log could not be loaded.</p>;
  }

  let raw: { event_type: string; mission_id: string | null; created_at: string }[] = traceRows.map((row) => ({
    event_type: row.event_type,
    mission_id: row.project_id,
    created_at: row.created_at,
  }));

  if (uiMocksEnabled && raw.length === 0) {
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

  let rows: AuditTraceRow[] = raw.map((row) =>
    withAdminContext({
      event_type: row.event_type,
      mission_id: row.mission_id,
      mission_title:
        row.mission_id && MISSION_ID_RE.test(row.mission_id)
          ? (missionTitles.get(row.mission_id) ?? row.mission_id)
          : (row.mission_id ?? null),
      created_at: row.created_at,
    }),
  );

  const runFilter = props.mvoRunId?.trim();
  if (runFilter) {
    const { rows: mvoRows, error: mvoErr } = await fetchMvoAuditEventsForRun(supabase, runFilter);
    if (!mvoErr && mvoRows.length > 0) {
      const mvoMapped: AuditTraceRow[] = mvoRows.map((ev) =>
        withAdminContext({
          event_type: ev.action,
          mission_id: runFilter,
          mission_title: missionTitles.get(runFilter) ?? `Run ${runFilter.slice(0, 8)}`,
          created_at: ev.ts,
        }),
      );
      rows = [...mvoMapped, ...rows.filter((r) => r.mission_id !== runFilter)];
    }
  }

  let usedAdminSeed = false;
  if (props.licensorCollective && rows.length === 0) {
    if (uiMocksEnabled) {
      rows = COLLECTIVE_AUDIT_FIXTURES;
    } else {
      rows = buildAdminCollectiveAuditSeed();
      usedAdminSeed = true;
    }
  }

  const dataSourceLabel = uiMocksEnabled
    ? "Demo fixtures — sample collective audit rows for layout review."
    : usedAdminSeed
      ? "Admin seed — reviewable audit rows until live vendor traces populate."
      : rows.length === 0
        ? "Live — no vendor audit traces in range yet."
        : "Live — append-only traces from linkaios.traces and linkbrain.audit_events.";

  return (
    <div className="space-y-3">
      <p className="text-xs text-zinc-500 dark:text-zinc-400" role="status">
        {dataSourceLabel} Librarian triage runs through LiNKbots fleet, not this Audit tab.
      </p>
      <LinkbrainAuditTable rows={rows} licensorCollective={props.licensorCollective} />
    </div>
  );
}
