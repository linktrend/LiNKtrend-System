import { ProjectTrackedItemsTable } from "@/components/project-tracked-items-table";
import { resolveProjectIdFromProps } from "@/lib/api/project-mission-id";
import { isUiMocksEnabled } from "@/lib/ui-mocks/flags";
import { demoProjectIssues } from "@/lib/ui-mocks/project-workflows-issues-demo";

export async function ProjectIssuesPanel(props: {
  projectId?: string;
  /** @deprecated Use projectId */
  missionId?: string;
}) {
  const projectId = resolveProjectIdFromProps(props);
  const items = isUiMocksEnabled() ? demoProjectIssues(projectId) : [];

  return (
    <ProjectTrackedItemsTable
      kind="issue"
      title="Issues"
      items={items}
      emptyMessage="No issues are tracked for this project yet."
    />
  );
}
