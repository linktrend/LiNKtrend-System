import { fetchMetricsSnapshot } from "@/app/(shell)/metrics/actions";
import { RecentRunsTable } from "@/components/metrics-recent-runs-table";
import { resolveProjectIdFromProps } from "@/lib/api/project-mission-id";
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

function snapshotForProject(base: MetricsSnapshot, projectId: string): MetricsSnapshot {
  const runs = base.runs.filter((r) => r.mission_id === projectId);
  return { ...base, runs, totalTraces: runs.length };
}

/** Project-scoped runs table — same surface as Metrics → Recent Runs. */
export async function ProjectRunsPanel(props: {
  projectId?: string;
  /** @deprecated Use projectId */
  missionId?: string;
  tracesHref?: string;
}) {
  const projectId = resolveProjectIdFromProps(props);
  let snapshot: MetricsSnapshot;

  if (isUiMocksEnabled()) {
    snapshot = snapshotForProject(demoMetricsSnapshot(), projectId);
  } else {
    const result = await fetchMetricsSnapshot({
      days: 30,
      missionId: projectId,
      agentId: null,
    });
    snapshot = result.ok ? result.data : emptySnapshot();
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Each Run is one pass through project modules — continuous projects repeat Runs over time. Rows are governance
        traces from LiNKbot and automation activity; open system logs for the full audit tail filtered to this project.
      </p>
      <RecentRunsTable
        snapshot={snapshot}
        hideProjectColumn
        tracesHref={props.tracesHref ?? `/settings/traces?project=${encodeURIComponent(projectId)}`}
        sectionTitle="Runs (last 30 days)"
      />
    </div>
  );
}
