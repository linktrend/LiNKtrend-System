"use client";

import { useMemo } from "react";

import { ProjectsIndexTable } from "@/components/projects-index-table";
import { getPlaneBridgeConfig, planeWorkspaceProjectsHref } from "@/lib/plane-links";
import { suiteProjectIndexRows } from "@/lib/project-index-rows";

export function ModuleProjectsTab(props: { suiteId: string }) {
  const planeCfg = useMemo(() => getPlaneBridgeConfig(), []);
  const planeProjectsHref = useMemo(() => planeWorkspaceProjectsHref(planeCfg), [planeCfg]);
  const rows = useMemo(() => suiteProjectIndexRows(props.suiteId, planeCfg), [props.suiteId, planeCfg]);

  return (
    <div className="space-y-3">
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Projects using this suite — open a row for live progress, Plane sync, and the module → phase → issue tree.
      </p>
      <ProjectsIndexTable
        rows={rows}
        planeWorkspaceHref={planeProjectsHref}
        showSuiteColumn={false}
        emptyMessage="No projects yet — use Add Project to select modules from this suite's catalogue."
      />
    </div>
  );
}
