"use client";

import { useRouter, useSearchParams } from "next/navigation";

import { COMPANY_SECTION_COPY, companyOverviewHref } from "@/lib/company-page-copy";
import { COMPANY_FIXTURES } from "@/lib/company-fixtures";
import { FIELD } from "@/lib/ui-standards";

export function CompanySwitcher() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const companyId = searchParams.get("companyId") ?? COMPANY_FIXTURES[0]!.id;

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
      <label htmlFor="company-switcher" className="block min-w-[14rem] flex-1">
        <span className={FIELD.label}>{COMPANY_SECTION_COPY.switcher.label}</span>
        <select
          id="company-switcher"
          value={companyId}
          onChange={(e) => router.push(companyOverviewHref(e.target.value))}
          className={`mt-1 ${FIELD.control}`}
        >
          {COMPANY_FIXTURES.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} ({c.code})
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
