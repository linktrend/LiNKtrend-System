"use client";

import { useEffect, useState } from "react";

import {
  DataTable,
  DataTableBody,
  DataTableHead,
  DataTableRow,
  DataTableShell,
  DT,
} from "@/components/data-table";
import { TableBoolToggle } from "@/components/data-table/table-bool-toggle";
import {
  EVENT_PRIVACY_PREFERENCES_CHANGED,
  readPrivacyPreferences,
  writePrivacyPreferences,
  type PrivacyPreferenceRow,
} from "@/lib/privacy-preferences";
import { formatUiLabel } from "@/lib/ui-standards";

export function PrivacySettingsPage() {
  const [rows, setRows] = useState<PrivacyPreferenceRow[]>(() => readPrivacyPreferences());
  const [flash, setFlash] = useState<string | null>(null);

  useEffect(() => {
    const sync = () => setRows(readPrivacyPreferences());
    sync();
    window.addEventListener(EVENT_PRIVACY_PREFERENCES_CHANGED, sync);
    return () => window.removeEventListener(EVENT_PRIVACY_PREFERENCES_CHANGED, sync);
  }, []);

  function updateRow(rowId: string, enabled: boolean) {
    const updated = rows.map((row) => (row.id === rowId ? { ...row, enabled } : row));
    setRows(updated);
    writePrivacyPreferences(updated);
    setFlash("Privacy preferences saved.");
    window.setTimeout(() => setFlash(null), 3000);
  }

  return (
    <div className="space-y-6">
      {flash ? (
        <p role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-100">
          {flash}
        </p>
      ) : null}

      <section className="space-y-4">
        <DataTableShell scrollableBody>
          <DataTable>
            <colgroup>
              <col className="w-[24%]" />
              <col className="w-[56%]" />
              <col className="w-[20%]" />
            </colgroup>
            <DataTableHead>
              <tr>
                <th className={DT.thTextInset}>{formatUiLabel("Setting")}</th>
                <th className={DT.thTextInset}>{formatUiLabel("Description")}</th>
                <th className={DT.thControl}>
                  <div className={DT.controlInner}>{formatUiLabel("Enabled")}</div>
                </th>
              </tr>
            </DataTableHead>
            <DataTableBody>
              {rows.map((row) => (
                <DataTableRow key={row.id} multiline>
                  <td className={`${DT.tdClipInset} font-medium text-zinc-900 dark:text-zinc-100`}>
                    <span className={DT.tdTextSpan}>{formatUiLabel(row.label)}</span>
                  </td>
                  <td className={DT.tdClipInset}>
                    <span className={DT.tdWrapSpan}>{row.description}</span>
                  </td>
                  <td className={DT.tdControl}>
                    <div className={DT.controlInner}>
                      <TableBoolToggle
                        on={row.enabled}
                        ariaLabel={row.label}
                        onToggle={(next) => updateRow(row.id, next)}
                      />
                    </div>
                  </td>
                </DataTableRow>
              ))}
            </DataTableBody>
          </DataTable>
        </DataTableShell>
      </section>
    </div>
  );
}
