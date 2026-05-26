/** Copy and tab ids for `/settings/billing`. */

export const BILLING_PAGE_HEADER = {
  title: "Billing",
  subtitle: "Payment methods, LiNKaios subscription, suite licenses, and invoices for your workspace.",
} as const;

export const BILLING_TABS = [
  { id: "overview", label: "Overview" },
  { id: "payment-methods", label: "Payment Methods" },
  { id: "subscriptions", label: "Subscriptions" },
  { id: "invoices", label: "Invoices" },
] as const;

export type BillingTabId = (typeof BILLING_TABS)[number]["id"];

export const BILLING_DEFAULT_TAB: BillingTabId = "overview";

const BILLING_TAB_IDS = new Set<string>(BILLING_TABS.map((t) => t.id));

export function parseBillingTab(raw: string | null | undefined): BillingTabId {
  if (raw === "linkaios" || raw === "modules") return "subscriptions";
  if (raw && BILLING_TAB_IDS.has(raw)) return raw as BillingTabId;
  return BILLING_DEFAULT_TAB;
}

export function billingTabHref(tab: BillingTabId): string {
  if (tab === BILLING_DEFAULT_TAB) return "/settings/billing";
  return `/settings/billing?tab=${tab}`;
}

export const BILLING_STUB_COPY = {
  addCardTitle: "Add Payment Method",
  addCardBody: "Card details are not sent to a processor in this preview. A placeholder method is stored locally for MVO proof.",
} as const;
