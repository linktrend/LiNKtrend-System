"use client";

import { AlertTriangle, HeartPulse } from "lucide-react";

import { SummaryMetricCard } from "@/components/summary-metric-card/summary-metric-card";
import { SummaryMetricCardGrid } from "@/components/summary-metric-card/summary-metric-card-grid";

export function LinkguardSummaryStatsGrid(props: {
  lastHeartbeatAge: string;
  lastHeartbeatAt: string | null;
  fsFailures24h: number;
  heartbeatError?: boolean;
  failuresError?: boolean;
  className?: string;
}) {
  return (
    <SummaryMetricCardGrid className={props.className ?? "gap-4 sm:grid-cols-2"}>
      <SummaryMetricCard
        title="Last heartbeat"
        icon={HeartPulse}
        metric={props.lastHeartbeatAge}
        compactMetric
        preview={props.lastHeartbeatAt ?? undefined}
        footer={
          props.heartbeatError ? (
            <p className="text-sm text-amber-700 dark:text-amber-400">Heartbeat feed is temporarily unavailable.</p>
          ) : undefined
        }
      />
      <SummaryMetricCard
        title="FS cleanup failures (24h)"
        icon={AlertTriangle}
        metric={props.fsFailures24h}
        compactMetric
        preview="Filesystem cleanup issues (24h)"
        footer={
          props.failuresError ? (
            <p className="text-sm text-amber-700 dark:text-amber-400">Cleanup metrics are temporarily unavailable.</p>
          ) : undefined
        }
      />
    </SummaryMetricCardGrid>
  );
}

/** @deprecated Use LinkguardSummaryStatsGrid */
export const PrismSummaryStatsGrid = LinkguardSummaryStatsGrid;
