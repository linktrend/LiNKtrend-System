"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { ModulePricingBlock } from "@/components/modules/module-pricing-block";
import { moduleProfileHref } from "@/lib/modules-page-copy";
import type { ModuleCatalogueItem } from "@/lib/ui-mocks/modules-catalog-demo";
import { BUTTON } from "@/lib/ui-standards";

export function ModuleCheckoutPanel(props: {
  module: ModuleCatalogueItem;
  mode: "preview" | "subscribe";
  onPreview: () => void;
  onSubscribe: () => void;
}) {
  const router = useRouter();
  const [step, setStep] = useState<"confirm" | "done">("confirm");
  const [busy, setBusy] = useState(false);

  const isPreview = props.mode === "preview";

  async function handleActivate() {
    setBusy(true);
    await new Promise((r) => setTimeout(r, 600));
    if (isPreview) props.onPreview();
    else props.onSubscribe();
    setStep("done");
    setBusy(false);
  }

  if (step === "done") {
    return (
      <section className="rounded-xl border border-emerald-200 bg-emerald-50/80 p-6 dark:border-emerald-900/50 dark:bg-emerald-950/30">
        <h3 className="text-base font-semibold text-emerald-900 dark:text-emerald-100">
          {isPreview ? "Preview activated" : "Subscription activated"}
        </h3>
        <p className="mt-2 text-sm text-emerald-800 dark:text-emerald-200">
          {isPreview
            ? `${props.module.name} is available on a free 30-day preview. Operational tabs are unlocked — start a project when ready.`
            : `${props.module.name} is now subscribed (demo checkout). Billing authorisation was recorded locally for MVO proof.`}
        </p>
        <Link href={moduleProfileHref(props.module.id, "overview")} className={`${BUTTON.primaryCompact} mt-4 inline-flex`}>
          Open module
        </Link>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-lg space-y-6 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <div>
        <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
          {isPreview ? "Free 30-day preview" : "Subscribe to module"}
        </h3>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Demo checkout — no real Stripe charge. Confirms module activation for MVO proof.
        </p>
      </div>

      <dl className="space-y-3 text-sm">
        <div className="flex justify-between gap-4 border-b border-zinc-100 pb-2 dark:border-zinc-800">
          <dt className="text-zinc-500">Module</dt>
          <dd className="font-medium text-zinc-900 dark:text-zinc-100">{props.module.name}</dd>
        </div>
        <div className="border-b border-zinc-100 pb-2 dark:border-zinc-800">
          <dt className="mb-2 text-zinc-500">Plan</dt>
          <dd>
            {isPreview ? (
              <span className="font-medium text-zinc-900 dark:text-zinc-100">Preview · 30 days</span>
            ) : (
              <ModulePricingBlock monthlyUsd={props.module.priceMonthlyUsd} />
            )}
          </dd>
        </div>
        {!isPreview ? (
          <div className="flex justify-between gap-4">
            <dt className="text-zinc-500">Payment</dt>
            <dd className="font-medium text-zinc-900 dark:text-zinc-100">Demo authorisation</dd>
          </div>
        ) : null}
      </dl>

      <div className="flex flex-wrap gap-2">
        <button type="button" disabled={busy} onClick={handleActivate} className={BUTTON.primaryCompact}>
          {busy ? "Processing…" : isPreview ? "Activate preview" : "Authorize & subscribe"}
        </button>
        <button type="button" onClick={() => router.push(moduleProfileHref(props.module.id, "overview"))} className={BUTTON.secondaryCompact}>
          Cancel
        </button>
      </div>
    </section>
  );
}
