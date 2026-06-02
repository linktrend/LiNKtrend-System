"use client";

import { AutoBreadcrumbs } from "@/components/auto-breadcrumbs";
import { BreadcrumbLabelProvider } from "@/components/breadcrumb-label-registry";
import { DataEnvironmentBadge } from "@/components/data-environment-badge";
import { ShellAutoPageHeader } from "@/components/shell-auto-page-header";
import { ShellChromeToolbar } from "@/components/shell-chrome-toolbar";
import type { DataEnvironmentState } from "@/lib/data-environment";
import { SHELL } from "@/lib/ui-standards";

export function ShellMainFrame(props: {
  uiMocksEnabled: boolean;
  dataEnvironment: DataEnvironmentState;
  children: React.ReactNode;
}) {
  return (
    <BreadcrumbLabelProvider>
      {props.dataEnvironment.showBadge ? (
        <div className="mb-3">
          <DataEnvironmentBadge mode={props.dataEnvironment.mode} />
        </div>
      ) : null}
      <div className={SHELL.breadcrumbRow}>
        <AutoBreadcrumbs fixtureLabelsInNav={props.uiMocksEnabled} />
        <ShellChromeToolbar />
      </div>
      <ShellAutoPageHeader />
      <div className="min-h-0 flex-1">{props.children}</div>
    </BreadcrumbLabelProvider>
  );
}
