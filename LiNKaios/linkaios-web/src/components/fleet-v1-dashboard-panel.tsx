"use client";

import { useEffect, useState } from "react";
import { Bot, Cpu, MemoryStick } from "lucide-react";

import type { FleetDashboardSummary } from "@/lib/kernel/fleet/fleet-dashboard";
import { StatusPill } from "@/components/ui/status-pill";
import { formatUiLabel } from "@/lib/ui-standards";

function formatLastRun(iso: string | null): string {
  if (!iso) return "No run recorded";
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

/** Fleet v1 dashboard — OpenClaw profiles, AZ lanes, RAM note (Wave 6.5). */
export function FleetV1DashboardPanel() {
  const [summary, setSummary] = useState<FleetDashboardSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/kernel/fleet/summary")
      .then((res) => res.json())
      .then((json: { ok?: boolean; summary?: FleetDashboardSummary; error?: string }) => {
        if (cancelled) return;
        if (json.ok && json.summary) {
          setSummary(json.summary);
        } else {
          setError(json.error ?? "Failed to load fleet summary");
        }
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return (
      <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-50">
        Fleet summary unavailable: {error}
      </p>
    );
  }

  if (!summary) {
    return <p className="text-sm text-zinc-500">Loading fleet v1 summary…</p>;
  }

  return (
    <section className="space-y-6 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            {formatUiLabel("Fleet v1")}
          </h2>
          <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
            {summary.openclawProfiles.length} OpenClaw profiles on one gateway (cap {summary.gatewayCap}) ·{" "}
            {summary.agentZeroLanes.length} Agent Zero lanes
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <StatusPill label={summary.hostLabel} tone="neutral" />
          <StatusPill
            label={`${summary.ramNoteGb} GB RAM note`}
            tone={summary.ramNoteGb <= 16 ? "warning" : "success"}
          />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <h3 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
            <Bot className="h-3.5 w-3.5" aria-hidden />
            OpenClaw profiles
          </h3>
          <ul className="divide-y divide-zinc-100 rounded-lg border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
            {summary.openclawProfiles.map((row) => (
              <li key={row.agentId} className="px-3 py-2.5 text-sm">
                <p className="font-medium text-zinc-900 dark:text-zinc-100">{row.label}</p>
                <p className="mt-0.5 font-mono text-xs text-violet-700 dark:text-violet-300">{row.agentId}</p>
                <p className="mt-1 text-xs text-zinc-500">
                  {row.tenantKind} · {row.slotKind}
                  {row.suiteId ? ` · ${row.suiteId}` : ""} · Last run: {formatLastRun(row.lastRunAt)}
                </p>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
            <Cpu className="h-3.5 w-3.5" aria-hidden />
            Agent Zero lanes
          </h3>
          <ul className="divide-y divide-zinc-100 rounded-lg border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
            {summary.agentZeroLanes.map((row) => (
              <li key={row.laneId} className="px-3 py-2.5 text-sm">
                <p className="font-medium text-zinc-900 dark:text-zinc-100">{row.label}</p>
                <p className="mt-0.5 font-mono text-xs text-teal-700 dark:text-teal-300">{row.laneId}</p>
                <p className="mt-1 text-xs text-zinc-500">
                  Queue {row.queueName} · Last run: {formatLastRun(row.lastRunAt)}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
