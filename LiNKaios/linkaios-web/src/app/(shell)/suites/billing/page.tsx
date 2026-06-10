import { CreditCard, Layers3, Package } from "lucide-react";

import { ShellPageHeaderClient } from "@/components/shell-page-header-client";
import {
  DataTable,
  DataTableBody,
  DataTableHead,
  DataTableRow,
  DataTableShell,
  DT,
} from "@/components/data-table";
import { StatusPill } from "@/components/ui/status-pill";
import { LICENSOR_SUITE_PUBLISH_PILL_LABELS, MARKETPLACE_LISTED_PILL_LABELS } from "@/lib/status-colors";
import { LICENSOR_SUITE_PRODUCTS } from "@/lib/licensor-suite-catalog";
import { formatUiLabel } from "@/lib/ui-standards";

export const dynamic = "force-dynamic";

const PLATFORM_STRIPE_PRODUCTS = [
  {
    id: "prod_linkaios_core",
    name: "LiNKaios Core",
    description: "Control plane subscription — includes one company, one brand, and your base user allowance per licensee workspace.",
    billing: "Recurring",
  },
  {
    id: "prod_capacity_bundle",
    name: "Capacity bundle",
    description:
      "Recurring add-on for extra companies, brands per company, and user seats (e.g. +2 companies, +4 brands each, +N users).",
    billing: "Recurring add-on",
  },
] as const;

/** Stripe product mapping for Marketplace checkout alignment. */
export default function LicensorSuiteBillingPage() {
  return (
    <main className="space-y-6">
      <ShellPageHeaderClient
        title="Stripe products"
        subtitle="Platform and suite offerings mapped to Stripe product IDs. Pricing and billing frequency can be managed from Admin once the Stripe API integration is approved — see STRIPE_ADMIN_API_RESEARCH.md."
      />

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Platform products</h2>
        <ul className="grid gap-3 md:grid-cols-2">
          {PLATFORM_STRIPE_PRODUCTS.map((row) => (
            <li
              key={row.id}
              className="flex flex-col rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
            >
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-zinc-500" aria-hidden />
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">{row.name}</h3>
              </div>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{row.description}</p>
              <p className="mt-3 text-xs font-mono text-zinc-500">{row.id}</p>
              <p className="mt-1 text-xs text-zinc-500">{row.billing}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Suite products</h2>
        <DataTableShell>
          <DataTable>
            <colgroup>
              <col className="w-[28%]" />
              <col className="w-[32%]" />
              <col className="w-[22%]" />
              <col className="w-[18%]" />
            </colgroup>
            <DataTableHead>
              <tr>
                <th className={DT.thTextInset}>Suite</th>
                <th className={DT.thTextInset}>Stripe product</th>
                <th className={DT.thTextInset}>Marketplace</th>
                <th className={DT.thTextInset}>Billing</th>
              </tr>
            </DataTableHead>
            <DataTableBody>
              {LICENSOR_SUITE_PRODUCTS.map((suite) => (
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
                      equalWidthLabels={MARKETPLACE_LISTED_PILL_LABELS}
                    />
                  </td>
                  <td className={DT.tdClipInset}>
                    <span className={`${DT.tdTextSpan} inline-flex items-center gap-1`}>
                      <CreditCard className="h-3.5 w-3.5" aria-hidden />
                      Stripe
                    </span>
                  </td>
                </DataTableRow>
              ))}
            </DataTableBody>
          </DataTable>
        </DataTableShell>
      </section>
    </main>
  );
}
