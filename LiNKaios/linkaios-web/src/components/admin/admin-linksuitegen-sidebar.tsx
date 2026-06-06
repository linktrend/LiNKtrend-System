"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Factory } from "lucide-react";

import { useAppSurface } from "@/components/app-surface-provider";

function subLinkClass(active: boolean) {
  return (
    "block rounded-md py-1.5 pl-4 pr-2 text-xs font-medium transition-colors " +
    (active
      ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
      : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100")
  );
}

/** Admin-only LiNKsuitegen nav (Wave 6.3). */
export function AdminLinksuitegenSidebarLink() {
  const pathname = usePathname() ?? "/";
  const { href: appHref, routePath } = useAppSurface();
  const route = routePath(pathname);
  const active = route.startsWith("/admin/linksuitegen");

  return (
    <Link href={appHref("/admin/linksuitegen")} className={subLinkClass(active)}>
      <span className="inline-flex items-center gap-1.5">
        <Factory className="h-3 w-3" aria-hidden />
        LiNKsuitegen
      </span>
    </Link>
  );
}
