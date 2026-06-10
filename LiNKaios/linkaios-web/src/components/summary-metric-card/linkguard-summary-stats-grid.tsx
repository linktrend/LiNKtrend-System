"use client";

import { AlertTriangle, CheckCircle2, HeartPulse } from "lucide-react";

import { SummaryMetricCard } from "@/components/summary-metric-card/summary-metric-card";
import { SummaryMetricCardGrid } from "@/components/summary-metric-card/summary-metric-card-grid";
import { StatusPill } from "@/components/ui/status-pill";

export function LinkguardSummaryStatsGrid(props: {
  lastHeartbeatAge: string;
  lastHeartbeatAt: string | null;
  fsFailures24h: number;
  latestSuccessAge: string;
  latestSuccessAt: string | null;
  heartbeatError?: boolean;
  failuresError?: boolean;
  successError?: boolean;
  className?: string;
}) {
  const failures = props.fsFailures24h;
  const hasFailures = failures > 0 && !props.failuresError;
  const systemClean = !hasFailures && !props.failuresError;

  return (
    <SummaryMetricCardGrid className={props.className ?? "gap-4 sm:grid-cols-2 lg:grid-cols-3"}>
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
        title="Cleanup failures (24h)"
        icon={AlertTriangle}
        metric={props.failuresError ? "—" : failures}
        compactMetric
        metricToneClass={hasFailures ? "text-red-600 dark:text-red-400" : undefined}
        badge={
          hasFailures ? <StatusPill label="Failures" tone="danger" /> : failures === 0 ? <StatusPill label="None" tone="success" /> : undefined
        }
        preview="Filesystem cleanup errors in the last 24 hours"
        footer={
          props.failuresError ? (
            <p className="text-sm text-amber-700 dark:text-amber-400">Cleanup metrics are temporarily unavailable.</p>
          ) : undefined
        }
      />
      <SummaryMetricCard
        title="Latest cleanup success"
        icon={CheckCircle2}
        metric={props.latestSuccessAge}
        compactMetric
        metricToneClass={systemClean ? "text-emerald-700 dark:text-emerald-300" : undefined}
        badge={<StatusPill label={systemClean ? "Clean now" : "Check failures"} tone={systemClean ? "success" : "warning"} />}
        preview={props.latestSuccessAt ?? "No successful cleanup recorded yet"}
        footer={
          props.successError ? (
            <p className="text-sm text-amber-700 dark:text-amber-400">Success history is temporarily unavailable.</p>
          ) : undefined
        }
      />
    </SummaryMetricCardGrid>
  );
}

/** @deprecated Use LinkguardSummaryStatsGrid */
export const PrismSummaryStatsGrid = LinkguardSummaryStatsGrid;
