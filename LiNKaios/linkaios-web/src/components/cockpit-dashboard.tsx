"use client";

import Link from "next/link";
import {
  Activity,
  CheckCircle2,
  ChevronRight,
  Clock,
  FolderKanban,
  Gauge,
  Layers,
  LayoutDashboard,
  Play,
  Shield,
  XCircle,
} from "lucide-react";

import { WorkEmptyState } from "@/app/(shell)/work/work-empty-state";
import { DomainStatusPill, StatusPill } from "@/components/ui/status-pill";
import { CockpitSummaryStatsGrid } from "@/components/summary-metric-card";
import type { CockpitDashboardData, ModuleStatus, LeaseStatus, RunOverview } from "@/lib/cockpit";
import { LICENSEE_HOME_PATH } from "@/lib/app-surface";
import { BUTTON } from "@/lib/ui-standards";

function healthTone(level: CockpitDashboardData["system_health"]): string {
  switch (level) {
    case "healthy":
      return "border-emerald-300 bg-emerald-50 text-emerald-950 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-50";
    case "degraded":
      return "border-amber-300 bg-amber-50 text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/35 dark:text-amber-50";
    case "unhealthy":
      return "border-red-300 bg-red-50 text-red-950 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-50";
    default:
      return "border-zinc-300 bg-zinc-50 text-zinc-950 dark:border-zinc-800 dark:bg-zinc-950/30 dark:text-zinc-50";
  }
}

function systemHealthMetricStatus(level: CockpitDashboardData["system_health"]): string {
  if (level === "healthy") return "ok";
  if (level === "unhealthy") return "failed";
  if (level === "degraded") return "degraded";
  return "ok";
}

function moduleHealthMetricStatus(health: ModuleStatus["health"]): string {
  if (health === "healthy") return "ok";
  if (health === "unhealthy") return "failed";
  return "degraded";
}

function leaseStatusForPill(raw: string): string {
  if (raw === "granted" || raw === "executed") return "active";
  if (raw === "denied") return "revoked";
  if (raw === "requires_approval") return "pending";
  return raw;
}

function runStatusForPill(raw: string): string {
  if (raw === "succeeded") return "success";
  return raw;
}

function ModuleStatusCard({ module }: { module: ModuleStatus }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex items-center gap-3">
        <Layers className="h-5 w-5 text-zinc-500 dark:text-zinc-400" />
        <div>
          <p className="font-medium text-zinc-900 dark:text-zinc-100">{module.module_name}</p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {module.plugin_kind} suite · {module.configured_capabilities.length} capabilities
            {module.missing_capabilities.length > 0 && (
              <span className="ml-1 text-amber-600 dark:text-amber-400">
                ({module.missing_capabilities.length} missing)
              </span>
            )}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <DomainStatusPill domain="metric" status={moduleHealthMetricStatus(module.health)} equalWidth />
        <DomainStatusPill domain="module" status={module.is_enabled ? "active" : "unavailable"} equalWidth />
      </div>
    </div>
  );
}

function LeaseStatusRow({ lease }: { lease: LeaseStatus }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex items-center gap-3">
        <Shield className="h-5 w-5 text-zinc-500 dark:text-zinc-400" />
        <div>
          <p className="font-medium text-zinc-900 dark:text-zinc-100">{lease.capability}</p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Run: {lease.run_id?.slice(0, 8) ?? "—"} • Stage: {lease.stage_id?.slice(0, 8) ?? "—"}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        {lease.kill_switch_state === "tripped" ? (
          <StatusPill label="Kill switch" tone="danger" />
        ) : null}
        <DomainStatusPill domain="lease" status={leaseStatusForPill(lease.status)} equalWidth />
        <span className="text-xs text-zinc-400 dark:text-zinc-500">
          {new Date(lease.requested_at).toLocaleTimeString()}
        </span>
      </div>
    </div>
  );
}

function RunStatusRow({ run }: { run: RunOverview }) {
  const statusIcon =
    run.status === "succeeded" ? (
      <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
    ) : run.status === "failed" ? (
      <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
    ) : run.status === "running" ? (
      <Play className="h-4 w-4 text-sky-600 dark:text-sky-400" />
    ) : (
      <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
    );

  return (
    <div className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex items-center gap-3">
        <div aria-hidden>{statusIcon}</div>
        <div>
          <p className="font-medium text-zinc-900 dark:text-zinc-100">
            {run.work_request_type}
            <span className="ml-2 text-xs text-zinc-500 dark:text-zinc-400">({run.plugin_id})</span>
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Run: {run.run_id.slice(0, 8)} • {run.completed_stages}/{run.total_stages} stages • {run.lease_count}{" "}
            leases
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <DomainStatusPill domain="run" status={runStatusForPill(run.status)} equalWidth />
        <span className="text-xs text-zinc-400 dark:text-zinc-500">
          {new Date(run.started_at).toLocaleTimeString()}
        </span>
        <Link href="/work" className="rounded-md p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800" aria-label="Open Work">
          <ChevronRight className="h-4 w-4 text-zinc-500" />
        </Link>
      </div>
    </div>
  );
}

