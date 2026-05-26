import { brandsForCompany } from "@/lib/brand-fixtures";
import { corporateProfileForCompany, type CompanyFixture } from "@/lib/company-fixtures";
import { resolveLicenseeRegistry } from "@/lib/licensee-registry";
import {
  BILLING_DEMO_INVOICES,
  BILLING_DEMO_LINKAIOS_PLAN,
} from "@/lib/ui-mocks/billing-demo";

export type ServiceContactRole = "owner" | "billing" | "technical" | "admin";

export type ServiceContact = {
  role: ServiceContactRole;
  label: string;
  name: string;
  email: string;
  phone: string;
};

export type LicensorCompanyBrandIndexRow = {
  companyId: string;
  companyName: string;
  brandId: string;
  brandName: string;
  status: "active" | "inactive";
  linkbotCount: number;
};

export type LicensorContractSummary = {
  contractRef: string;
  signedAt: string;
  termMonths: number;
  tier: string;
  documentLabel: string;
  stripeCustomerId: string | null;
  /** Contract vault entries — links activate when document storage is wired. */
  documents: { id: string; label: string }[];
};

const LICENSEE_COMPANY_MAP: Record<string, string[]> = {
  "xyz-marketing": ["xyz-marketing"],
  "lexos-legal": ["harbor-legal"],
  "harbor-dental": ["acme-dental"],
};

const LINKBOT_COUNTS: Record<string, number> = {
  "xyz-marketing": 4,
  "acme-dental": 2,
  "harbor-legal": 6,
};

const SERVICE_CONTACTS: Record<string, ServiceContact[]> = {
  "xyz-marketing": [
    { role: "owner", label: "Account owner", name: "Jane Rivera", email: "jane@xyz-marketing.example", phone: "+1 305 555 0100" },
    { role: "billing", label: "Billing / finance", name: "Marco Chen", email: "finance@xyz-marketing.example", phone: "+1 305 555 0102" },
    { role: "technical", label: "Technical / IT", name: "Alex Kim", email: "it@xyz-marketing.example", phone: "+1 305 555 0103" },
    { role: "admin", label: "Workspace admin", name: "Sam Ortiz", email: "admin@xyz-marketing.example", phone: "+1 305 555 0104" },
  ],
  "lexos-legal": [
    { role: "owner", label: "Account owner", name: "Patricia Wells", email: "p.wells@lexos.example", phone: "+44 20 7946 0100" },
    { role: "billing", label: "Billing / finance", name: "Finance Desk", email: "billing@lexos.example", phone: "+44 20 7946 0101" },
    { role: "admin", label: "Workspace admin", name: "Ops Team", email: "ops@lexos.example", phone: "+44 20 7946 0102" },
  ],
  "harbor-dental": [
    { role: "owner", label: "Account owner", name: "Dr. Lee Nguyen", email: "lee@harbor-dental.example", phone: "+1 407 555 0200" },
    { role: "billing", label: "Billing / finance", name: "Office Manager", email: "billing@harbor-dental.example", phone: "+1 407 555 0201" },
    { role: "technical", label: "Technical / IT", name: "IT Vendor", email: "support@vendor.example", phone: "+1 407 555 0202" },
  ],
};

const CONTRACTS: Record<string, LicensorContractSummary> = {
  "xyz-marketing": {
    contractRef: "MSA-2025-XYZ-001",
    signedAt: "2025-11-01",
    termMonths: 12,
    tier: "Business",
    documentLabel: "LiNKaios MSA + Order Form (signed PDF)",
    stripeCustomerId: "cus_demo_xyz_marketing",
    documents: [
      { id: "msa", label: "LiNKaios MSA + Order Form (signed PDF)" },
      { id: "dpa", label: "Data Processing Addendum" },
    ],
  },
  "lexos-legal": {
    contractRef: "MSA-2025-LEX-004",
    signedAt: "2025-09-15",
    termMonths: 24,
    tier: "Professional",
    documentLabel: "LiNKaios Enterprise MSA",
    stripeCustomerId: "cus_demo_lexos",
    documents: [{ id: "msa", label: "LiNKaios Enterprise MSA" }],
  },
  "harbor-dental": {
    contractRef: "MSA-2026-HDC-002",
    signedAt: "2026-01-10",
    termMonths: 12,
    tier: "Starter",
    documentLabel: "Trial conversion order form",
    stripeCustomerId: "cus_demo_harbor_dental",
    documents: [{ id: "order-form", label: "Trial conversion order form" }],
  },
};

export function companyIdsForLicensee(licenseeId: string): string[] {
  return LICENSEE_COMPANY_MAP[licenseeId] ?? [licenseeId];
}

/** Map a company fixture id to its tenant registry id (MVO demo mapping). */
export function resolveLicenseeIdForCompany(companyId: string): string {
  for (const [licenseeId, companies] of Object.entries(LICENSEE_COMPANY_MAP)) {
    if (companies.includes(companyId)) return licenseeId;
  }
  return companyId;
}

export function serviceContactsForLicensee(licenseeId: string): ServiceContact[] {
  return SERVICE_CONTACTS[licenseeId] ?? [];
}

export function contractSummaryForLicensee(licenseeId: string): LicensorContractSummary | null {
  return CONTRACTS[licenseeId] ?? null;
}

export function companiesBrandsIndexForLicensee(licenseeId: string, companies: CompanyFixture[]): LicensorCompanyBrandIndexRow[] {
  const allowed = new Set(companyIdsForLicensee(licenseeId));
  const rows: LicensorCompanyBrandIndexRow[] = [];
  for (const company of companies.filter((c) => allowed.has(c.id))) {
    const brands = brandsForCompany(company.id);
    if (brands.length === 0) {
      rows.push({
        companyId: company.id,
        companyName: company.displayName,
        brandId: company.id,
        brandName: company.displayName,
        status: "active",
        linkbotCount: LINKBOT_COUNTS[company.id] ?? 0,
      });
      continue;
    }
    for (const brand of brands) {
      rows.push({
        companyId: company.id,
        companyName: company.displayName,
        brandId: brand.id,
        brandName: brand.name,
        status: "active",
        linkbotCount: LINKBOT_COUNTS[company.id] ?? 0,
      });
    }
  }
  return rows;
}

export function contractEntitySummaryForLicensee(licenseeId: string, primaryCompany: CompanyFixture) {
  const profile = corporateProfileForCompany(primaryCompany.id);
  const registry = resolveLicenseeRegistry(licenseeId);
  return {
    legalName: profile.registeredName || primaryCompany.name,
    registrationNumber: profile.registrationNumber,
    registeredOffice: profile.registeredOffice,
    email: profile.email,
    phone: profile.phoneNumber ? `${profile.phoneCountryCode} ${profile.phoneNumber}` : "—",
    industry: primaryCompany.industry,
    plan: registry?.plan ?? BILLING_DEMO_LINKAIOS_PLAN.name,
    status: registry?.status ?? "active",
  };
}

export function billingSnapshotForLicensee(licenseeId: string) {
  const contract = contractSummaryForLicensee(licenseeId);
  const registry = resolveLicenseeRegistry(licenseeId);
  return {
    plan: registry?.plan ?? BILLING_DEMO_LINKAIOS_PLAN.name,
    stripeCustomerId: contract?.stripeCustomerId ?? null,
    invoices: BILLING_DEMO_INVOICES.slice(0, 3),
    contract,
  };
}
