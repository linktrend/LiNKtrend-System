import { ProjectTrackedItemsTable } from "@/components/project-tracked-items-table";
import { resolveProjectIdFromProps } from "@/lib/api/project-mission-id";
import { loadPlaneProjectSnapshot } from "@/lib/plane-project-snapshot";
import { isUiMocksEnabled } from "@/lib/ui-mocks/flags";
import { demoProjectIssues } from "@/lib/ui-mocks/project-workflows-issues-demo";

export async function ProjectIssuesPanel(props: {
  projectId?: string;
  /** @deprecated Use projectId */
  missionId?: string;
  suiteId?: string | null;
  moduleIds?: string[];
}) {
  const projectId = resolveProjectIdFromProps(props);

  if (isUiMocksEnabled()) {
    return (
      <ProjectTrackedItemsTable
        kind="issue"
        title="Issues"
        items={demoProjectIssues(projectId)}
        emptyMessage="No issues are tracked for this project yet."
      />
    );
  }

  const snapshot = await loadPlaneProjectSnapshot({
    projectId,
    suiteId: props.suiteId,
    moduleIds: props.moduleIds,
  });

  return (
    <div className="space-y-3">
      {snapshot.error ? (
        <p className="text-sm text-amber-800 dark:text-amber-200">
          Plane issue sync is pending ({snapshot.error}). Showing suite template issues.
        </p>
      ) : null}
      <ProjectTrackedItemsTable
        kind="issue"
        title="Issues"
        items={snapshot.issues}
        emptyMessage="No issues are tracked for this project yet."
      />
    </div>
  );
}
