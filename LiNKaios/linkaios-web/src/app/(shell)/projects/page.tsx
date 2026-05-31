import Link from "next/link";

import { listProjects } from "@linktrend/linklogic-sdk";
import type { ProjectRecord } from "@linktrend/shared-types";

import { AddProjectHeaderAction } from "@/components/role-gated-ui";
import { ProjectsIndexTable } from "@/components/projects-index-table";
import { ShellPageHeaderClient } from "@/components/shell-page-header-client";
import {
  ProjectLifecycleSummaryGrid,
  SummaryMetricCardSection,
} from "@/components/summary-metric-card";
import { getPlaneBridgeConfig, planeWorkspaceProjectsHref } from "@/lib/plane-links";
import { projectIndexRowFromMission } from "@/lib/project-index-rows";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ProjectSummaryColumnKey } from "@/lib/project-status-ui";
import { UiButton } from "@/components/ui/button-bridge";
import { DEMO_SIDEBAR_MISSIONS } from "@/lib/ui-mocks/entities";
import { isUiMocksEnabled } from "@/lib/ui-mocks/flags";
import { DEMO_MISSION_PLANE_BRIDGE, demoMissionsFixtureRows } from "@/lib/ui-mocks/missions-fixtures";

export const dynamic = "force-dynamic";

const COLUMN_ORDER: {
  key: ProjectSummaryColumnKey;
  title: string;
  statuses: ProjectRecord["status"][];
}[] = [
  { key: "draft", title: "Draft", statuses: ["draft"] },
  { key: "active", title: "Active", statuses: ["assigned", "running"] },
  { key: "completed", title: "Completed", statuses: ["completed"] },
  { key: "attention", title: "Attention", statuses: ["failed", "cancelled"] },
];

export default async function ProjectsListPage() {
  const supabase = await createSupabaseServerClient();
  const uiMocksEnabled = isUiMocksEnabled();
  const { data, error } = await listProjects(supabase, { limit: 200 });

  const planeCfg = getPlaneBridgeConfig();
  const planeProjectsHref = planeWorkspaceProjectsHref(planeCfg);

  if (error) {
    return (
      <main className="space-y-6">
        <ShellPageHeaderClient
          title="Projects"
          subtitle="Pipeline by lifecycle stage — suite, phase, and active issue for each project."
        />
        <p className="text-sm text-red-700 dark:text-red-400">{error.message}</p>
      </main>
    );
  }

  const api = (data ?? []) as ProjectRecord[];
  const demoIds = new Set<string>(DEMO_SIDEBAR_MISSIONS.map((d) => d.id));
  const merged: ProjectRecord[] = uiMocksEnabled
    ? [...demoMissionsFixtureRows(), ...api.filter((m) => !demoIds.has(String(m.id)))]
    : api;

  const byColumn = COLUMN_ORDER.map((col) => ({
    ...col,
    items: merged.filter((m) => col.statuses.includes(m.status)),
  }));
  const lifecycleCounts = Object.fromEntries(
    byColumn.map((col) => [col.key, col.items.length]),
  ) as Record<ProjectSummaryColumnKey, number>;

  return (
    <main className="space-y-10">
      <ShellPageHeaderClient
        title="Projects"
        subtitle="Pipeline by lifecycle stage — suite, phase, and active issue for each project."
        actions={<AddProjectHeaderAction />}
      />

      <SummaryMetricCardSection title="At a glance" aria-label="Lifecycle summary">
        <ProjectLifecycleSummaryGrid counts={lifecycleCounts} />
      </SummaryMetricCardSection>

      <section aria-label="All projects">
        <h2 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">All projects</h2>
        {merged.length === 0 ? (
          <div className="mt-6 rounded-xl border border-dashed border-zinc-300 bg-zinc-50/80 p-8 text-center dark:border-zinc-700 dark:bg-zinc-900/40">
            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">No projects yet</p>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Once projects exist in LiNKaios they will appear here automatically.
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <AddProjectHeaderAction />
              <UiButton asChild buttonKey="secondaryRow">
                <Link href="/suites/marketplace">Browse Marketplace</Link>
              </UiButton>
            </div>
          </div>
        ) : (
          <ProjectsIndexTable
            planeWorkspaceHref={planeProjectsHref}
            rows={merged.map((m) =>
              projectIndexRowFromMission(
                m,
                planeCfg,
                uiMocksEnabled ? DEMO_MISSION_PLANE_BRIDGE[String(m.id)] : undefined,
              ),
            )}
          />
        )}
      </section>
    </main>
  );
}
