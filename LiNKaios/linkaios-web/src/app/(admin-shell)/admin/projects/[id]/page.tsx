import { notFound } from "next/navigation";

import { AdminLaunchProjectButton } from "@/components/admin/admin-launch-project-button";
import { AdminProjectChannelsPanel } from "@/components/admin/admin-project-channels-panel";
import { LeadLinkbotAffordance } from "@/components/lead-linkbot-affordance";
import { ProjectBriefEditor } from "@/components/project-brief-editor";
import { ProjectBreadcrumbRegister } from "@/components/project-breadcrumb-register";
import { ProjectDetailMetaGrid } from "@/components/project-detail-meta-grid";
import { ProjectDetailTabNav } from "@/components/project-detail-tab-nav";
import { ProjectIssuesPanel } from "@/components/project-issues-panel";
import { ProjectModulesPanel } from "@/components/project-modules-panel";
import {
  ProjectLeasesPanel,
  ProjectLinkbotsAutomationsPanel,
} from "@/components/project-linkbots-automations-panel";
import { ProjectOverviewSnapshotGrid } from "@/components/project-overview-snapshot-grid";
import { ProjectPlaneOverviewSection } from "@/components/project-plane-overview-section";
import { ProjectRunsPanel } from "@/components/project-runs-panel";
import { ProjectWorkflowProgress } from "@/components/project-workflow-progress";
import { ProjectWorkflowsPanel } from "@/components/project-workflows-panel";
import { ShellPageHeaderClient } from "@/components/shell-page-header-client";
import { StatusPill } from "@/components/ui/status-pill";
import { loadAdminProjectById } from "@/lib/admin-projects-data";
import { ADMIN_PROJECTS_PAGE } from "@/lib/admin-projects-copy";
import { ADMIN_BASE_PATH } from "@/lib/app-surface";
import { loadProjectOverview } from "@/lib/project-overview-data";
import { parseProjectTab, type ProjectTabId } from "@/lib/project-tabs";
import {
  PROJECT_LIFECYCLE_PILL_LABELS,
  projectStatusDisplay,
  projectStatusPillTone,
  projectWorkflowProgressPercent,
} from "@/lib/project-status-ui";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getZulipSiteUrlFromEnv } from "@/lib/zulip-links";

export const dynamic = "force-dynamic";

const ADMIN_PROJECTS_BASE = `${ADMIN_BASE_PATH}/projects`;

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

function AdminProjectTabs(props: {
  project: {
    id: string;
    title: string;
    status: string;
    suiteId: string | null;
    moduleIds: string[];
    cadence: string | null;
    primaryAgentId: string | null;
    leadAgentLabel: string;
    brief: string | null;
    projectTypeLabel: string;
  };
  tab: ProjectTabId;
}) {
  const { project, tab } = props;

  if (tab === "overview") {
    return (
      <AdminProjectOverviewTab project={project} />
    );
  }

  if (tab === "modules") {
    return (
      <ProjectModulesPanel
        projectId={project.id}
        moduleIds={project.moduleIds}
        suiteId={project.suiteId}
        cadence={project.cadence}
        basePath={ADMIN_PROJECTS_BASE}
      />
    );
  }

  if (tab === "phases") {
    return (
      <ProjectWorkflowsPanel
        projectId={project.id}
        suiteId={project.suiteId}
        moduleIds={project.moduleIds}
      />
    );
  }

  if (tab === "issues") {
    return (
      <ProjectIssuesPanel
        projectId={project.id}
        suiteId={project.suiteId}
        moduleIds={project.moduleIds}
      />
    );
  }

  if (tab === "agents") {
    return (
      <ProjectLinkbotsAutomationsPanel
        projectId={project.id}
        primaryAgentId={project.primaryAgentId}
        suiteId={project.suiteId}
        moduleIds={project.moduleIds}
      />
    );
  }

  if (tab === "leases") {
    return <ProjectLeasesPanel projectId={project.id} />;
  }

  if (tab === "runs") {
    return <ProjectRunsPanel projectId={project.id} projectTitle={project.title} />;
  }

  return null;
}

async function AdminProjectOverviewTab(props: {
  project: {
    id: string;
    title: string;
    brief: string | null;
    leadAgentLabel: string;
    projectTypeLabel: string;
    suiteId: string | null;
  };
}) {
  const { brief, snapshot } = await loadProjectOverview(props.project.id, props.project.title, {
    briefOverride: props.project.brief,
    projectTypeLabel: props.project.projectTypeLabel,
  });

  const briefText =
    props.project.brief?.trim() ||
    brief.description ||
    "Add a project brief to capture goals, scope, and context as this vendor project evolves.";

  return (
    <div className="space-y-8">
      <AdminProjectChannelsPanel projectTitle={props.project.title} zulipSiteUrl={getZulipSiteUrlFromEnv()} />
      <ProjectBriefEditor
        projectId={props.project.id}
        initialBrief={briefText}
        expectedOutputs={brief.expectedOutputs}
      />
      <section>
        <h2 className="text-lg font-medium text-zinc-800 dark:text-zinc-100">Project snapshot</h2>
        <ProjectOverviewSnapshotGrid projectId={props.project.id} snapshot={snapshot} informationalOnly />
      </section>
      <ProjectPlaneOverviewSection projectId={props.project.id} />
    </div>
  );
}

export default async function AdminProjectDetailPage(props: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string | string[] }>;
}) {
  const { id } = await props.params;
  const sp = await props.searchParams;
  const tab = parseProjectTab(sp.tab);

  const supabase = await createSupabaseServerClient();
  const { project, error } = await loadAdminProjectById(supabase, id);

  if (error) {
    throw new Error(error);
  }

  if (!project) {
    notFound();
  }

  const isDraft = project.status.toLowerCase() === "draft";

  return (
    <main className="space-y-8">
      <ProjectBreadcrumbRegister projectId={project.id} title={project.title} />

      <ShellPageHeaderClient
        title={project.title}
        subtitle={ADMIN_PROJECTS_PAGE.detailSubtitle}
        hideLicensorScope
        titleExtra={<ProjectLifecycleStatusPill status={project.status} />}
        actions={
          <>
            {isDraft ? <AdminLaunchProjectButton projectId={project.id} /> : null}
            {project.planeProjectHref ? (
              <a
                href={project.planeProjectHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                Open in Plane ↗
              </a>
            ) : null}
          </>
        }
      />

      {isDraft ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-100">
          {ADMIN_PROJECTS_PAGE.draftStatusHint}
        </p>
      ) : null}

      <ProjectDetailMetaGrid
        items={[
          { label: "Project ID", value: project.id, copyValue: project.id },
          { label: "Type", value: project.projectTypeLabel },
          { label: "Suite", value: project.suiteDisplayName },
          { label: "Modules", value: project.moduleDisplayNames },
          {
            label: "Lead LiNKbot",
            value: project.primaryAgentId ? (
              <LeadLinkbotAffordance workerId={project.primaryAgentId} name={project.leadAgentLabel} />
            ) : (
              project.leadAgentLabel
            ),
          },
        ]}
      />

      <ProjectWorkflowProgress percent={projectWorkflowProgressPercent(project.status)} />

      <ProjectDetailTabNav projectId={project.id} tab={tab} basePath={ADMIN_PROJECTS_BASE} />

      <AdminProjectTabs project={project} tab={tab} />
    </main>
  );
}
