"use client";

import { usePathname } from "next/navigation";

import { ShellPageHeaderClient } from "@/components/shell-page-header-client";
import { resolveShellPageMeta, suppressesAutoShellPageHeader } from "@/lib/shell-page-meta";
import { SHELL } from "@/lib/ui-standards";

/** Injects shared title / Help / Refresh on routes that do not define their own header. */
export function ShellAutoPageHeader() {
  const pathname = usePathname() ?? "/";
  if (suppressesAutoShellPageHeader(pathname)) return null;

  const meta = resolveShellPageMeta(pathname);
  if (!meta) return null;

  return (
    <div className={SHELL.autoPageHeaderWrap}>
      <ShellPageHeaderClient title={meta.title} subtitle={meta.subtitle} />
    </div>
  );
}
