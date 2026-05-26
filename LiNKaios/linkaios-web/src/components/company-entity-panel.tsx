"use client";

import { CompanyOrgStructurePanel } from "@/components/company-org-structure-panel";
import { CompanyOverviewPanel } from "@/components/company-overview-panel";
import type { CompanyFixture } from "@/lib/company-fixtures";

/** Legal-entity profile for the selected company, with org structure at the bottom. */
export function CompanyEntityPanel(props: { company: CompanyFixture }) {
  return (
    <div className="space-y-8">
      <CompanyOverviewPanel company={props.company} />
      <section className="space-y-4 border-t border-zinc-200 pt-8 dark:border-zinc-800">
        <div>
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">Organisation structure</h2>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Departments and reporting lines for LiNKbrain tags and internal routing.
          </p>
        </div>
        <CompanyOrgStructurePanel />
      </section>
    </div>
  );
}
