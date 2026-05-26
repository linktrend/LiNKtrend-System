"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { InsetSelect } from "@/components/forms";
import { useAppSurface } from "@/components/app-surface-provider";
import { brandsForCompany, defaultBrandForCompany, type BrandFixture } from "@/lib/brand-fixtures";
import { COMPANY_FIXTURES, resolveCompanyFixture } from "@/lib/company-fixtures";
import { companyTabHref, normalizeCompanyTab } from "@/lib/company-page-copy";
import { companiesVisibleInTopology, topologyDisplayMode } from "@/lib/tenant-topology";
import { useTenantTopology } from "@/hooks/use-tenant-topology";
import { effectiveBrandId, parseLicenseeContext } from "@/lib/licensee-context";
import { FIELD, FORM } from "@/lib/ui-standards";

/** Persistent sidebar footer — active legal entity and brand via dropdowns. */
export function SidebarActiveContext() {
  const router = useRouter();
  const pathname = usePathname() ?? "/";
  const searchParams = useSearchParams();
  const { href: appHref } = useAppSurface();
  const { mode: topologyMode } = useTenantTopology();
  const display = topologyDisplayMode(topologyMode);
  const ctx = parseLicenseeContext(searchParams, topologyMode);
  const company = resolveCompanyFixture(ctx.companyId);
  const brands = brandsForCompany(ctx.companyId);
  const activeBrandId = effectiveBrandId(ctx);

  const visibleCompanyIds = companiesVisibleInTopology(
    topologyMode,
    COMPANY_FIXTURES.map((c) => c.id),
  );
  const companyOptions = COMPANY_FIXTURES.filter((c) => visibleCompanyIds.includes(c.id));

  const pushGlobalContext = (nextCompanyId: string, nextBrandId: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("companyId", nextCompanyId);
    if (nextBrandId) params.set("brandId", nextBrandId);
    else params.delete("brandId");
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  };

  const onCompanyChange = (nextCompanyId: string) => {
    const defaultBrand = defaultBrandForCompany(nextCompanyId)?.id ?? null;
    if (pathname.startsWith("/company")) {
      const tab = normalizeCompanyTab(searchParams.get("tab"));
      const brandForHref = tab === "brand" ? defaultBrand : null;
      router.push(appHref(companyTabHref(tab, nextCompanyId, brandForHref)));
      return;
    }
    pushGlobalContext(nextCompanyId, defaultBrand);
  };

  const onBrandChange = (nextBrandId: string) => {
    if (pathname.startsWith("/company")) {
      const tab = normalizeCompanyTab(searchParams.get("tab"));
      router.push(appHref(companyTabHref(tab, ctx.companyId, nextBrandId || null)));
      return;
    }
    pushGlobalContext(ctx.companyId, nextBrandId || null);
  };

  const showBrandControl = display.showBrandSwitcher && brands.length > 0;

  return (
    <div className="space-y-3 px-2 py-3">
      <div className={FORM.fieldStack}>
        <span className={`${FIELD.label} px-0.5`}>Active company</span>
        {display.showCompanySwitcher && companyOptions.length > 1 ? (
          <InsetSelect
            id="sidebar-active-company"
            value={ctx.companyId}
            aria-label="Active company"
            onChange={(e) => onCompanyChange(e.target.value)}
          >
            {companyOptions.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </InsetSelect>
        ) : (
          <p className="truncate px-0.5 text-sm font-semibold text-zinc-900 dark:text-zinc-100" title={company.name}>
            {company.name}
          </p>
        )}
      </div>

      {showBrandControl ? (
        <div className={FORM.fieldStack}>
          <span className={`${FIELD.label} px-0.5`}>Active brand</span>
          {brands.length > 1 ? (
            <InsetSelect
              id="sidebar-active-brand"
              value={activeBrandId ?? ""}
              aria-label="Active brand"
              onChange={(e) => onBrandChange(e.target.value)}
            >
              {brands.map((b: BrandFixture) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </InsetSelect>
          ) : (
            <p className="truncate px-0.5 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              {brands[0]?.name ?? "—"}
            </p>
          )}
        </div>
      ) : null}
    </div>
  );
}
