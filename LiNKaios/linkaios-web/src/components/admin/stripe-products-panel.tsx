"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { ExternalLink, Layers3, Plus, RefreshCw } from "lucide-react";

import { StripeOpenModal } from "@/components/admin/stripe-open-modal";
import {
  DataTable,
  DataTableBody,
  DataTableHead,
  DataTableRow,
  DataTableShell,
  DT,
} from "@/components/data-table";
import { StatusPill } from "@/components/ui/status-pill";
import { useLicensorSuiteStore } from "@/hooks/use-licensor-suite-store";
import { formatBillingFrequency, formatStripeAmount } from "@/lib/admin/stripe/format";
import type { StripeProductRow, StripeRecurringInterval } from "@/lib/admin/stripe/types";
import { LICENSOR_SUITE_PRODUCTS } from "@/lib/licensor-suite-catalog";
import { BUTTON, FIELD, FORM, formatUiLabel } from "@/lib/ui-standards";

type CatalogResponse = {
  ok: boolean;
  configured: boolean;
  products: StripeProductRow[];
  dashboardMode: "test" | "live";
  error?: string;
};

const INTERVAL_OPTIONS: { value: StripeRecurringInterval; label: string }[] = [
  { value: "month", label: "Monthly" },
  { value: "year", label: "Annual" },
  { value: "week", label: "Weekly" },
  { value: "day", label: "Daily" },
];

