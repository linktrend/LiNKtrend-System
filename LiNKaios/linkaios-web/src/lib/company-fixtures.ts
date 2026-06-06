/** UI fixtures for multi-company preview on `/company` (no persistence). */

import type { PersonalAddressValue } from "@/lib/form-types";

export type CompanyFixture = {
  id: string;
  name: string;
  code: string;
  industry: string;
  displayName: string;
  description: string;
  website: string;
  userCount: number;
};

export const COMPANY_FIXTURES: CompanyFixture[] = [
  {
    id: "linktrend-studio",
    name: "LiNKtrend Venture Studio LLC",
    code: "LNK",
    industry: "Venture studio",
    displayName: "LiNKtrend",
    description: "AI-native venture studio operating LinkSites and LiNKdeveloper on LiNKaios Client.",
    website: "https://linktrend.media",
    userCount: 4,
  },
  {
    id: "xyz-marketing",
    name: "XYZ Marketing Agency LLC",
    code: "XYZ",
    industry: "Marketing agency",
    displayName: "XYZ Marketing",
    description: "Full-service digital marketing for South Florida SMBs.",
    website: "https://xyz-marketing.example",
    userCount: 12,
  },
  {
    id: "acme-dental",
    name: "Acme Dental Group PLLC",
    code: "ACME",
    industry: "Dental",
    displayName: "Acme Dental",
    description: "Multi-chair dental practice with two branch offices.",
    website: "https://acme-dental.example",
    userCount: 8,
  },
  {
    id: "harbor-legal",
    name: "Harbor Legal Partners LLP",
    code: "HARBOR",
    industry: "Legal",
    displayName: "Harbor Legal",
    description: "Litigation and corporate counsel for regional clients.",
    website: "https://harbor-legal.example",
    userCount: 24,
  },
];

export const COMPANY_DEFAULT_FIXTURE_ID = COMPANY_FIXTURES[0]!.id;

export function resolveCompanyFixture(companyId: string | null | undefined): CompanyFixture {
  return COMPANY_FIXTURES.find((c) => c.id === companyId) ?? COMPANY_FIXTURES[0]!;
}

export type LocationFixture = {
  id: string;
  site: string;
  role: string;
  city: string;
};

const LOCATIONS_BY_COMPANY: Record<string, LocationFixture[]> = {
  "xyz-marketing": [
    { id: "hq", site: "HQ — Downtown", role: "Headquarters", city: "Miami, FL" },
    { id: "west", site: "West office", role: "Branch", city: "Fort Lauderdale, FL" },
  ],
  "acme-dental": [
    { id: "main", site: "Main clinic", role: "Headquarters", city: "Orlando, FL" },
    { id: "south", site: "South campus", role: "Branch", city: "Kissimmee, FL" },
  ],
  "harbor-legal": [
    { id: "tower", site: "Harbor Tower", role: "Headquarters", city: "Tampa, FL" },
  ],
};

export function locationsForCompany(companyId: string): LocationFixture[] {
  return LOCATIONS_BY_COMPANY[companyId] ?? LOCATIONS_BY_COMPANY[COMPANY_DEFAULT_FIXTURE_ID] ?? [];
}

export type ModuleSubscriptionFixture = {
  id: string;
  moduleId: string;
  module: string;
  description: string;
  status: "active" | "trialing" | "not_subscribed" | "canceled";
  plan: string | null;
};

const MODULES_BY_COMPANY: Record<string, ModuleSubscriptionFixture[]> = {
  "linktrend-studio": [
    {
      id: "linksites",
      moduleId: "linksites",
      module: "LinkSites",
      description: "Lead-to-preview website factory — MVO commercial loop for studio outreach.",
      status: "active",
      plan: "Enterprise",
    },
    {
      id: "linkdeveloper",
      moduleId: "linkdeveloper",
      module: "LiNKdeveloper",
      description: "Client-only software factory — product runs through governed gates on Linktrend tenant.",
      status: "active",
      plan: "Enterprise",
    },
  ],
  "xyz-marketing": [
    {
      id: "linksites",
      moduleId: "linksites",
      module: "LinkSites",
      description: "Lead-to-preview website factory for SMB outreach and campaign landing pages.",
      status: "active",
      plan: "Professional",
    },
    {
      id: "linkapps",
      moduleId: "linkapps",
      module: "LiNKapps",
      description: "Internal app builder and design system for tenant-facing products.",
      status: "not_subscribed",
      plan: null,
    },
    {
      id: "lexos",
      moduleId: "lexos",
      module: "LEXOS Litigation",
      description: "Litigation practice processes, matter intake, and document automation.",
      status: "trialing",
      plan: "Starter",
    },
  ],
  "acme-dental": [
    {
      id: "linksites",
      moduleId: "linksites",
      module: "LinkSites",
      description: "Lead-to-preview website factory for SMB outreach and campaign landing pages.",
      status: "active",
      plan: "Starter",
    },
    {
      id: "linkapps",
      moduleId: "linkapps",
      module: "LiNKapps",
      description: "Internal app builder and design system for tenant-facing products.",
      status: "not_subscribed",
      plan: null,
    },
  ],
  "harbor-legal": [
    {
      id: "linksites",
      moduleId: "linksites",
      module: "LinkSites",
      description: "Lead-to-preview website factory for SMB outreach and campaign landing pages.",
      status: "active",
      plan: "Enterprise",
    },
    {
      id: "lexos",
      moduleId: "lexos",
      module: "LEXOS Litigation",
      description: "Litigation practice processes, matter intake, and document automation.",
      status: "active",
      plan: "Professional",
    },
    {
      id: "linkapps",
      moduleId: "linkapps",
      module: "LiNKapps",
      description: "Internal app builder and design system for tenant-facing products.",
      status: "canceled",
      plan: null,
    },
  ],
};

