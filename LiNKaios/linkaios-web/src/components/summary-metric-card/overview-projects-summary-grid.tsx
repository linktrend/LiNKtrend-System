"use client";

import { CheckCircle2, FileStack, FolderKanban, ShieldAlert } from "lucide-react";

import {
  SummaryMetricStatusPill,
  WORK_STREAM_STATUS_PILL_LABELS,
  summaryMetricCountPreview,
} from "@/components/summary-metric-card/summary-metric-status-pill";
import { SummaryMetricCard } from "@/components/summary-metric-card/summary-metric-card";
import { SummaryMetricCardGrid } from "@/components/summary-metric-card/summary-metric-card-grid";
import { SUMMARY_METRIC_CARD } from "@/lib/ui-standards";

export function OverviewProjectsSummaryGrid(props: {
  draft: number;
  active: number;
  completed: number;
  needsAttention: number;
  className?: string;
}) {
  return (
    <SummaryMetricCardGrid
      className={props.className ?? "mt-4 grid-cols-2 lg:grid-cols-4"}
      statusPillLabels={WORK_STREAM_STATUS_PILL_LABELS}
    >
      <SummaryMetricCard
        href="/projects"
        title="Draft"
        icon={FileStack}
        metric={props.draft}
        preview={
          props.draft === 0
            ? "No draft projects"
            : summaryMetricCountPreview(props.draft, "draft project")
        }
        badge={<SummaryMetricStatusPill tone={props.draft > 0 ? "attention" : "ok"} />}
        surfaceClassName={SUMMARY_METRIC_CARD.surfaceDefault}
      />
      <SummaryMetricCard
        href="/projects"
        title="Active"
        icon={FolderKanban}
        metric={props.active}
        preview={
          props.active === 0
            ? "No active projects"
            : summaryMetricCountPreview(props.active, "active project")
        }
        badge={<SummaryMetricStatusPill tone="ok" />}
        surfaceClassName={SUMMARY_METRIC_CARD.surfaceDefault}
      />
      <SummaryMetricCard
        href="/projects"
        title="Completed"
        icon={CheckCircle2}
        metric={props.completed}
        preview={
          props.completed === 0
            ? "None completed yet"
            : summaryMetricCountPreview(props.completed, "completed project")
        }
        badge={<SummaryMetricStatusPill tone="ok" />}
        surfaceClassName={SUMMARY_METRIC_CARD.surfaceDefault}
      />
      <SummaryMetricCard
        href="/projects"
        title="Needs attention"
        icon={ShieldAlert}
        metric={props.needsAttention}
        preview={
          props.needsAttention === 0
            ? "All projects on track"
            : summaryMetricCountPreview(props.needsAttention, "project needing attention")
        }
        badge={
          <SummaryMetricStatusPill tone={props.needsAttention > 0 ? "attention" : "ok"} />
        }
        surfaceClassName={SUMMARY_METRIC_CARD.surfaceDefault}
      />
    </SummaryMetricCardGrid>
  );
}
