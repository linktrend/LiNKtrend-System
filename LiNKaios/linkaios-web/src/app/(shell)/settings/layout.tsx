"use client";

import { usePathname } from "next/navigation";

import { useAppRole } from "@/components/role-preview-provider";
import { ShellPageHeaderClient } from "@/components/shell-page-header-client";
import { stripAppBasePath } from "@/lib/app-surface";
import { VAULTWARDEN_SECRETS_COPY } from "@/lib/vaultwarden-config";
import { resolveSettingsSubpageMeta, type ShellPageMeta } from "@/lib/shell-page-meta";

/** Profile hero owns the page H1 on User settings — layout header would duplicate it. */
const SETTINGS_HEADER_SUPPRESS = new Set(["/settings/user"]);

const SETTINGS_HEADER_OVERRIDES: Record<string, ShellPageMeta> = {
  "/settings/access": {
    title: "Access",
    subtitle: "Assign roles and review suite capabilities by role.",
  },
};

const LICENSOR_ACCESS_HEADER: ShellPageMeta = {
  title: "Operator Roles & Permissions",
  subtitle: "LiNKtrend staff who can access the Admin app — invite operators and review platform role capabilities.",
};

const LICENSOR_API_KEYS_HEADER: ShellPageMeta = {
  title: "Platform Secrets",
  subtitle: VAULTWARDEN_SECRETS_COPY.subtitle,
};

function resolveSettingsLayoutHeader(pathname: string, kind: "licensee" | "licensor"): ShellPageMeta | null {
  if (SETTINGS_HEADER_SUPPRESS.has(pathname)) return null;
  if (pathname === "/settings/access" && kind === "licensor") return LICENSOR_ACCESS_HEADER;
  if (pathname === "/settings/api-keys" && kind === "licensor") return LICENSOR_API_KEYS_HEADER;
  const override = SETTINGS_HEADER_OVERRIDES[pathname];
  if (override) return override;
  return resolveSettingsSubpageMeta(pathname);
}

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = stripAppBasePath(usePathname() ?? "");
  const { kind } = useAppRole();
  const header = resolveSettingsLayoutHeader(pathname, kind);

  return (
    <div className="min-w-0 space-y-6">
      {header ? <ShellPageHeaderClient title={header.title} subtitle={header.subtitle} /> : null}
      {children}
    </div>
  );
}
