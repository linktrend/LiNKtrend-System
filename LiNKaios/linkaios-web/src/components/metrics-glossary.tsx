"use client";

import { ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";

const METRICS_IA_CRUMB = [
  { label: "LiNKtrend", hint: "Tenant / studio" },
  { label: "Suite", hint: "LinkSites, LEXOS, LiNKapps…" },
  { label: "Module", hint: "Vendor recipe (website factory, litigation intake…)" },
  { label: "Project", hint: "Plane-backed work container" },
  { label: "Phase", hint: "Stage group within a module" },
  { label: "Issue", hint: "Task or ticket within the phase" },
  { label: "Run", hint: "Single trace event (LLM, tool, skill, automation)" },
] as const;

/** Collapsible performance glossary — Metrics hub. */
export function MetricsGlossary() {
  const [open, setOpen] = useState(false);

  return (
    <section className="rounded-xl border border-zinc-200 bg-zinc-50/60 dark:border-zinc-800 dark:bg-zinc-900/30">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
        aria-expanded={open}
      >
        <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">About performance metrics</span>
        {open ? (
          <ChevronDown className="h-4 w-4 shrink-0 text-zinc-400" aria-hidden />
        ) : (
          <ChevronRight className="h-4 w-4 shrink-0 text-zinc-400" aria-hidden />
        )}
      </button>
      {open ? (
        <div className="space-y-2 border-t border-zinc-200 px-4 pb-4 pt-3 text-xs leading-6 text-zinc-700 dark:border-zinc-800 dark:text-zinc-300">
          <p>
            Metrics aggregates <strong>runs</strong> (trace events) across projects, LiNKbots, automations, models, tools,
            and skills. Use filters to narrow the window; scope filters (suite, module, phase, issue) slice runs
            when trace payloads carry structured metadata.
          </p>
          <p>
            <strong>Cost</strong> — spend, tokens, cost per successful run, wasted cost on failures.{" "}
            <strong>Performance</strong> — duration, throughput, retries, step mix.{" "}
            <strong>Reliability</strong> — failure, timeout, tool/model error rates.
          </p>
          <p className="text-zinc-500 dark:text-zinc-400">
            Data comes from LiNKaios traces and run payloads. Open individual runs from the recent runs table or Cockpit
            for full audit detail.
          </p>
          <div
            className="mt-3 rounded-lg border border-zinc-200 bg-white/80 px-3 py-2.5 dark:border-zinc-700 dark:bg-zinc-950/50"
            aria-label="Metrics hierarchy"
          >
            <p className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-400">
              How metrics roll up (future drill-down IA)
            </p>
            <ol className="mt-2 flex flex-wrap items-center gap-1 text-[11px]">
              {METRICS_IA_CRUMB.map((crumb, idx) => (
                <li key={crumb.label} className="flex items-center gap-1">
                  {idx > 0 ? (
                    <span className="text-zinc-300 dark:text-zinc-600" aria-hidden>
                      /
                    </span>
                  ) : null}
                  <span
                    className="rounded border border-zinc-200 bg-zinc-50 px-1.5 py-0.5 font-medium text-zinc-800 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                    title={crumb.hint}
                  >
                    {crumb.label}
                  </span>
                </li>
              ))}
            </ol>
            <p className="mt-2 text-[11px] leading-relaxed text-zinc-500 dark:text-zinc-400">
              Each level narrows the next: pick a suite to see its modules, then phases, then issues, then individual
              runs. Phase B exposes scope filters as stubs; full tree navigation is backlog UIUX-MET-H001.
            </p>
          </div>
        </div>
      ) : null}
    </section>
  );
}
