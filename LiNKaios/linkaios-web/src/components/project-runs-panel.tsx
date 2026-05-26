import { fetchMetricsSnapshot } from "@/app/(shell)/metrics/actions";
import { RecentRunsTable } from "@/components/metrics-recent-runs-table";
import { buildMetricsSnapshotFromRows, type MetricsSnapshot } from "@/lib/metrics-snapshot";
import { isUiMocksEnabled } from "@/lib/ui-mocks/flags";
import { demoMetricsSnapshot } from "@/lib/ui-mocks/metrics-demo-snapshot";

function emptySnapshot(): MetricsSnapshot {
  const now = new Date();
  const from = new Date(now);
  from.setUTCDate(from.getUTCDate() - 30);
  return buildMetricsSnapshotFromRows({
    rows: [],
    missionMeta: new Map(),
    agentNames: new Map(),
    fromIso: from.toISOString(),
    toIso: now.toISOString(),
    eventTypeContains: null,
  });
}

function snapshotForMission(base: MetricsSnapshot, missionId: string): MetricsSnapshot {
  const runs = base.runs.filter((r) => r.mission_id === missionId);
  return { ...base, runs, totalTraces: runs.length };
}

/** Project-scoped runs table — same surface as Metrics → Recent Runs. */
export async function ProjectRunsPanel(props: { missionId: string }) {
  let snapshot: MetricsSnapshot;

  if (isUiMocksEnabled()) {
    snapshot = snapshotForMission(demoMetricsSnapshot(), props.missionId);
  } else {
    const result = await fetchMetricsSnapshot({
      days: 30,
      missionId: props.missionId,
      agentId: null,
    });
    snapshot = result.ok ? result.data : emptySnapshot();
  }

  return (
    <RecentRunsTable
      snapshot={snapshot}
      hideProjectColumn
      tracesHref={`/settings/traces?project=${encodeURIComponent(props.missionId)}`}
    />
  );
}
