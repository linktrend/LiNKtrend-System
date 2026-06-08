import Link from "next/link";
import { redirect } from "next/navigation";
import { Bot } from "lucide-react";

import type { AgentRecord } from "@linktrend/shared-types";

import { FleetOrgChart } from "@/components/fleet-org-chart";
import { FleetSummaryStatsGrid } from "@/components/summary-metric-card";
import { demoFleetProfile } from "@/lib/demo-fleet-profiles";
import { DEMO_SIDEBAR_AGENTS } from "@/lib/ui-mocks/entities";
import { isUiMocksEnabled } from "@/lib/ui-mocks/flags";
import { agentOperationalUxFromSessions } from "@/lib/agent-operational-ux";
import { buildFleetOrgChart } from "@/lib/fleet-org-chart-layout";
import {
  formatFleetHeartbeat,
  linkbotFleetStatusLabel,
  linkbotFleetStatusTone,
  type LinkbotFleetStatusLabel,
} from "@/lib/linkbot-fleet-status";
import { AddLinkbotHeaderAction } from "@/components/role-gated-ui";
import { AddLinkbotRoot } from "@/components/add-linkbot";
import { WorkersPageHeader } from "@/components/workers-page-header";
import { readAppSurfaceFromHeaders, withAppBasePath } from "@/lib/app-surface";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { BADGE, BUTTON } from "@/lib/ui-standards";
import { parseRuntimeSettings } from "@/lib/agent-runtime-settings";
import {
  FleetPresenceFilterBar,
  WorkersFleetNav,
  parseFleetPresenceFilter,
  parseFleetView,
  type FleetPresenceFilter,
  type FleetView,
} from "@/components/workers-fleet-nav";

export const dynamic = "force-dynamic";

type FleetRow = AgentRecord & {
  role?: string;
  demo?: boolean;
  operationalUx?: "working" | "idle" | "offline";
  statusLabel: LinkbotFleetStatusLabel;
  projectLine: string;
  lastHeartbeatIso: string | null;
  description: string;
};

function titleFromRuntime(raw: unknown): string | null {
  if (!raw || typeof raw !== "object") return null;
  const lp = (raw as Record<string, unknown>).linkaios_profile;
  if (!lp || typeof lp !== "object") return null;
  const t = (lp as Record<string, unknown>).title;
  return typeof t === "string" && t.trim() ? t.trim() : null;
}

function descriptionFromRuntime(raw: unknown): string | null {
  if (!raw || typeof raw !== "object") return null;
  const lp = (raw as Record<string, unknown>).linkaios_profile;
  if (!lp || typeof lp !== "object") return null;
  const d = (lp as Record<string, unknown>).description;
  return typeof d === "string" && d.trim() ? d.trim() : null;
}

function passesFilter(row: FleetRow, filter: FleetPresenceFilter): boolean {
  if (filter === "all") return true;
  if (filter === "active") return row.status === "active";
  if (filter === "inactive") return row.status === "inactive" || row.status === "retired";
  if (filter === "online")
    return row.status === "active" && (row.statusLabel === "Online" || row.statusLabel === "Busy" || row.statusLabel === "Idle");
  if (filter === "busy") return row.statusLabel === "Busy";
  if (filter === "idle") return row.statusLabel === "Idle";
  return true;
}

function demoFleetRow(agent: AgentRecord, index: number): FleetRow {
  const profile = demoFleetProfile(String(agent.id));
  return {
    ...agent,
    role: profile?.role ?? (index === 0 ? "Chief Executive Officer" : "Chief Technology Officer"),
    demo: true,
    operationalUx: profile?.statusLabel === "Busy" ? "working" : profile?.statusLabel === "Idle" ? "idle" : "offline",
    statusLabel: profile?.statusLabel ?? "Online",
    projectLine: profile?.projectTitles.length ? profile.projectTitles.join(" · ") : "No active projects",
    lastHeartbeatIso: profile?.lastHeartbeatIso ?? null,
    description: profile?.description ?? "Fixture profile for UX review.",
  };
}

