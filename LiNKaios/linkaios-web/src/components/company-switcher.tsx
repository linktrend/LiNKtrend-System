"use client";

import { useRouter, useSearchParams } from "next/navigation";

import { InsetSelect } from "@/components/forms";
import { brandsForCompany, defaultBrandForCompany } from "@/lib/brand-fixtures";
import { COMPANY_SECTION_COPY, companyTabHref, normalizeCompanyTab } from "@/lib/company-page-copy";
import { COMPANY_FIXTURES } from "@/lib/company-fixtures";
import { useLicenseeContext } from "@/hooks/use-licensee-context";
import { companiesVisibleInTopology } from "@/lib/tenant-topology";
import { FIELD, FORM } from "@/lib/ui-standards";

export function CompanySwitcher() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { companyId, topologyMode, display } = useLicenseeContext();
  const activeTab = normalizeCompanyTab(searchParams.get("tab"));

  if (!display.showCompanySwitcher) return null;

  const visibleIds = companiesVisibleInTopology(
    topologyMode,
    COMPANY_FIXTURES.map((c) => c.id),
  );
  const options = COMPANY_FIXTURES.filter((c) => visibleIds.includes(c.id));

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
      <label htmlFor="company-switcher" className={`block min-w-[14rem] flex-1 ${FORM.fieldStack}`}>
        <span className={FIELD.label}>{COMPANY_SECTION_COPY.switcher.label}</span>
        <InsetSelect
          id="company-switcher"
          value={companyId}
          onChange={(e) => {
            const nextCompanyId = e.target.value;
            const nextBrandId =
              activeTab === "brand" ? (defaultBrandForCompany(nextCompanyId)?.id ?? null) : null;
            router.push(companyTabHref(activeTab, nextCompanyId, nextBrandId));
          }}
        >
          {options.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} ({c.code})
            </option>
          ))}
        </InsetSelect>
      </label>
    </div>
  );
}
