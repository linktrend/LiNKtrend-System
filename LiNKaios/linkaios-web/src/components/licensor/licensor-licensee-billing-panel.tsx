"use client";

import { CreditCard, FileText } from "lucide-react";

import { CompanyEditableCard } from "@/components/company-editable-card";
import { CompanyFieldGrid } from "@/components/company-form-fields";
import { StubBadge } from "@/components/stub-badge";
import { StatusPill } from "@/components/ui/status-pill";
import { billingSnapshotForLicensee } from "@/lib/licensor-licensee-profile";
import type { BillingInvoice } from "@/lib/ui-mocks/billing-demo";
import { BUTTON } from "@/lib/ui-standards";

function formatMoney(usd: number) {
  return new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(usd);
}

function invoiceStatusTone(status: BillingInvoice["status"]) {
  if (status === "paid") return "success" as const;
  if (status === "open") return "warning" as const;
  return "neutral" as const;
}

function InvoiceTable(props: { invoices: BillingInvoice[] }) {
  return (
    <div className="mt-4 overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
      <table className="w-full min-w-[32rem] text-sm">
        <thead className="border-b border-zinc-200 bg-zinc-50/80 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-400">
          <tr>
            <th className="px-3 py-2.5">Invoice</th>
            <th className="px-3 py-2.5">Description</th>
            <th className="px-3 py-2.5 text-right">Amount</th>
            <th className="px-3 py-2.5 text-right">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
          {props.invoices.map((inv) => (
            <tr key={inv.id}>
              <td className="whitespace-nowrap px-3 py-2.5 font-medium text-zinc-900 dark:text-zinc-100">{inv.number}</td>
              <td className="px-3 py-2.5 text-zinc-600 dark:text-zinc-400">{inv.summary}</td>
              <td className="whitespace-nowrap px-3 py-2.5 text-right tabular-nums text-zinc-900 dark:text-zinc-100">
                {formatMoney(inv.amountUsd)}
              </td>
              <td className="px-3 py-2.5 text-right">
                <StatusPill label={inv.status} tone={invoiceStatusTone(inv.status)} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function LicensorLicenseeBillingPanel(props: { licenseeId: string }) {
  const snap = billingSnapshotForLicensee(props.licenseeId);

  return (
    <div className="space-y-4">
      <p className="max-w-3xl text-sm text-zinc-600 dark:text-zinc-400">
        Billing and invoices come from <strong className="font-medium text-zinc-800 dark:text-zinc-200">Stripe</strong>{" "}
        when connected. Contract metadata stays in LiNKaios when Stripe does not store the signed agreement.
      </p>

      <CompanyEditableCard
        icon={CreditCard}
        title="Stripe Billing"
        description="Subscriptions, invoices, and payment status — source of truth for money."
        required
      >
        <CompanyFieldGrid
          rows={[
            { label: "Plan", value: snap.plan },
            {
              label: "Stripe customer",
              value: snap.stripeCustomerId ?? "Not linked",
            },
            { label: "Integration", value: "Stripe read-only stub" },
          ]}
        />
        <InvoiceTable invoices={snap.invoices} />
      </CompanyEditableCard>

      {snap.contract ? (
        <CompanyEditableCard
          icon={FileText}
          title="Contract"
          description="Commercial terms and signed agreement — not stored in Stripe."
          required
        >
          <CompanyFieldGrid
            rows={[
              { label: "Reference", value: snap.contract.contractRef },
              { label: "Signed", value: snap.contract.signedAt },
              { label: "Term", value: `${snap.contract.termMonths} months` },
              { label: "Tier", value: snap.contract.tier },
            ]}
          />
          <div className="mt-4 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Documents</p>
              <StubBadge label="Vault stub until live" />
            </div>
            <ul className="divide-y divide-zinc-200 rounded-lg border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
              {snap.contract.documents.map((doc) => (
                <li key={doc.id} className="flex flex-wrap items-center justify-between gap-2 px-3 py-2.5 text-sm">
                  <span className="min-w-0 text-zinc-700 dark:text-zinc-300">{doc.label}</span>
                  <button type="button" className={BUTTON.secondaryCompact} disabled title="Contract vault not wired yet">
                    View
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </CompanyEditableCard>
      ) : null}
    </div>
  );
}
