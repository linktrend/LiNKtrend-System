import Link from "next/link";

import { ShellPageHeaderClient } from "@/components/shell-page-header-client";
import { LINKDEVELOPER_CLIENT_ROUTES } from "@/lib/client/linkdeveloper/routes";

export const dynamic = "force-dynamic";

export default function LinkdeveloperClientDashboardPage() {
  return (
    <main className="space-y-8">
      <ShellPageHeaderClient
        title="LiNKdeveloper"
        subtitle="Client factory — product runs, steward conversation, and governed launch."
      />

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { label: "New project", href: `${LINKDEVELOPER_CLIENT_ROUTES.projects}/new` },
          { label: "Active projects", href: LINKDEVELOPER_CLIENT_ROUTES.projects },
          { label: "Needs approval", href: `${LINKDEVELOPER_CLIENT_ROUTES.projects}?filter=approval` },
        ].map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="rounded-xl border border-zinc-200 p-4 text-sm font-medium text-zinc-900 hover:border-sky-400 dark:border-zinc-800 dark:text-zinc-100"
          >
            {item.label}
          </Link>
        ))}
      </section>
    </main>
  );
}
