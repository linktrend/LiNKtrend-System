import { ProjectTrackedItemsTable } from "@/components/project-tracked-items-table";
import { isUiMocksEnabled } from "@/lib/ui-mocks/flags";
import { demoProjectIssues } from "@/lib/ui-mocks/project-workflows-issues-demo";

export async function ProjectIssuesPanel(props: { missionId: string }) {
  const items = isUiMocksEnabled() ? demoProjectIssues(props.missionId) : [];

  return (
    <ProjectTrackedItemsTable
      kind="issue"
      title="Issues"
      items={items}
      emptyMessage="No issues are tracked for this project yet."
    />
  );
}
