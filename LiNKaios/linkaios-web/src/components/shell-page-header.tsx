"use client";

import { LicensorScopeLine } from "@/components/admin/licensor-scope-banner";
import { formatShellPageTitle, SHELL } from "@/lib/ui-standards";

/** Shared page title block — primary actions sit beside the subtitle; refresh/help live in shell chrome. */
export function ShellPageHeader(props: {
  title: string;
  subtitle: string;
  refreshedLabel?: string | null;
  /** Renders inline after the page title (e.g. lifecycle status pill). */
  titleExtra?: React.ReactNode;
  actions?: React.ReactNode;
  /** Hide per-licensee scope row — vendor-only surfaces (e.g. Admin Projects). */
  hideLicensorScope?: boolean;
}) {
  const { title, subtitle, refreshedLabel, titleExtra, actions, hideLicensorScope } = props;
  const displayTitle = formatShellPageTitle(title);

  return (
    <header className={SHELL.pageHeader}>
      <div className="flex flex-wrap items-center gap-3">
        <h1 className={SHELL.pageTitle}>{displayTitle}</h1>
        {titleExtra ? <div className="shrink-0">{titleExtra}</div> : null}
      </div>
      <div className={SHELL.pageSubtitleRow}>
        <p className={SHELL.pageSubtitle}>{subtitle}</p>
        {actions ? <div className={SHELL.pageActions}>{actions}</div> : null}
      </div>
      {hideLicensorScope ? null : <LicensorScopeLine />}
      {refreshedLabel ? (
        <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400" suppressHydrationWarning>
          {refreshedLabel}
        </p>
      ) : null}
    </header>
  );
}
