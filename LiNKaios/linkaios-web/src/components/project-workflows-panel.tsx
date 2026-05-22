import { ProjectTrackedItemsTable } from "@/components/project-tracked-items-table";
import { isUiMocksEnabled } from "@/lib/ui-mocks/flags";
import { demoProjectWorkflows } from "@/lib/ui-mocks/project-workflows-issues-demo";

export async function ProjectWorkflowsPanel(props: { missionId: string }) {
  const items = isUiMocksEnabled() ? demoProjectWorkflows(props.missionId) : [];

  return (
    <ProjectTrackedItemsTable
      kind="workflow"
      title="Phases"
      items={items}
      emptyMessage="No phases are registered for this project yet."
    />
  );
}
