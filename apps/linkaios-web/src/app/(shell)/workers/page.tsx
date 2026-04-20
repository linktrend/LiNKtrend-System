import Link from "next/link";
import { redirect } from "next/navigation";

import type { AgentRecord } from "@linktrend/shared-types";

import { FleetOrgChart } from "@/components/fleet-org-chart";
import { DEMO_SIDEBAR_AGENTS } from "@/lib/ui-mocks/entities";
import { isUiMocksEnabled } from "@/lib/ui-mocks/flags";
import { agentOperationalUxFromSessions } from "@/lib/agent-operational-ux";
import { buildFleetOrgChart } from "@/lib/fleet-org-chart-layout";
import { AddLinkbotOpenButton, AddLinkbotRoot } from "@/components/add-linkbot";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { BADGE, BUTTON } from "@/lib/ui-standards";
import {
  FleetPresenceFilterBar,
  WorkersFleetNav,
  parseFleetPresenceFilter,
  parseFleetView,
  type FleetPresenceFilter,
  type FleetView,
} from "@/components/workers-fleet-nav";

export const dynamic = "force-dynamic";

type FleetRow = AgentRecord & { role?: string; demo?: boolean; operationalUx?: "working" | "idle" | "offline" };

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

function statusStyles(status: string) {
  switch (status) {
    case "active":
      return "bg-emerald-50 text-emerald-800 ring-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-100 dark:ring-emerald-900/50";
    case "inactive":
      return "bg-zinc-100 text-zinc-700 ring-zinc-200 dark:bg-zinc-800 dark:text-zinc-200 dark:ring-zinc-600";
    case "retired":
      return "bg-amber-50 text-amber-900 ring-amber-200 dark:bg-amber-950/35 dark:text-amber-100 dark:ring-amber-900/40";
    default:
      return "bg-zinc-100 text-zinc-700 ring-zinc-200";
  }
}

function uxBadge(ux: FleetRow["operationalUx"]) {
  if (ux === "working") return "text-emerald-800 ring-emerald-200 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-100";
  if (ux === "idle") return "text-sky-900 ring-sky-200 bg-sky-50 dark:bg-sky-950/40 dark:text-sky-100";
  return "text-zinc-600 ring-zinc-200 bg-zinc-100 dark:bg-zinc-800 dark:text-zinc-200";
}

function uxLabel(ux: FleetRow["operationalUx"]) {
  if (ux === "working") return "Busy";
  if (ux === "idle") return "Idle";
  return "Standby";
}

function currentActivityLine(ux: FleetRow["operationalUx"]): string {
  if (ux === "working") return "Current activity: in an active session.";
  if (ux === "idle") return "Current activity: online and available.";
  return "Current activity: no recent session heartbeat.";
}

function StatCard(props: { label: string; value: number; tone?: "zinc" | "emerald" | "amber" | "sky" }) {
  const tone =
    props.tone === "emerald"
      ? "text-emerald-700 dark:text-emerald-400"
      : props.tone === "amber"
        ? "text-amber-800 dark:text-amber-300"
        : props.tone === "sky"
          ? "text-sky-800 dark:text-sky-300"
          : "text-zinc-900 dark:text-zinc-100";
  return (
    <div className="flex flex-1 flex-col rounded-xl border border-zinc-200 bg-white px-4 py-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{props.label}</p>
      <p className={`mt-2 text-2xl font-semibold tabular-nums ${tone}`}>{props.value}</p>
    </div>
  );
}

function passesFilter(row: FleetRow, filter: FleetPresenceFilter): boolean {
  if (filter === "all") return true;
  if (filter === "active") return row.status === "active";
  if (filter === "inactive") return row.status === "inactive" || row.status === "retired";
  if (filter === "online") return row.status === "active" && row.operationalUx !== "offline";
  if (filter === "busy") return row.operationalUx === "working";
  if (filter === "idle") return row.operationalUx === "idle";
  return true;
}

