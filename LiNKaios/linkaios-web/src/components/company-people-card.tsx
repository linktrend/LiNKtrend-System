"use client";

import Link from "next/link";

import { COMPANY_SECTION_COPY } from "@/lib/company-page-copy";
import type { CompanyFixture } from "@/lib/company-fixtures";
import { BUTTON } from "@/lib/ui-standards";

export function CompanyPeopleCard(props: { company: CompanyFixture }) {
  return (
    <section
      className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
      aria-labelledby="people-heading"
    >
      <h2
        id="people-heading"
        className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400"
      >
        {COMPANY_SECTION_COPY.people.title}
      </h2>
      <p className="mt-2 max-w-3xl text-sm text-zinc-600 dark:text-zinc-400">{COMPANY_SECTION_COPY.people.body}</p>
      <dl className="mt-4 flex flex-wrap items-baseline gap-x-6 gap-y-2 rounded-lg border border-zinc-100 bg-zinc-50/80 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900/40">
        <div>
          <dt className="text-xs text-zinc-500 dark:text-zinc-400">{COMPANY_SECTION_COPY.people.previewCountLabel}</dt>
          <dd className="text-2xl font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">{props.company.userCount}</dd>
        </div>
        <div>
          <dt className="text-xs text-zinc-500 dark:text-zinc-400">Company</dt>
          <dd className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{props.company.displayName}</dd>
        </div>
      </dl>
      <div className="mt-4">
        <Link href="/settings/user" className={BUTTON.primaryRow}>
          {COMPANY_SECTION_COPY.people.cta}
        </Link>
      </div>
    </section>
  );
}
