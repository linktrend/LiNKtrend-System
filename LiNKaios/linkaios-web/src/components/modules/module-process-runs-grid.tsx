"use client";

import { GitBranch, RefreshCw } from "lucide-react";

import { SummaryMetricCard } from "@/components/summary-metric-card/summary-metric-card";
import { SummaryMetricCardGrid, SummaryMetricCardSection } from "@/components/summary-metric-card/summary-metric-card-grid";
import { DomainStatusPill } from "@/components/ui/status-pill";
import type { ModuleProcess } from "@/lib/ui-mocks/modules-catalog-demo";
import {
  MODULE_PROCESS_RUN_PILL_LABELS,
  processRunFixtureFor,
  processRunPreviewLine,
} from "@/lib/ui-mocks/module-process-run-demo";
import { SUMMARY_METRIC_CARD } from "@/lib/ui-standards";

/** Matches default summary metric numeral line height (`text-3xl leading-none`). */
function ProcessRunMetric(props: { rerunsAutomatically: boolean; completionPercent: number | null }) {
  if (props.rerunsAutomatically) {
    return (
      <span className="inline-flex h-[1.875rem] items-end" title="Recurring process">
        <RefreshCw className="h-6 w-6 shrink-0" aria-hidden />
        <span className="sr-only">Recurring process</span>
      </span>
    );
  }

  return `${props.completionPercent ?? 0}%`;
}

/** Active module runs for a subscribed suite — one summary card per published module template. */
export function ModuleProcessRunsGrid(props: { suiteId: string; processes: ModuleProcess[]; owned: boolean }) {
  const published = props.processes.filter((p) => p.published);
  if (!props.owned || published.length === 0) return null;

  return (
    <SummaryMetricCardSection title="Runs" aria-label="Current suite module runs">
      <SummaryMetricCardGrid statusPillLabels={MODULE_PROCESS_RUN_PILL_LABELS}>
        {published.map((process) => {
          const run = processRunFixtureFor(process);
          return (
            <SummaryMetricCard
              key={process.id}
              href={`/projects/${run.projectId}`}
              title={process.name}
              icon={GitBranch}
              metric={
                <ProcessRunMetric
                  rerunsAutomatically={process.rerunsAutomatically}
                  completionPercent={run.completionPercent}
                />
              }
              preview={processRunPreviewLine(run.projectName)}
              previewClassName="line-clamp-1"
              badge={
                <DomainStatusPill
                  domain="workflow"
                  status={run.status}
                  equalWidthLabels={MODULE_PROCESS_RUN_PILL_LABELS}
                />
              }
              surfaceClassName={SUMMARY_METRIC_CARD.surfaceDefault}
            />
          );
        })}
      </SummaryMetricCardGrid>
    </SummaryMetricCardSection>
  );
}
