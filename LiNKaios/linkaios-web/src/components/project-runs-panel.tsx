import { fetchMetricsSnapshot } from "@/app/(shell)/metrics/actions";
import { ProjectRunsPanelClient } from "@/components/project-runs-panel-client";
import { resolveProjectIdFromProps } from "@/lib/api/project-mission-id";
import { buildMetricsSnapshotFromRows, type MetricsSnapshot } from "@/lib/metrics-snapshot";
import { isUiMocksEnabled } from "@/lib/ui-mocks/flags";
import { demoMetricsSnapshot } from "@/lib/ui-mocks/metrics-demo-snapshot";

function emptySnapshot(): MetricsSnapshot {
  const now = new Date();
  const from = new Date(now);
  from.setUTCDate(from.getUTCDate() - 90);
  return buildMetricsSnapshotFromRows({
    rows: [],
    missionMeta: new Map(),
    agentNames: new Map(),
    fromIso: from.toISOString(),
    toIso: now.toISOString(),
    eventTypeContains: null,
  });
}

function snapshotForProject(base: MetricsSnapshot, projectId: string, title: string): MetricsSnapshot {
  const runs = base.runs
    .filter((r) => r.mission_id === projectId)
    .map((r) => ({ ...r, mission_title: r.mission_title ?? title }));
  return { ...base, runs, totalTraces: runs.length };
}

/** Project-scoped runs table with time window filter. */
export async function ProjectRunsPanel(props: {
  projectId?: string;
  /** @deprecated Use projectId */
  missionId?: string;
  projectTitle?: string;
  tracesHref?: string;
}) {
  const projectId = resolveProjectIdFromProps(props);
  const projectTitle = props.projectTitle ?? "Project";
  let snapshot: MetricsSnapshot;

  if (isUiMocksEnabled()) {
    snapshot = snapshotForProject(demoMetricsSnapshot(), projectId, projectTitle);
  } else {
    const result = await fetchMetricsSnapshot({
      days: 90,
      missionId: projectId,
      agentId: null,
    });
    snapshot = result.ok ? snapshotForProject(result.data, projectId, projectTitle) : emptySnapshot();
  }

  return <ProjectRunsPanelClient projectId={projectId} projectTitle={projectTitle} initialSnapshot={snapshot} />;
}
