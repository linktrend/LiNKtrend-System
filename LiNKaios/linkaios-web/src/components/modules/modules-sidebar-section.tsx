"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { ChevronDown, ChevronRight, Layers3 } from "lucide-react";

import { useModuleSubscriptions } from "@/hooks/use-module-subscriptions";
import { fixtureLicensedByModule, MODULES_CATALOG_DEMO } from "@/lib/ui-mocks/modules-catalog-demo";

function subLinkClass(active: boolean) {
  return (
    "block rounded-md py-1.5 pl-4 pr-2 text-xs font-medium transition-colors " +
    (active
      ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
      : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100")
  );
}

const subMenuRail = "ml-2 mt-0.5 border-l border-sky-500/35 pl-2 dark:border-sky-400/35";

const RESERVED_SUITE_SEGMENTS = new Set(["marketplace", "my-suites", "my-modules", "project-types", "linkapps"]);

function isSuiteProfilePath(pathname: string): boolean {
  const match = pathname.match(/^\/suites\/([^/?]+)/);
  if (!match) return false;
  return !RESERVED_SUITE_SEGMENTS.has(match[1]!);
}

export function ModulesSidebarSection() {
  const pathname = usePathname() ?? "/";
  const suitesPath = pathname.startsWith("/suites") || pathname.startsWith("/modules");
  const [open, setOpen] = useState(suitesPath);
  const fixtureLicensed = useMemo(() => fixtureLicensedByModule(), []);
  const { accessFor } = useModuleSubscriptions(fixtureLicensed);

  const ownedSuites = MODULES_CATALOG_DEMO.modules.filter((m) => {
    const access = accessFor(m.id);
    return access === "subscribed" || access === "preview";
  });

  useEffect(() => {
    if (suitesPath) setOpen(true);
  }, [suitesPath]);

  const marketplaceActive = pathname === "/suites/marketplace" || pathname === "/modules/marketplace";
  const mySuitesActive =
    pathname === "/suites/my-suites" ||
    pathname === "/modules/my-modules" ||
    pathname === "/suites" ||
    pathname === "/modules";

  return (
    <div className="mt-1">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={
          "flex w-full items-center justify-between gap-2 rounded-md px-3 py-2 text-left text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800 " +
          (suitesPath ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100" : "")
        }
        aria-expanded={open}
      >
        <span className="flex items-center gap-2">
          <Layers3 className="h-4 w-4 shrink-0 opacity-85" aria-hidden />
          Suites
        </span>
        {open ? <ChevronDown className="h-4 w-4 text-zinc-400" aria-hidden /> : <ChevronRight className="h-4 w-4 text-zinc-400" aria-hidden />}
      </button>
      {open ? (
        <div className={subMenuRail}>
          <Link href="/suites/marketplace" className={subLinkClass(marketplaceActive)}>
            Marketplace
          </Link>
          <Link href="/suites/my-suites" className={subLinkClass(mySuitesActive)}>
            My Suites
          </Link>
          {ownedSuites.map((suite) => {
            const profileActive =
              pathname === `/suites/${suite.id}` ||
              (pathname.startsWith(`/suites/${suite.id}?`) && isSuiteProfilePath(pathname));
            return (
              <Link key={suite.id} href={`/suites/${suite.id}`} className={subLinkClass(profileActive)}>
                {suite.name}
              </Link>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
