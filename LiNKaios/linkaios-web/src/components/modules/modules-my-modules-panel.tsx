"use client";

import Link from "next/link";
import { useMemo } from "react";

import { ModuleOwnedCard } from "@/components/modules/module-owned-card";
import type { ModuleSubscriptionMode } from "@/hooks/use-module-subscriptions";
import { useModuleSubscriptions } from "@/hooks/use-module-subscriptions";
import { fixtureLicensedByModule, MODULES_CATALOG_DEMO } from "@/lib/ui-mocks/modules-catalog-demo";

const MY_MODULES_ACCESS_ORDER: Record<ModuleSubscriptionMode, number> = {
  subscribed: 0,
  preview: 1,
  expired: 2,
  cancelled: 3,
  none: 99,
};

export function ModulesMyModulesPanel() {
  const fixtureLicensed = useMemo(() => fixtureLicensedByModule(), []);
  const { accessFor } = useModuleSubscriptions(fixtureLicensed);

  const owned = MODULES_CATALOG_DEMO.modules
    .filter((m) => {
      const access = accessFor(m.id);
      return access === "subscribed" || access === "preview" || access === "expired" || access === "cancelled";
    })
    .sort((a, b) => MY_MODULES_ACCESS_ORDER[accessFor(a.id)] - MY_MODULES_ACCESS_ORDER[accessFor(b.id)]);

  if (owned.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50/80 p-6 text-sm text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900/40 dark:text-zinc-400">
        No suites yet.{" "}
        <Link href="/suites/marketplace" className="font-medium text-zinc-800 underline-offset-2 hover:underline dark:text-zinc-200">
          Browse marketplace
        </Link>
      </p>
    );
  }

  return (
    <div className="grid items-stretch gap-4 md:grid-cols-2 xl:grid-cols-3">
      {owned.map((mod) => (
        <ModuleOwnedCard key={mod.id} module={mod} access={accessFor(mod.id)} />
      ))}
    </div>
  );
}
