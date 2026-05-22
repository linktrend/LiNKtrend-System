/** Copy and constants for the Company hub (`/company`). */

export const COMPANY_PAGE_HEADER = {
  title: "Company",
  subtitle: "Corporate profile, brand assets, and organisational structure for your workspace.",
} as const;

/** Sub-nav tab ids — synced with `?tab=` search param (default: overview). */
export const COMPANY_TABS = [
  { id: "overview", label: "Overview" },
  { id: "brand", label: "Brand" },
  { id: "organization", label: "Org Structure" },
] as const;

export type CompanyTabId = (typeof COMPANY_TABS)[number]["id"];

export const COMPANY_DEFAULT_TAB: CompanyTabId = "overview";

export function normalizeCompanyTab(value: string | null | undefined): CompanyTabId {
  if (value === "locations") return "brand";
  if (value === "knowledge" || value === "modules") return "overview";
  if (value && (COMPANY_TABS as readonly { id: string }[]).some((t) => t.id === value)) return value as CompanyTabId;
  return COMPANY_DEFAULT_TAB;
}

export function companyTabHref(tab: CompanyTabId, companyId?: string | null): string {
  const params = new URLSearchParams();
  if (companyId) params.set("companyId", companyId);
  if (tab !== COMPANY_DEFAULT_TAB) params.set("tab", tab);
  const query = params.toString();
  return query ? `/company?${query}` : "/company";
}

export function companyTabFromSearch(search?: string): CompanyTabId {
  return normalizeCompanyTab(new URLSearchParams(search ?? "").get("tab"));
}

export function matchCompanyTab(id: CompanyTabId, path: string, search?: string): boolean {
  if (path !== "/company" && path !== "/company/") return false;
  return companyTabFromSearch(search) === id;
}

/** Navigate here after switching licensee — always lands on Overview for the chosen company. */
export function companyOverviewHref(companyId: string): string {
  const params = new URLSearchParams();
  params.set("companyId", companyId);
  params.set("tab", COMPANY_DEFAULT_TAB);
  return `/company?${params.toString()}`;
}

export const COMPANY_SECTION_COPY = {
  switcher: {
    label: "Switch company",
    mockHint: "Preview another licensee company. Persistence is not wired yet.",
  },
  modules: {
    title: "Suites & subscriptions",
    body: "Licensed LiNKtrend suites for this company. Subscribe and cancel use a Stripe checkout stub until billing is connected.",
    subscribe: "Subscribe",
    cancel: "Cancel",
    changePlan: "Change plan",
    preview: "Preview",
    stripeStubTitle: "Stripe checkout (stub)",
    stripeStubBody: "No payment is collected. Confirm records a local audit preview until LINKTREND Stripe keys and webhooks are configured.",
    planLabel: "Plan",
    confirmSubscribe: "Confirm subscription",
    confirmCancel: "Confirm cancellation",
    auditRecorded: "Audit preview recorded — connect Stripe for live billing.",
  },
} as const;

/** SMB industry picklist — used in mock previews; full profile wiring is Phase B. */
export const COMPANY_INDUSTRY_OPTIONS = [
  "Legal",
  "Dental",
  "Medical practice",
  "Restaurant",
  "Café",
  "Retail",
  "Marketing agency",
  "Creative agency",
  "Real estate",
  "Construction",
  "HVAC",
  "Plumbing",
  "Accounting",
  "Insurance",
  "Fitness",
  "Salon & spa",
  "Auto repair",
  "Property management",
  "Nonprofit",
  "Education",
  "Hospitality",
  "Manufacturing",
  "Logistics",
  "IT services",
  "Consulting",
  "Other",
] as const;
