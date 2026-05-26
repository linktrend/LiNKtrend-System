import Link from "next/link";

import {
  DataTable,
  DataTableBody,
  DataTableHead,
  DataTableRow,
  DataTableShell,
  DT,
} from "@/components/data-table";
import { COMPANY_INDUSTRY_OPTIONS } from "@/lib/company-page-copy";

/** Read-only fixture strip when `LINKAIOS_UI_MOCKS` is on — for catalogue / layout review only. */
export function CompanyUiMockStrip() {
  return (
    <section className="rounded-2xl border border-amber-200 bg-amber-50/40 p-6 shadow-sm dark:border-amber-900/50 dark:bg-amber-950/25">
      <p className="text-xs font-semibold text-amber-900 dark:text-amber-200">
        UI mock preview (LINKAIOS_UI_MOCKS)
      </p>
      <p className="mt-2 max-w-3xl text-sm text-amber-950/90 dark:text-amber-100/90">
        Sample profile, location, and module rows below are read-only fixtures for layout review. Editable forms use live
        database rows when present.
      </p>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div>
          <h3 className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
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
          <h3 className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
            Locations (fixture)
          </h3>
          <DataTableShell className="mt-3">
            <DataTable>
              <DataTableHead>
                <tr>
                  <th className={DT.thTextInset}>Site</th>
                  <th className={DT.thTextInset}>Role</th>
                  <th className={DT.thTextInset}>City</th>
                </tr>
              </DataTableHead>
              <DataTableBody>
                <DataTableRow>
                  <td className={`${DT.tdClipInset} font-medium text-zinc-900 dark:text-zinc-100`}>HQ — Downtown</td>
                  <td className={DT.tdClipInset}>Headquarters</td>
                  <td className={DT.tdClipInset}>Miami, FL</td>
                </DataTableRow>
                <DataTableRow>
                  <td className={`${DT.tdClipInset} font-medium text-zinc-900 dark:text-zinc-100`}>West office</td>
                  <td className={DT.tdClipInset}>Branch</td>
                  <td className={DT.tdClipInset}>Fort Lauderdale, FL</td>
                </DataTableRow>
              </DataTableBody>
            </DataTable>
          </DataTableShell>
        </div>
      </div>
      <div className="mt-6">
        <h3 className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
          Suite subscriptions (fixture)
        </h3>
        <DataTableShell className="mt-3">
          <DataTable>
            <DataTableHead>
              <tr>
                <th className={DT.thTextInset}>Suite</th>
                <th className={DT.thTextInset}>Status</th>
                <th className={DT.thTextInset}>Plan</th>
              </tr>
            </DataTableHead>
            <DataTableBody>
              <DataTableRow>
                <td className={`${DT.tdClipInset} font-medium text-zinc-900 dark:text-zinc-100`}>LinkSites</td>
                <td className={`${DT.tdClipInset} text-emerald-700 dark:text-emerald-400`}>Active</td>
                <td className={DT.tdClipInset}>Professional</td>
              </DataTableRow>
              <DataTableRow>
                <td className={`${DT.tdClipInset} font-medium text-zinc-900 dark:text-zinc-100`}>LiNKapps</td>
                <td className={`${DT.tdClipInset} text-zinc-500`}>Not subscribed</td>
                <td className={DT.tdClipInset}>—</td>
              </DataTableRow>
            </DataTableBody>
          </DataTable>
        </DataTableShell>
      </div>
    </section>
  );
}
