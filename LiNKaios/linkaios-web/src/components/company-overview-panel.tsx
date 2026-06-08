"use client";

import { useEffect, useMemo, useState } from "react";
import { Banknote, Building2, MapPin } from "lucide-react";

import { CompanyPeopleSection } from "@/components/company-people-section";
import {
  CompanyCorporateBasicFields,
  CompanyCorporateContactFields,
  CompanyCorporateFinancialFields,
} from "@/components/company-corporate-fields";
import { CompanyEditableCard } from "@/components/company-editable-card";
import { CompanyFieldGrid } from "@/components/company-form-fields";
import {
  corporateProfileForCompany,
  formatFinancialFilingDisplay,
  formatShareCapitalDisplay,
  mergeCorporateProfile,
  type CompanyFixture,
  type CorporateProfileFixture,
} from "@/lib/company-fixtures";
import { formatIsoDateDisplay } from "@/lib/date-field-utils";
import { formatPersonalAddressNatural, formatPersonalPhoneDisplay } from "@/lib/personal-contact-display";

function formatAddressDisplay(address: CorporateProfileFixture["registeredOffice"] | undefined): string {
  const lines = formatPersonalAddressNatural(address);
  return lines.length > 0 ? lines.join(" · ") : "—";
}

export function CompanyOverviewPanel(props: { company: CompanyFixture }) {
  const seed = corporateProfileForCompany(props.company.id);
  const [profile, setProfile] = useState(seed);
  const [draft, setDraft] = useState<Partial<CorporateProfileFixture>>({});

  useEffect(() => {
    const next = corporateProfileForCompany(props.company.id);
    setProfile(next);
    setDraft({});
  }, [props.company.id]);

  const merged = useMemo(() => mergeCorporateProfile(profile, draft), [profile, draft]);

  function patchDraft(next: Partial<CorporateProfileFixture>) {
    setDraft((current) => {
      const updated: Partial<CorporateProfileFixture> = { ...current, ...next };
      if (next.registeredOffice) {
        updated.registeredOffice = {
          ...profile.registeredOffice,
          ...current.registeredOffice,
          ...next.registeredOffice,
        };
      }
      if (next.principalPlace) {
        updated.principalPlace = {
          ...profile.principalPlace,
          ...current.principalPlace,
          ...next.principalPlace,
        };
      }
      return updated;
    });
  }

  return (
    <div className="space-y-4">
      <CompanyEditableCard
        icon={Building2}
        title="Basic corporate information"
        description="Registered identity, dates, and primary business activities."
        required
        editContent={<CompanyCorporateBasicFields profile={merged} onChange={patchDraft} />}
      >
        <CompanyFieldGrid
          rows={[
            { label: "Company name", value: merged.registeredName },
            { label: "Trading names", value: merged.tradingNames },
            { label: "Registration number", value: merged.registrationNumber },
            { label: "Incorporated", value: formatIsoDateDisplay(merged.incorporationDate) },
            { label: "Financial year end", value: merged.financialYearEnd },
            { label: "AGM due", value: formatIsoDateDisplay(merged.agmDueDate) },
            { label: "Industry", value: props.company.industry },
            { label: "Activities", value: merged.businessActivities },
          ]}
        />
      </CompanyEditableCard>

      <CompanyEditableCard
        icon={MapPin}
        title="Addresses & contacts"
        description="Registered office, principal place of business, and official contact channels."
        required
        editContent={<CompanyCorporateContactFields profile={merged} onChange={patchDraft} />}
      >
        <CompanyFieldGrid
          rows={[
            { label: "Registered office", value: formatAddressDisplay(merged.registeredOffice) },
            { label: "Principal place of business", value: formatAddressDisplay(merged.principalPlace) },
            {
              label: "Phone",
              value: formatPersonalPhoneDisplay(merged.phoneCountryCode, merged.phoneNumber),
            },
            { label: "Email", value: merged.email },
            {
              label: "Website",
              value: merged.website || props.company.website,
              href: merged.website || props.company.website || undefined,
            },
          ]}
        />
      </CompanyEditableCard>

      <CompanyPeopleSection companyId={props.company.id} seedProfile={merged} />

      <CompanyEditableCard
        icon={Banknote}
        title="Capital & financials"
        description="Share capital structure and links to mandatory filings."
        editContent={<CompanyCorporateFinancialFields profile={merged} onChange={patchDraft} />}
      >
        <CompanyFieldGrid
          rows={[
            { label: "Share capital", value: formatShareCapitalDisplay(merged) },
            { label: "Filings", value: formatFinancialFilingDisplay(merged, formatIsoDateDisplay) },
          ]}
        />
      </CompanyEditableCard>
    </div>
  );
}
