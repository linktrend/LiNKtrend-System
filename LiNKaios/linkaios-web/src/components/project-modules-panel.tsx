import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { isUiMocksEnabled } from "@/lib/ui-mocks/flags";
import { demoProjectModules } from "@/lib/project-modules-data";

function cadenceLabel(continuous: boolean): string {
  return continuous ? "Continuous" : "Once";
}

export async function ProjectModulesPanel(props: { missionId: string }) {
  const modules = isUiMocksEnabled() ? demoProjectModules(props.missionId) : [];
  const base = `/projects/${encodeURIComponent(props.missionId)}`;

  if (modules.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50/80 p-6 text-sm text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900/40 dark:text-zinc-400">
        No modules are bound to this project yet.
      </p>
    );
  }

  return (
    <section className="space-y-3" aria-label="Project modules">
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Modules selected when this project was created — each expands into phases, issues, and assignees. Open Phases to
        track stage progress.
      </p>
      <div className="space-y-3">
        {modules.map((mod) => (
          <article
            key={mod.templateId}
            className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950"
          >
            <Link
              href={`${base}?tab=phases`}
              className="flex w-full items-start gap-2 px-4 py-3 text-left transition hover:bg-zinc-50 dark:hover:bg-zinc-900/40"
            >
              <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-zinc-400" aria-hidden />
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-center gap-2">
                  <span className="rounded bg-violet-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-violet-900 ring-1 ring-violet-200 dark:bg-violet-950/50 dark:text-violet-100 dark:ring-violet-800">
                    Module {mod.order}
                  </span>
                  <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{mod.name}</span>
                  <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                    {cadenceLabel(mod.continuous)}
                  </span>
                </span>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{mod.summary}</p>
                <p className="mt-0.5 text-[11px] text-zinc-500 dark:text-zinc-400">
                  {mod.phaseCount} phase{mod.phaseCount === 1 ? "" : "s"} · {mod.issueCount} issue
                  {mod.issueCount === 1 ? "" : "s"}
                  {mod.suiteName ? ` · ${mod.suiteName} suite` : ""}
                </p>
              </span>
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
