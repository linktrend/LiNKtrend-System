"use client";

import type { CouncilReportSummary } from "@/lib/council/types";
import { StatusPill } from "@/components/ui/status-pill";

function verdictTone(status: string): "success" | "warning" | "danger" | "neutral" {
  if (status === "PASS") return "success";
  if (status === "WARN") return "warning";
  if (status === "BLOCKER") return "danger";
  return "neutral";
}

/**
 * Read-only council summary for approval gate rows (Admin + Client inbox).
 */
export function CouncilGateSummary(props: {
  report: CouncilReportSummary | null | undefined;
  gate?: string;
  compact?: boolean;
}) {
  const report = props.report;
  if (!report) {
    return (
      <p className="text-xs text-zinc-500 dark:text-zinc-400">
        Council deliberation not run for this gate yet.
      </p>
    );
  }

  const gateLabel = props.gate ?? report.gate;

  return (
    <div
      className="rounded-lg border border-zinc-200 bg-zinc-50/80 p-3 dark:border-zinc-800 dark:bg-zinc-900/40"
      data-testid="council-gate-summary"
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Council {gateLabel}
        </span>
        <StatusPill label={report.summary_status} tone={verdictTone(report.summary_status)} />
      </div>

      {!props.compact && report.personas?.length ? (
        <ul className="mt-2 space-y-1 text-xs text-zinc-700 dark:text-zinc-300">
          {report.personas.map((persona) => (
            <li key={persona.persona_id}>
              <span className="font-medium">{persona.persona_id.replace(/-/g, " ")}:</span>{" "}
              {persona.verdict} — {persona.summary.slice(0, 120)}
              {persona.summary.length > 120 ? "…" : ""}
            </li>
          ))}
        </ul>
      ) : null}

      {report.blockers.length > 0 ? (
        <ul className="mt-2 list-disc pl-4 text-xs text-red-700 dark:text-red-300">
          {report.blockers.map((blocker) => (
            <li key={`${blocker.persona_id}-${blocker.message.slice(0, 24)}`}>
              {blocker.persona_id}: {blocker.message}
            </li>
          ))}
        </ul>
      ) : null}

      {report.deliberation_ref ? (
        <p className="mt-2 text-[10px] text-zinc-400 dark:text-zinc-500">
          ref {report.deliberation_ref}
        </p>
      ) : null}
    </div>
  );
}
