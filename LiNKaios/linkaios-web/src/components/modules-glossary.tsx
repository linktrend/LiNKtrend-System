"use client";

import { ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";

/** Collapsible hierarchy glossary — Modules hub. */
export function ModulesGlossary() {
  const [open, setOpen] = useState(false);

  return (
    <section className="rounded-xl border border-zinc-200 bg-zinc-50/60 dark:border-zinc-800 dark:bg-zinc-900/30">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
        aria-expanded={open}
      >
        <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">About modules &amp; project types</span>
        {open ? (
          <ChevronDown className="h-4 w-4 shrink-0 text-zinc-400" aria-hidden />
        ) : (
          <ChevronRight className="h-4 w-4 shrink-0 text-zinc-400" aria-hidden />
        )}
      </button>
      {open ? (
        <div className="space-y-2 border-t border-zinc-200 px-4 pb-4 pt-3 text-xs leading-6 text-zinc-700 dark:border-zinc-800 dark:text-zinc-300">
          <p>
            <strong>Module</strong> = a service line (LinkSites, LiNKapps, LEXOS, …) — a process or bundle of processes
            enabled for your tenant.
          </p>
          <p>
            <strong>Project type</strong> = a pre-defined process template inside a module. Operators start{" "}
            <strong>projects</strong> only from licensed project types — custom process building comes later.
          </p>
          <p>
            <strong>Workflow</strong> = a major stage inside that project type. <strong>Task / issue</strong> = atomic
            work inside a workflow. Template tasks shown here are blueprint examples, not live project issues.
          </p>
          <p className="text-zinc-500 dark:text-zinc-400">
            Running client work lives under <strong>Projects</strong>. Plane mirrors projects, workflows, and issues when
            sync is enabled.
          </p>
        </div>
      ) : null}
    </section>
  );
}
