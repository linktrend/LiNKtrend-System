"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { COMPANY_TABS, companyTabHref, normalizeCompanyTab } from "@/lib/company-page-copy";
import { screenTabLinkClass, TABS } from "@/lib/ui-standards";

export function CompanySubNav() {
  const searchParams = useSearchParams();
  const rawTab = searchParams.get("tab");
  const activeTab = normalizeCompanyTab(rawTab);
  const companyId = searchParams.get("companyId");

  return (
    <nav className={TABS.row} aria-label="Company sections">
      {COMPANY_TABS.map((tab) => (
        <Link
          key={tab.id}
          href={companyTabHref(tab.id, companyId)}
          className={screenTabLinkClass(activeTab === tab.id)}
          aria-current={activeTab === tab.id ? "page" : undefined}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}
