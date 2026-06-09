"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { useAppRole } from "@/components/role-preview-provider";
import { useLicenseeContext } from "@/hooks/use-licensee-context";
import {
  COMPANY_TABS,
  companyHubPath,
  companyTabHref,
  companyTabHrefForSurface,
  LICENSOR_LICENSEE_TABS,
  normalizeCompanyTab,
  LICENSEES_LABEL,
  normalizeLicensorLicenseeTab,
} from "@/lib/company-page-copy";
import { screenTabLinkClass, TABS, formatUiLabel } from "@/lib/ui-standards";

export function CompanySubNav() {
  const searchParams = useSearchParams();
  const rawTab = searchParams.get("tab");
  const { companyId, brandId } = useLicenseeContext();
  const { kind } = useAppRole();
  const isLicensor = kind === "licensor";
  const tabs = isLicensor ? LICENSOR_LICENSEE_TABS : COMPANY_TABS;
  const activeTab = isLicensor ? normalizeLicensorLicenseeTab(rawTab) : normalizeCompanyTab(rawTab);
  const navLabel = isLicensor ? `${LICENSEES_LABEL} sections` : "Company sections";

  return (
    <nav className={TABS.row} aria-label={navLabel}>
      {tabs.map((tab) => {
        const href = isLicensor
          ? companyTabHref(tab.id, companyId, undefined, companyHubPath(true))
          : companyTabHrefForSurface(
              tab.id,
              "licensee",
              companyId,
              tab.id === "brand" ? brandId : undefined,
            );

        return (
          <Link
            key={tab.id}
            href={href}
            className={screenTabLinkClass(activeTab === tab.id)}
            aria-current={activeTab === tab.id ? "page" : undefined}
          >
            {formatUiLabel(tab.label)}
          </Link>
        );
      })}
    </nav>
  );
}
