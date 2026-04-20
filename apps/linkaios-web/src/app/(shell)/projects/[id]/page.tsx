import Link from "next/link";
import { notFound } from "next/navigation";

import {
  getMissionById,
  listManifestsForMission,
  listMemoryEntries,
} from "@linktrend/linklogic-sdk";

import { EntityTable } from "@/components/entity-table";
import { ProjectDetailTabNav } from "@/components/project-detail-tab-nav";
import { parseProjectTab, type ProjectTabId } from "@/lib/project-tabs";
import { projectStatusDisplay } from "@/lib/project-status-ui";
import { ProjectsPlaneStrip } from "@/components/projects-plane-strip";
import { canWriteCommandCentre, getCommandCentreRoleForUser } from "@/lib/command-centre-access";
import { getPlaneBridgeConfig, planeWorkspaceProjectsHref } from "@/lib/plane-links";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isDemoMissionId } from "@/lib/ui-mocks/entities";
import { isUiMocksEnabled } from "@/lib/ui-mocks/flags";
import { DEMO_MISSION_DETAIL_SPECS, type DemoMissionDetailSpec } from "@/lib/ui-mocks/missions-fixtures";

import { AppendMemoryForm } from "./append-memory-form";
import { MissionToolsSection } from "./mission-tools-section";

export const dynamic = "force-dynamic";

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">{title}</h2>
      {description ? (
        <p className="mt-1 max-w-2xl text-xs leading-relaxed text-zinc-600 dark:text-zinc-400 sm:text-sm">{description}</p>
      ) : null}
      <div className="mt-4">{children}</div>
    </section>
  );
}

