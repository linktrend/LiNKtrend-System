"use client";

import { BarChart3, TrendingDown, TrendingUp } from "lucide-react";

import { SummaryMetricCard } from "@/components/summary-metric-card/summary-metric-card";
import { SummaryMetricCardGrid } from "@/components/summary-metric-card/summary-metric-card-grid";
import type { KpiCard, KpiTone } from "@/lib/metrics-kpi-views";

function kpiSurfaceTone(tone: KpiTone): string {
  if (tone === "bad") return "border border-red-200 bg-red-50/80 dark:border-red-900/50 dark:bg-red-950/25";
  if (tone === "warn") return "border border-amber-200 bg-amber-50/80 dark:border-amber-900/50 dark:bg-amber-950/25";
  return "border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950";
}

function KpiTrendBadge(props: { pct: number }) {
  const up = props.pct >= 0;
  const Icon = up ? TrendingUp : TrendingDown;
  const tone = up
    ? "text-emerald-700 dark:text-emerald-400"
    : "text-red-700 dark:text-red-400";
  const sign = props.pct > 0 ? "+" : "";
  return (
    <span
      className={`inline-flex items-center gap-0.5 rounded-md border border-zinc-200/80 bg-white/90 px-1.5 py-0.5 text-[10px] font-semibold tabular-nums dark:border-zinc-700 dark:bg-zinc-900/90 ${tone}`}
      title={`Trend ${sign}${props.pct.toFixed(1)}%`}
    >
      <Icon className="h-3 w-3 shrink-0" aria-hidden />
      {sign}
      {props.pct.toFixed(1)}%
    </span>
  );
}

export function MetricsKpiSummaryGrid(props: { cards: KpiCard[]; className?: string }) {
  return (
    <SummaryMetricCardGrid className={props.className ?? "gap-2 sm:grid-cols-2 lg:grid-cols-4"}>
      {props.cards.map((card) => (
        <SummaryMetricCard
          key={card.slot}
          title={card.label}
          titleFormat="sentence"
          icon={BarChart3}
          metric={card.value}
          compactMetric
          preview={card.context}
          badge={card.trend ? <KpiTrendBadge pct={card.trend.pct} /> : undefined}
          surfaceClassName={kpiSurfaceTone(card.tone)}
        />
      ))}
    </SummaryMetricCardGrid>
  );
}
