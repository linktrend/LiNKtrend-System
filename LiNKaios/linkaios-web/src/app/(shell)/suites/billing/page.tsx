import { ShellPageHeaderClient } from "@/components/shell-page-header-client";
import { StripeProductsPanel } from "@/components/admin/stripe-products-panel";

export const dynamic = "force-dynamic";

/** Stripe product catalog — Admin-owned API management with Dashboard break-glass. */
export default function LicensorSuiteBillingPage() {
  return (
    <main className="space-y-6">
      <ShellPageHeaderClient
        title="Stripe products"
        subtitle="Create products and prices, link suites, and manage billing frequency from Admin. Use Open in Stripe on each row for finance break-glass."
      />
      <StripeProductsPanel />
    </main>
  );
}
