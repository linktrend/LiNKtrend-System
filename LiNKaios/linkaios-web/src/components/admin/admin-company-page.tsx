"use client";

import { Suspense } from "react";

import { LicenseeRegistryPanel } from "@/components/admin/licensee-registry-panel";
import { CompanyPageShell } from "@/components/company-page-shell";
import { ShellPageHeaderClient } from "@/components/shell-page-header-client";
import { useLicensorScope } from "@/components/role-preview-provider";
import { LICENSEES_PAGE_HEADER } from "@/lib/company-page-copy";

function AdminCompanyPageInner() {
  const { isAllLicensees } = useLicensorScope();

  if (isAllLicensees) {
    return (
      <main className="space-y-6">
        <ShellPageHeaderClient
          title={LICENSEES_PAGE_HEADER.title}
          subtitle={LICENSEES_PAGE_HEADER.subtitle}
        />
        <LicenseeRegistryPanel />
      </main>
    );
  }

  return (
    <main className="space-y-6">
      <CompanyPageShell />
    </main>
  );
}

export function AdminCompanyPage() {
  return (
    <Suspense fallback={<main className="p-6 text-sm text-zinc-500">Loading licensees…</main>}>
      <AdminCompanyPageInner />
    </Suspense>
  );
}
