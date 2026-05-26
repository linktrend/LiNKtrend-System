"use client";

import { Building2, Mail, Phone, UserCircle } from "lucide-react";

import { CompanyFieldGrid } from "@/components/company-form-fields";
import { CompanyEditableCard } from "@/components/company-editable-card";
import { StatusPill } from "@/components/ui/status-pill";
import {
  contractEntitySummaryForLicensee,
  serviceContactsForLicensee,
  type ServiceContact,
} from "@/lib/licensor-licensee-profile";
import type { CompanyFixture } from "@/lib/company-fixtures";
import { resolveLicenseeRegistry } from "@/lib/licensee-registry";
import { formatPersonalAddressNatural } from "@/lib/personal-contact-display";
import { FIELD, PROFILE } from "@/lib/ui-standards";

function ServiceContactRow(props: { contact: ServiceContact }) {
  const { contact: c } = props;

  return (
    <li className="grid gap-4 border-t border-zinc-200 py-4 first:border-t-0 first:pt-0 last:pb-0 dark:border-zinc-800 md:grid-cols-[minmax(0,10.5rem)_minmax(0,1fr)] md:items-start">
      <div className="min-w-0">
        <p className={`${FIELD.label} ${PROFILE.readonlyLabel} text-zinc-500 dark:text-zinc-400`}>{c.label}</p>
        <p className={`mt-1 ${PROFILE.readonlyValue} font-semibold text-zinc-900 dark:text-zinc-100`}>{c.name}</p>
      </div>

      <dl className="grid min-w-0 gap-3 sm:grid-cols-2 sm:gap-x-8">
        <div className={`${PROFILE.readonlyField} min-w-0`}>
          <dt className={`${FIELD.label} ${PROFILE.readonlyLabel} text-zinc-500 dark:text-zinc-400`}>Email</dt>
          <dd className={`mt-1 ${PROFILE.readonlyValue} flex min-w-0 items-start gap-2 text-zinc-700 dark:text-zinc-300`}>
            <Mail className="mt-0.5 h-3.5 w-3.5 shrink-0 text-zinc-400" aria-hidden />
            <a href={`mailto:${c.email}`} className="min-w-0 break-all hover:text-sky-700 dark:hover:text-sky-400">
              {c.email}
            </a>
          </dd>
        </div>
        <div className={`${PROFILE.readonlyField} min-w-0`}>
          <dt className={`${FIELD.label} ${PROFILE.readonlyLabel} text-zinc-500 dark:text-zinc-400`}>Phone</dt>
          <dd className={`mt-1 ${PROFILE.readonlyValue} flex min-w-0 items-start gap-2 text-zinc-700 dark:text-zinc-300`}>
            <Phone className="mt-0.5 h-3.5 w-3.5 shrink-0 text-zinc-400" aria-hidden />
            <a href={`tel:${c.phone.replace(/\s/g, "")}`} className="whitespace-nowrap hover:text-sky-700 dark:hover:text-sky-400">
              {c.phone}
            </a>
          </dd>
        </div>
      </dl>
    </li>
  );
}

export function LicensorLicenseeOverviewPanel(props: { licenseeId: string; primaryCompany: CompanyFixture }) {
  const summary = contractEntitySummaryForLicensee(props.licenseeId, props.primaryCompany);
  const contacts = serviceContactsForLicensee(props.licenseeId);
  const registry = resolveLicenseeRegistry(props.licenseeId);
  const office = formatPersonalAddressNatural(summary.registeredOffice).join(" · ") || "—";

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Plan</p>
          <p className="mt-1 text-sm font-semibold text-zinc-900 dark:text-zinc-100">{summary.plan}</p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Status</p>
          <p className="mt-2">
            <StatusPill label={summary.status} tone={summary.status === "active" ? "success" : "warning"} />
          </p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Open support tickets</p>
          <p className="mt-1 text-sm font-semibold text-zinc-900 dark:text-zinc-100">{registry?.openIssues ?? 0}</p>
        </div>
      </div>

      <CompanyEditableCard
        icon={Building2}
        title="Contract legal entity"
        description="Registered identity for the party that signed with LiNKtrend — not subsidiary corporate depth."
        required
      >
        <CompanyFieldGrid
          rows={[
            { label: "Legal name", value: summary.legalName },
            { label: "Registration number", value: summary.registrationNumber },
            { label: "Registered office", value: office },
            { label: "Industry", value: summary.industry },
            { label: "Official email", value: summary.email },
            { label: "Official phone", value: summary.phone },
          ]}
        />
      </CompanyEditableCard>

      <CompanyEditableCard
        icon={UserCircle}
        title="Service Contacts"
        description="Who to reach for billing, technical, and account decisions — not directors or shareholders."
        required
      >
        <ul>
          {contacts.map((c) => (
            <ServiceContactRow key={c.role} contact={c} />
          ))}
        </ul>
      </CompanyEditableCard>
    </div>
  );
}
