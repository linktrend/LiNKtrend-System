"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

import { LicensorLicenseeTabContent } from "@/components/licensor/licensor-licensee-tab-content";
import { CompanySubNav } from "@/components/company-sub-nav";
import { ShellPageHeaderClient } from "@/components/shell-page-header-client";
import { useAppSurface } from "@/components/app-surface-provider";
import { useLicensorScope } from "@/components/role-preview-provider";
import {
  LICENSEE_PROFILE_PAGE_HEADER,
  LICENSEES_PAGE_HEADER,
  normalizeLicensorLicenseeTab,
} from "@/lib/company-page-copy";
import { ALL_LICENSEES_SCOPE } from "@/lib/app-roles";
import { resolveLicenseeRegistry } from "@/lib/licensee-registry";
import { BUTTON } from "@/lib/ui-standards";

function LicensorLicenseePageShellInner(props: {
  chatwootPublicUrl: string | null;
  chatwootAccountId: string | null;
}) {
  const searchParams = useSearchParams();
  const rawTab = searchParams.get("tab");
  const { scope, setScope } = useLicensorScope();
  const { href } = useAppSurface();
  const router = useRouter();
  const tab = normalizeLicensorLicenseeTab(rawTab);
  const registry = resolveLicenseeRegistry(scope);
  const title = registry ? `${registry.name} — ${LICENSEE_PROFILE_PAGE_HEADER.title}` : LICENSEE_PROFILE_PAGE_HEADER.title;

  function returnToRegistry() {
    setScope(ALL_LICENSEES_SCOPE);
    router.push(href("/licensees"));
  }

  return (
    <main className="space-y-6">
      <ShellPageHeaderClient
        title={title}
        subtitle={LICENSEE_PROFILE_PAGE_HEADER.subtitle}
        actions={
          <button type="button" onClick={returnToRegistry} className={BUTTON.secondaryRow}>
            Back to {LICENSEES_PAGE_HEADER.title}
          </button>
        }
      />
      <CompanySubNav />
      <LicensorLicenseeTabContent
        tab={tab}
        licenseeId={scope}
        chatwootPublicUrl={props.chatwootPublicUrl}
        chatwootAccountId={props.chatwootAccountId}
      />
    </main>
  );
}

/** Admin-only licensee detail — service profile tabs without Client corporate governance panels. */
export function LicensorLicenseePageShell(props: {
  chatwootPublicUrl: string | null;
  chatwootAccountId: string | null;
}) {
  return (
    <Suspense fallback={<main className="p-6 text-sm text-zinc-500">Loading licensee profile…</main>}>
      <LicensorLicenseePageShellInner
        chatwootPublicUrl={props.chatwootPublicUrl}
        chatwootAccountId={props.chatwootAccountId}
      />
    </Suspense>
  );
}
