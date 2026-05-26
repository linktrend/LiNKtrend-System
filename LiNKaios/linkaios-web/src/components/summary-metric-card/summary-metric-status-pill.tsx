"use client";

import { StatusPill } from "@/components/ui/status-pill";
import type { WorkRowTone } from "@/lib/overview-dashboard";
import {
  WORK_STREAM_STATUS_LABELS,
  WORK_STREAM_STATUS_PILL_LABELS,
} from "@/lib/status-colors";

const widthProps = { equalWidthLabels: WORK_STREAM_STATUS_PILL_LABELS } as const;

/** Corner badge — same pill set and width as Work Streams on `/work`. */
export function SummaryMetricStatusPill(props: { tone: WorkRowTone }) {
  if (props.tone === "critical") {
    return <StatusPill label={WORK_STREAM_STATUS_LABELS.needsAction} tone="danger" {...widthProps} />;
  }
  if (props.tone === "attention") {
    return <StatusPill label={WORK_STREAM_STATUS_LABELS.review} tone="warning" {...widthProps} />;
  }
  return <StatusPill label={WORK_STREAM_STATUS_LABELS.ok} tone="success" {...widthProps} />;
}

export function summaryMetricToneFromCount(count: number, opts?: { warnWhenPositive?: boolean; criticalWhenPositive?: boolean }): WorkRowTone {
  if (opts?.criticalWhenPositive && count > 0) return "critical";
  if (opts?.warnWhenPositive && count > 0) return "attention";
  return "ok";
}

export function summaryMetricCountPreview(count: number, singular: string, plural?: string): string {
  if (count === 0) return "None right now";
  const label = count === 1 ? singular : (plural ?? `${singular}s`);
  return `${count} ${label}`;
}

export { WORK_STREAM_STATUS_PILL_LABELS };
