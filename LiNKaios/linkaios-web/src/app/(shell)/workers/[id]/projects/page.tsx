import Link from "next/link";
import { notFound } from "next/navigation";

import { WorkerTabSectionHeader } from "@/components/worker-tab-section-header";
import { isDemoAgentId, DEMO_SIDEBAR_MISSIONS } from "@/lib/ui-mocks/entities";
import { demoFleetProfile } from "@/lib/demo-fleet-profiles";
import { missionIdFromSessionMetadata } from "@/lib/session-display";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type WorkState = "assigned" | "working" | "completed" | "blocked" | "failed" | "paused";

type WorkerProjectRow = {
  id: string;
  projectTitle: string;
  projectStatus: string;
  moduleLabel: string;
  projectTypeLabel: string;
  workflowLabel: string;
  issueLabel: string;
  runLabel: string;
  runHref: string | null;
  traceLabel: string;
  traceHref: string | null;
  assignmentState: WorkState;
  usesSyntheticFields: boolean;
};

const PROJECT_FILTERS = ["all", "assigned", "working", "completed", "blocked", "failed", "paused"] as const;

function mapMissionToWorkState(status: string, hasRunningSession: boolean): WorkState {
  const s = status.toLowerCase();
  if (s === "failed") return "failed";
  if (s === "blocked" || s === "on_hold" || s === "paused") return "blocked";
  if (s === "completed" || s === "done") return "completed";
  if (s === "cancelled" || s === "canceled" || s === "retired") return "paused";
  if (hasRunningSession || s === "running" || s === "in_progress") return "working";
  return "assigned";
}

function stateBadgeStyles(state: WorkState): string {
  if (state === "working") return "bg-sky-50 text-sky-800 ring-sky-200 dark:bg-sky-950/30 dark:text-sky-100 dark:ring-sky-900/40";
  if (state === "completed")
    return "bg-emerald-50 text-emerald-800 ring-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-100 dark:ring-emerald-900/40";
  if (state === "blocked") return "bg-amber-50 text-amber-900 ring-amber-200 dark:bg-amber-950/30 dark:text-amber-100 dark:ring-amber-900/40";
  if (state === "failed") return "bg-rose-50 text-rose-900 ring-rose-200 dark:bg-rose-950/30 dark:text-rose-100 dark:ring-rose-900/40";
  if (state === "paused") return "bg-zinc-100 text-zinc-700 ring-zinc-200 dark:bg-zinc-800 dark:text-zinc-100 dark:ring-zinc-700";
  return "bg-violet-50 text-violet-800 ring-violet-200 dark:bg-violet-950/30 dark:text-violet-100 dark:ring-violet-900/40";
}

function inferModuleLabel(title: string): string {
  const t = title.toLowerCase();
  if (t.includes("lexos")) return "LEXOS";
  if (t.includes("linkapps") || t.includes("app")) return "LiNKapps";
  if (t.includes("website") || t.includes("site")) return "LinkSites";
  if (t.includes("infra") || t.includes("platform")) return "LiNKaios Core";
  return "Synthetic module";
}

function inferProjectTypeLabel(status: string): string {
  const s = status.toLowerCase();
  if (s === "running" || s === "in_progress") return "Delivery";
  if (s === "completed" || s === "done") return "Closure";
  if (s === "failed" || s === "blocked") return "Recovery";
  return "Planning";
}

