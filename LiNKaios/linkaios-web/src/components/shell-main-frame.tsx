"use client";

import { AutoBreadcrumbs } from "@/components/auto-breadcrumbs";
import { BreadcrumbLabelProvider } from "@/components/breadcrumb-label-registry";
import { ShellAutoPageHeader } from "@/components/shell-auto-page-header";
import { ShellChromeToolbar } from "@/components/shell-chrome-toolbar";
import { SHELL } from "@/lib/ui-standards";

export function ShellMainFrame(props: { uiMocksEnabled: boolean; children: React.ReactNode }) {
  return (
    <BreadcrumbLabelProvider>
      <div className={SHELL.breadcrumbRow}>
        <AutoBreadcrumbs fixtureLabelsInNav={props.uiMocksEnabled} />
        <ShellChromeToolbar />
      </div>
      <ShellAutoPageHeader />
      <div className="min-h-0 flex-1">{props.children}</div>
    </BreadcrumbLabelProvider>
  );
}
