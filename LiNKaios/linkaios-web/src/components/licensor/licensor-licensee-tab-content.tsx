"use client";

import { LicensorLicenseeBillingPanel } from "@/components/licensor/licensor-licensee-billing-panel";
import { LicensorLicenseeCompaniesPanel } from "@/components/licensor/licensor-licensee-companies-panel";
import { LicensorLicenseeOverviewPanel } from "@/components/licensor/licensor-licensee-overview-panel";
import { LicensorLicenseeSupportPanel } from "@/components/licensor/licensor-licensee-support-panel";
import { companyIdsForLicensee } from "@/lib/licensor-licensee-profile";
import { resolveCompanyFixture } from "@/lib/company-fixtures";
import type { LicensorLicenseeTabId } from "@/lib/company-page-copy";

export function LicensorLicenseeTabContent(props: {
  tab: LicensorLicenseeTabId;
  licenseeId: string;
  chatwootPublicUrl?: string | null;
  chatwootAccountId?: string | null;
}) {
  const primaryCompanyId = companyIdsForLicensee(props.licenseeId)[0] ?? props.licenseeId;
  const primaryCompany = resolveCompanyFixture(primaryCompanyId);

  switch (props.tab) {
    case "companies":
      return <LicensorLicenseeCompaniesPanel licenseeId={props.licenseeId} />;
    case "billing":
      return <LicensorLicenseeBillingPanel licenseeId={props.licenseeId} />;
    case "support":
      return (
        <LicensorLicenseeSupportPanel
          licenseeId={props.licenseeId}
          chatwootPublicUrl={props.chatwootPublicUrl ?? null}
          chatwootAccountId={props.chatwootAccountId ?? null}
        />
      );
    case "overview":
    default:
      return <LicensorLicenseeOverviewPanel licenseeId={props.licenseeId} primaryCompany={primaryCompany} />;
  }
}
