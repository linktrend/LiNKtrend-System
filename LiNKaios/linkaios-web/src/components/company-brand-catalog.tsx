"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { brandsForCompany, type BrandFixture } from "@/lib/brand-fixtures";
import { companyTabHref } from "@/lib/company-page-copy";
import { mergeLicenseeContextIntoSearch } from "@/lib/licensee-context";
import { BUTTON } from "@/lib/ui-standards";

/** Brand catalog on the Company → Brand tab when topology has multiple brands. */
export function CompanyBrandCatalog(props: { companyId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const brands = brandsForCompany(props.companyId);

  if (brands.length <= 1) return null;

  const openBrand = (brand: BrandFixture) => {
    const params = mergeLicenseeContextIntoSearch(searchParams, {
      companyId: props.companyId,
      brandId: brand.id,
    });
    params.set("tab", "brand");
    router.push(`/company?${params.toString()}`);
  };

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {brands.map((brand) => (
        <button
          key={brand.id}
          type="button"
          onClick={() => openBrand(brand)}
          className="rounded-xl border border-zinc-200 bg-white px-4 py-3 text-left transition hover:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-950 dark:hover:border-zinc-500"
        >
          <span className="block font-medium text-zinc-900 dark:text-zinc-100">{brand.name}</span>
          <span className="mt-0.5 block text-xs text-zinc-500 dark:text-zinc-400">{brand.code}</span>
          <span className="mt-2 block text-sm text-zinc-600 dark:text-zinc-400">{brand.tagline}</span>
        </button>
      ))}
    </div>
  );
}

export function CompanyBrandCatalogBackLink(props: { companyId: string }) {
  const href = companyTabHref("brand", props.companyId);
  return (
    <Link href={href} className={`${BUTTON.secondaryRow} text-xs`}>
      All brands
    </Link>
  );
}
