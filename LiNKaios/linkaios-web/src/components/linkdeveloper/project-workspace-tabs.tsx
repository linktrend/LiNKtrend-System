"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  LINKDEVELOPER_CLIENT_ROUTES,
  LINKDEVELOPER_PROJECT_TABS,
  formatProjectTabLabel,
  linkdeveloperProjectTabActive,
  type LinkdeveloperProjectTab,
} from "@/lib/client/linkdeveloper/routes";

function tabClass(active: boolean) {
  return (
    "rounded-md px-3 py-1.5 text-sm font-medium transition-colors " +
    (active
      ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
      : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100")
  );
}

export function ProjectWorkspaceTabs(props: { productRunId: string; activeTab?: LinkdeveloperProjectTab }) {
  const pathname = usePathname() ?? "";

  return (
    <nav
      className="flex flex-wrap gap-1 rounded-xl border border-zinc-200 bg-white p-1 dark:border-zinc-800 dark:bg-zinc-900"
      aria-label="Project workspace"
    >
      {LINKDEVELOPER_PROJECT_TABS.map((tab) => {
        const active = props.activeTab
          ? tab === props.activeTab
          : linkdeveloperProjectTabActive(tab, pathname);
        return (
          <Link
            key={tab}
            href={LINKDEVELOPER_CLIENT_ROUTES.project(props.productRunId, tab)}
            className={tabClass(active)}
          >
            {formatProjectTabLabel(tab)}
          </Link>
        );
      })}
    </nav>
  );
}
