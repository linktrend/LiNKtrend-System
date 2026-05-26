/** Copy and constants for the Company hub (`/company`) and licensor Licensees hub (`/licensees`). */

import { ADMIN_BASE_PATH, stripAppBasePath, withAppBasePath, type AppSurface } from "@/lib/app-surface";

export const COMPANY_HUB_PATH = "/company";
/** Route segment after `/admin` — use {@link companyHubPath} for link hrefs. */
export const LICENSEES_HUB_PATH = "/licensees";
export const LICENSEES_ADMIN_HUB_PATH = `${ADMIN_BASE_PATH}${LICENSEES_HUB_PATH}`;

export function isLicenseesHubPath(path: string): boolean {
  const route = stripAppBasePath(path.split("?")[0] ?? path);
  return route === LICENSEES_HUB_PATH || route === `${LICENSEES_HUB_PATH}/`;
}

export function companyHubPath(isAdmin: boolean): string {
  return isAdmin ? LICENSEES_ADMIN_HUB_PATH : COMPANY_HUB_PATH;
}

export const COMPANY_PAGE_HEADER = {
  title: "Company",
  subtitle: "Corporate profile, brand assets, and organisational structure for your workspace.",
} as const;

export const LICENSEES_PAGE_HEADER = {
  title: "Licensees",
  subtitle: "Tenant registry — overview, companies & brands, billing, and Chatwoot support per licensee.",
} as const;

export const LICENSEE_PROFILE_PAGE_HEADER = {
  title: "Licensee Profile",
  subtitle: "Service contacts, tenant topology, billing, and support — not internal corporate governance.",
} as const;

/** Sub-nav tab ids — synced with `?tab=` search param (default: company). */
export const COMPANY_TABS = [
  { id: "company", label: "Company" },
  { id: "brand", label: "Brand" },
] as const;

/** Licensor admin — tenant operations (not full corporate dossier). */
export const LICENSOR_LICENSEE_TABS = [
  { id: "overview", label: "Overview" },
  { id: "companies", label: "Companies & Brands" },
  { id: "billing", label: "Billing" },
  { id: "support", label: "Support" },
] as const;

export type LicensorLicenseeTabId = (typeof LICENSOR_LICENSEE_TABS)[number]["id"];

/** @deprecated Licensor tabs renamed — use LICENSOR_LICENSEE_TABS */
export const LICENSOR_LICENSEE_TABS_LEGACY = [
  { id: "company", label: "Legal Entity" },
  { id: "brand", label: "Brand" },
] as const;

export type CompanyTabId = (typeof COMPANY_TABS)[number]["id"];

export const COMPANY_DEFAULT_TAB: CompanyTabId = "company";
export const LICENSOR_LICENSEE_DEFAULT_TAB: LicensorLicenseeTabId = "overview";

export function normalizeLicensorLicenseeTab(value: string | null | undefined): LicensorLicenseeTabId {
  if (value === "company" || value === "overview") return "overview";
  if (value === "brand" || value === "companies") return "companies";
  if (value === "billing") return "billing";
  if (value === "support") return "support";
  if (value && LICENSOR_LICENSEE_TABS.some((t) => t.id === value)) return value as LicensorLicenseeTabId;
  return LICENSOR_LICENSEE_DEFAULT_TAB;
}

export function normalizeCompanyTab(value: string | null | undefined): CompanyTabId {
  if (value === "locations") return "brand";
  if (value === "organization" || value === "overview" || value === "knowledge") return "company";
  if (value === "modules") return "company";
  if (value && (COMPANY_TABS as readonly { id: string }[]).some((t) => t.id === value)) return value as CompanyTabId;
  return COMPANY_DEFAULT_TAB;
}

export function companyTabHref(
  tab: CompanyTabId | LicensorLicenseeTabId,
  companyId?: string | null,
  brandId?: string | null,
  hubPath: string = COMPANY_HUB_PATH,
): string {
  const params = new URLSearchParams();
  if (companyId) params.set("companyId", companyId);
  if (brandId) params.set("brandId", brandId);
  const defaultTab = isLicenseesHubPath(hubPath) ? LICENSOR_LICENSEE_DEFAULT_TAB : COMPANY_DEFAULT_TAB;
  if (tab !== defaultTab) params.set("tab", tab);
  const query = params.toString();
  return query ? `${hubPath}?${query}` : hubPath;
}

/** Absolute tab href for the active app surface (admin vs licensee). */
export function companyTabHrefForSurface(
  tab: CompanyTabId | LicensorLicenseeTabId,
  surface: AppSurface,
  companyId?: string | null,
  brandId?: string | null,
): string {
  const hubPath = companyHubPath(surface === "admin");
  return withAppBasePath(companyTabHref(tab, companyId, brandId, hubPath), surface);
}

export function isCompanyHubPath(path: string): boolean {
  const route = stripAppBasePath(path.split("?")[0] ?? path);
  return (
    route === COMPANY_HUB_PATH ||
    route === `${COMPANY_HUB_PATH}/` ||
    route === LICENSEES_HUB_PATH ||
    route === `${LICENSEES_HUB_PATH}/`
  );
}

export function companyTabFromSearch(search?: string): CompanyTabId {
  return normalizeCompanyTab(new URLSearchParams(search ?? "").get("tab"));
}

export function matchCompanyTab(id: CompanyTabId, path: string, search?: string): boolean {
  if (!isCompanyHubPath(path)) return false;
  return companyTabFromSearch(search) === id;
}

/** Navigate here after switching licensee — lands on workspace Overview with company context. */
export function companyOverviewHref(companyId: string, brandId?: string | null): string {
  const params = new URLSearchParams();
  params.set("companyId", companyId);
  if (brandId) params.set("brandId", brandId);
  const query = params.toString();
  return query ? `/app?${query}` : "/app";
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
