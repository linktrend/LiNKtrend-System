"use client";

import { useMemo } from "react";

import { brandsForCompany } from "@/lib/brand-fixtures";
import { COMPANY_FIXTURES, modulesForCompany, resolveCompanyFixture, type CompanyFixture } from "@/lib/company-fixtures";
import { useLicenseeContext } from "@/hooks/use-licensee-context";
import { companiesVisibleInTopology } from "@/lib/tenant-topology";

function SummaryRow(props: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 border-b border-zinc-100 py-3 last:border-0 dark:border-zinc-800 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
      <dt className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{props.label}</dt>
      <dd className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{props.value}</dd>
    </div>
  );
}

export function CompanySummaryPanel(props: { company: CompanyFixture }) {
  const { topologyMode, companyId } = useLicenseeContext();
  const company = resolveCompanyFixture(companyId);
  const entityCount = companiesVisibleInTopology(
    topologyMode,
    COMPANY_FIXTURES.map((c) => c.id),
  ).length;
  const brandCount = useMemo(
    () => COMPANY_FIXTURES.flatMap((c) => brandsForCompany(c.id)).length,
    [],
  );
  const brandsForActive = brandsForCompany(company.id);
  const suites = modulesForCompany(company.id).filter((m) => m.status === "active" || m.status === "trialing");

  return (
    <div className="space-y-4">
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Read-only snapshot of your workspace — company profile, brands, and subscribed suites.
      </p>
      <section className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Organisation</h2>
        <dl className="mt-2">
          <SummaryRow label="Legal entities in workspace" value={String(entityCount)} />
          <SummaryRow label="Brands (all entities)" value={String(brandCount)} />
          <SummaryRow label="Active company" value={company.displayName} />
          <SummaryRow label="Brands under active company" value={String(brandsForActive.length)} />
          <SummaryRow label="Industry" value={props.company.industry} />
        </dl>
      </section>
      <section className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Suites (active company)</h2>
        <dl className="mt-2">
          <SummaryRow
            label="Subscribed or trialing"
            value={suites.length > 0 ? suites.map((s) => s.module).join(", ") : "None"}
          />
        </dl>
      </section>
    </div>
  );
}
