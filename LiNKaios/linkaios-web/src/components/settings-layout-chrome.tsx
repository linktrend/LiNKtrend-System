"use client";

import { usePathname } from "next/navigation";

import { ShellPageHeaderClient } from "@/components/shell-page-header-client";
import { resolveSettingsSubpageMeta } from "@/lib/shell-page-meta";

export function SettingsLayoutChrome(props: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "";
  const subpageMeta = resolveSettingsSubpageMeta(pathname);

  return (
    <div className="min-w-0 space-y-6">
      {subpageMeta ? <ShellPageHeaderClient title={subpageMeta.title} subtitle={subpageMeta.subtitle} /> : null}
      {props.children}
    </div>
  );
}
