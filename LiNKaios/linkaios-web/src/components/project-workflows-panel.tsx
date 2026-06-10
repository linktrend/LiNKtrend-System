import { GovernanceTraceStepsPanel } from "@/components/governance-trace-steps-panel";
import { ProjectTrackedItemsTable } from "@/components/project-tracked-items-table";
import { resolveProjectIdFromProps } from "@/lib/api/project-mission-id";
import { loadPlaneProjectSnapshot } from "@/lib/plane-project-snapshot";
import { loadProjectPhaseTimeline } from "@/lib/project-run-phases";
import { isUiMocksEnabled } from "@/lib/ui-mocks/flags";
import { demoProjectWorkflows } from "@/lib/ui-mocks/project-workflows-issues-demo";

export async function ProjectWorkflowsPanel(props: {
  projectId?: string;
  /** @deprecated Use projectId */
  missionId?: string;
  suiteId?: string | null;
  moduleIds?: string[];
}) {
  const projectId = resolveProjectIdFromProps(props);
  const uiMocksEnabled = isUiMocksEnabled();

  if (uiMocksEnabled) {
    const items = demoProjectWorkflows(projectId);
    return (
      <ProjectTrackedItemsTable
        kind="workflow"
        title="Phases"
        items={items}
        emptyMessage="No phases are registered for this project yet."
      />
    );
  }

  const snapshot = await loadPlaneProjectSnapshot({
    projectId,
    suiteId: props.suiteId,
    moduleIds: props.moduleIds,
  });

  if (snapshot.phases.length > 0) {
    return (
      <div className="space-y-3">
        {snapshot.error ? (
          <p className="text-sm text-amber-800 dark:text-amber-200">
            Plane phase sync is pending ({snapshot.error}). Showing suite template phases.
          </p>
        ) : null}
        <ProjectTrackedItemsTable
          kind="workflow"
          title="Phases"
          items={snapshot.phases}
          emptyMessage="No phases are registered for this project yet."
        />
      </div>
    );
  }

  const live = await loadProjectPhaseTimeline(projectId);

  return (
    <div className="space-y-8">
      {live.error ? (
        <p className="text-sm text-amber-800 dark:text-amber-200">
          Phase timeline could not be loaded from persisted runs ({live.error}).
        </p>
      ) : null}
      <ProjectTrackedItemsTable
        kind="workflow"
        title="Phases"
        items={live.items}
        emptyMessage="No phases are registered for this project yet. Run the LinkSites MVO demo with Supabase configured to populate kernel stages."
      />
      {live.kernelStageItems.length > 0 ? (
        <ProjectTrackedItemsTable
          kind="workflow"
          title="Kernel stages (trace)"
          items={live.kernelStageItems}
          emptyMessage=""
        />
      ) : null}
      {live.governanceSteps.length > 0 ? (
        <section className="space-y-3">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Governance trace refs</h3>
          <GovernanceTraceStepsPanel steps={live.governanceSteps} projectId={projectId} />
        </section>
      ) : null}
    </div>
  );
}
