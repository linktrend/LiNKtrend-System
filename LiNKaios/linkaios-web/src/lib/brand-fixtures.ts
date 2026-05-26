/** Brand fixtures — market-facing identities under a legal entity (company). */

export type BrandFixture = {
  id: string;
  companyId: string;
  name: string;
  code: string;
  tagline: string;
  isDefault?: boolean;
};

const BRANDS: BrandFixture[] = [
  {
    id: "xyz-main",
    companyId: "xyz-marketing",
    name: "XYZ Marketing",
    code: "XYZ",
    tagline: "Full-service digital for South Florida SMBs.",
    isDefault: true,
  },
  {
    id: "xyz-social",
    companyId: "xyz-marketing",
    name: "XYZ Social Studio",
    code: "XYZ-S",
    tagline: "Social-first campaigns and creator partnerships.",
  },
  {
    id: "acme-smile",
    companyId: "acme-dental",
    name: "Acme Smile",
    code: "SMILE",
    tagline: "Family and cosmetic dentistry.",
    isDefault: true,
  },
  {
    id: "acme-kids",
    companyId: "acme-dental",
    name: "Acme Kids Dental",
    code: "KIDS",
    tagline: "Paediatric chairs and gentle-care positioning.",
  },
  {
    id: "harbor-main",
    companyId: "harbor-legal",
    name: "Harbor Legal",
    code: "HARBOR",
    tagline: "Litigation and corporate counsel.",
    isDefault: true,
  },
];

export function brandsForCompany(companyId: string): BrandFixture[] {
  return BRANDS.filter((b) => b.companyId === companyId);
}

export function resolveBrandFixture(
  brandId: string | null | undefined,
  companyId: string,
): BrandFixture | null {
  if (!brandId?.trim()) return defaultBrandForCompany(companyId);
  return BRANDS.find((b) => b.id === brandId && b.companyId === companyId) ?? defaultBrandForCompany(companyId);
}

export function defaultBrandForCompany(companyId: string): BrandFixture | null {
  const rows = brandsForCompany(companyId);
  return rows.find((b) => b.isDefault) ?? rows[0] ?? null;
}

export function resolveActiveBrandId(
  brandId: string | null | undefined,
  companyId: string,
): string | null {
  const brand = resolveBrandFixture(brandId, companyId);
  return brand?.id ?? null;
}
