"use client";

import { useEffect, useState } from "react";
import { Banknote, Building2, MapPin } from "lucide-react";

import { CompanyPeopleSection } from "@/components/company-people-section";
import { CompanyEditableCard } from "@/components/company-editable-card";
import { CompanyFieldGrid, CompanyFormFields } from "@/components/company-form-fields";
import { corporateProfileForCompany, type CompanyFixture } from "@/lib/company-fixtures";

export function CompanyOverviewPanel(props: { company: CompanyFixture }) {
  const seed = corporateProfileForCompany(props.company.id);
  const [profile, setProfile] = useState(seed);
  const [draft, setDraft] = useState<Record<string, string>>({});

  useEffect(() => {
    const next = corporateProfileForCompany(props.company.id);
    setProfile(next);
    setDraft({});
  }, [props.company.id]);

  function setDraftField(key: string, value: string) {
    setDraft((d) => ({ ...d, [key]: value }));
  }

  function val(key: keyof typeof profile, fallback = ""): string {
    const k = String(key);
    return draft[k] ?? String(profile[key] ?? fallback);
  }

  return (
    <div className="space-y-4">
      <CompanyEditableCard
        icon={Building2}
        title="Basic corporate information"
        description="Registered identity, dates, and primary business activities."
        required
        editContent={
          <CompanyFormFields
            fields={[
              { key: "registeredName", label: "Company name", value: profile.registeredName },
              { key: "tradingNames", label: "Trading names / aliases", value: profile.tradingNames },
              { key: "registrationNumber", label: "Registration / ID number", value: profile.registrationNumber },
              { key: "incorporationDate", label: "Date of incorporation", value: profile.incorporationDate },
              { key: "financialYearEnd", label: "Financial year end", value: profile.financialYearEnd },
              { key: "agmDueDate", label: "AGM due date", value: profile.agmDueDate },
              { key: "businessActivities", label: "Business activities", value: profile.businessActivities, multiline: true },
              { key: "industryCode", label: "Industry classification", value: profile.industryCode },
            ]}
            values={draft}
            onChange={setDraftField}
          />
        }
      >
        <CompanyFieldGrid
          rows={[
            { label: "Company name", value: val("registeredName") },
            { label: "Trading names", value: val("tradingNames") },
            { label: "Registration number", value: val("registrationNumber") },
            { label: "Incorporated", value: val("incorporationDate") },
            { label: "Financial year end", value: val("financialYearEnd") },
            { label: "AGM due", value: val("agmDueDate") },
            { label: "Industry", value: props.company.industry },
            { label: "Activities", value: val("businessActivities") },
          ]}
        />
      </CompanyEditableCard>

      <CompanyEditableCard
        icon={MapPin}
        title="Addresses & contacts"
        description="Registered office, principal place of business, and official contact channels."
        required
        editContent={
          <CompanyFormFields
            fields={[
              { key: "registeredOffice", label: "Registered office", value: profile.registeredOffice, multiline: true },
              { key: "principalPlace", label: "Principal place of business", value: profile.principalPlace, multiline: true },
              { key: "phone", label: "Phone", value: profile.phone },
              { key: "email", label: "Email", value: profile.email },
              { key: "website", label: "Website", value: profile.website },
            ]}
            values={draft}
            onChange={setDraftField}
          />
        }
      >
        <CompanyFieldGrid
          rows={[
            { label: "Registered office", value: val("registeredOffice") },
            { label: "Principal place of business", value: val("principalPlace") },
            { label: "Phone", value: val("phone") },
            { label: "Email", value: val("email") },
            {
              label: "Website",
              value: val("website", props.company.website),
              href: val("website", props.company.website) || undefined,
            },
          ]}
        />
      </CompanyEditableCard>

      <CompanyPeopleSection companyId={props.company.id} seedProfile={profile} />

      <CompanyEditableCard
        icon={Banknote}
        title="Capital & financials"
        description="Share capital structure and links to mandatory filings."
        editContent={
          <CompanyFormFields
            fields={[
              { key: "shareCapital", label: "Share capital", value: profile.shareCapital, multiline: true },
              { key: "financialFilings", label: "Financial documents / filings", value: profile.financialFilings, multiline: true },
            ]}
            values={draft}
            onChange={setDraftField}
          />
        }
      >
        <CompanyFieldGrid
          rows={[
            { label: "Share capital", value: val("shareCapital") },
            { label: "Filings", value: val("financialFilings") },
          ]}
        />
      </CompanyEditableCard>
    </div>
  );
}