export function StripeProductsPanel() {
  const { products: suiteProducts, linkStripeProduct } = useLicensorSuiteStore();
  const [catalog, setCatalog] = useState<CatalogResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [productName, setProductName] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [productSuiteId, setProductSuiteId] = useState("");

  const [priceProductId, setPriceProductId] = useState("");
  const [priceAmount, setPriceAmount] = useState("");
  const [priceCurrency, setPriceCurrency] = useState("usd");
  const [priceType, setPriceType] = useState<"recurring" | "one_time">("recurring");
  const [priceInterval, setPriceInterval] = useState<StripeRecurringInterval>("month");

  const [stripeModal, setStripeModal] = useState<{ productId: string; name: string } | null>(null);

  const suiteOptions = useMemo(
    () => suiteProducts.length > 0 ? suiteProducts : LICENSOR_SUITE_PRODUCTS,
    [suiteProducts],
  );

  const loadCatalog = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/stripe/products", { cache: "no-store" });
      const json = (await res.json()) as CatalogResponse & { error?: string };
      if (!res.ok) {
        setError(json.error ?? "Failed to load Stripe catalog.");
        setCatalog(null);
        return;
      }
      setCatalog(json);
      if (json.products.length > 0 && !priceProductId) {
        setPriceProductId(json.products[0]!.id);
      }
    } catch {
      setError("Network error loading Stripe catalog.");
    } finally {
      setLoading(false);
    }
  }, [priceProductId]);

  useEffect(() => {
    void loadCatalog();
  }, [loadCatalog]);

  const onCreateProduct = async (event: FormEvent) => {
    event.preventDefault();
    if (!productName.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/stripe/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: productName.trim(),
          description: productDescription.trim() || undefined,
          suiteId: productSuiteId || undefined,
        }),
      });
      const json = (await res.json()) as { error?: string; product?: StripeProductRow };
      if (!res.ok) {
        setError(json.error ?? "Create product failed.");
        return;
      }
      if (json.product?.suiteId) {
        linkStripeProduct(json.product.suiteId, json.product.id);
      }
      setProductName("");
      setProductDescription("");
      setProductSuiteId("");
      await loadCatalog();
    } finally {
      setBusy(false);
    }
  };

  const onCreatePrice = async (event: FormEvent) => {
    event.preventDefault();
    const amount = Number(priceAmount);
    if (!priceProductId || !Number.isFinite(amount) || amount <= 0) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/stripe/prices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: priceProductId,
          amount,
          currency: priceCurrency,
          type: priceType,
          recurringInterval: priceType === "recurring" ? priceInterval : undefined,
        }),
      });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(json.error ?? "Create price failed.");
        return;
      }
      setPriceAmount("");
      await loadCatalog();
    } finally {
      setBusy(false);
    }
  };

  const onLinkSuite = async (suiteId: string, stripeProductId: string) => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/stripe/linkage", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ suiteId, stripeProductId }),
      });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(json.error ?? "Link suite failed.");
        return;
      }
      linkStripeProduct(suiteId, stripeProductId);
      await loadCatalog();
    } finally {
      setBusy(false);
    }
  };

  const onArchive = async (productId: string) => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/stripe/products/${encodeURIComponent(productId)}`, {
        method: "POST",
      });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(json.error ?? "Archive failed.");
        return;
      }
      await loadCatalog();
    } finally {
      setBusy(false);
    }
  };

  const configured = catalog?.configured ?? false;
  const dashboardMode = catalog?.dashboardMode ?? "test";
  const stripeProducts = catalog?.products ?? [];

  return (
    <div className="space-y-6">
      {!configured && !loading ? (
        <div
          className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/35 dark:text-amber-50"
          role="status"
        >
          <p className="font-semibold">Stripe not configured</p>
          <p className="mt-1">
            Set <code className="text-xs">LINKTREND_AIOS_PROD_STRIPE_SECRET_KEY</code> or{" "}
            <code className="text-xs">STRIPE_SECRET_KEY</code> to load and manage catalog via API.
          </p>
        </div>
      ) : null}

      {error ? (
        <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-100">
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          className={`${BUTTON.secondaryCardAction} inline-flex items-center gap-1.5`}
          onClick={() => void loadCatalog()}
          disabled={loading || busy}
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} aria-hidden />
          Refresh catalog
        </button>
        {configured ? (
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            Mode · {dashboardMode === "test" ? "Stripe test" : "Stripe live"}
          </span>
        ) : null}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <form
          onSubmit={onCreateProduct}
          className="space-y-3 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950"
        >
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Create product</h2>
          <label className={FORM.fieldStack}>
            <span className={FIELD.label}>Name</span>
            <input
              className={FIELD.controlFull}
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              required
              disabled={!configured || busy}
            />
          </label>
          <label className={FORM.fieldStack}>
            <span className={FIELD.label}>Description</span>
            <textarea
              className={FIELD.textareaFull}
              rows={2}
              value={productDescription}
              onChange={(e) => setProductDescription(e.target.value)}
              disabled={!configured || busy}
            />
          </label>
          <label className={FORM.fieldStack}>
            <span className={FIELD.label}>Link to suite (optional)</span>
            <select
              className={FIELD.selectFull}
              value={productSuiteId}
              onChange={(e) => setProductSuiteId(e.target.value)}
              disabled={!configured || busy}
            >
              <option value="">— None —</option>
              {suiteOptions.map((suite) => (
                <option key={suite.id} value={suite.id}>
                  {suite.name}
                </option>
              ))}
            </select>
          </label>
          <button type="submit" className={BUTTON.primaryRow} disabled={!configured || busy}>
            <Plus className="mr-1 inline h-3.5 w-3.5" aria-hidden />
            Create product
          </button>
        </form>

        <form
          onSubmit={onCreatePrice}
          className="space-y-3 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950"
        >
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Create price</h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Prices are immutable in Stripe — changing amount requires a new price row.
          </p>
          <label className={FORM.fieldStack}>
            <span className={FIELD.label}>Product</span>
            <select
              className={FIELD.selectFull}
              value={priceProductId}
              onChange={(e) => setPriceProductId(e.target.value)}
              disabled={!configured || busy || stripeProducts.length === 0}
            >
              {stripeProducts.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.id})
                </option>
              ))}
            </select>
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className={FORM.fieldStack}>
              <span className={FIELD.label}>Amount</span>
              <input
                type="number"
                min="0.01"
                step="0.01"
                className={FIELD.controlFull}
                value={priceAmount}
                onChange={(e) => setPriceAmount(e.target.value)}
                placeholder="29.00"
                required
                disabled={!configured || busy}
              />
            </label>
            <label className={FORM.fieldStack}>
              <span className={FIELD.label}>Currency</span>
              <input
                className={FIELD.controlFull}
                value={priceCurrency}
                onChange={(e) => setPriceCurrency(e.target.value)}
                disabled={!configured || busy}
              />
            </label>
          </div>
          <label className={FORM.fieldStack}>
            <span className={FIELD.label}>Billing type</span>
            <select
              className={FIELD.selectFull}
              value={priceType}
              onChange={(e) => setPriceType(e.target.value as "recurring" | "one_time")}
              disabled={!configured || busy}
            >
              <option value="recurring">Recurring subscription</option>
              <option value="one_time">One-time</option>
            </select>
          </label>
          {priceType === "recurring" ? (
            <label className={FORM.fieldStack}>
              <span className={FIELD.label}>Interval</span>
              <select
                className={FIELD.selectFull}
                value={priceInterval}
                onChange={(e) => setPriceInterval(e.target.value as StripeRecurringInterval)}
                disabled={!configured || busy}
              >
                {INTERVAL_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
          <button type="submit" className={BUTTON.primaryRow} disabled={!configured || busy}>
            <Plus className="mr-1 inline h-3.5 w-3.5" aria-hidden />
            Create price
          </button>
        </form>
      </div>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Stripe catalog</h2>
        <DataTableShell>
          <DataTable>
            <colgroup>
              <col className="w-[22%]" />
              <col className="w-[18%]" />
              <col className="w-[28%]" />
              <col className="w-[12%]" />
              <col className="w-[20%]" />
            </colgroup>
            <DataTableHead>
              <tr>
                <th className={DT.thTextInset}>Product</th>
                <th className={DT.thTextInset}>Suite link</th>
                <th className={DT.thTextInset}>Prices</th>
                <th className={DT.thTextInset}>Status</th>
                <th className={DT.thTextInset}>Actions</th>
              </tr>
            </DataTableHead>
            <DataTableBody>
              {loading ? (
                <DataTableRow>
                  <td colSpan={5} className={`${DT.tdClipInset} py-8 text-center text-sm text-zinc-500`}>
                    Loading Stripe catalog…
                  </td>
                </DataTableRow>
              ) : stripeProducts.length === 0 ? (
                <DataTableRow>
                  <td colSpan={5} className={`${DT.tdClipInset} py-8 text-center text-sm text-zinc-500`}>
                    {configured ? "No products yet — create one above." : "Configure Stripe secret to sync catalog."}
                  </td>
                </DataTableRow>
              ) : (
                stripeProducts.map((product) => (
                  <DataTableRow key={product.id}>
                    <td className={DT.tdClipInset}>
                      <p className={`${DT.tdTextSpan} font-medium`}>{product.name}</p>
                      <p className="mt-0.5 font-mono text-xs text-zinc-500">{product.id}</p>
                    </td>
                    <td className={DT.tdClipInset}>
                      <select
                        className={FIELD.selectCompact}
                        value={product.suiteId ?? ""}
                        onChange={(e) => {
                          const suiteId = e.target.value;
                          if (suiteId) void onLinkSuite(suiteId, product.id);
                        }}
                        disabled={!configured || busy}
                      >
                        <option value="">{formatUiLabel("Not linked")}</option>
                        {suiteOptions.map((suite) => (
                          <option key={suite.id} value={suite.id}>
                            {suite.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className={DT.tdClipInset}>
                      {product.prices.length === 0 ? (
                        <span className={`${DT.tdTextSpan} text-zinc-500`}>No prices</span>
                      ) : (
                        <ul className="space-y-1 text-xs">
                          {product.prices.map((price) => (
                            <li key={price.id} className="text-zinc-700 dark:text-zinc-300">
                              {formatStripeAmount(price.unitAmount, price.currency)} ·{" "}
                              {formatBillingFrequency(price)}
                              {!price.active ? " (inactive)" : ""}
                            </li>
                          ))}
                        </ul>
                      )}
                    </td>
                    <td className={DT.tdClipInset}>
                      <StatusPill
                        label={product.active ? "Active" : "Archived"}
                        tone={product.active ? "success" : "neutral"}
                      />
                    </td>
                    <td className={DT.tdClipInset}>
                      <div className="flex flex-wrap gap-1.5">
                        <button
                          type="button"
                          className={`${BUTTON.secondaryCardAction} !px-2 !py-1 text-xs inline-flex items-center gap-1`}
                          onClick={() => setStripeModal({ productId: product.id, name: product.name })}
                        >
                          <ExternalLink className="h-3 w-3" aria-hidden />
                          Stripe
                        </button>
                        {product.active ? (
                          <button
                            type="button"
                            className={`${BUTTON.secondaryCardAction} !px-2 !py-1 text-xs`}
                            onClick={() => void onArchive(product.id)}
                            disabled={busy}
                          >
                            Archive
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </DataTableRow>
                ))
              )}
            </DataTableBody>
          </DataTable>
        </DataTableShell>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Local suite mappings</h2>
        <DataTableShell>
          <DataTable>
            <colgroup>
              <col className="w-[40%]" />
              <col className="w-[40%]" />
              <col className="w-[20%]" />
            </colgroup>
            <DataTableHead>
              <tr>
                <th className={DT.thTextInset}>Suite</th>
                <th className={DT.thTextInset}>Stripe product ID</th>
                <th className={DT.thTextInset}>Marketplace</th>
              </tr>
            </DataTableHead>
            <DataTableBody>
              {suiteOptions.map((suite) => (
                <DataTableRow key={suite.id}>
                  <td className={DT.tdClipInset}>
                    <div className="flex items-center gap-2">
                      <Layers3 className="h-4 w-4 shrink-0 text-zinc-500" aria-hidden />
                      <span className={`${DT.tdTextSpan} font-medium`}>{suite.name}</span>
                    </div>
                  </td>
                  <td className={DT.tdClipInset}>
                    <span className={`${DT.tdTextSpan} font-mono text-xs`}>
                      {suite.stripeProductId ?? formatUiLabel("Not linked")}
                    </span>
                  </td>
                  <td className={DT.tdClipInset}>
                    <StatusPill
                      label={suite.publishState === "published" ? "Listed" : "Not listed"}
                      tone={suite.publishState === "published" ? "success" : "neutral"}
                    />
                  </td>
                </DataTableRow>
              ))}
            </DataTableBody>
          </DataTable>
        </DataTableShell>
      </section>

      <StripeOpenModal
        open={stripeModal !== null}
        onClose={() => setStripeModal(null)}
        productId={stripeModal?.productId ?? null}
        productName={stripeModal?.name ?? ""}
        dashboardMode={dashboardMode}
      />
    </div>
  );
}
