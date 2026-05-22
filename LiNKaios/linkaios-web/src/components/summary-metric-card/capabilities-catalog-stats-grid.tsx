"use client";

import { Archive, CheckCircle2, FileStack, Layers, type LucideIcon } from "lucide-react";

import {
  SummaryMetricStatusPill,
  WORK_STREAM_STATUS_PILL_LABELS,
  summaryMetricCountPreview,
} from "@/components/summary-metric-card/summary-metric-status-pill";
import { SummaryMetricCard } from "@/components/summary-metric-card/summary-metric-card";
import { SummaryMetricCardGrid } from "@/components/summary-metric-card/summary-metric-card-grid";
import { SUMMARY_METRIC_CARD } from "@/lib/ui-standards";
import type { WorkRowTone } from "@/lib/overview-dashboard";

function catalogTone(key: string, count: number): WorkRowTone {
  if (key === "draft" && count > 0) return "attention";
  if (key === "sunset" && count > 0) return "attention";
  return "ok";
}

export function CapabilitiesCatalogStatsGrid(props: {
  total: number;
  approved: number;
  draft: number;
  sunset: number;
  sunsetLabel: string;
  className?: string;
}) {
  const cards: { key: string; title: string; icon: LucideIcon; metric: number; preview: string; tone: WorkRowTone }[] = [
    {
      key: "total",
      title: "Total in catalogue",
      icon: Layers,
      metric: props.total,
      preview: props.total === 0 ? "Catalogue empty" : summaryMetricCountPreview(props.total, "item"),
      tone: "ok",
    },
    {
      key: "approved",
      title: "Approved",
      icon: CheckCircle2,
      metric: props.approved,
      preview: props.approved === 0 ? "None approved" : summaryMetricCountPreview(props.approved, "approved item"),
      tone: "ok",
    },
    {
      key: "draft",
      title: "Draft",
      icon: FileStack,
      metric: props.draft,
      preview: props.draft === 0 ? "No drafts" : summaryMetricCountPreview(props.draft, "draft item"),
      tone: catalogTone("draft", props.draft),
    },
    {
      key: "sunset",
      title: props.sunsetLabel,
      icon: Archive,
      metric: props.sunset,
      preview: props.sunset === 0 ? `No ${props.sunsetLabel.toLowerCase()} items` : summaryMetricCountPreview(props.sunset, props.sunsetLabel.toLowerCase()),
      tone: catalogTone("sunset", props.sunset),
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