export default async function WorkersPage(props: { searchParams: Promise<{ view?: string; filter?: string }> }) {
  const sp = await props.searchParams;
  const rawView = Array.isArray(sp.view) ? sp.view[0] : sp.view;
  if (rawView === "runtime") {
    redirect("/settings/advanced");
  }
  const view: FleetView = parseFleetView(sp.view);
  const filter = parseFleetPresenceFilter(sp.filter);
  const uiMocksEnabled = isUiMocksEnabled();

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
      .select("id, display_name, status, created_at, updated_at")
      .order("updated_at", { ascending: false }),
  ]);

  const err = sessionsRes.error || agentsRes.error;

  const demoFleet: FleetRow[] = uiMocksEnabled
    ? DEMO_SIDEBAR_AGENTS.map((d, i) => ({
        id: d.id,
        display_name: d.display_name,
        status: "active",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        role: i === 0 ? "Chief Executive Officer" : "Chief Technology Officer",
        demo: true,
      }))
    : [];

  const apiAgents = (agentsRes.data ?? []) as FleetRow[];
  const fleetBase: FleetRow[] = uiMocksEnabled
    ? [...demoFleet, ...apiAgents.map((a) => ({ ...a, demo: false }))]
    : apiAgents.map((a) => ({ ...a, demo: false }));

  const sessionLites = (sessionsRes.data ?? []) as {
    agent_id: string;
    status: string;
    started_at: string;
    last_heartbeat: string | null;
  }[];

  const fleet: FleetRow[] = fleetBase.map((a) => ({
    ...a,
    operationalUx: agentOperationalUxFromSessions(String(a.id), sessionLites),
  }));

  const visible = fleet.filter((a) => passesFilter(a, filter));

  const online = fleet.filter((a) => a.status === "active" && a.operationalUx !== "offline").length;
  const busy = fleet.filter((a) => a.operationalUx === "working").length;
  const idle = fleet.filter((a) => a.operationalUx === "idle").length;

  const orgChart = buildFleetOrgChart(fleet);

  if (err) {
    return (
      <main>
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">LiNKbots</h1>
        <p className="mt-4 text-sm text-red-700 dark:text-red-400">{err.message}</p>
      </main>
    );
  }

  return (
    <main className="space-y-6">
      <AddLinkbotRoot />
      <header className="border-b border-zinc-200 pb-8 dark:border-zinc-800">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">LiNKbots</h1>
            <p className="mt-2 max-w-2xl text-sm text-zinc-600 dark:text-zinc-400">
              Directory of LiNKbots, their registry status, and live presence from recent sessions.
            </p>
          </div>
          <AddLinkbotOpenButton className={BUTTON.primaryRow} />
        </div>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <StatCard label="Total" value={fleet.length} />
          <StatCard label="Online" value={online} tone="emerald" />
          <StatCard label="Busy" value={busy} tone="sky" />
          <StatCard label="Idle" value={idle} tone="sky" />
          <StatCard label="Inactive" value={fleet.filter((a) => a.status !== "active").length} />
          <StatCard label="Visible" value={visible.length} tone="amber" />
        </div>
        <WorkersFleetNav current={view} />
        <FleetPresenceFilterBar current={filter} view={view} />
      </header>

      {fleet.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50/80 p-8 text-center dark:border-zinc-700 dark:bg-zinc-900/40">
          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">No LiNKbots yet</p>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Add a LiNKbot to see it listed here.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <AddLinkbotOpenButton className={BUTTON.primaryRow} />
            <Link href="/settings/gateway" className={BUTTON.secondaryRow}>
              Integration routing
            </Link>
          </div>
        </div>
      ) : null}

      {fleet.length > 0 && visible.length === 0 ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:border-amber-900/40 dark:bg-amber-950/25 dark:text-amber-100">
          No LiNKbots match this filter. Choose <span className="font-medium">All</span> to see the full fleet.
        </p>
      ) : null}

      {fleet.length > 0 && view === "list" ? (
        <section aria-labelledby="fleet-list-heading">
          <h2 id="fleet-list-heading" className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            List
          </h2>
          <ul className="mt-4 divide-y divide-zinc-200 rounded-xl border border-zinc-200 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-950">
            {visible.map((agent) => {
              const role = agent.role?.trim() || titleFromRuntime(undefined) || "—";
              const desc =
                descriptionFromRuntime(undefined) ||
                "Open this LiNKbot for sessions, skills, and configuration.";
              return (
                <li key={agent.id}>
                  <Link
                    href={`/workers/${agent.id}/sessions`}
                    className="flex flex-wrap items-center justify-between gap-3 px-4 py-4 text-sm transition hover:bg-zinc-50 dark:hover:bg-zinc-900/60"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-zinc-900 dark:text-zinc-100">{agent.display_name}</p>
                      <p className="mt-0.5 text-xs font-medium text-violet-800 dark:text-violet-300">Role · {role}</p>
                      <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">{desc}</p>
                      <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{currentActivityLine(agent.operationalUx)}</p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1.5">
                      <span className={`capitalize ${BADGE.status} ${statusStyles(agent.status)}`}>{agent.status}</span>
                      <span className={`${BADGE.status} ${uxBadge(agent.operationalUx)}`}>{uxLabel(agent.operationalUx)}</span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      {fleet.length > 0 && view === "grid" ? (
        <section aria-labelledby="fleet-grid-heading">
          <h2 id="fleet-grid-heading" className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Grid
          </h2>
          <ul className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {visible.map((agent) => {
              const role = agent.role?.trim() || titleFromRuntime(undefined) || "LiNKbot";
              const desc =
                descriptionFromRuntime(undefined) ||
                (agent.demo ? "Fixture profile for UX review." : "Open this LiNKbot for sessions, skills, and configuration.");
              return (
                <li key={agent.id}>
                  <Link
                    href={`/workers/${agent.id}/sessions`}
                    className="flex h-full flex-col rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:border-zinc-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-base font-semibold text-zinc-900 dark:text-zinc-100">{agent.display_name}</p>
                        <p className="mt-0.5 text-xs font-medium text-violet-700 dark:text-violet-300">Role · {role}</p>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-1">
                        <span className={`capitalize ${BADGE.status} ${statusStyles(agent.status)}`}>{agent.status}</span>
                        <span className={`${BADGE.status} ${uxBadge(agent.operationalUx)}`}>{uxLabel(agent.operationalUx)}</span>
                      </div>
                    </div>
                    <p className="mt-3 line-clamp-3 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">{desc}</p>
                    <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">{currentActivityLine(agent.operationalUx)}</p>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      {fleet.length > 0 && view === "org" ? (
        <section aria-labelledby="fleet-org-heading">
          <h2 id="fleet-org-heading" className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
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
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Unassigned Agents</p>
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
