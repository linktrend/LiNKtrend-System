import {
  COMPANY_TABS,
  companyTabHref,
  isCompanyHubPath,
  matchCompanyTab,
  type CompanyTabId,
} from "@/lib/company-page-copy";

export type CompanyNavItem = {
  id: CompanyTabId;
  label: string;
  href: (companyId: string | null, brandId?: string | null) => string;
  match: (path: string, search?: string) => boolean;
};

/** Sidebar sections for Company — mirrors hub tab strip on `/company`. */
export const COMPANY_SIDEBAR_ITEMS: CompanyNavItem[] = COMPANY_TABS.map((tab) => ({
  id: tab.id,
  label: tab.label,
  href: (companyId, brandId) => companyTabHref(tab.id, companyId, brandId),
  match: (path, search) => matchCompanyTab(tab.id, path, search),
}));

export function companySectionActive(pathname: string): boolean {
  return isCompanyHubPath(pathname);
}
