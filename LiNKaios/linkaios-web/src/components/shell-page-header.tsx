"use client";

import { LicensorScopeLine } from "@/components/admin/licensor-scope-banner";
import { formatShellPageTitle, SHELL } from "@/lib/ui-standards";

/** Shared page title block — primary actions sit beside the subtitle; refresh/help live in shell chrome. */
export function ShellPageHeader(props: {
  title: string;
  subtitle: string;
  refreshedLabel?: string | null;
  actions?: React.ReactNode;
}) {
  const { title, subtitle, refreshedLabel, actions } = props;
  const displayTitle = formatShellPageTitle(title);

  return (
    <header className={SHELL.pageHeader}>
      <h1 className={SHELL.pageTitle}>{displayTitle}</h1>
      <div className={SHELL.pageSubtitleRow}>
        <p className={SHELL.pageSubtitle}>{subtitle}</p>
        {actions ? <div className={SHELL.pageActions}>{actions}</div> : null}
      </div>
      <LicensorScopeLine />
      {refreshedLabel ? (
        <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400" suppressHydrationWarning>
          {refreshedLabel}
        </p>
      ) : null}
    </header>
  );
}
