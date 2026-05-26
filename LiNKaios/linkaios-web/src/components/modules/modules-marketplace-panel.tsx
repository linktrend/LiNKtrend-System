"use client";

import Link from "next/link";
import { useMemo } from "react";

import { ModuleMarketplaceCard } from "@/components/modules/module-marketplace-card";
import { useModuleSubscriptions } from "@/hooks/use-module-subscriptions";
import { fixtureLicensedByModule, publishedMarketplaceModules } from "@/lib/ui-mocks/modules-catalog-demo";

export function ModulesMarketplacePanel() {
  const fixtureLicensed = useMemo(() => fixtureLicensedByModule(), []);
  const { accessFor } = useModuleSubscriptions(fixtureLicensed);

  const marketplace = publishedMarketplaceModules().filter((m) => {
    const access = accessFor(m.id);
    return access === "none";
  });

  if (marketplace.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50/80 p-6 text-sm text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900/40 dark:text-zinc-400">
        All published suites are already in My Suites.{" "}
        <Link href="/suites/my-suites" className="font-medium text-zinc-800 underline-offset-2 hover:underline dark:text-zinc-200">
          Open My Suites
        </Link>
      </p>
    );
  }

  return (
    <div className="grid items-stretch gap-4 md:grid-cols-2 xl:grid-cols-3">
      {marketplace.map((mod) => (
        <ModuleMarketplaceCard key={mod.id} module={mod} subscribed={false} />
      ))}
    </div>
  );
}
