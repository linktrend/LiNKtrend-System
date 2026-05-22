"use client";

import { ModuleOverviewStatsGrid } from "@/components/modules/module-overview-stats-grid";
import { ModuleProcessRunsGrid } from "@/components/modules/module-process-runs-grid";
import { moduleStats, modulesForSuite, type ModuleCatalogueItem } from "@/lib/suites-page-copy";

export function ModuleOverviewPanel(props: { suite: ModuleCatalogueItem; owned: boolean }) {
  const stats = moduleStats(props.suite.id);
  const moduleTemplates = modulesForSuite(props.suite.id);

  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">{props.suite.marketingDescription}</p>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          <span className="font-semibold text-zinc-800 dark:text-zinc-200">Who it&apos;s for:</span> {props.suite.audienceWho}
        </p>
      </section>

      <ModuleOverviewStatsGrid suiteId={props.suite.id} owned={props.owned} stats={stats} />

      <ModuleProcessRunsGrid suiteId={props.suite.id} processes={moduleTemplates} owned={props.owned} />

      {!props.owned ? (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Preview or subscribe to start projects and unlock operational status. Modules and Sample Outputs are available
          to browse before you commit.
        </p>
      ) : null}
    </div>
  );
}
