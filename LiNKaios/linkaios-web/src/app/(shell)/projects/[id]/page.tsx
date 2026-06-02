import { notFound } from "next/navigation";

import { getProjectById } from "@linktrend/linklogic-sdk";

import { LeadLinkbotAffordance } from "@/components/lead-linkbot-affordance";
import { ProjectCreatedBanner } from "@/components/projects/project-created-banner";
import { ProjectDetailMetaGrid } from "@/components/project-detail-meta-grid";
import { ProjectDetailTabNav } from "@/components/project-detail-tab-nav";
import { ProjectModulesPanel } from "@/components/project-modules-panel";
import { ProjectIssuesPanel } from "@/components/project-issues-panel";
import { ProjectOverviewPanel } from "@/components/project-overview-panel";
import {
  ProjectLeasesPanel,
  ProjectLinkbotsAutomationsPanel,
} from "@/components/project-linkbots-automations-panel";
import { ProjectRunsPanel } from "@/components/project-runs-panel";
import { ProjectWorkflowProgress } from "@/components/project-workflow-progress";
import { ProjectWorkflowsPanel } from "@/components/project-workflows-panel";
import { ShellPageHeaderClient } from "@/components/shell-page-header-client";
import { StatusPill } from "@/components/ui/status-pill";
import { getPlaneBridgeConfig, planeProjectBoardHref, planeProjectBoardHrefFromEnv, planeWorkspaceProjectsHref } from "@/lib/plane-links";
import { loadPlaneBridgesForProjects } from "@/lib/plane-project-bridge";
import { isPlaneLiveConfigured } from "@/lib/kernel/plane-project-sync";
import { parseProjectTab, type ProjectTabId } from "@/lib/project-tabs";
import {
  PROJECT_LIFECYCLE_PILL_LABELS,
  projectStatusDisplay,
  projectStatusPillTone,
  projectWorkflowProgressPercent,
} from "@/lib/project-status-ui";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isDemoMissionId } from "@/lib/ui-mocks/entities";
import { isUiMocksEnabled } from "@/lib/ui-mocks/flags";
import {
  getRegisteredDemoProject,
  getRegisteredDemoProjectDetailSpec,
} from "@/lib/projects/demo-project-registry";
import {
  DEMO_MISSION_DETAIL_SPECS,
  DEMO_MISSION_PLANE_BRIDGE,
  type DemoMissionDetailSpec,
} from "@/lib/ui-mocks/missions-fixtures";

export const dynamic = "force-dynamic";

function ProjectLifecycleStatusPill(props: { status: string }) {
  const label = projectStatusDisplay(props.status);
  return (
    <StatusPill
      label={label}
      tone={projectStatusPillTone(label)}
      equalWidthLabels={PROJECT_LIFECYCLE_PILL_LABELS}
    />
  );
}

function DemoMissionTabs(props: {
  spec: DemoMissionDetailSpec;
  tab: ProjectTabId;
  missionId: string;
}) {
  const { spec, tab, missionId } = props;

  if (tab === "overview") {
    return <ProjectOverviewPanel missionId={missionId} title={spec.title} />;
  }

  if (tab === "modules") {
    return <ProjectModulesPanel missionId={missionId} />;
  }

  if (tab === "phases") {
    return <ProjectWorkflowsPanel missionId={missionId} />;
  }

  if (tab === "issues") {
    return <ProjectIssuesPanel missionId={missionId} />;
  }

  if (tab === "agents") {
    return <ProjectLinkbotsAutomationsPanel missionId={missionId} primaryAgentId={spec.leadId} />;
  }

  if (tab === "leases") {
    return <ProjectLeasesPanel missionId={missionId} />;
  }

  if (tab === "runs") {
    return <ProjectRunsPanel missionId={missionId} />;
  }

  return null;
}

function LiveMissionTabs(props: {
  mission: { id: string; title: string; primary_agent_id: string | null };
  tab: ProjectTabId;
}) {
  const { mission, tab } = props;

  if (tab === "overview") {
    return <ProjectOverviewPanel missionId={mission.id} title={mission.title} />;
  }

  if (tab === "modules") {
    return <ProjectModulesPanel missionId={mission.id} />;
  }

  if (tab === "phases") {
    return <ProjectWorkflowsPanel missionId={mission.id} />;
  }

  if (tab === "issues") {
    return <ProjectIssuesPanel missionId={mission.id} />;
  }

  if (tab === "agents") {
    return (
      <ProjectLinkbotsAutomationsPanel missionId={mission.id} primaryAgentId={mission.primary_agent_id} />
    );
  }

  if (tab === "leases") {
    return <ProjectLeasesPanel missionId={mission.id} />;
  }

  if (tab === "runs") {
    return <ProjectRunsPanel missionId={mission.id} />;
  }

  return null;
}