export function CockpitDashboard({ data }: { data: CockpitDashboardData }) {
  return (
    <main className="space-y-8 pb-16">
      <section
        className={`sticky top-0 z-20 rounded-xl border p-4 shadow-sm backdrop-blur-sm ${healthTone(
          data.system_health,
        )}`}
        aria-label="System health"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex min-w-0 flex-1 items-start gap-3">
            <Gauge className="mt-0.5 h-5 w-5 shrink-0 opacity-90" aria-hidden />
            <div className="min-w-0">
              <p className="text-[10px] font-semibold opacity-80">Cross-plane health</p>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <DomainStatusPill domain="metric" status={systemHealthMetricStatus(data.system_health)} />
              </div>
              <p className="mt-1 text-sm opacity-90">
                {data.health_issues.length > 0
                  ? data.health_issues.join(" • ")
                  : "All systems operational. Drill into Overview, Suites, Projects, or Work for details."}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 gap-4 text-xs">
            <div className="text-right">
              <p className="opacity-80">Suites</p>
              <p className="font-semibold">
                {data.enabled_module_count}/{data.total_module_count}
              </p>
            </div>
            <div className="text-right">
              <p className="opacity-80">Active Leases</p>
              <p className="font-semibold">{data.active_lease_count}</p>
            </div>
            <div className="text-right">
              <p className="opacity-80">Running</p>
              <p className="font-semibold">{data.running_run_count}</p>
            </div>
            <div className="text-right">
              <p className="opacity-80">Online Workers</p>
              <p className="font-semibold">{data.online_worker_count}</p>
            </div>
          </div>
        </div>
      </section>

      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-zinc-200 pb-6 dark:border-zinc-800">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">Cross-plane summary</h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Snapshot across planes — open Overview, Suites, Projects, or Work for the canonical homes.
          </p>
        </div>
        <p className="text-xs text-zinc-400 dark:text-zinc-500">
          Generated: {new Date(data.generated_at).toLocaleString()}
        </p>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Link
          href={LICENSEE_HOME_PATH}
          className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm transition hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700"
        >
          <LayoutDashboard className="h-5 w-5 text-zinc-500 dark:text-zinc-400" aria-hidden />
          <div>
            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Overview</p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Attention queue &amp; system status</p>
          </div>
        </Link>
        <Link
          href="/suites/my-suites"
          className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm transition hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700"
        >
          <Layers className="h-5 w-5 text-zinc-500 dark:text-zinc-400" aria-hidden />
          <div>
            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Suites</p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Tenant packages &amp; health</p>
          </div>
        </Link>
        <Link
          href="/projects"
          className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm transition hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700"
        >
          <FolderKanban className="h-5 w-5 text-zinc-500 dark:text-zinc-400" aria-hidden />
          <div>
            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Projects</p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Active work &amp; delivery</p>
          </div>
        </Link>
        <Link
          href="/work"
          className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm transition hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700"
        >
          <Activity className="h-5 w-5 text-zinc-500 dark:text-zinc-400" aria-hidden />
          <div>
            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Work</p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Runs, alerts, sessions</p>
          </div>
        </Link>
      </section>

      <CockpitSummaryStatsGrid
        enabledModuleCount={data.enabled_module_count}
        totalModuleCount={data.total_module_count}
        activeLeaseCount={data.active_lease_count}
        trippedKillSwitchCount={data.tripped_kill_switch_count}
        runningRunCount={data.running_run_count}
        failedRunCount={data.failed_run_count}
        onlineWorkerCount={data.online_worker_count}
        workerSessionCount={data.worker_sessions.length}
        busyWorkerCount={data.busy_worker_count}
      />

      <div className="grid gap-8 lg:grid-cols-2">
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Recent Runs</h2>
            <Link href="/work" className="text-xs font-medium text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300">
              Open Work
            </Link>
          </div>
          <div className="space-y-2">
            {data.recent_runs.length === 0 ? (
              <WorkEmptyState
                icon={Activity}
                title="No recent runs"
                description="Runs from projects and automations will appear here once activity starts."
                actions={[{ kind: "link", label: "Open Work", href: "/work" }]}
              />
            ) : (
              data.recent_runs.slice(0, 5).map((run) => <RunStatusRow key={run.run_id} run={run} />)
            )}
          </div>
        </section>

        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Recent Leases</h2>
            <Link href="/skills/leases" className="text-xs font-medium text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300">
              Open leases
            </Link>
          </div>
          <div className="space-y-2">
            {data.recent_leases.length === 0 ? (
              <WorkEmptyState
                icon={Shield}
                title="No recent leases"
                description="Capability leases from LinkSkills will show here when projects request governed actions."
                actions={[{ kind: "link", label: "Open leases", href: "/skills/leases" }]}
              />
            ) : (
              data.recent_leases.slice(0, 5).map((lease) => <LeaseStatusRow key={lease.lease_id} lease={lease} />)
            )}
          </div>
        </section>
      </div>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Suite health</h2>
          <Link href="/suites/my-suites" className="text-xs font-medium text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300">
            Open suites
          </Link>
        </div>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {data.modules.length === 0 ? (
            <WorkEmptyState
              className="sm:col-span-2 lg:col-span-3"
              icon={Layers}
              title="No suites registered"
              description="Subscribe to a suite from the marketplace to see tenant package health here."
              actions={[
                { kind: "link", label: "Open My Suites", href: "/suites/my-suites" },
                { kind: "link", label: "Browse marketplace", href: "/suites/marketplace", variant: "secondary" },
              ]}
            />
          ) : (
            data.modules.map((module) => <ModuleStatusCard key={module.module_id} module={module} />)
          )}
        </div>
      </section>
    </main>
  );
}
