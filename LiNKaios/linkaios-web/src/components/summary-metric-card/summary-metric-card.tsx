"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";

import { formatCardTitle, formatMetricsCardTitle, SUMMARY_METRIC_CARD } from "@/lib/ui-standards";

export type SummaryMetricCardProps = {
  href?: string;
  title: string;
  /** `shell` = title-case words; `sentence` = first letter only (metrics KPIs). */
  titleFormat?: "shell" | "sentence";
  icon: LucideIcon;
  metric: React.ReactNode;
  preview?: React.ReactNode;
  /** Optional override for preview line clamp/truncation. */
  previewClassName?: string;
  badge?: React.ReactNode;
  footer?: React.ReactNode;
  metricToneClass?: string;
  compactMetric?: boolean;
  surfaceClassName?: string;
  className?: string;
};

/** Canonical summary metric tile — all stat/stream/lifecycle cards use this (GLOBAL summary-metric-card). */
export function SummaryMetricCard(props: SummaryMetricCardProps) {
  const Icon = props.icon;
  const displayTitle =
    props.titleFormat === "sentence" ? formatMetricsCardTitle(props.title) : formatCardTitle(props.title);
  const metricClass = props.compactMetric ? SUMMARY_METRIC_CARD.metricCompact : SUMMARY_METRIC_CARD.metric;
  const shellClass = [
    SUMMARY_METRIC_CARD.shell,
    props.surfaceClassName ?? SUMMARY_METRIC_CARD.surfaceDefault,
    props.className,
  ]
    .filter(Boolean)
    .join(" ");

  const content = (
    <>
      {props.badge ? <div className={SUMMARY_METRIC_CARD.badgeWrap}>{props.badge}</div> : null}
      <div className={props.badge ? SUMMARY_METRIC_CARD.titleRow : SUMMARY_METRIC_CARD.titleRowPlain}>
        <Icon className={SUMMARY_METRIC_CARD.titleIcon} aria-hidden />
        <span className={SUMMARY_METRIC_CARD.titleText}>{displayTitle}</span>
      </div>
      <div className={SUMMARY_METRIC_CARD.body}>
        <p className={[metricClass, props.metricToneClass].filter(Boolean).join(" ")}>{props.metric}</p>
        {props.preview != null ? (
          <div className={[SUMMARY_METRIC_CARD.preview, props.previewClassName].filter(Boolean).join(" ")}>
            {props.preview}
          </div>
        ) : null}
        {props.footer ? <div className={SUMMARY_METRIC_CARD.footer}>{props.footer}</div> : null}
      </div>
    </>
  );

  if (props.href) {
    return (
      <Link href={props.href} className={shellClass}>
        {content}
      </Link>
    );
  }

  return <div className={shellClass}>{content}</div>;
}
