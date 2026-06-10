import { notFound } from "next/navigation";

import { AdminProjectChannelsPanel } from "@/components/admin/admin-project-channels-panel";
import { LeadLinkbotAffordance } from "@/components/lead-linkbot-affordance";
import { ProjectCreatedBanner } from "@/components/projects/project-created-banner";
import { ProjectDetailMetaGrid } from "@/components/project-detail-meta-grid";
import { ProjectDetailTabNav } from "@/components/project-detail-tab-nav";
import { ProjectIssuesPanel } from "@/components/project-issues-panel";
import { ProjectModulesPanel } from "@/components/project-modules-panel";
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
import { loadAdminProjectById } from "@/lib/admin-projects-data";
import { ADMIN_PROJECTS_PAGE } from "@/lib/admin-projects-copy";
import { ADMIN_BASE_PATH } from "@/lib/app-surface";
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
    projectTypeLabel: string;
  };
  tab: ProjectTabId;
}) {
  const { project, tab } = props;

  if (tab === "overview") {
    return (
      <div className="space-y-8">
        <AdminProjectChannelsPanel projectTitle={project.title} zulipSiteUrl={getZulipSiteUrlFromEnv()} />
        <ProjectOverviewPanel projectId={project.id} title={project.title} />
      </div>
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
    return (
      <ProjectRunsPanel
        projectId={project.id}
        tracesHref={`${ADMIN_BASE_PATH}/settings/traces?project=${encodeURIComponent(project.id)}`}
      />
    );
  }

  return null;
}

export default async function AdminProjectDetailPage(props: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string | string[]; created?: string | string[] }>;
}) {
  const { id } = await props.params;
  const sp = await props.searchParams;
  const tab = parseProjectTab(sp.tab);
  const showCreatedBanner = (Array.isArray(sp.created) ? sp.created[0] : sp.created) === "1";

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
      <ShellPageHeaderClient
        title={project.title}
        subtitle={ADMIN_PROJECTS_PAGE.detailSubtitle}
        hideLicensorScope
        actions={
          <>
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
            <ProjectLifecycleStatusPill status={project.status} />
          </>
        }
      />

      {showCreatedBanner ? (
        <ProjectCreatedBanner projectId={project.id} basePath={ADMIN_PROJECTS_BASE} />
      ) : null}

      {isDraft ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-100">
          {ADMIN_PROJECTS_PAGE.draftStatusHint}
        </p>
      ) : null}

      <ProjectDetailMetaGrid
        items={[
          { label: "Project ID", value: project.id },
          { label: "Type", value: project.projectTypeLabel },
          { label: "Suite", value: project.suiteId ?? "—" },
          {
            label: "Lead LiNKbot",
            value: project.primaryAgentId ? (
              <LeadLinkbotAffordance workerId={project.primaryAgentId} name="LiNKbot" />
            ) : (
              "—"
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
