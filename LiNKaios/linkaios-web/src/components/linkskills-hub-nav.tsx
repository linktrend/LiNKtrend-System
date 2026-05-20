"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type HubTab = "overview" | "skills" | "tools" | "connectors" | "leases";

const TABS: { id: HubTab; href: string; label: string }[] = [
  { id: "overview", href: "/skills", label: "Overview" },
  { id: "skills", href: "/skills/skills", label: "Skills" },
  { id: "tools", href: "/skills/tools", label: "Tools" },
  { id: "connectors", href: "/skills/connectors", label: "Connectors" },
  { id: "leases", href: "/skills/leases", label: "Leases" },
];

function activeTab(pathname: string): HubTab {
  if (pathname.startsWith("/skills/leases")) return "leases";
  if (pathname.startsWith("/skills/skills") || /^\/skills\/[0-9a-f-]{36}(\/|$)/i.test(pathname)) return "skills";
  if (pathname.startsWith("/skills/tools")) return "tools";
  if (pathname.startsWith("/skills/connectors")) return "connectors";
  if (pathname === "/skills" || pathname === "/skills/") return "overview";
  return "overview";
}

export function LinkskillsHubNav() {
  const pathname = usePathname() ?? "/skills";
  const current = activeTab(pathname);

  return (
    <nav aria-label="LiNKskills sections" className="flex flex-wrap gap-2 border-b border-zinc-200 pb-4 dark:border-zinc-800">
      {TABS.map((tab) => {
        const on = current === tab.id;
        return (
          <Link
            key={tab.id}
            href={tab.href}
            aria-current={on ? "page" : undefined}
            className={
              "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors " +
              (on
                ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100")
            }
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
