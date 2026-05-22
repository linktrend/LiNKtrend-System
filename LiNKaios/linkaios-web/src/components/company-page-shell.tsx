"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";

import { AddCompanyOpenButton, AddCompanyRoot } from "@/components/add-company";
import { CompanyBrandPanel } from "@/components/company-brand-panel";
import { CompanyOrgStructurePanel } from "@/components/company-org-structure-panel";
import { CompanyOverviewPanel } from "@/components/company-overview-panel";
import { CompanySubNav } from "@/components/company-sub-nav";
import { CompanySwitcher } from "@/components/company-switcher";
import { ShellPageHeaderClient } from "@/components/shell-page-header-client";
import {
  COMPANY_DEFAULT_TAB,
  COMPANY_PAGE_HEADER,
  normalizeCompanyTab,
} from "@/lib/company-page-copy";
import { resolveCompanyFixture } from "@/lib/company-fixtures";
import { BUTTON } from "@/lib/ui-standards";

function CompanyTabContent(props: { tab: string; companyId: string }) {
  const tab = normalizeCompanyTab(props.tab);
  const company = resolveCompanyFixture(props.companyId);

  if (tab === "overview") {
    return <CompanyOverviewPanel company={company} />;
  }

  if (tab === "brand") {
    return <CompanyBrandPanel />;
  }

  return <CompanyOrgStructurePanel />;
}

function CompanyPageShellInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") ?? COMPANY_DEFAULT_TAB;
  const companyId = searchParams.get("companyId") ?? resolveCompanyFixture(null).id;

  useEffect(() => {
    if (searchParams.get("tab") === "modules") {
      router.replace("/suites/my-suites");
    }
  }, [router, searchParams]);

  if (searchParams.get("tab") === "modules") {
    return <main className="p-6 text-sm text-zinc-500">Redirecting to modules…</main>;
  }

  return (
    <main className="space-y-6">
      <AddCompanyRoot />
      <ShellPageHeaderClient
        title={COMPANY_PAGE_HEADER.title}
        subtitle={COMPANY_PAGE_HEADER.subtitle}
        actions={<AddCompanyOpenButton className={BUTTON.addRow}>Add Company</AddCompanyOpenButton>}
      />
      <CompanySwitcher />
      <CompanySubNav />

      <CompanyTabContent tab={tab} companyId={companyId} />
    </main>
  );
}

export function CompanyPageShell() {
  return (
    <Suspense fallback={<main className="p-6 text-sm text-zinc-500">Loading company…</main>}>
      <CompanyPageShellInner />
    </Suspense>
  );
}
