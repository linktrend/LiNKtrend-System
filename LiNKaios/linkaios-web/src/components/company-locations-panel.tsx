"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

import { CompanyAddLocationModal } from "@/components/company-add-location-modal";
import { COMPANY_SECTION_COPY } from "@/lib/company-page-copy";
import { locationsForCompany, resolveCompanyFixture, type LocationFixture } from "@/lib/company-fixtures";
import { BUTTON, TABLE } from "@/lib/ui-standards";

export function CompanyLocationsPanel() {
  const searchParams = useSearchParams();
  const company = resolveCompanyFixture(searchParams.get("companyId"));
  const seedRows = useMemo(() => locationsForCompany(company.id), [company.id]);
  const [rows, setRows] = useState<LocationFixture[]>(seedRows);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    setRows(locationsForCompany(company.id));
  }, [company.id]);

  return (
    <section
      className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
      aria-labelledby="company-locations-heading"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2
            id="company-locations-heading"
            className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400"
          >
            {COMPANY_SECTION_COPY.locations.title}
          </h2>
          <p className="mt-2 max-w-3xl text-sm text-zinc-600 dark:text-zinc-400">{COMPANY_SECTION_COPY.locations.body}</p>
        </div>
        <button type="button" className={BUTTON.primaryRow} onClick={() => setModalOpen(true)}>
          {COMPANY_SECTION_COPY.locations.addLabel}
        </button>
      </div>

      {rows.length === 0 ? (
        <p className="mt-4 rounded-lg border border-dashed border-zinc-200 px-4 py-3 text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
          {COMPANY_SECTION_COPY.locations.empty}
        </p>
      ) : (
        <div className="mt-4 overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800">
          <table className="min-w-full divide-y divide-zinc-200 text-left text-sm dark:divide-zinc-800">
            <thead className="bg-zinc-50 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:bg-zinc-900">
              <tr>
                <th className={`px-3 py-2 ${TABLE.thText}`}>Site</th>
                <th className={`px-3 py-2 ${TABLE.thText}`}>Role</th>
                <th className={`px-3 py-2 ${TABLE.thText}`}>City</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {rows.map((row) => (
                <tr key={row.id}>
                  <td className="px-3 py-2 font-medium text-zinc-900 dark:text-zinc-100">{row.site}</td>
                  <td className="px-3 py-2 text-zinc-600 dark:text-zinc-400">{row.role}</td>
                  <td className="px-3 py-2 text-zinc-600 dark:text-zinc-400">{row.city}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <CompanyAddLocationModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onAdd={(row) => setRows((prev) => [...prev, row])}
      />
    </section>
  );
}
