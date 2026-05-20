"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { COMPANY_DEFAULT_TAB, COMPANY_TABS, type CompanyTabId, isCompanyTabId } from "@/lib/company-page-copy";
import { screenTabLinkClass, TABS } from "@/lib/ui-standards";

function companyHref(tab: CompanyTabId, companyId: string | null): string {
  const params = new URLSearchParams();
  if (companyId) params.set("companyId", companyId);
  if (tab !== COMPANY_DEFAULT_TAB) params.set("tab", tab);
  const query = params.toString();
  return query ? `/company?${query}` : "/company";
}

export function CompanySubNav() {
  const searchParams = useSearchParams();
  const rawTab = searchParams.get("tab");
  const activeTab = isCompanyTabId(rawTab) ? rawTab : COMPANY_DEFAULT_TAB;
  const companyId = searchParams.get("companyId");

  return (
    <nav className={TABS.row} aria-label="Company sections">
      {COMPANY_TABS.map((tab) => (
        <Link
          key={tab.id}
          href={companyHref(tab.id, companyId)}
          className={screenTabLinkClass(activeTab === tab.id)}
          aria-current={activeTab === tab.id ? "page" : undefined}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}
