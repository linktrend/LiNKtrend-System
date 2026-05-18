"use client";

import { AutoBreadcrumbs } from "@/components/auto-breadcrumbs";
import { BreadcrumbLabelProvider } from "@/components/breadcrumb-label-registry";

export function ShellMainFrame(props: { uiMocksEnabled: boolean; children: React.ReactNode }) {
  return (
    <BreadcrumbLabelProvider>
      {props.uiMocksEnabled ? (
        <div
          role="status"
          className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-100"
        >
          <span className="font-semibold">UI mock mode.</span> Sidebar, projects, work samples, and metrics may be
          synthetic for UX review — not production data. Set <code className="rounded bg-amber-100/80 px-1 text-xs dark:bg-amber-900/80">LINKAIOS_UI_MOCKS=0</code> or unset before stakeholder demos. See{" "}
          <span className="font-mono text-xs">docs/LiNKaios-web-production-readiness-PRD.md</span> §7.
        </div>
      ) : null}
      <AutoBreadcrumbs fixtureLabelsInNav={props.uiMocksEnabled} />
      <div className="min-h-0 flex-1">{props.children}</div>
    </BreadcrumbLabelProvider>
  );
}
