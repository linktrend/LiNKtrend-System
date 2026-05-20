/** UI fixtures for multi-company preview on `/company` (no persistence). */

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
  module: string;
  status: "active" | "trialing" | "not_subscribed" | "canceled";
  plan: string | null;
};

const MODULES_BY_COMPANY: Record<string, ModuleSubscriptionFixture[]> = {
  "xyz-marketing": [
    { id: "linksites", module: "LinkSites", status: "active", plan: "Professional" },
    { id: "linkapps", module: "LiNKapps", status: "not_subscribed", plan: null },
    { id: "lexos", module: "LEXOS Litigation", status: "trialing", plan: "Starter" },
  ],
  "acme-dental": [
    { id: "linksites", module: "LinkSites", status: "active", plan: "Starter" },
    { id: "linkapps", module: "LiNKapps", status: "not_subscribed", plan: null },
  ],
  "harbor-legal": [
    { id: "linksites", module: "LinkSites", status: "active", plan: "Enterprise" },
    { id: "lexos", module: "LEXOS Litigation", status: "active", plan: "Professional" },
    { id: "linkapps", module: "LiNKapps", status: "canceled", plan: null },
  ],
};

export function modulesForCompany(companyId: string): ModuleSubscriptionFixture[] {
  return MODULES_BY_COMPANY[companyId] ?? MODULES_BY_COMPANY[COMPANY_DEFAULT_FIXTURE_ID] ?? [];
}

export const STRIPE_PLAN_OPTIONS = ["Starter", "Professional", "Enterprise"] as const;
