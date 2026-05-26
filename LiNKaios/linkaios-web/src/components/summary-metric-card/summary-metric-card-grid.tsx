"use client";

import { StatusPillWidthProvider } from "@/components/ui/status-pill-width-provider";
import { SUMMARY_METRIC_CARD } from "@/lib/ui-standards";

export function SummaryMetricCardGrid(props: {
  children: React.ReactNode;
  className?: string;
  dense?: boolean;
  /** Labels for every status pill in this card row — sets equal width from the longest label. */
  statusPillLabels?: readonly string[];
}) {
  const gridClass = [props.dense ? SUMMARY_METRIC_CARD.gridDense : SUMMARY_METRIC_CARD.grid, props.className]
    .filter(Boolean)
    .join(" ");

  if (props.statusPillLabels?.length) {
    return (
      <StatusPillWidthProvider labels={props.statusPillLabels} className={gridClass}>
        {props.children}
      </StatusPillWidthProvider>
    );
  }

  return <div className={gridClass}>{props.children}</div>;
}

export function SummaryMetricCardSection(props: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  /** When true, use sentence-case section title (metrics dashboards). */
  sentenceTitle?: boolean;
  "aria-label"?: string;
}) {
  const titleClass = props.sentenceTitle
    ? "text-sm font-semibold text-zinc-900 dark:text-zinc-100"
    : SUMMARY_METRIC_CARD.sectionLabel;
  const titleClassWithIcon = props.sentenceTitle
    ? "flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100"
    : SUMMARY_METRIC_CARD.sectionLabelWithIcon;

  return (
    <section className={props.className} aria-label={props["aria-label"]}>
      {props.icon ? (
        <h2 className={titleClassWithIcon}>
          {props.icon}
          {props.title}
        </h2>
      ) : (
        <h2 className={titleClass}>{props.title}</h2>
      )}
      {props.sentenceTitle ? (
        <div className="mt-3">{props.children}</div>
      ) : (
        <div className={SUMMARY_METRIC_CARD.sectionContentGap}>{props.children}</div>
      )}
    </section>
  );
}