export default async function WorkersPage(props: { searchParams: Promise<{ view?: string; filter?: string }> }) {
  const sp = await props.searchParams;
  const rawView = Array.isArray(sp.view) ? sp.view[0] : sp.view;
  if (rawView === "runtime") {
    redirect("/settings/platform");
  }
  const view: FleetView = parseFleetView(sp.view);
  const filter = parseFleetPresenceFilter(sp.filter);
  const uiMocksEnabled = isUiMocksEnabled();
  const surface = await readAppSurfaceFromHeaders();
  const isAdminSurface = surface === "admin";

  const supabase = await createSupabaseServerClient();

  const [sessionsRes, agentsRes] = await Promise.all([
    supabase
      .schema("bot_runtime")
      .from("worker_sessions")
      .select("agent_id, status, started_at, last_heartbeat")
      .order("started_at", { ascending: false })
      .limit(200),
    supabase
      .schema("linkaios")
      .from("agents")
      .select("id, display_name, status, created_at, updated_at, runtime_settings")
      .order("updated_at", { ascending: false }),
  ]);

  const err = sessionsRes.error || agentsRes.error;

  const demoFleet: FleetRow[] = uiMocksEnabled ? DEMO_SIDEBAR_AGENTS.map((d, i) => demoFleetRow(d, i)) : [];

  const apiAgents = (agentsRes.data ?? []) as (AgentRecord & { runtime_settings?: unknown })[];
  const fleetBase: FleetRow[] = uiMocksEnabled
    ? demoFleet
    : apiAgents.map((a) => {
        const sessionLites = (sessionsRes.data ?? []) as {
          agent_id: string;
          status: string;
          started_at: string;
          last_heartbeat: string | null;
        }[];
        const operationalUx = agentOperationalUxFromSessions(String(a.id), sessionLites);
        const statusLabel = linkbotFleetStatusLabel(a.status, operationalUx);
        const parsed = parseRuntimeSettings(a.runtime_settings ?? {});
        const role = parsed.linkaiosProfile.title?.trim() || titleFromRuntime(a.runtime_settings) || "LiNKbot";
        const description =
          parsed.linkaiosProfile.description?.trim() ||
          descriptionFromRuntime(a.runtime_settings) ||
          "Open this LiNKbot for sessions, skills, and configuration.";
        const latest = sessionLites
          .filter((s) => String(s.agent_id) === String(a.id))
          .sort((x, y) => new Date(y.started_at).getTime() - new Date(x.started_at).getTime())[0];
        return {
          ...a,
          demo: false,
          role,
          operationalUx,
          statusLabel,
          projectLine: isAdminSurface
            ? "Open Sessions for troubleshooting."
            : "Projects load on the LiNKbot detail tab.",
          lastHeartbeatIso: latest?.last_heartbeat ?? null,
          description,
        };
      });

  const fleet = fleetBase;

  const visible = fleet.filter((a) => passesFilter(a, filter));

  const online = fleet.filter((a) => a.statusLabel === "Online" || a.statusLabel === "Busy" || a.statusLabel === "Idle").length;
  const busy = fleet.filter((a) => a.statusLabel === "Busy").length;
  const idle = fleet.filter((a) => a.statusLabel === "Idle").length;

  const orgChart = buildFleetOrgChart(fleet);

  if (err && !uiMocksEnabled) {
    return (
      <main className="space-y-6">
        <WorkersPageHeader />
        <p className="text-sm text-red-700 dark:text-red-400">{err.message}</p>
      </main>
    );
  }

  return (
    <main className="space-y-6">
      {!isAdminSurface ? <AddLinkbotRoot /> : null}
      <WorkersPageHeader />
      <FleetSummaryStatsGrid
        total={fleet.length}
        online={online}
        busy={busy}
        idle={idle}
        inactive={fleet.filter((a) => a.statusLabel === "Inactive").length}
      />
      <WorkersFleetNav current={view} />
      <FleetPresenceFilterBar current={filter} view={view} />

      {fleet.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50/80 p-8 text-center dark:border-zinc-700 dark:bg-zinc-900/40">
          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">No LiNKbots yet</p>
          {isAdminSurface ? (
            <>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                LiNKbots appear here when provisioned through suite composition for a licensee workspace.
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                <Link href={withAppBasePath("/suites", surface)} className={BUTTON.addRow}>
                  Open Suites
                </Link>
                <Link href={withAppBasePath("/settings/platform", surface)} className={BUTTON.secondaryRow}>
                  Integration routing
                </Link>
              </div>
            </>
          ) : (
            <>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">Add a LiNKbot to see it listed here.</p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                <AddLinkbotHeaderAction className={BUTTON.addRow} />
                <Link href="/settings/platform" className={BUTTON.secondaryRow}>
                  Integration routing
                </Link>
              </div>
            </>
          )}
        </div>
      ) : null}

      {fleet.length > 0 && visible.length === 0 ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:border-amber-900/40 dark:bg-amber-950/25 dark:text-amber-100">
          No LiNKbots match this filter. Choose <span className="font-medium">All</span> to see the full fleet.
        </p>
      ) : null}

      {fleet.length > 0 && view === "list" ? (
        <section aria-labelledby="fleet-list-heading">
          <h2 id="fleet-list-heading" className="sr-only">
            LiNKbot list
          </h2>
          <ul className="divide-y divide-zinc-200 rounded-xl border border-zinc-200 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-950">
            {visible.map((agent) => (
              <li key={agent.id}>
                <Link
                  href={`/workers/${agent.id}/sessions`}
                  className="flex flex-wrap items-center justify-between gap-3 px-4 py-4 text-sm transition hover:bg-zinc-50 dark:hover:bg-zinc-900/60"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-zinc-900 dark:text-zinc-100">{agent.display_name}</p>
                    <p className="mt-0.5 text-xs font-medium text-violet-800 dark:text-violet-300">Role · {agent.role}</p>
                    <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
                      {isAdminSurface ? "Monitor ·" : "Projects ·"} {agent.projectLine}
                    </p>
                    {agent.lastHeartbeatIso ? (
                      <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                        Last heartbeat · {formatFleetHeartbeat(agent.lastHeartbeatIso)}
                      </p>
                    ) : null}
                  </div>
                  <span className={`shrink-0 font-semibold ${BADGE.status} ${linkbotFleetStatusTone(agent.statusLabel)}`}>
                    {agent.statusLabel}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {fleet.length > 0 && view === "grid" ? (
        <section aria-labelledby="fleet-grid-heading">
          <h2 id="fleet-grid-heading" className="sr-only">
            LiNKbot grid
          </h2>
          <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {visible.map((agent) => (
              <li key={agent.id}>
                <Link
                  href={`/workers/${agent.id}/sessions`}
                  className="flex h-full flex-col rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:border-zinc-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-start gap-3">
                      <Bot className="mt-0.5 h-5 w-5 shrink-0 text-zinc-700 dark:text-zinc-300" aria-hidden />
                      <div className="min-w-0">
                        <p className="truncate text-base font-semibold text-zinc-900 dark:text-zinc-100">{agent.display_name}</p>
                        <p className="mt-0.5 text-xs font-medium text-violet-700 dark:text-violet-300">Role · {agent.role}</p>
                      </div>
                    </div>
                    <span className={`shrink-0 font-semibold ${BADGE.status} ${linkbotFleetStatusTone(agent.statusLabel)}`}>
                      {agent.statusLabel}
                    </span>
                  </div>
                  <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
                    {isAdminSurface ? "Monitor ·" : "Projects ·"} {agent.projectLine}
                  </p>
                  {agent.lastHeartbeatIso ? (
                    <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                      Last heartbeat · {formatFleetHeartbeat(agent.lastHeartbeatIso)}
                    </p>
                  ) : null}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {fleet.length > 0 && view === "org" ? (
        <section aria-labelledby="fleet-org-heading">
          <h2 id="fleet-org-heading" className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">
            Org
          </h2>
          <p className="mt-1 max-w-2xl text-xs text-zinc-500 dark:text-zinc-400">
            Illustrative hierarchy: <span className="font-medium text-violet-800 dark:text-violet-300">Role</span> (executive
            titles), <span className="font-medium text-sky-800 dark:text-sky-300">Team</span> (pools),{" "}
            <span className="font-medium text-teal-800 dark:text-teal-300">Agent</span> (LiNKbots).
          </p>
          <div className="mt-4">
            <FleetOrgChart nodes={orgChart.nodes} edges={orgChart.edges} />
          </div>
          {orgChart.extraAgents.length > 0 ? (
            <div className="mt-6 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
              <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Unassigned Agents</p>
              <ul className="mt-2 flex flex-wrap gap-2">
                {orgChart.extraAgents.map((a) => (
                  <li key={a.id}>
                    <Link
                      href={`/workers/${a.id}/sessions`}
                      className="inline-flex rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs font-medium text-zinc-800 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
                    >
                      {a.display_name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </section>
      ) : null}
    </main>
  );
}
