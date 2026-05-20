import { TABLE } from "@/lib/ui-standards";

/** Read-only fixture strip when `LINKAIOS_UI_MOCKS` is on — for catalogue / layout review only. */
export function CompanyUiMockStrip() {
  return (
    <section className="rounded-2xl border border-amber-200 bg-amber-50/40 p-6 shadow-sm dark:border-amber-900/50 dark:bg-amber-950/25">
      <p className="text-xs font-semibold uppercase tracking-wide text-amber-900 dark:text-amber-200">
        UI mock preview (LINKAIOS_UI_MOCKS)
      </p>
      <p className="mt-2 max-w-3xl text-sm text-amber-950/90 dark:text-amber-100/90">
        Sample legal entity and org rows below are read-only fixtures so you can review layout. Editable forms use live
        database rows when present.
      </p>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-600 dark:text-zinc-400">
            Legal entity (fixture)
          </h3>
          <dl className="mt-3 space-y-2 rounded-xl border border-zinc-200 bg-white p-4 text-sm dark:border-zinc-800 dark:bg-zinc-950">
            <div>
              <dt className="text-xs text-zinc-500">Legal name</dt>
              <dd className="font-medium text-zinc-900 dark:text-zinc-100">LiNKtrend Media LLC</dd>
            </div>
            <div>
              <dt className="text-xs text-zinc-500">Short code</dt>
              <dd className="font-mono text-zinc-800 dark:text-zinc-200">LINK</dd>
            </div>
          </dl>
        </div>
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-600 dark:text-zinc-400">
            Org sample (fixture)
          </h3>
          <div className="mt-3 overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
            <table className="min-w-full divide-y divide-zinc-200 text-left text-sm dark:divide-zinc-800">
              <thead className="bg-zinc-50 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:bg-zinc-900">
                <tr>
                  <th className={`px-3 py-2 ${TABLE.thText}`}>Grouping</th>
                  <th className={`px-3 py-2 ${TABLE.thText}`}>Unit</th>
                  <th className={`px-3 py-2 ${TABLE.thText}`}>Effective</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                <tr>
                  <td className="px-3 py-2 text-zinc-600">region</td>
                  <td className="px-3 py-2 font-medium text-zinc-900 dark:text-zinc-100">Americas</td>
                  <td className="px-3 py-2 text-xs text-zinc-500">2026-01-01 → open</td>
                </tr>
                <tr>
                  <td className="px-3 py-2 text-zinc-600">department</td>
                  <td className="px-3 py-2 font-medium text-zinc-900 dark:text-zinc-100">Platform engineering</td>
                  <td className="px-3 py-2 text-xs text-zinc-500">2026-01-01 → open</td>
                </tr>
                <tr>
                  <td className="px-3 py-2 text-zinc-600">department</td>
                  <td className="px-3 py-2 font-medium text-zinc-900 dark:text-zinc-100">Customer success</td>
                  <td className="px-3 py-2 text-xs text-zinc-500">2026-01-01 → open</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
