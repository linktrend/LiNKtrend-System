"use client";

import Link from "next/link";
import { Package } from "lucide-react";

import {
  MODULE_CARD_DESCRIPTION,
  MODULE_CARD_FOOTER,
  MODULE_CARD_PRICING_ROW,
  MODULE_CARD_SHELL,
} from "@/components/modules/module-card-layout";
import { TitledCardHeader } from "@/components/titled-card-header";
import { DomainStatusPill } from "@/components/ui/status-pill";
import type { ModuleSubscriptionMode } from "@/hooks/use-module-subscriptions";
import { suiteProfileHref } from "@/lib/suites-page-copy";
import type { ModuleCatalogueItem } from "@/lib/ui-mocks/modules-catalog-demo";
import { BUTTON } from "@/lib/ui-standards";

const MODULE_OWNED_PILL_LABELS = ["Subscribed", "Preview", "Expired", "Cancelled"] as const;

function pillStatusForAccess(access: ModuleSubscriptionMode): "licensed" | "preview" | "expired" | "cancelled" {
  if (access === "subscribed") return "licensed";
  if (access === "preview") return "preview";
  if (access === "expired") return "expired";
  return "cancelled";
}

function ModuleOwnedCardBody(props: { module: ModuleCatalogueItem; access: ModuleSubscriptionMode }) {
  const { module: mod, access } = props;
  const pillStatus = pillStatusForAccess(access);
  const showSubscribe = access === "preview" || access === "expired" || access === "cancelled";

  return (
    <>
      <div className="flex items-start justify-between gap-3">
        <TitledCardHeader
          icon={Package}
          title={mod.name}
          titleClassName="text-lg font-semibold text-zinc-900 dark:text-zinc-100"
        />
        <DomainStatusPill domain="module" status={pillStatus} equalWidthLabels={MODULE_OWNED_PILL_LABELS} />
      </div>

      <div className={MODULE_CARD_PRICING_ROW} aria-hidden />

      <p className={MODULE_CARD_DESCRIPTION}>{mod.marketingDescription}</p>

      <div className={MODULE_CARD_FOOTER}>
        {showSubscribe ? (
          <Link href={suiteProfileHref(mod.id, "subscribe")} className={BUTTON.approveCompact}>
            Subscribe
          </Link>
        ) : null}
      </div>
    </>
  );
}

export function ModuleOwnedCard(props: { module: ModuleCatalogueItem; access: ModuleSubscriptionMode }) {
  const { module: mod, access } = props;
  const isSubscribed = access === "subscribed";

  if (isSubscribed) {
    return (
      <Link
        href={suiteProfileHref(mod.id, "overview")}
        className={`${MODULE_CARD_SHELL} transition hover:border-zinc-400 hover:shadow-md dark:hover:border-zinc-600`}
      >
        <ModuleOwnedCardBody module={mod} access={access} />
      </Link>
    );
  }

  return (
    <article className={MODULE_CARD_SHELL}>
      <ModuleOwnedCardBody module={mod} access={access} />
    </article>
  );
}