export default async function WorkerProjectsPage(props: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ state?: string }>;
}) {
  const { id } = await props.params;
  const sp = await props.searchParams;

  if (isDemoAgentId(id)) {
    const profile = demoFleetProfile(id);
    const missions = DEMO_SIDEBAR_MISSIONS.filter((m) => m.primary_agent_id === id);
    const extraTitles = (profile?.projectTitles ?? []).filter((t) => !missions.some((m) => m.title === t));
    const demoRows: WorkerProjectRow[] = [
      ...missions.map((m, i) => ({
        id: String(m.id),
        projectTitle: String(m.title),
        projectStatus: String(m.status).replace(/_/g, " "),
        moduleLabel: String(m.title).toLowerCase().includes("website") ? "LinkSites" : "LiNKapps",
        projectTypeLabel: i === 0 ? "Delivery" : "Planning",
        workflowLabel: `autowork.${String(m.id).slice(0, 8)}.pipeline`,
        issueLabel: "Issue clear",
        runLabel: "Fixture run",
        runHref: `/workers/${encodeURIComponent(id)}/sessions`,
        traceLabel: "Trace fixture",
        traceHref: `/workers/${encodeURIComponent(id)}/sessions`,
        assignmentState: (m.status === "running" ? "working" : "assigned") as WorkState,
        usesSyntheticFields: true,
      })),
      ...extraTitles.map((title, i) => ({
        id: `demo-extra-${id}-${i}`,
        projectTitle: title,
        projectStatus: "assigned",
        moduleLabel: "LinkSites",
        projectTypeLabel: "Planning",
        workflowLabel: "autowork.demo.pipeline",
        issueLabel: "Issue clear",
        runLabel: "No recent run id",
        runHref: null,
        traceLabel: "Trace unavailable",
        traceHref: null,
        assignmentState: "assigned" as WorkState,
        usesSyntheticFields: true,
      })),
    ];
    const stateParam = Array.isArray(sp.state) ? sp.state[0] : sp.state;
    const stateFilter = PROJECT_FILTERS.includes((stateParam as (typeof PROJECT_FILTERS)[number]) || "all")
      ? ((stateParam as (typeof PROJECT_FILTERS)[number]) ?? "all")
      : "all";
    const visibleRows = stateFilter === "all" ? demoRows : demoRows.filter((r) => r.assignmentState === stateFilter);
    const displayName = id === "demo-lisa" ? "Lisa (CEO)" : "Eric (CTO)";

    return (
      <div className="space-y-6">
        <section>
          <WorkerTabSectionHeader
            title="Projects"
            subtitle={`Projects and module context for ${displayName}. Module, workflow, and issue fields are fixtures until live wiring.`}
          />
          <div className="mt-4 flex flex-wrap gap-2">
            {PROJECT_FILTERS.map((filter) => {
              const active = filter === stateFilter;
              const href =
                filter === "all"
                  ? `/workers/${encodeURIComponent(id)}/projects`
                  : `/workers/${encodeURIComponent(id)}/projects?state=${encodeURIComponent(filter)}`;
              return (
                <Link
                  key={filter}
                  href={href}
                  className={`rounded-full border px-3 py-1 text-xs font-medium capitalize transition ${
                    active
                      ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
                      : "border-zinc-300 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-900"
                  }`}
                >
                  {filter}
                </Link>
              );
            })}
          </div>
          <div className="mt-4">
            {!visibleRows.length ? (
              <p className="text-sm text-zinc-500">No projects match this state filter.</p>
            ) : (
              <ul className="space-y-3">
                {visibleRows.map((row) => (
                  <li key={row.id} className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Project</p>
                        <Link href={`/projects/${row.id}`} className="mt-1 block font-semibold text-zinc-900 hover:underline dark:text-zinc-100">
                          {row.projectTitle}
                        </Link>
                        <p className="mt-1 text-xs capitalize text-zinc-500 dark:text-zinc-400">Status · {row.projectStatus}</p>
                      </div>
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 capitalize ${stateBadgeStyles(row.assignmentState)}`}>
                        {row.assignmentState}
                      </span>
                    </div>
                    <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
                      <div>
                        <dt className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Module</dt>
                        <dd className="mt-1 font-medium text-zinc-900 dark:text-zinc-100">{row.moduleLabel}</dd>
                      </div>
                      <div>
                        <dt className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Project type</dt>
                        <dd className="mt-1 font-medium text-zinc-900 dark:text-zinc-100">{row.projectTypeLabel}</dd>
                      </div>
                      <div>
                        <dt className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Workflow</dt>
                        <dd className="mt-1 font-mono text-xs text-zinc-700 dark:text-zinc-200">{row.workflowLabel}</dd>
                      </div>
                    </dl>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>
    );
  }

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

  const { data, error } = await supabase
    .schema("linkaios")
    .from("missions")
    .select("id, title, status, updated_at")
    .eq("primary_agent_id", id)
    .order("updated_at", { ascending: false })
    .limit(40);

  const sessionsRes = await supabase
    .schema("bot_runtime")
    .from("worker_sessions")
    .select("id, status, started_at, metadata")
    .eq("agent_id", id)
    .order("started_at", { ascending: false })
    .limit(120);

  const stateParam = Array.isArray(sp.state) ? sp.state[0] : sp.state;
  const stateFilter = PROJECT_FILTERS.includes((stateParam as (typeof PROJECT_FILTERS)[number]) || "all")
    ? ((stateParam as (typeof PROJECT_FILTERS)[number]) ?? "all")
    : "all";

  const sessionsByMission = new Map<string, Array<{ id: string; status: string }>>();
  for (const row of sessionsRes.data ?? []) {
    const missionId = missionIdFromSessionMetadata((row as { metadata?: unknown }).metadata);
    if (!missionId) continue;
    const list = sessionsByMission.get(missionId) ?? [];
    list.push({ id: String((row as { id: string }).id), status: String((row as { status: string }).status) });
    sessionsByMission.set(missionId, list);
  }

  const rows: WorkerProjectRow[] = (data ?? []).map((m) => {
    const sessions = sessionsByMission.get(String(m.id)) ?? [];
    const hasRunningSession = sessions.some((s) => s.status.toLowerCase() === "running");
    const state = mapMissionToWorkState(String(m.status), hasRunningSession);
    const recentRun = sessions[0]?.id ?? null;
    const statusText = String(m.status || "assigned").replace(/_/g, " ");
    return {
      id: String(m.id),
      projectTitle: String(m.title),
      projectStatus: statusText,
      moduleLabel: inferModuleLabel(String(m.title)),
      projectTypeLabel: inferProjectTypeLabel(String(m.status || "")),
      workflowLabel: `autowork.${String(m.id).slice(0, 8)}.pipeline`,
      issueLabel: state === "blocked" || state === "failed" ? `Issue open · ${state}` : "Issue clear",
      runLabel: recentRun ? `Run ${recentRun.slice(0, 8)}` : "No recent run id",
      runHref: recentRun ? `/workers/${encodeURIComponent(id)}/sessions/${encodeURIComponent(recentRun)}` : null,
      traceLabel: recentRun ? `Trace ${recentRun.slice(0, 8)}` : "Trace unavailable",
      traceHref: recentRun ? `/workers/${encodeURIComponent(id)}/sessions/${encodeURIComponent(recentRun)}` : null,
      assignmentState: state,
      usesSyntheticFields: true,
    };
  });

  const visibleRows = stateFilter === "all" ? rows : rows.filter((r) => r.assignmentState === stateFilter);

  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Projects</h2>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Project work context for {String((agent as { display_name: string }).display_name)} across module, project type,
          workflow, issue, run status, and trace linkage.
        </p>
        <p className="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-100">
          Some fields below are clearly marked as synthetic/demo context until backend wiring is completed.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {PROJECT_FILTERS.map((filter) => {
            const active = filter === stateFilter;
            const href =
              filter === "all"
                ? `/workers/${encodeURIComponent(id)}/projects`
                : `/workers/${encodeURIComponent(id)}/projects?state=${encodeURIComponent(filter)}`;
            return (
              <Link
                key={filter}
                href={href}
                className={`rounded-full border px-3 py-1 text-xs font-medium capitalize transition ${
                  active
                    ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
                    : "border-zinc-300 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-900"
                }`}
              >
                {filter}
              </Link>
            );
          })}
        </div>
        <div className="mt-4">
          {error ? (
            <p className="text-sm text-amber-800 dark:text-amber-200">Project list could not be loaded.</p>
          ) : !rows.length ? (
            <p className="text-sm text-zinc-500">No primary projects assigned.</p>
          ) : !visibleRows.length ? (
            <p className="text-sm text-zinc-500">No projects match this state filter.</p>
          ) : (
            <ul className="space-y-3">
              {visibleRows.map((row) => (
                <li key={row.id} className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Project</p>
                      <Link href={`/projects/${row.id}`} className="mt-1 block font-semibold text-zinc-900 hover:underline dark:text-zinc-100">
                        {row.projectTitle}
                      </Link>
                      <p className="mt-1 text-xs capitalize text-zinc-500 dark:text-zinc-400">Run status source: {row.projectStatus}</p>
                    </div>
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 capitalize ${stateBadgeStyles(row.assignmentState)}`}>
                      {row.assignmentState}
                    </span>
                  </div>

                  <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
                    <div>
                      <dt className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Module</dt>
                      <dd className="mt-1 font-medium text-zinc-900 dark:text-zinc-100">{row.moduleLabel}</dd>
                    </div>
                    <div>
                      <dt className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Project Type</dt>
                      <dd className="mt-1 font-medium text-zinc-900 dark:text-zinc-100">{row.projectTypeLabel}</dd>
                    </div>
                    <div>
                      <dt className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Workflow</dt>
                      <dd className="mt-1 font-mono text-xs text-zinc-700 dark:text-zinc-200">{row.workflowLabel}</dd>
                    </div>
                    <div>
                      <dt className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Issue</dt>
                      <dd className="mt-1 text-zinc-800 dark:text-zinc-200">{row.issueLabel}</dd>
                    </div>
                    <div>
                      <dt className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Recent Run</dt>
                      <dd className="mt-1">
                        {row.runHref ? (
                          <Link href={row.runHref} className="text-sky-700 underline dark:text-sky-400">
                            {row.runLabel}
                          </Link>
                        ) : (
                          <span className="text-zinc-500 dark:text-zinc-400">{row.runLabel}</span>
                        )}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Recent Trace</dt>
                      <dd className="mt-1">
                        {row.traceHref ? (
                          <Link href={row.traceHref} className="text-sky-700 underline dark:text-sky-400">
                            {row.traceLabel}
                          </Link>
                        ) : (
                          <span className="text-zinc-500 dark:text-zinc-400">{row.traceLabel}</span>
                        )}
                      </dd>
                    </div>
                  </dl>

                  {row.usesSyntheticFields ? (
                    <p className="mt-3 text-xs text-amber-800 dark:text-amber-200">
                      Synthetic context labels are shown for module/project-type/workflow/issue while live project-work tables are pending.
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
