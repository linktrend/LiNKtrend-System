"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useId, useMemo, useState } from "react";
import { CreditCard, FileText, Layers, Receipt, Sparkles } from "lucide-react";

import { BillingSubscriptionsPanel } from "@/components/settings/billing-subscriptions-panel";
import {
  DataTable,
  DataTableBody,
  DataTableHead,
  DataTableRow,
  DataTableShell,
  DT,
} from "@/components/data-table";
import { TitledCardHeader } from "@/components/titled-card-header";
import { StatusPill } from "@/components/ui/status-pill";
import { StubPageNotice } from "@/components/stub-badge";
import { modulesForCompany, resolveCompanyFixture } from "@/lib/company-fixtures";
import {
  BILLING_STUB_COPY,
  BILLING_TABS,
  billingTabHref,
  parseBillingTab,
  type BillingTabId,
} from "@/lib/billing-page-copy";
import {
  BILLING_DEMO_INVOICES,
  BILLING_DEMO_LINKAIOS_PLAN,
  BILLING_DEMO_PAYMENT_METHODS,
  BILLING_DEMO_UPCOMING,
  billingInvoiceStatusDisplay,
  formatBillingDate,
  formatBillingUsd,
  type BillingPaymentMethod,
} from "@/lib/ui-mocks/billing-demo";
import { BILLING_INVOICE_STATUS_PILL_LABELS } from "@/lib/status-colors";
import { BUTTON, FIELD, formatCardTitle, screenTabLinkClass, TABS } from "@/lib/ui-standards";

/** Fixed width for paired Remove / Default actions in payment-methods table (single-line labels). */
const PAYMENT_METHOD_TABLE_ACTION = "w-[7.5rem] shrink-0 whitespace-nowrap px-2.5 py-1";

