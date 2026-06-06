"use client";

import { useCallback, useEffect, useState } from "react";

import type { MarketplaceCatalogueItem } from "@/lib/kernel/marketplace/catalogue";
import { isUiMocksEnabled } from "@/lib/ui-mocks/flags";
import { MODULES_CATALOG_DEMO, publishedMarketplaceModules } from "@/lib/ui-mocks/modules-catalog-demo";

export function useMarketplaceCatalogue(tenantSlug?: string | null) {
  const [items, setItems] = useState<MarketplaceCatalogueItem[]>([]);
  const [loading, setLoading] = useState(!isUiMocksEnabled());
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (isUiMocksEnabled()) {
      const demo = publishedMarketplaceModules();
      setItems(
        demo.map((m) => ({
          id: m.id,
          name: m.name,
          summary: m.summary,
          published: m.published,
          version: "demo",
          suiteFamily: null,
          source: "builtin" as const,
          priceMonthlyUsd: m.priceMonthlyUsd,
          stripeMode: "shadow" as const,
        })),
      );
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const qs = tenantSlug ? `?tenant_slug=${encodeURIComponent(tenantSlug)}` : "";
      const res = await fetch(`/api/kernel/marketplace/catalogue${qs}`);
      const json = (await res.json()) as {
        ok?: boolean;
        items?: MarketplaceCatalogueItem[];
        error?: string;
      };
      if (!res.ok || !json.ok) {
        throw new Error(json.error ?? "catalogue fetch failed");
      }
      setItems(json.items ?? []);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [tenantSlug]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { items, loading, error, reload, demoFallback: MODULES_CATALOG_DEMO };
}
