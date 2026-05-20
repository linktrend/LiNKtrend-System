/** Copy and constants for the Company hub (`/company`). */

export const COMPANY_PAGE_HEADER = {
  title: "Company",
  subtitle:
    "Your licensed organization — profile, locations, modules, and company context. Upload company knowledge through LiNKbrain Inbox.",
} as const;

export const COMPANY_SECTION_COPY = {
  profile: {
    title: "Company profile",
    legalIdentity: "Legal identity",
    website: "Website",
    websiteEmpty: "No website on file yet.",
    websiteHint: "Website, industry, and description fields expand in a future update.",
  },
  locations: {
    title: "Locations",
    body: "Physical sites for this company — headquarters, clinics, offices, or stores. Org structure (departments and regions) is managed separately below.",
    empty: "No locations added yet. Add headquarters and branch addresses when location editing is enabled.",
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
  },
  people: {
    title: "People & permissions",
    body: "Human operators belong to one or more licensee companies. LiNKtrend vendor users and AI agent accounts are managed separately with higher platform permissions. Create users and set permissions in Settings.",
    cta: "Manage users in Settings",
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
