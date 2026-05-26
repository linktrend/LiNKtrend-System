"use client";

import Link from "next/link";
import { Package } from "lucide-react";

import { ModulePricingBlock } from "@/components/modules/module-pricing-block";
import {
  MODULE_CARD_DESCRIPTION,
  MODULE_CARD_FOOTER,
  MODULE_CARD_PRICING_ROW,
  MODULE_CARD_SHELL,
} from "@/components/modules/module-card-layout";
import { TitledCardHeader } from "@/components/titled-card-header";
import { suiteProfileHref } from "@/lib/suites-page-copy";
import type { ModuleCatalogueItem } from "@/lib/ui-mocks/modules-catalog-demo";
import { BUTTON } from "@/lib/ui-standards";

/** Compact black outline — pairs with {@link BUTTON.addRow} on marketplace cards. */
const moreInfoButton =
  "inline-flex min-h-8 shrink-0 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-100 px-3 py-1.5 text-xs font-semibold text-zinc-950 transition hover:bg-zinc-200 dark:border-zinc-200 dark:bg-zinc-900 dark:text-zinc-50 dark:hover:bg-zinc-800";

export function ModuleMarketplaceCard(props: { module: ModuleCatalogueItem; subscribed: boolean }) {
  const { module: mod } = props;

  return (
    <article className={MODULE_CARD_SHELL}>
      <TitledCardHeader icon={Package} title={mod.name} titleClassName="text-lg font-semibold text-zinc-900 dark:text-zinc-100" />

      <div className={MODULE_CARD_PRICING_ROW}>
        <ModulePricingBlock monthlyUsd={mod.priceMonthlyUsd} compact align="start" />
      </div>

      <p className={MODULE_CARD_DESCRIPTION}>{mod.marketingDescription}</p>

      <div className={MODULE_CARD_FOOTER}>
        <Link href={suiteProfileHref(mod.id, "overview")} className={moreInfoButton} title="More information">
          More info
        </Link>
        {!props.subscribed ? (
          <>
            <Link
              href={suiteProfileHref(mod.id, "preview")}
              className={BUTTON.editCompact}
              title="30-day free preview"
            >
              Preview
            </Link>
            <Link href={suiteProfileHref(mod.id, "subscribe")} className={BUTTON.approveCompact}>
              Subscribe
            </Link>
          </>
        ) : (
          <Link href={suiteProfileHref(mod.id, "overview")} className={BUTTON.approveCompact}>
            Open suite
          </Link>
        )}
      </div>
    </article>
  );
}
