"use client";

import Link from "next/link";

import { Activity, Bot, Layers, Shield } from "lucide-react";

import { SummaryMetricCard } from "@/components/summary-metric-card/summary-metric-card";
import { SummaryMetricCardGrid } from "@/components/summary-metric-card/summary-metric-card-grid";
import { BUTTON } from "@/lib/ui-standards";

export function CockpitSummaryStatsGrid(props: {
  enabledModuleCount: number;
  totalModuleCount: number;
  activeLeaseCount: number;
  trippedKillSwitchCount: number;
  runningRunCount: number;
  failedRunCount: number;
  onlineWorkerCount: number;
  workerSessionCount: number;
  busyWorkerCount: number;
  className?: string;
}) {
  return (
    <SummaryMetricCardGrid className={props.className ?? "gap-4"}>
      <SummaryMetricCard
        title="Suites"
        icon={Layers}
        metric={
          <>
            {props.enabledModuleCount}
            <span className="text-sm font-normal text-zinc-500">/{props.totalModuleCount}</span>
          </>
        }
        compactMetric
        footer={
          <Link href="/suites/my-suites" className={BUTTON.secondaryCardAction}>
            Open suites
          </Link>
        }
      />
      <SummaryMetricCard
        title="Active leases"
        icon={Shield}
        metric={props.activeLeaseCount}
        compactMetric
        preview={
          props.trippedKillSwitchCount > 0
            ? `${props.trippedKillSwitchCount} kill switch tripped`
            : undefined
        }
        footer={
          <Link href="/skills/leases" className={BUTTON.secondaryCardAction}>
            Open leases
          </Link>
        }
      />
      <SummaryMetricCard
        title="Running"
        icon={Activity}
        metric={props.runningRunCount}
        compactMetric
        preview={props.failedRunCount > 0 ? `${props.failedRunCount} failed (24h)` : undefined}
        footer={
          <Link href="/work" className={BUTTON.secondaryCardAction}>
            Open work
          </Link>
        }
      />
      <SummaryMetricCard
        title="Workers"
        icon={Bot}
        metric={
          <>
            {props.onlineWorkerCount}
            <span className="text-sm font-normal text-zinc-500">/{props.workerSessionCount}</span>
          </>
        }
        compactMetric
        preview={props.busyWorkerCount > 0 ? `${props.busyWorkerCount} busy` : undefined}
        footer={
          <Link href="/workers" className={BUTTON.secondaryCardAction}>
            Open LiNKbots
          </Link>
        }
      />
    </SummaryMetricCardGrid>
  );
}
