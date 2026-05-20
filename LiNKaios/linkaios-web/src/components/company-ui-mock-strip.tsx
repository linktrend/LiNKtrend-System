import Link from "next/link";

import { COMPANY_INDUSTRY_OPTIONS } from "@/lib/company-page-copy";
import { TABLE } from "@/lib/ui-standards";

/** Read-only fixture strip when `LINKAIOS_UI_MOCKS` is on — for catalogue / layout review only. */
export function CompanyUiMockStrip() {
  return (
    <section className="rounded-2xl border border-amber-200 bg-amber-50/40 p-6 shadow-sm dark:border-amber-900/50 dark:bg-amber-950/25">
      <p className="text-xs font-semibold uppercase tracking-wide text-amber-900 dark:text-amber-200">
        UI mock preview (LINKAIOS_UI_MOCKS)
      </p>
      <p className="mt-2 max-w-3xl text-sm text-amber-950/90 dark:text-amber-100/90">
        Sample profile, location, and module rows below are read-only fixtures for layout review. Editable forms use live
        database rows when present.
      </p>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-600 dark:text-zinc-400">
            Profile (fixture)
          </h3>
          <dl className="mt-3 space-y-2 rounded-xl border border-zinc-200 bg-white p-4 text-sm dark:border-zinc-800 dark:bg-zinc-950">
            <div>
              <dt className="text-xs text-zinc-500">Legal name</dt>
              <dd className="font-medium text-zinc-900 dark:text-zinc-100">XYZ Marketing Agency LLC</dd>
            </div>
            <div>
              <dt className="text-xs text-zinc-500">Short code</dt>
              <dd className="font-mono text-zinc-800 dark:text-zinc-200">XYZ</dd>
            </div>
            <div>
              <dt className="text-xs text-zinc-500">Industry</dt>
              <dd className="text-zinc-800 dark:text-zinc-200">{COMPANY_INDUSTRY_OPTIONS[6]}</dd>
            </div>
            <div>
              <dt className="text-xs text-zinc-500">Website</dt>
              <dd>
                <Link href="https://xyz-marketing.example" className="text-sky-700 underline dark:text-sky-400">
                  https://xyz-marketing.example
                </Link>
              </dd>
            </div>
          </dl>
        </div>
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-600 dark:text-zinc-400">
            Locations (fixture)
          </h3>
          <div className="mt-3 overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
            <table className="min-w-full divide-y divide-zinc-200 text-left text-sm dark:divide-zinc-800">
              <thead className="bg-zinc-50 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:bg-zinc-900">
                <tr>
                  <th className={`px-3 py-2 ${TABLE.thText}`}>Site</th>
                  <th className={`px-3 py-2 ${TABLE.thText}`}>Role</th>
                  <th className={`px-3 py-2 ${TABLE.thText}`}>City</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                <tr>
                  <td className="px-3 py-2 font-medium text-zinc-900 dark:text-zinc-100">HQ — Downtown</td>
                  <td className="px-3 py-2 text-zinc-600">Headquarters</td>
                  <td className="px-3 py-2 text-zinc-600">Miami, FL</td>
                </tr>
                <tr>
                  <td className="px-3 py-2 font-medium text-zinc-900 dark:text-zinc-100">West office</td>
                  <td className="px-3 py-2 text-zinc-600">Branch</td>
                  <td className="px-3 py-2 text-zinc-600">Fort Lauderdale, FL</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div className="mt-6">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-600 dark:text-zinc-400">
          Module subscriptions (fixture)
        </h3>
        <div className="mt-3 overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
          <table className="min-w-full divide-y divide-zinc-200 text-left text-sm dark:divide-zinc-800">
            <thead className="bg-zinc-50 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:bg-zinc-900">
              <tr>
                <th className={`px-3 py-2 ${TABLE.thText}`}>Module</th>
                <th className={`px-3 py-2 ${TABLE.thText}`}>Status</th>
                <th className={`px-3 py-2 ${TABLE.thText}`}>Plan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              <tr>
                <td className="px-3 py-2 font-medium text-zinc-900 dark:text-zinc-100">LinkSites</td>
                <td className="px-3 py-2 text-emerald-700 dark:text-emerald-400">Active</td>
                <td className="px-3 py-2 text-zinc-600">Professional</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium text-zinc-900 dark:text-zinc-100">LiNKapps</td>
                <td className="px-3 py-2 text-zinc-500">Not subscribed</td>
                <td className="px-3 py-2 text-zinc-600">—</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