function DemoMissionTabs(props: { spec: DemoMissionDetailSpec; tab: ProjectTabId; planeProjectsHref: string | null }) {
  const { spec, tab, planeProjectsHref } = props;

  if (tab === "overview") {
    return (
      <div className="grid gap-6 lg:grid-cols-2">
        <Section title="Objectives">
          <ul className="list-disc space-y-2 pl-5 text-sm text-zinc-700">
            <li>Ship weekly milestones with clear acceptance checks.</li>
            <li>Keep human approvals on high-risk automations.</li>
          </ul>
        </Section>
        <Section title="Risks & alerts">
          <p className="text-sm text-zinc-600">No sample alerts for this preview project.</p>
          <Link
            href="/settings/traces"
            className="mt-3 inline-flex text-sm font-medium text-sky-700 underline dark:text-sky-400"
          >
            System logs
          </Link>
        </Section>
      </div>
    );
  }

  if (tab === "work-items") {
    return (
      <div className="space-y-6">
        <Section title="Work items">
          <dl className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-zinc-100 bg-zinc-50 px-4 py-3">
              <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">Open</dt>
              <dd className="mt-1 text-xl font-semibold text-zinc-900">{spec.openWorkItems}</dd>
            </div>
            <div className="rounded-xl border border-zinc-100 bg-zinc-50 px-4 py-3">
              <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">Blockers</dt>
              <dd className="mt-1 text-xl font-semibold text-zinc-900">{spec.blockers}</dd>
            </div>
            <div className="rounded-xl border border-zinc-100 bg-zinc-50 px-4 py-3">
              <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">Board</dt>
              <dd className="mt-1">
                {planeProjectsHref ? (
                  <a
                    href={planeProjectsHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex rounded-lg bg-zinc-900 px-3 py-2 text-sm font-semibold text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
                  >
                    Open in Plane ↗
                  </a>
                ) : (
                  <span className="text-sm text-zinc-500">Plane is not connected.</span>
                )}
              </dd>
            </div>
          </dl>
        </Section>
      </div>
    );
  }

  if (tab === "cycles") {
    return (
      <Section title="Cycles">
        <p className="text-sm text-zinc-700">
          <span className="font-medium">Current:</span> {spec.cycle}
        </p>
        {planeProjectsHref ? (
          <a
            href={planeProjectsHref}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Open in Plane ↗
          </a>
        ) : null}
      </Section>
    );
  }

  if (tab === "agents") {
    return (
      <Section title="LiNKbots">
        <p className="text-sm text-zinc-600">
          Lead:{" "}
          <Link href={`/workers/${spec.leadId}/sessions`} className="font-semibold text-violet-800 underline">
            {spec.leadName}
          </Link>
        </p>
      </Section>
    );
  }

  if (tab === "tools") {
    return (
      <Section title="Tool permissions">
        <p className="text-sm text-zinc-600">Open a live project to manage tools for this workspace.</p>
      </Section>
    );
  }

  /* activity */
  return (
    <Section title="Activity">
      <Link href="/settings/traces" className="inline-flex text-sm font-medium text-sky-700 underline dark:text-sky-400">
        System logs
      </Link>
    </Section>
  );
}

type LiveMissionParts = {
  mission: {
    id: string;
    title: string;
    status: string;
    primary_agent_id: string | null;
  };
  manifests: Awaited<ReturnType<typeof listManifestsForMission>>;
  memory: Awaited<ReturnType<typeof listMemoryEntries>>;
  canWrite: boolean;
};

function LiveMissionTabs(
  props: LiveMissionParts & {
    tab: ProjectTabId;
    planeProjectsHref: string | null;
    highlightRequestId?: string | null;
  },
) {
  const { mission, manifests, memory, canWrite, tab, planeProjectsHref, highlightRequestId } = props;

  if (tab === "overview") {
    return (
      <div className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-3">
          <Section title="Overview">
            <p className="text-sm text-zinc-600">Goals and narrative for this project.</p>
          </Section>
          <Section title="Manifests">
            {manifests.error ? (
              <p className="text-sm text-amber-800 dark:text-amber-200">Manifest history could not be loaded.</p>
            ) : (
              <EntityTable
                title="Versions"
                rows={(manifests.data ?? []) as Record<string, unknown>[]}
                columns={["version", "created_at"]}
              />
            )}
          </Section>
          <Section title="Activity">
            <Link
              href={`/settings/traces?project=${mission.id}`}
              className="inline-flex text-sm font-medium text-sky-700 underline dark:text-sky-400"
            >
              System logs for this project
            </Link>
          </Section>
        </div>

        <Section title="LiNKbrain">
          <p className="mb-4 text-sm">
            <Link href={`/memory?tab=project&mission=${mission.id}`} className="font-medium text-zinc-900 underline">
              Open full memory view
            </Link>
          </p>
          <AppendMemoryForm missionId={mission.id} canWrite={canWrite} />
          {memory.error ? (
            <p className="mt-2 text-sm text-amber-800 dark:text-amber-200">Memory entries could not be loaded.</p>
          ) : (
            <div className="mt-4">
              <EntityTable
                title="Entries"
                rows={(memory.data ?? []) as Record<string, unknown>[]}
                columns={["classification", "body", "created_at"]}
              />
            </div>
          )}
        </Section>
      </div>
    );
  }

  if (tab === "work-items") {
    return (
      <Section title="Work items">
        {planeProjectsHref ? (
          <a
            href={planeProjectsHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Open in Plane ↗
          </a>
        ) : (
          <p className="text-sm text-zinc-500">Plane is not connected.</p>
        )}
      </Section>
    );
  }

  if (tab === "cycles") {
    return (
      <Section title="Cycles">
        {planeProjectsHref ? (
          <a
            href={planeProjectsHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Open in Plane ↗
          </a>
        ) : (
          <p className="text-sm text-zinc-500">Plane is not connected.</p>
        )}
      </Section>
    );
  }

  if (tab === "agents") {
    return (
      <Section title="LiNKbots">
        {mission.primary_agent_id ? (
          <p className="text-sm text-zinc-700">
            Lead LiNKbot:{" "}
            <Link
              href={`/workers/${mission.primary_agent_id}/sessions`}
              className="font-semibold text-violet-800 underline"
            >
              Open worker →
            </Link>
          </p>
        ) : (
          <p className="text-sm text-zinc-500">No primary LiNKbot assigned.</p>
        )}
      </Section>
    );
  }

  if (tab === "tools") {
    return (
      <MissionToolsSection missionId={mission.id} highlightRequestId={highlightRequestId ?? null} canWrite={canWrite} />
    );
  }

  return (
    <Section title="Activity">
      <Link
        href={`/settings/traces?project=${mission.id}`}
        className="inline-flex text-sm font-medium text-sky-700 underline dark:text-sky-400"
      >
        System logs for this project
      </Link>
    </Section>
  );
}

export default async function MissionDetailPage(props: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string | string[]; request?: string | string[] }>;
}) {
  const { id } = await props.params;
  const sp = await props.searchParams;
  const tab = parseProjectTab(sp.tab);
  const rawReq = Array.isArray(sp.request) ? sp.request[0] : sp.request;
  const highlightRequestId = rawReq?.trim() || null;

  const planeCfg = getPlaneBridgeConfig();
  const planeProjectsHref = planeWorkspaceProjectsHref(planeCfg);

  if (!isUiMocksEnabled() && isDemoMissionId(id)) {
    notFound();
  }

  const demo = isUiMocksEnabled() ? DEMO_MISSION_DETAIL_SPECS[id] : undefined;
  if (demo) {
    return (
      <main className="space-y-8">
        <header className="border-b border-zinc-200 pb-8">
          <p className="text-sm text-zinc-500">
            <Link href="/projects" className="text-zinc-700 underline">
              Projects
            </Link>
            <span className="mx-2">/</span>
            <span className="text-zinc-900">{demo.title}</span>
          </p>
          <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">{demo.title}</h1>
              <p className="mt-2 max-w-2xl text-sm text-zinc-600">{demo.tagline}</p>
            </div>
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:items-end">
              {planeProjectsHref ? (
                <a
                  href={planeProjectsHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
                >
                  Open in Plane ↗
                </a>
              ) : null}
              <div className="flex flex-wrap justify-end gap-2">
                <span className="inline-flex rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-900 ring-1 ring-amber-200">
                  Sample project
                </span>
                <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-900 ring-1 ring-emerald-200">
                  {projectStatusDisplay(demo.status)}
                </span>
              </div>
            </div>
          </div>
          <dl className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-zinc-100 bg-zinc-50 px-4 py-3">
              <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">Lead LiNKbot</dt>
              <dd className="mt-1 text-sm font-semibold text-zinc-900">
                <Link href={`/workers/${demo.leadId}/sessions`} className="text-violet-800 underline">
                  {demo.leadName}
                </Link>
              </dd>
            </div>
            <div className="rounded-xl border border-zinc-100 bg-zinc-50 px-4 py-3">
              <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">Project id</dt>
              <dd className="mt-1 text-xs text-zinc-700">{demo.id}</dd>
            </div>
            <div className="rounded-xl border border-zinc-100 bg-zinc-50 px-4 py-3">
              <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">Cycle</dt>
              <dd className="mt-1 text-sm font-semibold text-zinc-900">{demo.cycle}</dd>
            </div>
          </dl>
        </header>

        <ProjectsPlaneStrip workspaceProjectsHref={planeProjectsHref} />

        <ProjectDetailTabNav missionId={id} tab={tab} />

        <DemoMissionTabs spec={demo} tab={tab} planeProjectsHref={planeProjectsHref} />
      </main>
    );
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const role =
    user?.id != null
      ? await getCommandCentreRoleForUser(supabase, { userId: user.id, email: user.email })
      : "operator";
  const canWrite = canWriteCommandCentre(role);

  const [{ data: mission, error: mErr }, manifests, memory] = await Promise.all([
    getMissionById(supabase, id),
    listManifestsForMission(supabase, id),
    listMemoryEntries(supabase, { missionId: id, limit: 100 }),
  ]);

  if (mErr || !mission) {
    notFound();
  }

  const m = mission as { id: string; title: string; status: string; primary_agent_id: string | null };

  return (
    <main className="space-y-8">
      <header className="border-b border-zinc-200 pb-8">
        <p className="text-sm text-zinc-500">
          <Link href="/projects" className="text-zinc-700 underline">
            Projects
          </Link>
          <span className="mx-2">/</span>
          <span className="text-zinc-900">{m.title}</span>
        </p>
        <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">{m.title}</h1>
          </div>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:items-end">
            {planeProjectsHref ? (
              <a
                href={planeProjectsHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                Open in Plane ↗
              </a>
            ) : null}
            <div className="flex flex-wrap justify-end gap-2">
              <span className="inline-flex rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-800 ring-1 ring-zinc-200">
                {projectStatusDisplay(m.status)}
              </span>
              {m.primary_agent_id ? (
                <Link
                  href={`/workers/${m.primary_agent_id}/sessions`}
                  className="inline-flex rounded-full bg-sky-50 px-2.5 py-1 text-xs font-medium text-sky-900 ring-1 ring-sky-200 hover:bg-sky-100"
                >
                  Lead LiNKbot
                </Link>
              ) : null}
            </div>
          </div>
        </div>
      </header>

      <ProjectsPlaneStrip workspaceProjectsHref={planeProjectsHref} />

      <ProjectDetailTabNav missionId={m.id} tab={tab} />

      <LiveMissionTabs
        mission={m}
        manifests={manifests}
        memory={memory}
        canWrite={canWrite}
        tab={tab}
        planeProjectsHref={planeProjectsHref}
        highlightRequestId={highlightRequestId}
      />
    </main>
  );
}
