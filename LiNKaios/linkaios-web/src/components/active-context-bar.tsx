"use client";

import { resolveBrandFixture } from "@/lib/brand-fixtures";
import { resolveCompanyFixture } from "@/lib/company-fixtures";
import { useLicenseeContext } from "@/hooks/use-licensee-context";

/** Shell strip — shows active legal entity and brand for the current workspace context. */
export function ActiveContextBar() {
  const { companyId, brandId, effectiveBrandId, display } = useLicenseeContext();
  const company = resolveCompanyFixture(companyId);
  const brand = resolveBrandFixture(effectiveBrandId, companyId);
  const explicitBrand = brandId ? resolveBrandFixture(brandId, companyId) : null;

  if (!display.showCompanySwitcher && !display.showBrandSwitcher) {
    return (
      <p className="text-xs text-zinc-500 dark:text-zinc-400">
        Working as <span className="font-medium text-zinc-700 dark:text-zinc-300">{company.displayName}</span>
        {brand ? <> · {brand.name}</> : null}
      </p>
    );
  }

  return (
    <p className="text-xs text-zinc-500 dark:text-zinc-400">
      Working as{" "}
      <span className="font-medium text-zinc-700 dark:text-zinc-300">{company.displayName}</span>
      {display.showBrandSwitcher && (explicitBrand ?? brand) ? (
        <>
          {" "}
          · Brand{" "}
          <span className="font-medium text-zinc-700 dark:text-zinc-300">{(explicitBrand ?? brand)!.name}</span>
        </>
      ) : null}
    </p>
  );
}
