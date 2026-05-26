"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";

import { AddBrandOpenButton, AddBrandRoot } from "@/components/add-brand";
import { AddCompanyOpenButton, AddCompanyRoot } from "@/components/add-company";
import { BrandSwitcher } from "@/components/brand-switcher";
import { CompanyBrandPanel } from "@/components/company-brand-panel";
import { CompanyEntityPanel } from "@/components/company-entity-panel";
import { CompanySubNav } from "@/components/company-sub-nav";
import { CompanySwitcher } from "@/components/company-switcher";
import { LicensorLicenseeTabContent } from "@/components/licensor/licensor-licensee-tab-content";
import { ShellPageHeaderClient } from "@/components/shell-page-header-client";
import { useAppSurface } from "@/components/app-surface-provider";
import { useAppRole, useLicensorScope } from "@/components/role-preview-provider";
import { useLicenseeContext } from "@/hooks/use-licensee-context";
import {
  COMPANY_DEFAULT_TAB,
  COMPANY_PAGE_HEADER,
  LICENSEE_PROFILE_PAGE_HEADER,
  normalizeCompanyTab,
  normalizeLicensorLicenseeTab,
} from "@/lib/company-page-copy";
import { resolveCompanyFixture } from "@/lib/company-fixtures";
import { appendLicenseeContext } from "@/lib/licensee-context";
import { resolveLicenseeIdForCompany } from "@/lib/licensor-licensee-profile";
import { ALL_LICENSEES_SCOPE } from "@/lib/app-roles";
import { canEditCompanyProfile } from "@/lib/app-roles";
import { BUTTON } from "@/lib/ui-standards";

function CompanyTabContent(props: { tab: string; companyId: string; brandId: string | null }) {
  const tab = normalizeCompanyTab(props.tab);
  const company = resolveCompanyFixture(props.companyId);

  if (tab === "brand") {
    return <CompanyBrandPanel companyId={props.companyId} brandId={props.brandId} />;
  }

  return <CompanyEntityPanel company={company} />;
}

function CompanyPageShellInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawTab = searchParams.get("tab");
  const { companyId, brandId, effectiveBrandId, display } = useLicenseeContext();
  const { kind, role } = useAppRole();
  const { isAdmin } = useAppSurface();
  const { scope: licensorScope } = useLicensorScope();
  const canEdit = canEditCompanyProfile(kind, role);
  const company = resolveCompanyFixture(companyId);
  const isLicensorLicenseeView = isAdmin && kind === "licensor";
  const pageHeader = isLicensorLicenseeView ? LICENSEE_PROFILE_PAGE_HEADER : COMPANY_PAGE_HEADER;
  const licensorTab = normalizeLicensorLicenseeTab(rawTab);
  const licenseeTab = normalizeCompanyTab(rawTab ?? COMPANY_DEFAULT_TAB);
  const licensorLicenseeId =
    licensorScope !== ALL_LICENSEES_SCOPE ? licensorScope : resolveLicenseeIdForCompany(companyId);

  useEffect(() => {
    if (isLicensorLicenseeView) return;
    if (rawTab === "modules") {
      router.replace(appendLicenseeContext("/suites/my-suites", { companyId, brandId: effectiveBrandId }));
      return;
    }
    if (rawTab === "overview") {
      router.replace(appendLicenseeContext("/app", { companyId, brandId: effectiveBrandId }));
    }
  }, [router, rawTab, companyId, effectiveBrandId, isLicensorLicenseeView]);

  if (!isLicensorLicenseeView && rawTab === "modules") {
    return <main className="p-6 text-sm text-zinc-500">Redirecting to suites…</main>;
  }

  if (!isLicensorLicenseeView && rawTab === "overview") {
    return <main className="p-6 text-sm text-zinc-500">Redirecting to overview…</main>;
  }

  const headerAction =
    !isLicensorLicenseeView && canEdit
      ? licenseeTab === "company"
        ? (
            <AddCompanyOpenButton className={BUTTON.addRow} />
          )
        : licenseeTab === "brand"
          ? (
              <AddBrandOpenButton className={BUTTON.addRow} />
            )
          : null
      : null;

  return (
    <main className="space-y-6">
      {!isLicensorLicenseeView ? (
        <>
          <AddCompanyRoot />
          <AddBrandRoot />
        </>
      ) : null}
      <ShellPageHeaderClient title={pageHeader.title} subtitle={pageHeader.subtitle} actions={headerAction} />
      <CompanySubNav />

      {!isLicensorLicenseeView && licenseeTab === "company" ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
          <CompanySwitcher />
        </div>
      ) : null}

      {!isLicensorLicenseeView && licenseeTab === "brand" && display.showBrandSwitcher ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
          <CompanySwitcher />
          <BrandSwitcher companyId={companyId} />
        </div>
      ) : null}

      {!isLicensorLicenseeView && licenseeTab === "brand" && !display.showBrandSwitcher ? (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Brand profile for <span className="font-medium text-zinc-900 dark:text-zinc-100">{company.displayName}</span>.
        </p>
      ) : null}

      {isLicensorLicenseeView ? (
        <LicensorLicenseeTabContent tab={licensorTab} licenseeId={licensorLicenseeId} />
      ) : (
        <CompanyTabContent tab={licenseeTab} companyId={companyId} brandId={brandId} />
      )}
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
