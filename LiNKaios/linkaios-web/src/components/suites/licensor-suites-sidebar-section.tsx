"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { ChevronDown, ChevronRight, Layers3 } from "lucide-react";

import { AdminLinksuitegenSidebarLink } from "@/components/admin/admin-linksuitegen-sidebar";
import { useAppSurface } from "@/components/app-surface-provider";

function subLinkClass(active: boolean) {
  return (
    "block rounded-md py-1.5 pl-4 pr-2 text-xs font-medium transition-colors " +
    (active
      ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
      : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100")
  );
}

const subMenuRail = "ml-2 mt-0.5 border-l border-sky-500/35 pl-2 dark:border-sky-400/35";

/** Licensor suite product builder — not tenant subscriptions. */
export function LicensorSuitesSidebarSection() {
  const pathname = usePathname() ?? "/";
  const { href: appHref, routePath } = useAppSurface();
  const route = routePath(pathname);
  const suitesPath =
    route.startsWith("/suites") || route.startsWith("/modules") || route.startsWith("/linksuitegen");
  const [open, setOpen] = useState(suitesPath);

  useEffect(() => {
    if (suitesPath) setOpen(true);
  }, [suitesPath]);

  const allSuitesActive =
    route === "/suites" ||
    route === "/suites/" ||
    (route.startsWith("/suites/") && !route.startsWith("/suites/billing"));
  const billingActive = route === "/suites/billing";

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
          <Link href={appHref("/suites")} className={subLinkClass(allSuitesActive && !billingActive)}>
            All suites
          </Link>
          <Link href={appHref("/suites/billing")} className={subLinkClass(billingActive)}>
            Stripe products
          </Link>
          <AdminLinksuitegenSidebarLink />
        </div>
      ) : null}
    </div>
  );
}
