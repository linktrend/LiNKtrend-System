"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

import { CompanyGlossary } from "@/components/company-glossary";
import { CompanyLocationsPanel } from "@/components/company-locations-panel";
import { CompanyModulesPanel } from "@/components/company-modules-panel";
import { CompanyOrgEditor } from "@/components/company-org-editor";
import { CompanyPeopleCard } from "@/components/company-people-card";
import { CompanyProfilePanel } from "@/components/company-profile-panel";
import { CompanySubNav } from "@/components/company-sub-nav";
import { CompanySwitcher } from "@/components/company-switcher";
import { ShellPageHeaderClient } from "@/components/shell-page-header-client";
import {
  COMPANY_DEFAULT_TAB,
  COMPANY_PAGE_HEADER,
  COMPANY_SECTION_COPY,
  isCompanyTabId,
} from "@/lib/company-page-copy";
import { resolveCompanyFixture } from "@/lib/company-fixtures";
import { BUTTON } from "@/lib/ui-standards";

import type { BrainLegalEntityRow, BrainOrgNodeRow } from "@linktrend/linklogic-sdk";

function CompanyTabContent(props: {
  tab: string;
  companyId: string;
  orgLoadFailed: boolean;
  primaryEntity?: BrainLegalEntityRow;
  nodes: BrainOrgNodeRow[] | null;
  companyKnowledgeCount: number | null;
  companyKnowledgePreview: { id: string; path: string }[];
  inboxHref: string;
  companyMemoryHref: string;
}) {
  const company = resolveCompanyFixture(props.companyId);
  const tab = isCompanyTabId(props.tab) ? props.tab : COMPANY_DEFAULT_TAB;

  if (tab === "overview") {
    return (
      <>
        <CompanyProfilePanel
          company={company}
          orgLoadFailed={props.orgLoadFailed}
          primaryEntity={props.primaryEntity}
        />
        <CompanyPeopleCard company={company} />
      </>
    );
  }

  if (tab === "locations") {
    return <CompanyLocationsPanel />;
  }

  if (tab === "organization") {
    return (
      <section
        className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
        aria-labelledby="org-structure-heading"
      >
        <h2
          id="org-structure-heading"
          className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400"
        >
          {COMPANY_SECTION_COPY.organization.title}
        </h2>
        <p className="mt-2 max-w-3xl text-sm text-zinc-600 dark:text-zinc-400">
          {COMPANY_SECTION_COPY.organization.body}
        </p>
        <div className="mt-6">
          <CompanyOrgEditor nodes={props.nodes} />
        </div>
      </section>
    );
  }

  if (tab === "modules") {
    return <CompanyModulesPanel />;
  }

  return (
    <section
      className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
      aria-labelledby="company-knowledge-heading"
    >
      <h2
        id="company-knowledge-heading"
        className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400"
      >
        {COMPANY_SECTION_COPY.knowledge.title}
      </h2>
      <p className="mt-2 max-w-3xl text-sm text-zinc-600 dark:text-zinc-400">{COMPANY_SECTION_COPY.knowledge.body}</p>
      <p className="mt-3 text-sm text-zinc-700 dark:text-zinc-300">
        {props.companyKnowledgeCount == null ? (
          <span className="text-zinc-500">Published company files could not be counted right now.</span>
        ) : (
          <>
            <span className="font-medium text-zinc-900 dark:text-zinc-100">{props.companyKnowledgeCount}</span>
            <span className="text-zinc-600 dark:text-zinc-400">
              {" "}
              published company {props.companyKnowledgeCount === 1 ? "file" : "files"} in LiNKbrain
            </span>
          </>
        )}
      </p>
      {props.companyKnowledgePreview.length > 0 ? (
        <ul className="mt-4 space-y-1 rounded-lg border border-zinc-200 bg-zinc-50/80 px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-900/40">
          {props.companyKnowledgePreview.map((f) => (
            <li key={f.id} className="truncate font-mono text-xs text-zinc-700 dark:text-zinc-300">
              {f.path}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">{COMPANY_SECTION_COPY.knowledge.emptyPreview}</p>
      )}
      <div className="mt-4 flex flex-wrap gap-3">
        <Link href={props.inboxHref} className={BUTTON.primaryRow}>
          {COMPANY_SECTION_COPY.knowledge.addLabel}
        </Link>
        <Link href={props.companyMemoryHref} className={BUTTON.secondaryRow}>
          {COMPANY_SECTION_COPY.knowledge.viewLabel}
        </Link>
      </div>
    </section>
  );
}

function CompanyPageShellInner(props: {
  orgLoadFailed: boolean;
  primaryEntity?: BrainLegalEntityRow;
  nodes: BrainOrgNodeRow[] | null;
  companyKnowledgeCount: number | null;
  companyKnowledgePreview: { id: string; path: string }[];
  inboxHref: string;
  companyMemoryHref: string;
  uiMocks: boolean;
  isVendorOperator: boolean;
}) {
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") ?? COMPANY_DEFAULT_TAB;
  const companyId = searchParams.get("companyId") ?? resolveCompanyFixture(null).id;

  return (
    <main className="space-y-6">
      <ShellPageHeaderClient title={COMPANY_PAGE_HEADER.title} subtitle={COMPANY_PAGE_HEADER.subtitle} />
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex rounded-full border border-emerald-300 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-100">
          Licensee company
        </span>
        {props.isVendorOperator ? (
          <span className="inline-flex rounded-full border border-indigo-300 bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-indigo-900 dark:border-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-100">
            Linktrend operator view
          </span>
        ) : null}
      </div>
      <CompanySwitcher />
      {props.uiMocks ? (
        <p className="text-xs font-medium uppercase tracking-wide text-amber-800 dark:text-amber-200">
          LINKAIOS_UI_MOCKS — fixture companies &amp; Stripe stub active
        </p>
      ) : null}
      <CompanyGlossary />
      <CompanySubNav />

      {props.orgLoadFailed ? (
        <div
          role="alert"
          className="rounded-lg border border-amber-200 bg-amber-50/90 px-4 py-3 text-sm text-amber-950 dark:border-amber-800 dark:bg-amber-950/35 dark:text-amber-100"
        >
          <p className="font-medium">Company data could not be loaded right now.</p>
          <p className="mt-1 text-xs leading-relaxed opacity-90">
            This is usually a temporary connectivity or permissions issue, not an empty company profile. Try again
            shortly, confirm you are signed in, and verify LiNKbrain organization migrations are applied.
          </p>
        </div>
      ) : null}

      <CompanyTabContent
        tab={tab}
        companyId={companyId}
        orgLoadFailed={props.orgLoadFailed}
        primaryEntity={props.primaryEntity}
        nodes={props.nodes}
        companyKnowledgeCount={props.companyKnowledgeCount}
        companyKnowledgePreview={props.companyKnowledgePreview}
        inboxHref={props.inboxHref}
        companyMemoryHref={props.companyMemoryHref}
      />
    </main>
  );
}

export function CompanyPageShell(props: {
  orgLoadFailed: boolean;
  primaryEntity?: BrainLegalEntityRow;
  nodes: BrainOrgNodeRow[] | null;
  companyKnowledgeCount: number | null;
  companyKnowledgePreview: { id: string; path: string }[];
  inboxHref: string;
  companyMemoryHref: string;
  uiMocks: boolean;
  isVendorOperator: boolean;
}) {
  return (
    <Suspense fallback={<main className="p-6 text-sm text-zinc-500">Loading company…</main>}>
      <CompanyPageShellInner {...props} />
    </Suspense>
  );
}
