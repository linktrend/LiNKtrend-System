"use client";

import { FileKey2, ListTodo, PlayCircle, Workflow } from "lucide-react";

import {
  SummaryMetricStatusPill,
  WORK_STREAM_STATUS_PILL_LABELS,
} from "@/components/summary-metric-card/summary-metric-status-pill";
import { SummaryMetricCard } from "@/components/summary-metric-card/summary-metric-card";
import { SummaryMetricCardGrid } from "@/components/summary-metric-card/summary-metric-card-grid";
import type { ProjectOverviewSnapshot } from "@/lib/project-overview-data";
import { SUMMARY_METRIC_CARD } from "@/lib/ui-standards";

export function ProjectOverviewSnapshotGrid(props: {
  missionId: string;
  snapshot: ProjectOverviewSnapshot;
}) {
  const base = `/projects/${encodeURIComponent(props.missionId)}`;
  const s = props.snapshot;

  return (
    <SummaryMetricCardGrid
      className="mt-4 sm:grid-cols-2 lg:grid-cols-4"
      statusPillLabels={WORK_STREAM_STATUS_PILL_LABELS}
    >
      <SummaryMetricCard
        href={`${base}?tab=phases`}
        title="Phases"
        icon={Workflow}
        metric={s.workflows.inProgress}
        metricToneClass="text-sky-700 dark:text-sky-300"
        preview={
          s.workflows.headline
            ? `Now · ${s.workflows.headline}`
            : `${s.workflows.next} queued · ${s.workflows.done} done`
        }
        badge={
          <SummaryMetricStatusPill tone={s.workflows.inProgress > 0 ? "ok" : s.workflows.next > 0 ? "attention" : "ok"} />
        }
        footer={
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            {s.workflows.next} next · {s.workflows.done} completed
          </span>
        }
        surfaceClassName={SUMMARY_METRIC_CARD.surfaceDefault}
      />
      <SummaryMetricCard
        href={`${base}?tab=issues`}
        title="Issues"
        icon={ListTodo}
        metric={s.issues.inProgress}
        metricToneClass="text-amber-800 dark:text-amber-200"
        preview={
          s.issues.headline ? `Active · ${s.issues.headline}` : `${s.issues.next} open · ${s.issues.done} closed`
        }
        badge={
          <SummaryMetricStatusPill
            tone={s.issues.inProgress > 0 ? "attention" : s.issues.next > 0 ? "attention" : "ok"}
          />
        }
        footer={
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            {s.issues.next} open · {s.issues.done} done
          </span>
        }
        surfaceClassName={SUMMARY_METRIC_CARD.surfaceDefault}
      />
      <SummaryMetricCard
        href={`${base}?tab=runs`}
        title="Runs"
        icon={PlayCircle}
        metric={s.runs.total}
        preview={s.runs.headline ? `Latest · ${s.runs.headline}` : "No runs in the last 30 days"}
        badge={<SummaryMetricStatusPill tone={s.runs.total > 0 ? "ok" : "attention"} />}
        surfaceClassName={SUMMARY_METRIC_CARD.surfaceDefault}
      />
      <SummaryMetricCard
        href={`${base}?tab=leases`}
        title="Leases"
        icon={FileKey2}
        metric={s.leases.active}
        preview={
          s.leases.headline
            ? `Latest · ${s.leases.headline}`
            : s.leases.total > 0
              ? `${s.leases.total} lease decisions`
              : "No leases for this project"
        }
        badge={
          <SummaryMetricStatusPill tone={s.leases.active > 0 ? "ok" : s.leases.total > 0 ? "attention" : "ok"} />
        }
        footer={
          <span className="text-xs text-zinc-500 dark:text-zinc-400">{s.leases.total} total in window</span>
        }
        surfaceClassName={SUMMARY_METRIC_CARD.surfaceDefault}
      />
    </SummaryMetricCardGrid>
  );
}
