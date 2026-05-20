"use client";

import { useRouter, useSearchParams } from "next/navigation";

import { COMPANY_SECTION_COPY } from "@/lib/company-page-copy";
import { COMPANY_FIXTURES } from "@/lib/company-fixtures";
import { FIELD } from "@/lib/ui-standards";

function buildCompanyUrl(companyId: string, tab: string | null): string {
  const params = new URLSearchParams();
  params.set("companyId", companyId);
  if (tab) params.set("tab", tab);
  return `/company?${params.toString()}`;
}

export function CompanySwitcher() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const companyId = searchParams.get("companyId") ?? COMPANY_FIXTURES[0]!.id;
  const tab = searchParams.get("tab");

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-zinc-200 bg-zinc-50/80 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900/40 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <label htmlFor="company-switcher" className={FIELD.label}>
          {COMPANY_SECTION_COPY.switcher.label}
        </label>
        <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">{COMPANY_SECTION_COPY.switcher.mockHint}</p>
      </div>
      <select
        id="company-switcher"
        value={companyId}
        onChange={(e) => router.push(buildCompanyUrl(e.target.value, tab))}
        className={`mt-1 sm:mt-0 sm:max-w-md ${FIELD.control}`}
      >
        {COMPANY_FIXTURES.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name} ({c.code})
          </option>
        ))}
      </select>
    </div>
  );
}
