"use client";

import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  Bot,
  CheckCircle2,
  ChevronRight,
  Clock,
  Gauge,
  Layers,
  Play,
  Shield,
  XCircle,
} from "lucide-react";

import type { CockpitDashboardData, ModuleStatus, LeaseStatus, RunOverview } from "@/lib/cockpit";
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

function healthLabel(level: CockpitDashboardData["system_health"]): string {
  switch (level) {
    case "healthy":
      return "Healthy";
    case "degraded":
      return "Degraded";
    case "unhealthy":
      return "Unhealthy";
    default:
      return "Unknown";
  }
}

function ModuleStatusCard({ module }: { module: ModuleStatus }) {
  const healthIcon =
    module.health === "healthy" ? (
      <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
    ) : module.health === "unhealthy" ? (
      <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
    ) : (
      <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
    );

  return (
    <div className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex items-center gap-3">
        <Layers className="h-5 w-5 text-zinc-500 dark:text-zinc-400" />
        <div>
          <p className="font-medium text-zinc-900 dark:text-zinc-100">{module.module_name}</p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {module.plugin_kind} • {module.configured_capabilities.length} capabilities
            {module.missing_capabilities.length > 0 && (
              <span className="ml-1 text-amber-600 dark:text-amber-400">
                ({module.missing_capabilities.length} missing)
              </span>
            )}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {healthIcon}
        <span
          className={`text-xs font-medium ${
            module.is_enabled
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-zinc-500 dark:text-zinc-400"
          }`}
        >
          {module.is_enabled ? "Enabled" : "Disabled"}
        </span>
      </div>
    </div>
  );
}

function LeaseStatusRow({ lease }: { lease: LeaseStatus }) {
  const statusColor =
    lease.status === "granted" || lease.status === "executed"
      ? "text-emerald-600 dark:text-emerald-400"
      : lease.status === "denied" || lease.status === "revoked"
        ? "text-red-600 dark:text-red-400"
        : lease.status === "requires_approval"
          ? "text-amber-600 dark:text-amber-400"
          : "text-zinc-600 dark:text-zinc-400";

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
        {lease.kill_switch_state === "tripped" && (
          <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700 dark:bg-red-950 dark:text-red-300">
            Kill Switch
          </span>
        )}
        <span className={`text-xs font-medium ${statusColor}`}>{lease.status}</span>
        <span className="text-xs text-zinc-400 dark:text-zinc-500">
          {new Date(lease.requested_at).toLocaleTimeString()}
        </span>
      </div>
    </div>
  );
}

function RunStatusRow({ run }: { run: RunOverview }) {
  const statusColor =
    run.status === "succeeded"
      ? "text-emerald-600 dark:text-emerald-400"
      : run.status === "failed"
        ? "text-red-600 dark:text-red-400"
        : run.status === "running"
          ? "text-sky-600 dark:text-sky-400"
          : "text-amber-600 dark:text-amber-400";

  const statusIcon =
    run.status === "succeeded" ? (
      <CheckCircle2 className="h-4 w-4" />
    ) : run.status === "failed" ? (
      <XCircle className="h-4 w-4" />
    ) : run.status === "running" ? (
      <Play className="h-4 w-4" />
    ) : (
      <Clock className="h-4 w-4" />
    );

  return (
    <div className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex items-center gap-3">
        <div className={`${statusColor}`}>{statusIcon}</div>
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
        <span className={`text-xs font-medium ${statusColor}`}>{run.status}</span>
        <span className="text-xs text-zinc-400 dark:text-zinc-500">
          {new Date(run.started_at).toLocaleTimeString()}
        </span>
        <Link
          href={`/cockpit/runs/${run.run_id}`}
          className="rounded-md p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800"
        >
          <ChevronRight className="h-4 w-4 text-zinc-500" />
        </Link>
      </div>
    </div>
  );
}

