import Link from "next/link";
import { notFound } from "next/navigation";

import { listProjects } from "@linktrend/linklogic-sdk";
import type { ProjectRecord } from "@linktrend/shared-types";

import { ProjectsIndexTable } from "@/components/projects-index-table";
import {
  ProjectLifecycleSummaryGrid,
  SummaryMetricCardSection,
} from "@/components/summary-metric-card";
import { WorkerTabSectionHeader } from "@/components/worker-tab-section-header";
import { getPlaneBridgeConfig, planeWorkspaceProjectsHref } from "@/lib/plane-links";
import { projectIndexRowFromMission } from "@/lib/project-index-rows";
import { formatCardTitle } from "@/lib/ui-standards";
import type { ProjectSummaryColumnKey } from "@/lib/project-status-ui";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isDemoAgentId, DEMO_SIDEBAR_MISSIONS } from "@/lib/ui-mocks/entities";
import { isUiMocksEnabled } from "@/lib/ui-mocks/flags";
import { DEMO_MISSION_PLANE_BRIDGE, demoMissionsFixtureRows } from "@/lib/ui-mocks/missions-fixtures";

export const dynamic = "force-dynamic";

const COLUMN_ORDER: {
  key: string;
  title: string;
  statuses: ProjectRecord["status"][];
}[] = [
  { key: "draft", title: "Draft", statuses: ["draft"] },
  { key: "active", title: "Active", statuses: ["assigned", "running"] },
  { key: "completed", title: "Completed", statuses: ["completed"] },
  { key: "attention", title: "Attention", statuses: ["failed", "cancelled"] },
];

export default async function WorkerProjectsPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const uiMocksEnabled = isUiMocksEnabled();
  const planeCfg = getPlaneBridgeConfig();
  const planeProjectsHref = planeWorkspaceProjectsHref(planeCfg);

  let projects: ProjectRecord[] = [];
  let displayName = id;

  if (isDemoAgentId(id)) {
    const demoMerged = demoMissionsFixtureRows().filter((m) => m.primary_agent_id === id);
    const sidebar = DEMO_SIDEBAR_MISSIONS.filter((m) => m.primary_agent_id === id);
    const seen = new Set<string>();
    projects = [...demoMerged, ...sidebar].filter((m) => {
      const key = String(m.id);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    }) as ProjectRecord[];
    displayName = id === "demo-lisa" ? "Lisa (CEO)" : "Eric (CTO)";
  } else {
    const supabase = await createSupabaseServerClient();
    const { data: agent, error: agentErr } = await supabase
      .schema("linkaios")
      .from("agents")
      .select("id, display_name")
      .eq("id", id)
      .maybeSingle();

    if (agentErr || !agent) {
      notFound();
    }

    displayName = String((agent as { display_name: string }).display_name);

    const { data, error } = await listProjects(supabase, { limit: 200 });
    if (error) {
      return (
        <section className="space-y-4">
          <WorkerTabSectionHeader title="Projects" subtitle={`Projects assigned to ${displayName}.`} />
          <p className="text-sm text-red-700 dark:text-red-400">{error.message}</p>
        </section>
      );
    }

    projects = ((data ?? []) as ProjectRecord[]).filter((m) => m.primary_agent_id === id);
  }

  const rows = projects.map((m) =>
    projectIndexRowFromMission(m, planeCfg, uiMocksEnabled ? DEMO_MISSION_PLANE_BRIDGE[String(m.id)] : undefined),
  );
  const byColumn = COLUMN_ORDER.map((col) => ({
    ...col,
    items: projects.filter((m) => col.statuses.includes(m.status)),
  }));
  const lifecycleCounts = Object.fromEntries(
    byColumn.map((col) => [col.key, col.items.length]),
  ) as Record<ProjectSummaryColumnKey, number>;

  return (
    <div className="space-y-10">
      <WorkerTabSectionHeader
        title="Projects"
        subtitle={`Projects where ${displayName} is the primary LiNKbot — same layout as the Projects section, scoped to this agent.`}
      />

      <SummaryMetricCardSection title="At a glance" aria-label="Lifecycle summary">
        <ProjectLifecycleSummaryGrid counts={lifecycleCounts} />
      </SummaryMetricCardSection>

      <section aria-label="Assigned projects">
        <h2 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">{formatCardTitle("Assigned projects")}</h2>
        {rows.length === 0 ? (
          <div className="mt-6 rounded-xl border border-dashed border-zinc-300 bg-zinc-50/80 p-8 text-center dark:border-zinc-700 dark:bg-zinc-900/40">
            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">No projects assigned</p>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              When this LiNKbot leads a project it will appear here automatically.
            </p>
            <Link
              href="/projects"
              className="mt-4 inline-flex rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              Browse all projects
            </Link>
          </div>
        ) : (
          <ProjectsIndexTable planeWorkspaceHref={planeProjectsHref} rows={rows} />
        )}
      </section>
    </div>
  );
}
