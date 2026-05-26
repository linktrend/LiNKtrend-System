"use client";

import { AlertTriangle, CheckCircle2, FileStack, Play, type LucideIcon } from "lucide-react";

import {
  SummaryMetricStatusPill,
  WORK_STREAM_STATUS_PILL_LABELS,
  summaryMetricCountPreview,
} from "@/components/summary-metric-card/summary-metric-status-pill";
import { SummaryMetricCard } from "@/components/summary-metric-card/summary-metric-card";
import { SummaryMetricCardGrid } from "@/components/summary-metric-card/summary-metric-card-grid";
import { SUMMARY_METRIC_CARD } from "@/lib/ui-standards";
import type { ProjectSummaryColumnKey } from "@/lib/project-status-ui";

const COLUMNS: {
  key: ProjectSummaryColumnKey;
  title: string;
  icon: LucideIcon;
  toneWhenPositive: "attention" | "critical";
  previewSingular: string;
}[] = [
  { key: "draft", title: "Draft", icon: FileStack, toneWhenPositive: "attention", previewSingular: "draft project" },
  { key: "active", title: "Active", icon: Play, toneWhenPositive: "attention", previewSingular: "active project" },
  { key: "completed", title: "Completed", icon: CheckCircle2, toneWhenPositive: "attention", previewSingular: "completed project" },
  { key: "attention", title: "Attention", icon: AlertTriangle, toneWhenPositive: "critical", previewSingular: "project needing attention" },
];

function toneForColumn(key: ProjectSummaryColumnKey, count: number): "ok" | "attention" | "critical" {
  const col = COLUMNS.find((c) => c.key === key)!;
  if (count === 0) return "ok";
  return col.toneWhenPositive;
}

export function ProjectLifecycleSummaryGrid(props: {
  counts: Record<ProjectSummaryColumnKey, number>;
  className?: string;
}) {
  return (
    <SummaryMetricCardGrid className={props.className ?? "mt-4"} statusPillLabels={WORK_STREAM_STATUS_PILL_LABELS}>
      {COLUMNS.map((col) => {
        const count = props.counts[col.key];
        const tone = toneForColumn(col.key, count);
        return (
          <SummaryMetricCard
            key={col.key}
            href="/projects"
            title={col.title}
            icon={col.icon}
            metric={count}
            preview={summaryMetricCountPreview(count, col.previewSingular)}
            badge={<SummaryMetricStatusPill tone={tone} />}
            surfaceClassName={SUMMARY_METRIC_CARD.surfaceDefault}
          />
        );
      })}
    </SummaryMetricCardGrid>
  );
}
