"use client";

import { usePathname } from "next/navigation";

import { ShellPageHeaderClient } from "@/components/shell-page-header-client";
import { resolveSettingsSubpageMeta, type ShellPageMeta } from "@/lib/shell-page-meta";

/** Profile hero owns the page H1 on User settings — layout header would duplicate it. */
const SETTINGS_HEADER_SUPPRESS = new Set(["/settings/user"]);

const SETTINGS_HEADER_OVERRIDES: Record<string, ShellPageMeta> = {
  "/settings/access": {
    title: "Access",
    subtitle: "Assign roles and review suite capabilities by role.",
  },
};

function resolveSettingsLayoutHeader(pathname: string): ShellPageMeta | null {
  if (SETTINGS_HEADER_SUPPRESS.has(pathname)) return null;
  const override = SETTINGS_HEADER_OVERRIDES[pathname];
  if (override) return override;
  return resolveSettingsSubpageMeta(pathname);
}

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "";
  const header = resolveSettingsLayoutHeader(pathname);

  return (
    <div className="min-w-0 space-y-6">
      {header ? <ShellPageHeaderClient title={header.title} subtitle={header.subtitle} /> : null}
      {children}
    </div>
  );
}
