"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense } from "react";

import { COMPANY_FIXTURES, COMPANY_DEFAULT_FIXTURE_ID, resolveCompanyFixture } from "@/lib/company-fixtures";

/** App-wide mock company context — UI only until tenant membership schema ships (UIUX-COMP-020). */
function ShellCompanySwitcherInner() {
  const pathname = usePathname() ?? "";
  const searchParams = useSearchParams();
  const currentId = searchParams.get("companyId") ?? COMPANY_DEFAULT_FIXTURE_ID;
  const active = resolveCompanyFixture(currentId);

  function hrefFor(companyId: string): string {
    if (pathname.startsWith("/company")) {
      const p = new URLSearchParams(searchParams.toString());
      p.set("companyId", companyId);
      return `/company?${p.toString()}`;
    }
    return `/company?companyId=${encodeURIComponent(companyId)}`;
  }

  return (
    <label className="flex min-w-0 items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400">
      <span className="hidden shrink-0 font-medium uppercase tracking-wide sm:inline">Company</span>
      <select
        value={active.id}
        onChange={(e) => {
          window.location.href = hrefFor(e.target.value);
        }}
        className="max-w-[11rem] truncate rounded-md border border-zinc-200 bg-white px-2 py-1 text-xs font-medium text-zinc-800 shadow-sm dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
        aria-label="Active licensee company"
      >
        {COMPANY_FIXTURES.map((c) => (
          <option key={c.id} value={c.id}>
            {c.displayName}
          </option>
        ))}
      </select>
      <Link href={hrefFor(active.id)} className="shrink-0 text-sky-700 underline-offset-2 hover:underline dark:text-sky-400">
        Profile
      </Link>
    </label>
  );
}

export function ShellCompanySwitcher() {
  return (
    <Suspense fallback={null}>
      <ShellCompanySwitcherInner />
    </Suspense>
  );
}