export function modulesForCompany(companyId: string): ModuleSubscriptionFixture[] {
  return MODULES_BY_COMPANY[companyId] ?? MODULES_BY_COMPANY[COMPANY_DEFAULT_FIXTURE_ID] ?? [];
}

export const STRIPE_PLAN_OPTIONS = ["Starter", "Professional", "Enterprise"] as const;

export type CorporateProfileFixture = {
  registeredName: string;
  tradingNames: string;
  registrationNumber: string;
  incorporationDate: string;
  financialYearEnd: string;
  agmDueDate: string;
  businessActivities: string;
  industryCode: string;
  directors: string;
  secretary: string;
  shareholders: string;
  registeredOffice: PersonalAddressValue;
  principalPlace: PersonalAddressValue;
  phoneCountryCode: string;
  phoneNumber: string;
  email: string;
  website: string;
  shareCount: string;
  shareCapitalAmount: string;
  financialFilingDescription: string;
  financialFilingDate: string;
  registers: string;
  minutesResolutions: string;
  constitutionalDocs: string;
};

export function mergeCorporateProfile(
  base: CorporateProfileFixture,
  draft: Partial<CorporateProfileFixture>,
): CorporateProfileFixture {
  return {
    ...base,
    ...draft,
    registeredOffice: { ...base.registeredOffice, ...draft.registeredOffice },
    principalPlace: { ...base.principalPlace, ...draft.principalPlace },
  };
}

export function formatShareCapitalDisplay(
  profile: Pick<CorporateProfileFixture, "shareCount" | "shareCapitalAmount">,
): string {
  const count = profile.shareCount.trim();
  const amount = profile.shareCapitalAmount.trim();
  const parts: string[] = [];
  if (count) parts.push(`${count} shares`);
  if (amount) parts.push(amount);
  return parts.length > 0 ? parts.join(" · ") : "—";
}

export function formatFinancialFilingDisplay(
  profile: Pick<CorporateProfileFixture, "financialFilingDescription" | "financialFilingDate">,
  formatDate: (iso: string) => string,
): string {
  const description = profile.financialFilingDescription.trim();
  const dateLabel = profile.financialFilingDate.trim() ? formatDate(profile.financialFilingDate) : "";
  if (description && dateLabel) return `${description} · ${dateLabel}`;
  return description || dateLabel || "—";
}

