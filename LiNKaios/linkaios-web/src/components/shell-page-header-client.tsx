"use client";

import { ShellPageHeader } from "@/components/shell-page-header";

/** Client wrapper for pages that render their own header (Overview, hub layouts). */
export function ShellPageHeaderClient(props: {
  title: string;
  subtitle: string;
  refreshedLabel?: string | null;
  titleExtra?: React.ReactNode;
  actions?: React.ReactNode;
  hideLicensorScope?: boolean;
}) {
  return (
    <ShellPageHeader
      title={props.title}
      subtitle={props.subtitle}
      refreshedLabel={props.refreshedLabel}
      titleExtra={props.titleExtra}
      actions={props.actions}
      hideLicensorScope={props.hideLicensorScope}
    />
  );
}
