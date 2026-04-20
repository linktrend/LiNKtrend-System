import Link from "next/link";

import { listMissions } from "@linktrend/linklogic-sdk";
import type { MissionRecord } from "@linktrend/shared-types";

import { ProjectsIndexTable, type ProjectRowModal } from "@/components/projects-index-table";
import { ProjectsPlaneStrip } from "@/components/projects-plane-strip";
import { getPlaneBridgeConfig, planeWorkspaceProjectsHref } from "@/lib/plane-links";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { DEMO_SIDEBAR_MISSIONS } from "@/lib/ui-mocks/entities";
import { isUiMocksEnabled } from "@/lib/ui-mocks/flags";
import { DEMO_MISSION_PLANE_BRIDGE, demoMissionsFixtureRows } from "@/lib/ui-mocks/missions-fixtures";

export const dynamic = "force-dynamic";

const COLUMN_ORDER: {
  key: string;
  title: string;
  statuses: MissionRecord["status"][];
}[] = [
  { key: "draft", title: "Draft", statuses: ["draft"] },
  { key: "active", title: "Active", statuses: ["assigned", "running"] },
  { key: "completed", title: "Completed", statuses: ["completed"] },
  { key: "attention", title: "Attention", statuses: ["failed", "cancelled"] },
];

function leadLabel(id: string | null) {
  if (id === "demo-lisa") return "Lisa (CEO)";
  if (id === "demo-eric") return "Eric (CTO)";
  if (!id) return "—";
  return `LiNKbot …${id.slice(0, 8)}`;
}

function leadHref(id: string | null) {
  if (!id) return null;
  return `/workers/${id}/sessions`;
}

export default async function ProjectsListPage() {
  const supabase = await createSupabaseServerClient();
  const uiMocksEnabled = isUiMocksEnabled();
  const { data, error } = await listMissions(supabase, { limit: 200 });

  const planeCfg = getPlaneBridgeConfig();
  const planeProjectsHref = planeWorkspaceProjectsHref(planeCfg);

  if (error) {
    return (
      <main>
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">Projects</h1>
        <p className="mt-4 text-sm text-red-700 dark:text-red-400">{error.message}</p>
      </main>
    );
  }

  const api = (data ?? []) as MissionRecord[];
  const demoIds = new Set<string>(DEMO_SIDEBAR_MISSIONS.map((d) => d.id));
  const merged: MissionRecord[] = uiMocksEnabled
    ? [...demoMissionsFixtureRows(), ...api.filter((m) => !demoIds.has(String(m.id)))]
    : api;

  const byColumn = COLUMN_ORDER.map((col) => ({
    ...col,
    items: merged.filter((m) => col.statuses.includes(m.status)),
  }));

  return (
    <main className="space-y-10">
      <header className="border-b border-zinc-200 pb-8 dark:border-zinc-800">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">Projects</h1>
      </header>

      <ProjectsPlaneStrip workspaceProjectsHref={planeProjectsHref} />

      <section aria-label="Lifecycle summary">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">At a glance</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {byColumn.map((col) => (
            <div key={col.key} className="rounded-xl border border-zinc-200 bg-white px-4 py-3 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{col.title}</p>
              <p className="mt-1 text-2xl font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">{col.items.length}</p>
            </div>
          ))}
        </div>
      </section>

      <section aria-label="All projects">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">All projects</h2>
        {merged.length === 0 ? (
          <div className="mt-6 rounded-xl border border-dashed border-zinc-300 bg-zinc-50/80 p-8 text-center dark:border-zinc-700 dark:bg-zinc-900/40">
            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">No projects yet</p>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Once projects exist in LiNKaios they will appear here automatically.
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-3">
              <Link
                href="/workers"
                className="inline-flex rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                LiNKbots
              </Link>
              <Link
                href="/settings/traces"
                className="inline-flex rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-800"
              >
                System logs
              </Link>
            </div>
          </div>
        ) : (
          <ProjectsIndexTable
            planeWorkspaceHref={planeProjectsHref}
            rows={merged.map((m): ProjectRowModal => {
              const bridge = uiMocksEnabled ? DEMO_MISSION_PLANE_BRIDGE[String(m.id)] : undefined;
              const code = bridge?.code ?? `…${String(m.id).slice(0, 8)}`;
              const cycle = bridge?.activeCycle ?? "—";
              const open = bridge?.openWorkItems ?? 0;
              const blockers = bridge?.blockers ?? 0;
              const lh = leadHref(m.primary_agent_id);
              return {
                id: String(m.id),
                title: m.title,
                status: m.status,
                leadLabel: leadLabel(m.primary_agent_id),
                leadHref: lh,
                code,
                cycle,
                open,
                blockers,
                updated: m.updated_at?.slice(0, 10) ?? "—",
                hasBridge: Boolean(bridge),
              };
            })}
          />
        )}
      </section>
    </main>
  );
}
