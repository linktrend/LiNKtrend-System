"use client";

import { BarChart3, TrendingDown, TrendingUp, Minus } from "lucide-react";

import { SummaryMetricCard } from "@/components/summary-metric-card/summary-metric-card";
import type { TraceMetric } from "@/lib/plugins/linkapps/types/trace";

export type TraceMetricCardProps = {
  /** Metric data to display */
  metric: TraceMetric;
  /** Compact mode for sidebar */
  compact?: boolean;
};

function formatValue(value: number, unit?: string): string {
  if (unit === "ms") {
    return value >= 1000 ? `${(value / 1000).toFixed(1)}s` : `${Math.round(value)}ms`;
  }
  if (unit === "%") {
    return `${value.toFixed(1)}%`;
  }
  return value.toLocaleString();
}

function trendIcon(trend: TraceMetric["trend"]) {
  switch (trend) {
    case "up":
      return <TrendingUp className="h-3 w-3" aria-hidden />;
    case "down":
      return <TrendingDown className="h-3 w-3" aria-hidden />;
    case "flat":
      return <Minus className="h-3 w-3" aria-hidden />;
  }
}

function trendColorClass(trend: TraceMetric["trend"], upIsGood: boolean): string {
  const isGood = (trend === "up" && upIsGood) || (trend === "down" && !upIsGood);
  if (isGood) {
    return "text-emerald-600 dark:text-emerald-400";
  }
  if (trend === "flat") {
    return "text-zinc-500 dark:text-zinc-400";
  }
  return "text-red-600 dark:text-red-400";
}

export function TraceMetricCard(props: TraceMetricCardProps) {
  const { metric, compact = false } = props;

  if (compact) {
    return (
      <div
        className="rounded-md border border-zinc-200 bg-white p-2 dark:border-zinc-800 dark:bg-zinc-950"
        role="region"
        aria-label={metric.label}
      >
        <p className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400">{metric.label}</p>
        <div className="mt-1 flex items-baseline justify-between">
          <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            {formatValue(metric.value, metric.unit)}
          </span>
          <span className={`flex items-center gap-0.5 text-[10px] ${trendColorClass(metric.trend, metric.upIsGood)}`}>
            {trendIcon(metric.trend)}
          </span>
        </div>
      </div>
    );
  }

  const trendPreview =
    metric.previousValue !== undefined ? (
      <span className={`flex items-center gap-1 ${trendColorClass(metric.trend, metric.upIsGood)}`}>
        {trendIcon(metric.trend)}
        <span className="text-zinc-400 dark:text-zinc-500">from {formatValue(metric.previousValue, metric.unit)}</span>
      </span>
    ) : undefined;

  return (
    <SummaryMetricCard
      title={metric.label}
      icon={BarChart3}
      metric={formatValue(metric.value, metric.unit)}
      compactMetric
      preview={trendPreview}
    />
  );
}
