"use client";

import { Suspense, useCallback, useMemo, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";

import { PageHelpPanel } from "@/components/page-help-panel";
import { ShellPageHeader } from "@/components/shell-page-header";
import { resolvePageHelp } from "@/lib/page-help-copy";

function ShellPageHeaderClientInner(props: {
  title: string;
  subtitle: string;
  showRefresh?: boolean;
  helpPathname?: string;
  actions?: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname() ?? "/";
  const searchParams = useSearchParams();
  const [helpOpen, setHelpOpen] = useState(false);

  const helpPath = props.helpPathname ?? pathname;
  const helpContent = useMemo(
    () => resolvePageHelp(helpPath, searchParams),
    [helpPath, searchParams],
  );

  const openHelp = useCallback(() => setHelpOpen(true), []);
  const closeHelp = useCallback(() => setHelpOpen(false), []);

  return (
    <>
      <ShellPageHeader
        title={props.title}
        subtitle={props.subtitle}
        actions={props.actions}
        onRefresh={props.showRefresh !== false ? () => router.refresh() : undefined}
        onHelpClick={openHelp}
      />
      <PageHelpPanel open={helpOpen} onClose={closeHelp} content={helpContent} />
    </>
  );
}

function ShellPageHeaderClientFallback(props: {
  title: string;
  subtitle: string;
  showRefresh?: boolean;
  helpPathname?: string;
  actions?: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname() ?? "/";
  const [helpOpen, setHelpOpen] = useState(false);
  const helpPath = props.helpPathname ?? pathname;
  const helpContent = useMemo(() => resolvePageHelp(helpPath, null), [helpPath]);

  return (
    <>
      <ShellPageHeader
        title={props.title}
        subtitle={props.subtitle}
        actions={props.actions}
        onRefresh={props.showRefresh !== false ? () => router.refresh() : undefined}
        onHelpClick={() => setHelpOpen(true)}
      />
      <PageHelpPanel open={helpOpen} onClose={() => setHelpOpen(false)} content={helpContent} />
    </>
  );
}

/** Client wrapper so server pages get Refresh + Help in the shared page header. */
export function ShellPageHeaderClient(props: {
  title: string;
  subtitle: string;
  showRefresh?: boolean;
  /** Override route for help copy (defaults to current pathname). */
  helpPathname?: string;
  actions?: React.ReactNode;
}) {
  return (
    <Suspense fallback={<ShellPageHeaderClientFallback {...props} />}>
      <ShellPageHeaderClientInner {...props} />
    </Suspense>
  );
}
