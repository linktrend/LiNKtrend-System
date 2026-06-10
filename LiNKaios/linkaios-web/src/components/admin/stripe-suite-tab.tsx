"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { ExternalLink, Plus } from "lucide-react";

import { StripeOpenModal } from "@/components/admin/stripe-open-modal";
import { useAppSurface } from "@/components/app-surface-provider";
import { useLicensorSuiteStore } from "@/hooks/use-licensor-suite-store";
import type { StripeProductRow } from "@/lib/admin/stripe/types";
import { BUTTON, FIELD, FORM } from "@/lib/ui-standards";

type CatalogResponse = {
  ok: boolean;
  configured: boolean;
  products: StripeProductRow[];
  dashboardMode: "test" | "live";
};

export function StripeSuiteTab(props: { suiteId: string; suiteName: string }) {
  const { href: appHref } = useAppSurface();
  const { getSuite, linkStripeProduct } = useLicensorSuiteStore();
  const suite = getSuite(props.suiteId);

  const [catalog, setCatalog] = useState<CatalogResponse | null>(null);
  const [selectedProductId, setSelectedProductId] = useState(suite?.stripeProductId ?? "");
  const [createName, setCreateName] = useState(props.suiteName);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stripeModalOpen, setStripeModalOpen] = useState(false);

  useEffect(() => {
    setSelectedProductId(suite?.stripeProductId ?? "");
  }, [suite?.stripeProductId]);

  const loadCatalog = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/stripe/products", { cache: "no-store" });
      const json = (await res.json()) as CatalogResponse;
      if (res.ok) setCatalog(json);
    } catch {
      /* non-blocking */
    }
  }, []);

  useEffect(() => {
    void loadCatalog();
  }, [loadCatalog]);

  if (!suite) return null;

  const configured = catalog?.configured ?? false;
  const products = catalog?.products ?? [];
  const dashboardMode = catalog?.dashboardMode ?? "test";

  const onLinkExisting = async (event: FormEvent) => {
    event.preventDefault();
    const productId = selectedProductId.trim();
    if (!productId) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/stripe/linkage", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ suiteId: suite.id, stripeProductId: productId }),
      });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(json.error ?? "Failed to link product.");
        return;
      }
      linkStripeProduct(suite.id, productId);
      await loadCatalog();
    } finally {
      setBusy(false);
    }
  };

  const onCreateAndLink = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/stripe/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: createName.trim() || suite.name,
          description: suite.summary,
          suiteId: suite.id,
        }),
      });
      const json = (await res.json()) as { error?: string; product?: StripeProductRow };
      if (!res.ok) {
        setError(json.error ?? "Create product failed.");
        return;
      }
      if (json.product) {
        linkStripeProduct(suite.id, json.product.id);
        setSelectedProductId(json.product.id);
      }
      await loadCatalog();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Link a Stripe product before publishing to the licensee Marketplace. Create catalog entries here or on the{" "}
        <Link href={appHref("/suites/billing")} className="font-medium text-violet-700 underline dark:text-violet-300">
          Stripe products
        </Link>{" "}
        screen — suite linkage syncs via product metadata and local store.
      </p>

      {!configured ? (
        <div className="rounded-lg border border-dashed border-zinc-300 px-4 py-3 text-sm text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
          Stripe API not configured — save a manual product ID below, or set{" "}
          <code className="text-xs">STRIPE_SECRET_KEY</code> for full catalog sync.
        </div>
      ) : null}

      {error ? (
        <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-100">
          {error}
        </p>
      ) : null}

      {configured ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <form
            onSubmit={onLinkExisting}
            className="space-y-3 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950"
          >
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Link existing product</h3>
            <label className={FORM.fieldStack}>
              <span className={FIELD.label}>Stripe product</span>
              <select
                className={FIELD.selectFull}
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                disabled={busy}
              >
                <option value="">— Select —</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.id})
                  </option>
                ))}
              </select>
            </label>
            <button type="submit" className={BUTTON.primaryRow} disabled={busy || !selectedProductId}>
              Save linkage
            </button>
          </form>

          <div className="space-y-3 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Create product for this suite</h3>
            <label className={FORM.fieldStack}>
              <span className={FIELD.label}>Product name</span>
              <input
                className={FIELD.controlFull}
                value={createName}
                onChange={(e) => setCreateName(e.target.value)}
                disabled={busy}
              />
            </label>
            <button type="button" className={BUTTON.primaryRow} onClick={() => void onCreateAndLink()} disabled={busy}>
              <Plus className="mr-1 inline h-3.5 w-3.5" aria-hidden />
              Create &amp; link
            </button>
          </div>
        </div>
      ) : null}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          linkStripeProduct(suite.id, selectedProductId.trim() || null);
        }}
        className="max-w-xl space-y-3 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950"
      >
        <label className={FORM.fieldStack}>
          <span className={FIELD.label}>Stripe product ID</span>
          <input
            value={selectedProductId}
            onChange={(e) => setSelectedProductId(e.target.value)}
            className={FIELD.controlFull}
            placeholder="prod_…"
          />
        </label>
        <div className="flex flex-wrap gap-2">
          <button type="submit" className={BUTTON.primaryRow}>
            Save mapping
          </button>
          {suite.stripeProductId ? (
            <button
              type="button"
              className={`${BUTTON.secondaryCardAction} inline-flex items-center gap-1.5`}
              onClick={() => setStripeModalOpen(true)}
            >
              <ExternalLink className="h-3.5 w-3.5" aria-hidden />
              Open in Stripe
            </button>
          ) : null}
          <Link href={appHref("/suites/billing")} className={BUTTON.secondaryCardAction}>
            Stripe products overview
          </Link>
        </div>
      </form>

      {suite.stripeProductId ? (
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Current mapping · <code className="font-mono">{suite.stripeProductId}</code>
        </p>
      ) : (
        <p className="text-xs text-amber-700 dark:text-amber-300">
          Not linked — publish stays disabled until a product ID is saved.
        </p>
      )}

      <StripeOpenModal
        open={stripeModalOpen}
        onClose={() => setStripeModalOpen(false)}
        productId={suite.stripeProductId}
        productName={suite.name}
        dashboardMode={dashboardMode}
      />
    </div>
  );
}
