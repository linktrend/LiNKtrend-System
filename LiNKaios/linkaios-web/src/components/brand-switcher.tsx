"use client";

import { useRouter, useSearchParams } from "next/navigation";

import { brandsForCompany, type BrandFixture } from "@/lib/brand-fixtures";
import { InsetSelect } from "@/components/forms";
import { companyTabHref, normalizeCompanyTab } from "@/lib/company-page-copy";
import { FIELD, FORM } from "@/lib/ui-standards";

export function BrandSwitcher(props: { companyId: string; label?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const brands = brandsForCompany(props.companyId);

  if (brands.length <= 1) return null;

  const activeBrandId =
    brands.find((b) => b.id === searchParams.get("brandId"))?.id ?? brands.find((b) => b.isDefault)?.id ?? brands[0]?.id;
  const activeTab = normalizeCompanyTab(searchParams.get("tab"));

  return (
    <label htmlFor="brand-switcher" className={`block min-w-[14rem] flex-1 ${FORM.fieldStack}`}>
      <span className={FIELD.label}>{props.label ?? "Active brand"}</span>
      <InsetSelect
        id="brand-switcher"
        value={activeBrandId ?? ""}
        onChange={(e) => {
          const brandId = e.target.value.trim();
          router.push(companyTabHref(activeTab, props.companyId, brandId || null));
        }}
      >
        {brands.map((b: BrandFixture) => (
          <option key={b.id} value={b.id}>
            {b.name} ({b.code})
          </option>
        ))}
      </InsetSelect>
    </label>
  );
}