function BillingTabNav(props: { active: BillingTabId }) {
  return (
    <nav className={TABS.row} aria-label="Billing sections">
      {BILLING_TABS.map((tab) => (
        <Link key={tab.id} href={billingTabHref(tab.id)} className={screenTabLinkClass(props.active === tab.id)}>
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}

function AddPaymentMethodModal(props: { open: boolean; onClose: () => void; onAdd: (method: BillingPaymentMethod) => void }) {
  const titleId = useId();
  const [last4, setLast4] = useState("4242");

  if (!props.open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="presentation">
      <button type="button" className="absolute inset-0 bg-zinc-900/50 dark:bg-black/60" aria-label="Close dialog" onClick={props.onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-700 dark:bg-zinc-950"
      >
        <h2 id={titleId} className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          {BILLING_STUB_COPY.addCardTitle}
        </h2>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{BILLING_STUB_COPY.addCardBody}</p>
        <label className="mt-4 block">
          <span className={FIELD.label}>Last four digits (demo)</span>
          <input
            value={last4}
            onChange={(e) => setLast4(e.target.value.replace(/\D/g, "").slice(0, 4))}
            className={`mt-1 ${FIELD.control}`}
            inputMode="numeric"
            maxLength={4}
          />
        </label>
        <div className="mt-6 flex flex-wrap gap-2">
          <button type="button" className={BUTTON.secondaryRow} onClick={props.onClose}>
            Cancel
          </button>
          <button
            type="button"
            className={BUTTON.primaryRow}
            onClick={() => {
              props.onAdd({
                id: `pm_${Date.now()}`,
                brand: "Visa",
                last4: last4.padStart(4, "0").slice(-4),
                expMonth: 12,
                expYear: 2029,
                isDefault: false,
              });
              props.onClose();
            }}
          >
            Save card
          </button>
        </div>
      </div>
    </div>
  );
}

function BillingOverviewPanel(props: { methods: BillingPaymentMethod[] }) {
  const searchParams = useSearchParams();
  const company = resolveCompanyFixture(searchParams.get("companyId"));
  const subscribedModules = useMemo(
    () => modulesForCompany(company.id).filter((row) => row.status === "active" || row.status === "trialing"),
    [company.id],
  );
  const defaultMethod = props.methods.find((m) => m.isDefault) ?? props.methods[0];
  const plan = BILLING_DEMO_LINKAIOS_PLAN;
  const upcoming = BILLING_DEMO_UPCOMING;
  const overviewCard =
    "rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950";
  const subscriptionOverviewCard = `${overviewCard} h-full min-h-[10.875rem]`;

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <article className={overviewCard}>
            <TitledCardHeader
              icon={Receipt}
              title={formatCardTitle("Next charge")}
              description="Estimated total on your next billing date."
            />
            <p className="mt-4 text-2xl font-semibold text-zinc-900 dark:text-zinc-100">{formatBillingUsd(upcoming.amountUsd)}</p>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Due {formatBillingDate(upcoming.chargeDate)}</p>
          </article>

          <article className={overviewCard}>
            <TitledCardHeader
              icon={CreditCard}
              title={formatCardTitle("Payment method")}
              description="Default card on file for renewals."
            />
            {defaultMethod ? (
              <p className="mt-4 text-sm text-zinc-900 dark:text-zinc-100">
                {defaultMethod.brand} ···· {defaultMethod.last4}
                <span className="block text-zinc-500">
                  Expires {String(defaultMethod.expMonth).padStart(2, "0")}/{defaultMethod.expYear}
                </span>
              </p>
            ) : (
              <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">No payment method on file.</p>
            )}
          </article>
        </div>

        <div className="grid items-stretch gap-4 md:grid-cols-2">
          <article className={subscriptionOverviewCard}>
            <TitledCardHeader
              icon={Sparkles}
              title={formatCardTitle("LiNKaios plan")}
              description="Workspace control plane subscription."
            />
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-zinc-500">Plan</dt>
                <dd className="font-medium text-zinc-900 dark:text-zinc-100">{plan.name}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-zinc-500">Renews</dt>
                <dd className="text-zinc-900 dark:text-zinc-100">{formatBillingDate(plan.renewsAt)}</dd>
              </div>
            </dl>
          </article>

          <article className={subscriptionOverviewCard}>
            <TitledCardHeader
              icon={Layers}
              title={formatCardTitle("Suites subscribed")}
              description="Licensed business packages billed with your workspace."
            />
            {subscribedModules.length > 0 ? (
              <dl className="mt-4 space-y-2 text-sm">
                {subscribedModules.map((row) => (
                  <div key={row.id} className="flex justify-between gap-3">
                    <dt className="text-zinc-500">{row.module}</dt>
                    <dd className="font-medium text-zinc-900 dark:text-zinc-100">
                      {row.plan ?? "—"}
                      {row.status === "trialing" ? " (trial)" : ""}
                    </dd>
                  </div>
                ))}
              </dl>
            ) : (
              <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">No active suite subscriptions.</p>
            )}
          </article>
        </div>
      </div>
    </div>
  );
}

function BillingPaymentMethodsPanel(props: {
  methods: BillingPaymentMethod[];
  onAdd: (method: BillingPaymentMethod) => void;
  onRemove: (id: string) => void;
  onSetDefault: (id: string) => void;
}) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">Cards on file</h2>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Used for LiNKaios and suite subscription renewals.</p>
        </div>
        <button type="button" className={BUTTON.addRow} onClick={() => setModalOpen(true)}>
          Add Card
        </button>
      </div>

      <DataTableShell>
        <DataTable>
          <colgroup>
            <col className="w-[20%]" />
            <col className="w-[24%]" />
            <col className="w-[20%]" />
            <col className="w-[36%]" />
          </colgroup>
          <DataTableHead>
            <tr>
              <th className={DT.thTextInset}>Brand</th>
              <th className={DT.thTextInset}>Number</th>
              <th className={DT.thTextInset}>Expires</th>
              <th className={DT.thControl}>
                <div className={DT.controlInner}>Actions</div>
              </th>
            </tr>
          </DataTableHead>
          <DataTableBody>
            {props.methods.map((method) => (
              <DataTableRow key={method.id} multiline>
                <td className={`${DT.tdClipInset} font-medium text-zinc-900 dark:text-zinc-100`}>
                  <span className={DT.tdTextSpan}>{method.brand}</span>
                </td>
                <td className={DT.tdClipInset}>
                  <span className={DT.tdTextSpan}>···· {method.last4}</span>
                </td>
                <td className={DT.tdClipInset}>
                  <span className={DT.tdTextSpan}>
                    {String(method.expMonth).padStart(2, "0")}/{method.expYear}
                  </span>
                </td>
                <td className={DT.tdControl}>
                  <div className="flex flex-wrap justify-center gap-2">
                    <button
                      type="button"
                      className={`${BUTTON.rejectCompact} ${PAYMENT_METHOD_TABLE_ACTION}`}
                      onClick={() => props.onRemove(method.id)}
                    >
                      Remove
                    </button>
                    <button
                      type="button"
                      className={`${BUTTON.secondaryCompact} ${PAYMENT_METHOD_TABLE_ACTION}`}
                      disabled={method.isDefault}
                      onClick={() => props.onSetDefault(method.id)}
                    >
                      {method.isDefault ? "Default" : "Make Default"}
                    </button>
                  </div>
                </td>
              </DataTableRow>
            ))}
          </DataTableBody>
        </DataTable>
      </DataTableShell>

      <AddPaymentMethodModal open={modalOpen} onClose={() => setModalOpen(false)} onAdd={props.onAdd} />
    </section>
  );
}

function BillingInvoicesPanel() {
  const upcoming = BILLING_DEMO_UPCOMING;
  const invoices = useMemo(
    () => [...BILLING_DEMO_INVOICES].sort((a, b) => new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime()),
    [],
  );
  const lineTotal = useMemo(
    () => upcoming.lineItems.reduce((sum, line) => sum + line.amountUsd, 0),
    [upcoming.lineItems],
  );

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <TitledCardHeader icon={Receipt} title="Upcoming invoice" description="Preview of your next scheduled charge." />
        <p className="mt-4 text-2xl font-semibold text-zinc-900 dark:text-zinc-100">{formatBillingUsd(upcoming.amountUsd)}</p>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Charges on {formatBillingDate(upcoming.chargeDate)}</p>
        <ul className="mt-4 space-y-2 border-t border-zinc-100 pt-4 dark:border-zinc-800">
          {upcoming.lineItems.map((line) => (
            <li key={line.label} className="flex justify-between gap-4 text-sm">
              <span className="text-zinc-700 dark:text-zinc-300">{line.label}</span>
              <span className="font-medium text-zinc-900 dark:text-zinc-100">{formatBillingUsd(line.amountUsd)}</span>
            </li>
          ))}
          <li className="flex justify-between gap-4 border-t border-zinc-200 pt-3 text-sm font-semibold dark:border-zinc-700">
            <span className="text-zinc-900 dark:text-zinc-100">Total</span>
            <span className="text-zinc-900 dark:text-zinc-100">{formatBillingUsd(lineTotal)}</span>
          </li>
        </ul>
      </section>

      <section className="space-y-4">
        <TitledCardHeader icon={FileText} title="Invoice history" description="Past charges and receipts for this workspace." />
        <DataTableShell>
          <DataTable>
            <colgroup>
              <col className="w-[16%]" />
              <col className="w-[14%]" />
              <col className="w-[12%]" />
              <col className="w-[12%]" />
              <col className="w-[30%]" />
              <col className="w-[16%]" />
            </colgroup>
            <DataTableHead>
              <tr>
                <th className={DT.thTextInset}>Invoice</th>
                <th className={DT.thTextInset}>Date</th>
                <th className={DT.thTextInset}>Amount</th>
                <th className={DT.thControl}>
                  <div className={DT.controlInner}>Status</div>
                </th>
                <th className={DT.thTextInset}>Summary</th>
                <th className={DT.thControl}>
                  <div className={DT.controlInner}>Receipt</div>
                </th>
              </tr>
            </DataTableHead>
            <DataTableBody>
              {invoices.map((inv) => {
                const invoiceStatus = billingInvoiceStatusDisplay(inv.status);
                return (
                <DataTableRow key={inv.id} multiline>
                  <td className={`${DT.tdClipInset} font-medium text-zinc-900 dark:text-zinc-100`}>
                    <span className={DT.tdTextSpan}>{inv.number}</span>
                  </td>
                  <td className={DT.tdClipInset}>
                    <span className={DT.tdTextSpan}>{formatBillingDate(inv.issuedAt)}</span>
                  </td>
                  <td className={DT.tdClipInset}>
                    <span className={DT.tdTextSpan}>{formatBillingUsd(inv.amountUsd)}</span>
                  </td>
                  <td className={DT.tdControl}>
                    <div className={DT.controlInner}>
                      <StatusPill
                        label={invoiceStatus.label}
                        tone={invoiceStatus.tone}
                        equalWidth
                        equalWidthLabels={BILLING_INVOICE_STATUS_PILL_LABELS}
                      />
                    </div>
                  </td>
                  <td className={DT.tdClipInset}>
                    <span className={DT.tdWrapSpan}>{inv.summary}</span>
                  </td>
                  <td className={DT.tdControl}>
                    <div className={DT.controlInner}>
                      <button type="button" className={BUTTON.secondaryCompact}>
                        Download
                      </button>
                    </div>
                  </td>
                </DataTableRow>
              );
              })}
            </DataTableBody>
          </DataTable>
        </DataTableShell>
      </section>
    </div>
  );
}

export function BillingPage() {
  const searchParams = useSearchParams();
  const tabFromUrl = parseBillingTab(searchParams.get("tab"));
  const [activeTab, setActiveTab] = useState<BillingTabId>(tabFromUrl);
  const [methods, setMethods] = useState<BillingPaymentMethod[]>(() => [...BILLING_DEMO_PAYMENT_METHODS]);

  useEffect(() => {
    setActiveTab(tabFromUrl);
  }, [tabFromUrl]);

  function addMethod(method: BillingPaymentMethod) {
    setMethods((prev) => [...prev, method]);
  }

  function removeMethod(id: string) {
    setMethods((prev) => {
      const next = prev.filter((m) => m.id !== id);
      if (next.length > 0 && !next.some((m) => m.isDefault)) {
        next[0] = { ...next[0]!, isDefault: true };
      }
      return next;
    });
  }

  function setDefaultMethod(id: string) {
    setMethods((prev) => prev.map((m) => ({ ...m, isDefault: m.id === id })));
  }

  return (
    <div className="space-y-6">
      <StubPageNotice message="Billing uses local demo fixtures only. No charges, invoices, or payment methods are sent to a processor." />
      <BillingTabNav active={activeTab} />

      {activeTab === "overview" ? <BillingOverviewPanel methods={methods} /> : null}
      {activeTab === "payment-methods" ? (
        <BillingPaymentMethodsPanel methods={methods} onAdd={addMethod} onRemove={removeMethod} onSetDefault={setDefaultMethod} />
      ) : null}
      {activeTab === "subscriptions" ? <BillingSubscriptionsPanel /> : null}
      {activeTab === "invoices" ? <BillingInvoicesPanel /> : null}
    </div>
  );
}
