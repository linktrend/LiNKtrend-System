"use client";

import { AlertTriangle, CheckCircle2, Shield, XCircle } from "lucide-react";

import {
  SummaryMetricStatusPill,
  WORK_STREAM_STATUS_PILL_LABELS,
  summaryMetricCountPreview,
} from "@/components/summary-metric-card/summary-metric-status-pill";
import { SummaryMetricCard } from "@/components/summary-metric-card/summary-metric-card";
import { SummaryMetricCardGrid } from "@/components/summary-metric-card/summary-metric-card-grid";
import { SUMMARY_METRIC_CARD } from "@/lib/ui-standards";
import type { WorkRowTone } from "@/lib/overview-dashboard";

export function LeaseSummaryStatsGrid(props: {
  total: number;
  granted: number;
  denied: number;
  tripped: number;
  className?: string;
}) {
  const cards: { key: string; title: string; icon: typeof Shield; metric: number; preview: string; tone: WorkRowTone }[] = [
    {
      key: "total",
      title: "Total (last 24h)",
      icon: Shield,
      metric: props.total,
      preview: props.total === 0 ? "No lease activity" : summaryMetricCountPreview(props.total, "lease decision"),
      tone: "ok",
    },
    {
      key: "granted",
      title: "Granted / executed",
      icon: CheckCircle2,
      metric: props.granted,
      preview: props.granted === 0 ? "None granted" : summaryMetricCountPreview(props.granted, "granted lease"),
      tone: "ok",
    },
    {
      key: "denied",
      title: "Denied",
      icon: XCircle,
      metric: props.denied,
      preview: props.denied === 0 ? "None denied" : summaryMetricCountPreview(props.denied, "denied lease"),
      tone: props.denied > 0 ? "attention" : "ok",
    },
    {
      key: "tripped",
      title: "Kill switches tripped",
      icon: AlertTriangle,
      metric: props.tripped,
      preview: props.tripped === 0 ? "All switches open" : summaryMetricCountPreview(props.tripped, "tripped switch"),
      tone: props.tripped > 0 ? "critical" : "ok",
    },
  ];

  return (
    <SummaryMetricCardGrid className={props.className} statusPillLabels={WORK_STREAM_STATUS_PILL_LABELS}>
      {cards.map((card) => (
        <SummaryMetricCard
          key={card.key}
          title={card.title}
          icon={card.icon}
          metric={card.metric}
          preview={card.preview}
          badge={<SummaryMetricStatusPill tone={card.tone} />}
          surfaceClassName={SUMMARY_METRIC_CARD.surfaceDefault}
        />
      ))}
    </SummaryMetricCardGrid>
  );
}
