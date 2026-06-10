"use client";

import { Suspense } from "react";

import { LicenseeRegistryPanel } from "@/components/admin/licensee-registry-panel";
import { LicensorLicenseePageShell } from "@/components/licensor/licensor-licensee-page-shell";
import { ShellPageHeaderClient } from "@/components/shell-page-header-client";
import { useLicensorScope } from "@/components/role-preview-provider";
import { LICENSEES_PAGE_HEADER } from "@/lib/company-page-copy";

function AdminCompanyPageInner(props: {
  chatwootPublicUrl: string | null;
  chatwootAccountId: string | null;
}) {
  const { isSingleLicensee } = useLicensorScope();

  if (!isSingleLicensee) {
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
    <LicensorLicenseePageShell
      chatwootPublicUrl={props.chatwootPublicUrl}
      chatwootAccountId={props.chatwootAccountId}
    />
  );
}

export function AdminCompanyPage(props: {
  chatwootPublicUrl: string | null;
  chatwootAccountId: string | null;
}) {
  return (
    <Suspense fallback={<main className="p-6 text-sm text-zinc-500">Loading licensees…</main>}>
      <AdminCompanyPageInner
        chatwootPublicUrl={props.chatwootPublicUrl}
        chatwootAccountId={props.chatwootAccountId}
      />
    </Suspense>
  );
}
