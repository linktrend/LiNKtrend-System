"use client";

import Link from "next/link";
import { useMemo } from "react";

import { ModuleMarketplaceCard } from "@/components/suites/module-marketplace-card";
import { useMarketplaceCatalogue } from "@/hooks/use-marketplace-catalogue";
import { useModuleSubscriptions } from "@/hooks/use-module-subscriptions";
import {
  fixtureLicensedByModule,
  type ModuleCatalogueItem,
  publishedMarketplaceModules,
} from "@/lib/ui-mocks/modules-catalog-demo";

function catalogueItemToCard(item: {
  id: string;
  name: string;
  summary: string;
  published: boolean;
  priceMonthlyUsd: number | null;
}): ModuleCatalogueItem {
  return {
    id: item.id,
    name: item.name,
    summary: item.summary,
    published: item.published,
    clientLicensed: false,
    vendorOwner: "LiNKtrend",
    marketingDescription: item.summary,
    audienceWho: "Licensees on LiNKaios Client",
    priceMonthlyUsd: item.priceMonthlyUsd ?? 0,
    linkbotCount: 0,
    automationCount: 0,
    capabilityCount: 0,
    outputTypeCount: 0,
    sideEffectCount: 0,
  };
}

export function ModulesMarketplacePanel() {
  const fixtureLicensed = useMemo(() => fixtureLicensedByModule(), []);
  const { accessFor } = useModuleSubscriptions(fixtureLicensed);
  const { items: catalogueItems, loading, error } = useMarketplaceCatalogue();

  const marketplace = useMemo(() => {
    const source =
      catalogueItems.length > 0
        ? catalogueItems.map(catalogueItemToCard)
        : publishedMarketplaceModules();
    return source.filter((m) => accessFor(m.id) === "none");
  }, [accessFor, catalogueItems]);

  if (loading) {
    return (
      <p className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50/80 p-6 text-sm text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900/40 dark:text-zinc-400">
        Loading marketplace catalogue…
      </p>
    );
  }

  if (error) {
    return (
      <p className="rounded-xl border border-amber-300 bg-amber-50 p-6 text-sm text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-50">
        Marketplace catalogue unavailable: {error}
      </p>
    );
  }

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