const CORPORATE_BY_COMPANY: Record<string, CorporateProfileFixture> = {
  "xyz-marketing": {
    registeredName: "XYZ Marketing Agency LLC",
    tradingNames: "XYZ Marketing",
    registrationNumber: "L21000456789",
    incorporationDate: "2018-03-14",
    financialYearEnd: "31 December",
    agmDueDate: "2026-06-30",
    businessActivities: "Digital marketing, paid media, and creative services for SMB clients.",
    industryCode: "541613 — Marketing consulting",
    directors: "Jane Rivera (Managing Director)\nMarco Chen (Finance Director)",
    secretary: "Harbor Registered Agents Inc.",
    shareholders: "Jane Rivera — 6,000 ordinary shares\nMarco Chen — 4,000 ordinary shares",
    registeredOffice: {
      streetAddress1: "100 Biscayne Blvd",
      streetAddress2: "Suite 1200",
      city: "Miami",
      state: "Florida",
      postalCode: "33132",
      country: "United States",
    },
    principalPlace: {
      streetAddress1: "100 Biscayne Blvd",
      streetAddress2: "Suite 1200",
      city: "Miami",
      state: "Florida",
      postalCode: "33132",
      country: "United States",
    },
    phoneCountryCode: "+1",
    phoneNumber: "3055550142",
    email: "ops@xyz-marketing.example",
    website: "https://xyz-marketing.example",
    shareCount: "10,000",
    shareCapitalAmount: "$10,000 issued & paid-up (ordinary @ $1)",
    financialFilingDescription: "Annual return · Balance sheet on file (private)",
    financialFilingDate: "2025-02-01",
    registers: "Register of members · Register of directors · Significant controllers register",
    minutesResolutions: "Board minutes Q1–Q4 2025 · Dividend resolution 2025-11-12",
    constitutionalDocs: "Memorandum & Articles of Association (rev. 2022)",
  },
  "acme-dental": {
    registeredName: "Acme Dental Group PLLC",
    tradingNames: "Acme Dental · Acme Smiles",
    registrationNumber: "P12000098765",
    incorporationDate: "2015-09-02",
    financialYearEnd: "31 December",
    agmDueDate: "2026-05-31",
    businessActivities: "General and cosmetic dentistry across two clinic locations.",
    industryCode: "621210 — Offices of dentists",
    directors: "Dr. Amelia Ortiz (Clinical Director)",
    secretary: "Acme Corporate Services LLC",
    shareholders: "Dr. Amelia Ortiz — 100% membership interest",
    registeredOffice: {
      streetAddress1: "450 Central Ave",
      streetAddress2: "",
      city: "Orlando",
      state: "Florida",
      postalCode: "32801",
      country: "United States",
    },
    principalPlace: {
      streetAddress1: "450 Central Ave",
      streetAddress2: "South campus — 88 Lake Dr, Kissimmee",
      city: "Orlando",
      state: "Florida",
      postalCode: "32801",
      country: "United States",
    },
    phoneCountryCode: "+1",
    phoneNumber: "4075550198",
    email: "admin@acme-dental.example",
    website: "https://acme-dental.example",
    shareCount: "1",
    shareCapitalAmount: "Single-class membership interests",
    financialFilingDescription: "Annual report",
    financialFilingDate: "2025-01-20",
    registers: "Register of members · Register of managers",
    minutesResolutions: "Manager resolutions 2025-06-01 (equipment lease)",
    constitutionalDocs: "Operating Agreement (amended 2024)",
  },
  "harbor-legal": {
    registeredName: "Harbor Legal Partners LLP",
    tradingNames: "Harbor Legal",
    registrationNumber: "LP-8844221",
    incorporationDate: "2010-01-18",
    financialYearEnd: "30 April",
    agmDueDate: "2026-08-31",
    businessActivities: "Litigation, corporate counsel, and regulatory advisory.",
    industryCode: "541110 — Offices of lawyers",
    directors: "Partnership management committee",
    secretary: "Harbor Legal Administration",
    shareholders: "Partners per partnership agreement (12 equity partners)",
    registeredOffice: {
      streetAddress1: "Harbor Tower, 200 Tampa St",
      streetAddress2: "",
      city: "Tampa",
      state: "Florida",
      postalCode: "33602",
      country: "United States",
    },
    principalPlace: {
      streetAddress1: "Harbor Tower, 200 Tampa St",
      streetAddress2: "",
      city: "Tampa",
      state: "Florida",
      postalCode: "33602",
      country: "United States",
    },
    phoneCountryCode: "+1",
    phoneNumber: "8135550100",
    email: "firm@harbor-legal.example",
    website: "https://harbor-legal.example",
    shareCount: "12",
    shareCapitalAmount: "Partnership capital accounts (multi-class profit shares)",
    financialFilingDescription: "LLP annual return · Professional indemnity certificate on file",
    financialFilingDate: "",
    registers: "Register of partners · PSC register · AML beneficial ownership",
    minutesResolutions: "Partners meeting minutes 2025-09-15",
    constitutionalDocs: "Partnership Agreement · Statement of practice",
  },
};

export function corporateProfileForCompany(companyId: string): CorporateProfileFixture {
  return CORPORATE_BY_COMPANY[companyId] ?? CORPORATE_BY_COMPANY[COMPANY_DEFAULT_FIXTURE_ID]!;
}

export type BrandAssetSlotFixture = {
  id: string;
  label: string;
  /** Demo / saved preview file name */
  fileName?: string;
};

export type BrandAssetCategoryFixture = {
  id: string;
  title: string;
  description: string;
  required: boolean;
  slots: BrandAssetSlotFixture[];
};

