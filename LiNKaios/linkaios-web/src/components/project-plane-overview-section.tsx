import {
  DEMO_PROJECT_DETAIL_SPECS,
  DEMO_PROJECT_PLANE_BRIDGE,
} from "@/lib/ui-mocks/projects-fixtures";
import { resolveProjectIdFromProps } from "@/lib/api/project-mission-id";
import { isUiMocksEnabled } from "@/lib/ui-mocks/flags";
import {
  getPlaneBridgeConfig,
  planeProjectBoardHref,
  planeWorkspaceProjectsHref,
} from "@/lib/plane-links";
import { KanbanSquare } from "lucide-react";

import { TitledCardHeader } from "@/components/titled-card-header";

type PlaneField = {
  label: string;
  value: string;
};

function planeFieldsForProject(projectId: string): PlaneField[] | null {
  if (!isUiMocksEnabled()) return null;

  const bridge = DEMO_PROJECT_PLANE_BRIDGE[projectId];
  const spec = DEMO_PROJECT_DETAIL_SPECS[projectId];
  if (!bridge || !spec) return null;

  return [
    { label: "Active run", value: spec.cycle },
    { label: "Open work items", value: String(bridge.openWorkItems) },
    { label: "Blockers", value: String(bridge.blockers) },
    { label: "Active issue", value: bridge.activeIssue },
    { label: "Approval gate", value: bridge.approvalGate },
    { label: "Sync status", value: bridge.planeSyncStatus === "synced" ? "Synced" : "Pending" },
  ];
}

const PLACEHOLDER_FIELDS: PlaneField[] = [
  { label: "Active run", value: "—" },
  { label: "Open work items", value: "—" },
  { label: "Blockers", value: "—" },
  { label: "Active issue", value: "—" },
  { label: "Approval gate", value: "—" },
  { label: "Sync status", value: "—" },
];

/** Reserved overview block for Plane board context (cycles, work items, blockers). */
export async function ProjectPlaneOverviewSection(props: {
  projectId?: string;
  /** @deprecated Use projectId */
  missionId?: string;
}) {
  const projectId = resolveProjectIdFromProps(props);
  const planeCfg = getPlaneBridgeConfig();
  const bridge = DEMO_PROJECT_PLANE_BRIDGE[projectId];
  const planeHref =
    planeProjectBoardHref(planeCfg, bridge?.code ?? null) ?? planeWorkspaceProjectsHref(planeCfg);
  const previewFields = planeFieldsForProject(projectId);
  const fields = previewFields ?? PLACEHOLDER_FIELDS;
  const usingPreview = previewFields != null;

  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <TitledCardHeader
        icon={KanbanSquare}
        title="Plane"
        description="Board context from Plane — runs, work items, blockers, and approval gates — will surface here when the project bridge sync is enabled."
        titleClassName="text-lg font-medium text-zinc-800 dark:text-zinc-100"
        action={
          planeHref ? (
            <a
              href={planeHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex shrink-0 items-center justify-center rounded-lg border border-zinc-300 bg-white px-3 py-2 text-xs font-semibold text-zinc-900 transition hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:bg-zinc-900"
            >
              Open in Plane ↗
            </a>
          ) : null
        }
      />

      <dl className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {fields.map((field) => (
          <div
            key={field.label}
            className="rounded-lg border border-zinc-100 bg-zinc-50 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900/60"
          >
            <dt className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              {field.label}
            </dt>
            <dd className="mt-1 text-sm font-medium text-zinc-900 dark:text-zinc-100">{field.value}</dd>
          </div>
        ))}
      </dl>

      {usingPreview ? (
        <p className="mt-4 text-xs text-zinc-400 dark:text-zinc-500">
          Preview layout only — values will be loaded from Plane when the bridge sync is live.
        </p>
      ) : null}
    </section>
  );
}
