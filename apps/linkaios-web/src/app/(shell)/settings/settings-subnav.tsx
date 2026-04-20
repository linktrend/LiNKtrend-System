"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { screenTabLinkClass } from "@/lib/ui-standards";

type NavItem = { href: string; label: string; match: (path: string) => boolean };

const SETTINGS_TABS: NavItem[] = [
  { href: "/settings/user", label: "User", match: (p) => p === "/settings/user" || p === "/settings" || p === "/settings/" },
  { href: "/settings/access", label: "Access", match: (p) => p.startsWith("/settings/access") },
  { href: "/settings/api-keys", label: "API Keys", match: (p) => p.startsWith("/settings/api-keys") },
  { href: "/settings/gateway", label: "Integration Routing", match: (p) => p.startsWith("/settings/gateway") },
  {
    href: "/settings/advanced",
    label: "Advanced",
    match: (p) =>
      p.startsWith("/settings/advanced") ||
      p.startsWith("/settings/tools") ||
      p.startsWith("/settings/traces") ||
      p.startsWith("/settings/prism"),
  },
];

export function SettingsSubnav() {
  const pathname = usePathname() ?? "";

  return (
    <nav aria-label="Settings sections" className="min-w-0 overflow-x-auto pb-px [-webkit-overflow-scrolling:touch]">
      <div className="flex w-max min-w-full flex-nowrap items-end gap-1 border-b border-zinc-200 dark:border-zinc-800 md:w-auto md:min-w-0">
        {SETTINGS_TABS.map((tab) => {
          const active = tab.match(pathname);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={screenTabLinkClass(active)}
              aria-current={active ? "page" : undefined}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
