import { ProjectTrackedItemsTable } from "@/components/project-tracked-items-table";
import { resolveProjectIdFromProps } from "@/lib/api/project-mission-id";
import { isUiMocksEnabled } from "@/lib/ui-mocks/flags";
import { demoProjectWorkflows } from "@/lib/ui-mocks/project-workflows-issues-demo";

export async function ProjectWorkflowsPanel(props: {
  projectId?: string;
  /** @deprecated Use projectId */
  missionId?: string;
}) {
  const projectId = resolveProjectIdFromProps(props);
  const items = isUiMocksEnabled() ? demoProjectWorkflows(projectId) : [];

  return (
    <ProjectTrackedItemsTable
      kind="workflow"
      title="Phases"
      items={items}
      emptyMessage="No phases are registered for this project yet."
    />
  );
}