export default async function MissionDetailPage(props: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string | string[]; created?: string | string[] }>;
}) {
  const { id } = await props.params;
  const sp = await props.searchParams;
  const tab = parseProjectTab(sp.tab);
  const showCreatedBanner = (Array.isArray(sp.created) ? sp.created[0] : sp.created) === "1";

  const planeCfg = getPlaneBridgeConfig();
  const planeProjectsHref = planeWorkspaceProjectsHref(planeCfg);

  if (!isUiMocksEnabled() && isDemoMissionId(id)) {
    notFound();
  }

  const demo = isUiMocksEnabled()
    ? (getRegisteredDemoProjectDetailSpec(id) ?? DEMO_MISSION_DETAIL_SPECS[id])
    : undefined;
  if (demo) {
    const registered = getRegisteredDemoProject(id);
    const demoBridge = registered?.planeBridge ?? DEMO_MISSION_PLANE_BRIDGE[demo.id];
    const demoPlaneHref = planeProjectBoardHref(planeCfg, demoBridge?.code ?? null) ?? planeProjectsHref;
    return (
      <main className="space-y-8">
        <ShellPageHeaderClient
          title={demo.title}
          subtitle={demo.tagline}
          actions={
            <>
              {demoPlaneHref ? (
                <a
                  href={demoPlaneHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
                >
                  Open in Plane ↗
                </a>
              ) : null}
              <ProjectLifecycleStatusPill status={demo.status} />
            </>
          }
        />
        {showCreatedBanner ? <ProjectCreatedBanner projectId={demo.id} /> : null}
        <ProjectDetailMetaGrid
          items={[
            { label: "Project ID", value: demo.id },
            { label: "Suite", value: demo.moduleName },
            { label: "Module", value: demo.projectTypeName },
            {
              label: "Lead LiNKbot",
              value: <LeadLinkbotAffordance workerId={demo.leadId} name={demo.leadName} />,
            },
          ]}
        />
        <ProjectWorkflowProgress percent={projectWorkflowProgressPercent(demo.status)} />

        <ProjectDetailTabNav missionId={id} tab={tab} />

        <DemoMissionTabs spec={demo} tab={tab} missionId={id} />
      </main>
    );
  }

  const supabase = await createSupabaseServerClient();
  const { data: project, error: mErr } = await getProjectById(supabase, id);

  if (mErr || !project) {
    notFound();
  }

  const m = project as { id: string; title: string; status: string; primary_agent_id: string | null };
  const persistedBridge = isPlaneLiveConfigured()
    ? (await loadPlaneBridgesForProjects([m.id]))[m.id]
    : undefined;
  const demoBridge = DEMO_MISSION_PLANE_BRIDGE[m.id];
  const livePlaneHref =
    (persistedBridge?.planeProjectId
      ? planeProjectBoardHrefFromEnv(persistedBridge.planeProjectId, persistedBridge.code)
      : null) ??
    planeProjectBoardHref(planeCfg, demoBridge?.code ?? null) ??
    planeProjectsHref;
  const bridge = demoBridge;

  return (
    <main className="space-y-8">
      <ShellPageHeaderClient
        title={m.title}
        subtitle="Plane runs board execution; LiNKaios runs orchestration, approvals, outputs, and traces."
        actions={
          <>
            {livePlaneHref ? (
              <a
                href={livePlaneHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                Open in Plane ↗
              </a>
            ) : null}
            <ProjectLifecycleStatusPill status={m.status} />
          </>
        }
      />
      {showCreatedBanner ? <ProjectCreatedBanner projectId={m.id} /> : null}
      <ProjectDetailMetaGrid
        items={[
          { label: "Project ID", value: m.id },
          { label: "Suite", value: bridge?.moduleName ?? "Unmapped suite" },
          { label: "Module", value: bridge?.projectTypeName ?? "Unmapped module" },
          {
            label: "Lead LiNKbot",
            value: m.primary_agent_id ? (
              <LeadLinkbotAffordance workerId={m.primary_agent_id} name="LiNKbot" />
            ) : (
              "—"
            ),
          },
        ]}
      />

      <ProjectWorkflowProgress percent={projectWorkflowProgressPercent(m.status)} />

      <ProjectDetailTabNav missionId={m.id} tab={tab} />

      <LiveMissionTabs mission={m} tab={tab} />
    </main>
  );
}
