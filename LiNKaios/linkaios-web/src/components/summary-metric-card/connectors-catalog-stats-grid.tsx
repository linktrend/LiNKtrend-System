"use client";

import { CheckCircle2, Clock, FileStack, Layers, type LucideIcon } from "lucide-react";

import {
  SummaryMetricStatusPill,
  WORK_STREAM_STATUS_PILL_LABELS,
  summaryMetricCountPreview,
} from "@/components/summary-metric-card/summary-metric-status-pill";
import { SummaryMetricCard } from "@/components/summary-metric-card/summary-metric-card";
import { SummaryMetricCardGrid } from "@/components/summary-metric-card/summary-metric-card-grid";
import { SUMMARY_METRIC_CARD } from "@/lib/ui-standards";
import type { WorkRowTone } from "@/lib/overview-dashboard";

function connectorTone(key: string, count: number): WorkRowTone {
  if (key === "declared" && count > 0) return "attention";
  if (key === "pending" && count > 0) return "attention";
  return "ok";
}

export function ConnectorsCatalogStatsGrid(props: {
  total: number;
  implemented: number;
  declared: number;
  pending: number;
  className?: string;
}) {
  const cards: { key: string; title: string; icon: LucideIcon; metric: number; preview: string; tone: WorkRowTone }[] = [
    {
      key: "total",
      title: "Total in catalogue",
      icon: Layers,
      metric: props.total,
      preview: props.total === 0 ? "Catalogue empty" : summaryMetricCountPreview(props.total, "capability"),
      tone: "ok",
    },
    {
      key: "implemented",
      title: "Implemented",
      icon: CheckCircle2,
      metric: props.implemented,
      preview:
        props.implemented === 0 ? "None implemented" : summaryMetricCountPreview(props.implemented, "implemented capability"),
      tone: "ok",
    },
    {
      key: "declared",
      title: "Declared",
      icon: FileStack,
      metric: props.declared,
      preview: props.declared === 0 ? "No declared capabilities" : summaryMetricCountPreview(props.declared, "declared capability"),
      tone: connectorTone("declared", props.declared),
    },
    {
      key: "pending",
      title: "Pending",
      icon: Clock,
      metric: props.pending,
      preview: props.pending === 0 ? "No pending capabilities" : summaryMetricCountPreview(props.pending, "pending capability"),
      tone: connectorTone("pending", props.pending),
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
