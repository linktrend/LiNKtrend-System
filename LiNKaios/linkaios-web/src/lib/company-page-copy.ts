/** Copy and constants for the Company hub (`/company`). */

export const COMPANY_PAGE_HEADER = {
  title: "Company",
  subtitle:
    "Your licensed organization — profile, locations, modules, and company context. Upload company knowledge through LiNKbrain Inbox.",
} as const;

/** Sub-nav tab ids — synced with `?tab=` search param (default: overview). */
export const COMPANY_TABS = [
  { id: "overview", label: "Overview" },
  { id: "locations", label: "Locations" },
  { id: "organization", label: "Organization" },
  { id: "modules", label: "Modules" },
  { id: "knowledge", label: "Knowledge" },
] as const;

export type CompanyTabId = (typeof COMPANY_TABS)[number]["id"];

export const COMPANY_DEFAULT_TAB: CompanyTabId = "overview";

export function isCompanyTabId(value: string | null | undefined): value is CompanyTabId {
  return COMPANY_TABS.some((t) => t.id === value);
}

export const COMPANY_SECTION_COPY = {
  switcher: {
    label: "Active company",
    mockHint: "Demo switcher — sets ?companyId= for multi-company UI preview. Persistence is not wired yet.",
  },
  profile: {
    title: "Company profile",
    displayName: "Display name",
    description: "Description",
    industry: "Industry",
    legalIdentity: "Legal identity",
    website: "Website",
    websiteEmpty: "No website on file yet.",
    websiteHint: "Website URL will persist when company profile storage is wired.",
    saveNote: "Profile fields below are UI-only until company profile columns are migrated.",
  },
  locations: {
    title: "Locations",
    body: "Physical sites for this company — headquarters, clinics, offices, or stores. Org structure (departments and regions) is managed separately on the Organization tab.",
    empty: "No locations added yet. Use Add location to preview the form.",
    addLabel: "Add location",
    modalTitle: "Add location",
    modalHint: "Fixture-only — locations are not saved to the database yet.",
  },
  organization: {
    title: "Organization",
    body: "Departments, regions, and reporting lines. Used to scope LiNKbrain company knowledge and internal structure — not the same as physical addresses.",
  },
  knowledge: {
    title: "Company knowledge",
    body: "Approved company documents and reference material live in LiNKbrain. Add new files through Inbox; published company memory appears under LiNKbrain → Company.",
    addLabel: "Add via LiNKbrain Inbox",
    viewLabel: "View company memory",
    emptyPreview: "No published company files yet. Add material through LiNKbrain Inbox.",
  },
  people: {
    title: "People & permissions",
    body: "Human operators belong to one or more licensee companies. LiNKtrend vendor users and AI agent accounts are managed separately with higher platform permissions. Create users and set permissions in Settings.",
    cta: "Manage users in Settings",
    previewCountLabel: "Licensed users (preview)",
  },
  modules: {
    title: "Modules & subscriptions",
    body: "Licensed LiNKtrend modules for this company. Subscribe and cancel use a Stripe checkout stub until billing is connected.",
    subscribe: "Subscribe",
    cancel: "Cancel",
    changePlan: "Change plan",
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
