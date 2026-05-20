"use client";

import { AutoBreadcrumbs } from "@/components/auto-breadcrumbs";
import { BreadcrumbLabelProvider } from "@/components/breadcrumb-label-registry";
import { ShellAutoPageHeader } from "@/components/shell-auto-page-header";
import { ShellCompanySwitcher } from "@/components/shell-company-switcher";

export function ShellMainFrame(props: { uiMocksEnabled: boolean; children: React.ReactNode }) {
  return (
    <BreadcrumbLabelProvider>
      <div className="mb-4 flex min-h-[1.75rem] flex-wrap items-center justify-between gap-3">
        <AutoBreadcrumbs fixtureLabelsInNav={props.uiMocksEnabled} />
        <div className="flex shrink-0 flex-wrap items-center gap-3">
          <ShellCompanySwitcher />
          {props.uiMocksEnabled ? (
          <span
            role="status"
            title="Sidebar, projects, work samples, and metrics may be synthetic — not production data. Set LINKAIOS_UI_MOCKS=0 before stakeholder demos."
            className="shrink-0 cursor-default rounded-full border border-amber-300 bg-amber-100 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-amber-800 dark:border-amber-700 dark:bg-amber-950/60 dark:text-amber-300"
          >
            UI Mock Mode
          </span>
          ) : null}
        </div>
      </div>
      <ShellAutoPageHeader />
      <div className="min-h-0 flex-1">{props.children}</div>
    </BreadcrumbLabelProvider>
  );
}