export function brandAssetsForCompany(companyId: string): BrandAssetCategoryFixture[] {
  const base: BrandAssetCategoryFixture[] = [
    {
      id: "identity",
      title: "Brand identity & guidelines",
      description: "Style guide, logo files, colour palette, and typography rules.",
      required: true,
      slots: [
        { id: "style-guide", label: "Brand style guide" },
        { id: "logo-files", label: "Logo files (vector & PNG)" },
        { id: "colour-palette", label: "Colour palette (Hex / CMYK / RGB)" },
        { id: "typography", label: "Typography stack" },
      ],
    },
    {
      id: "digital",
      title: "Digital assets",
      description: "Website, social, email, and presentation templates.",
      required: true,
      slots: [
        { id: "website", label: "Website" },
        { id: "social", label: "Social media assets" },
        { id: "email", label: "Email templates" },
        { id: "presentations", label: "Presentation templates" },
      ],
    },
    {
      id: "print",
      title: "Print & sales materials",
      description: "Business cards, brochures, one-pagers, and stationery.",
      required: false,
      slots: [
        { id: "business-cards", label: "Business cards" },
        { id: "brochures", label: "Company brochures" },
        { id: "one-pagers", label: "Sales sheets / one-pagers" },
        { id: "stationery", label: "Letterheads & envelopes" },
      ],
    },
    {
      id: "marketing",
      title: "Marketing & promotional assets",
      description: "Lead magnets, ads, swag, and event signage.",
      required: false,
      slots: [
        { id: "lead-magnets", label: "Digital lead magnets" },
        { id: "ads", label: "Advertisement templates" },
        { id: "swag", label: "Swag & promotional items" },
        { id: "signage", label: "Event signage" },
      ],
    },
    {
      id: "internal",
      title: "Internal communications",
      description: "Employee-facing branded templates and email signatures.",
      required: false,
      slots: [
        { id: "internal-templates", label: "Internal document templates" },
        { id: "onboarding", label: "Onboarding packets" },
        { id: "handbook", label: "Employee handbook" },
        { id: "signatures", label: "Email signatures" },
      ],
    },
  ];
  if (companyId === "xyz-marketing") {
    return base.map((c) =>
      c.id === "identity"
        ? {
            ...c,
            slots: c.slots.map((slot) =>
              slot.id === "style-guide" ? { ...slot, fileName: "xyz-brand-style-guide-v3.pdf" } : slot,
            ),
          }
        : c,
    );
  }
  return base;
}

export type OrgDepartmentFixture = {
  id: string;
  location: string;
  department: string;
  lead: string;
  headcount: number;
};

export type BoardMemberFixture = {
  name: string;
  role: string;
  location: string;
};

export function orgStructureForCompany(companyId: string): {
  departments: OrgDepartmentFixture[];
  board: BoardMemberFixture[];
  platformUsers: number;
} {
  const company = resolveCompanyFixture(companyId);
  const departments: OrgDepartmentFixture[] =
    companyId === "harbor-legal"
      ? [
          { id: "lit", location: "Tampa HQ", department: "Litigation", lead: "Partner Ana Reyes", headcount: 18 },
          { id: "corp", location: "Tampa HQ", department: "Corporate", lead: "Partner James Holt", headcount: 9 },
          { id: "ops", location: "Tampa HQ", department: "Operations", lead: "Director Sam Okonkwo", headcount: 6 },
        ]
      : companyId === "acme-dental"
        ? [
            { id: "clinical", location: "Orlando Main", department: "Clinical", lead: "Dr. Amelia Ortiz", headcount: 14 },
            { id: "front", location: "Orlando Main", department: "Front office", lead: "Maria Santos", headcount: 6 },
            { id: "south", location: "Kissimmee South", department: "South campus", lead: "Dr. Leo Park", headcount: 8 },
          ]
        : [
            { id: "creative", location: "Miami HQ", department: "Creative", lead: "Jane Rivera", headcount: 8 },
            { id: "media", location: "Miami HQ", department: "Paid media", lead: "Marco Chen", headcount: 5 },
            { id: "west", location: "Fort Lauderdale", department: "Client services", lead: "Tanya Brooks", headcount: 4 },
          ];
  const board: BoardMemberFixture[] =
    companyId === "harbor-legal"
      ? [
          { name: "Ana Reyes", role: "Managing Partner", location: "Tampa HQ" },
          { name: "James Holt", role: "Partner — Corporate", location: "Tampa HQ" },
        ]
      : companyId === "acme-dental"
        ? [{ name: "Dr. Amelia Ortiz", role: "Clinical Director", location: "Orlando Main" }]
        : [
            { name: "Jane Rivera", role: "Managing Director", location: "Miami HQ" },
            { name: "Marco Chen", role: "Finance Director", location: "Miami HQ" },
          ];
  return { departments, board, platformUsers: company.userCount };
}