export function CockpitDashboard({ data }: { data: CockpitDashboardData }) {
  return (
    <main className="space-y-8 pb-16">
      {/* System health status bar */}
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
              <p className="text-[10px] font-semibold uppercase tracking-wide opacity-80">System Health</p>
              <p className="text-lg font-semibold leading-tight">{healthLabel(data.system_health)}</p>
              <p className="mt-1 text-sm opacity-90">
                {data.health_issues.length > 0
                  ? data.health_issues.join(" • ")
                  : "All systems operational. Cross-plane components healthy."}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 gap-4 text-xs">
            <div className="text-right">
              <p className="opacity-80">Modules</p>
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
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">Operational Cockpit</h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Cross-plane visibility: modules, leases, runs, workers, and traces
          </p>
        </div>
        <p className="text-xs text-zinc-400 dark:text-zinc-500">
          Generated: {new Date(data.generated_at).toLocaleString()}
        </p>
      </header>

      {/* Quick stats grid */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex items-center gap-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">
            <Layers className="h-4 w-4" />
            Modules
          </div>
          <p className="mt-2 text-2xl font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">
            {data.enabled_module_count}
            <span className="text-sm font-normal text-zinc-500">/{data.total_module_count}</span>
          </p>
          <Link href="/cockpit/modules" className={`${BUTTON.secondaryCardAction} mt-3`}>
            View modules
          </Link>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex items-center gap-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">
            <Shield className="h-4 w-4" />
            Active Leases
          </div>
          <p className="mt-2 text-2xl font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">
            {data.active_lease_count}
          </p>
          {data.tripped_kill_switch_count > 0 && (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400">
              {data.tripped_kill_switch_count} kill switch tripped
            </p>
          )}
          <Link href="/cockpit/leases" className={`${BUTTON.secondaryCardAction} mt-3`}>
            View leases
          </Link>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex items-center gap-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">
            <Activity className="h-4 w-4" />
            Running
          </div>
          <p className="mt-2 text-2xl font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">
            {data.running_run_count}
          </p>
          {data.failed_run_count > 0 && (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400">{data.failed_run_count} failed (24h)</p>
          )}
          <Link href="/cockpit/runs" className={`${BUTTON.secondaryCardAction} mt-3`}>
            View runs
          </Link>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex items-center gap-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">
            <Bot className="h-4 w-4" />
            Workers
          </div>
          <p className="mt-2 text-2xl font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">
            {data.online_worker_count}
            <span className="text-sm font-normal text-zinc-500">/{data.worker_sessions.length}</span>
          </p>
          {data.busy_worker_count > 0 && (
            <p className="mt-1 text-xs text-sky-600 dark:text-sky-400">{data.busy_worker_count} busy</p>
          )}
          <Link href="/workers" className={`${BUTTON.secondaryCardAction} mt-3`}>
            View workers
          </Link>
        </div>
      </section>

      {/* Recent activity sections */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Recent runs */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Recent Runs</h2>
            <Link href="/cockpit/runs" className="text-xs font-medium text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300">
              View all
            </Link>
          </div>
          <div className="space-y-2">
            {data.recent_runs.length === 0 ? (
              <p className="text-sm text-zinc-500 dark:text-zinc-400">No recent runs.</p>
            ) : (
              data.recent_runs.slice(0, 5).map((run) => <RunStatusRow key={run.run_id} run={run} />)
            )}
          </div>
        </section>

        {/* Recent leases */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Recent Leases</h2>
            <Link href="/cockpit/leases" className="text-xs font-medium text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300">
              View all
            </Link>
          </div>
          <div className="space-y-2">
            {data.recent_leases.length === 0 ? (
              <p className="text-sm text-zinc-500 dark:text-zinc-400">No recent leases.</p>
            ) : (
              data.recent_leases.slice(0, 5).map((lease) => <LeaseStatusRow key={lease.lease_id} lease={lease} />)
            )}
          </div>
        </section>
      </div>

      {/* Module health */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Module Health</h2>
          <Link href="/cockpit/modules" className="text-xs font-medium text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300">
            View all
          </Link>
        </div>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {data.modules.length === 0 ? (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">No modules registered.</p>
          ) : (
            data.modules.map((module) => <ModuleStatusCard key={module.module_id} module={module} />)
          )}
        </div>
      </section>
    </main>
  );
}
