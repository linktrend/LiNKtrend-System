"use client";

import { useEffect, useState } from "react";
import { Database } from "lucide-react";

import {
  DataTable,
  DataTableBody,
  DataTableHead,
  DataTableRow,
  DataTableShell,
  DT,
} from "@/components/data-table";
import { TableBoolToggle } from "@/components/data-table/table-bool-toggle";
import { TitledCardHeader } from "@/components/titled-card-header";
import { StubPageNotice } from "@/components/stub-badge";
import {
  appendBackupHistory,
  EVENT_DATA_SETTINGS_CHANGED,
  readBackupHistory,
  readDataSettings,
  RETENTION_OPTIONS,
  writeDataSettings,
  type BackupHistoryRow,
  type DataSettingsPreferences,
  type RetentionDays,
} from "@/lib/data-settings-preferences";
import { InsetSelect } from "@/components/forms";
import { BUTTON, formatUiLabel } from "@/lib/ui-standards";

function RetentionSelect(props: {
  value: RetentionDays;
  onChange: (next: RetentionDays) => void;
  ariaLabel: string;
}) {
  return (
    <InsetSelect
      compact
      value={props.value}
      aria-label={props.ariaLabel}
      onChange={(e) => props.onChange(e.target.value as RetentionDays)}
    >
      {RETENTION_OPTIONS.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </InsetSelect>
  );
}

export function DataSettingsPage() {
  const [prefs, setPrefs] = useState<DataSettingsPreferences>(() => readDataSettings());
  const [history, setHistory] = useState<BackupHistoryRow[]>(() => readBackupHistory());
  const [flash, setFlash] = useState<string | null>(null);

  useEffect(() => {
    const sync = () => {
      setPrefs(readDataSettings());
      setHistory(readBackupHistory());
    };
    sync();
    window.addEventListener(EVENT_DATA_SETTINGS_CHANGED, sync);
    return () => window.removeEventListener(EVENT_DATA_SETTINGS_CHANGED, sync);
  }, []);

  function save(next: DataSettingsPreferences, message = "Data settings saved.") {
    setPrefs(next);
    writeDataSettings(next);
    setFlash(message);
    window.setTimeout(() => setFlash(null), 3000);
  }

  function prepareManualBackup() {
    const row: BackupHistoryRow = {
      id: `bk_${Date.now()}`,
      createdAt: new Date().toISOString(),
      kind: "manual",
      status: "completed",
      sizeLabel: "43 MB",
    };
    appendBackupHistory(row);
    setHistory(readBackupHistory());
    setFlash("Backup prepared. Download link would expire in 24 hours.");
    window.setTimeout(() => setFlash(null), 4000);
  }

  return (
    <div className="space-y-6">
      <StubPageNotice message="Retention and backup controls are stored in this browser only. No remote backup jobs run in the MVO build." />
      {flash ? (
        <p
          role="status"
          className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-100"
        >
          {flash}
        </p>
      ) : null}

      <section className="space-y-4">
        <TitledCardHeader
          icon={Database}
          title="Retention policy"
          description="Control how long LiNKbrain events and trace payloads are kept for this workspace."
        />
        <DataTableShell scrollableBody>
          <DataTable>
            <colgroup>
              <col className="w-[28%]" />
              <col className="w-[44%]" />
              <col className="w-[28%]" />
            </colgroup>
            <DataTableHead>
              <tr>
                <th className={DT.thTextInset}>{formatUiLabel("Data type")}</th>
                <th className={DT.thTextInset}>{formatUiLabel("Description")}</th>
                <th className={DT.thControl}>
                  <div className={DT.controlInner}>{formatUiLabel("Retention")}</div>
                </th>
              </tr>
            </DataTableHead>
            <DataTableBody>
              <DataTableRow multiline>
                <td className={`${DT.tdClipInset} font-medium text-zinc-900 dark:text-zinc-100`}>
                  <span className={DT.tdTextSpan}>{formatUiLabel("LiNKbrain events")}</span>
                </td>
                <td className={DT.tdClipInset}>
                  <span className={DT.tdWrapSpan}>Audit ledger entries, memory writes, and operator actions.</span>
                </td>
                <td className={DT.tdControl}>
                  <div className={DT.controlInner}>
                    <RetentionSelect
                      ariaLabel="Event retention"
                      value={prefs.eventRetentionDays}
                      onChange={(next) => save({ ...prefs, eventRetentionDays: next })}
                    />
                  </div>
                </td>
              </DataTableRow>
              <DataTableRow multiline>
                <td className={`${DT.tdClipInset} font-medium text-zinc-900 dark:text-zinc-100`}>
                  <span className={DT.tdTextSpan}>{formatUiLabel("Trace payloads")}</span>
                </td>
                <td className={DT.tdClipInset}>
                  <span className={DT.tdWrapSpan}>Project run diagnostics and automation execution logs.</span>
                </td>
                <td className={DT.tdControl}>
                  <div className={DT.controlInner}>
                    <RetentionSelect
                      ariaLabel="Trace retention"
                      value={prefs.traceRetentionDays}
                      onChange={(next) => save({ ...prefs, traceRetentionDays: next })}
                    />
                  </div>
                </td>
              </DataTableRow>
            </DataTableBody>
          </DataTable>
        </DataTableShell>
      </section>

      <section className="space-y-4">
        <TitledCardHeader
          icon={Database}
          title="Backup preferences"
          description="Scheduled workspace snapshots for disaster recovery and operator restore points."
        />
        <DataTableShell scrollableBody>
          <DataTable>
            <colgroup>
              <col className="w-[28%]" />
              <col className="w-[44%]" />
              <col className="w-[28%]" />
            </colgroup>
            <DataTableHead>
              <tr>
                <th className={DT.thTextInset}>{formatUiLabel("Setting")}</th>
                <th className={DT.thTextInset}>{formatUiLabel("Description")}</th>
                <th className={DT.thControl}>
                  <div className={DT.controlInner}>{formatUiLabel("Value")}</div>
                </th>
              </tr>
            </DataTableHead>
            <DataTableBody>
              <DataTableRow multiline>
                <td className={`${DT.tdClipInset} font-medium text-zinc-900 dark:text-zinc-100`}>
                  <span className={DT.tdTextSpan}>{formatUiLabel("Automatic backups")}</span>
                </td>
                <td className={DT.tdClipInset}>
                  <span className={DT.tdWrapSpan}>Run scheduled snapshots without manual action.</span>
                </td>
                <td className={DT.tdControl}>
                  <div className={DT.controlInner}>
                    <TableBoolToggle
                      on={prefs.automaticBackups}
                      ariaLabel="Automatic backups"
                      onToggle={(next) => save({ ...prefs, automaticBackups: next })}
                    />
                  </div>
                </td>
              </DataTableRow>
              <DataTableRow multiline>
                <td className={`${DT.tdClipInset} font-medium text-zinc-900 dark:text-zinc-100`}>
                  <span className={DT.tdTextSpan}>{formatUiLabel("Backup frequency")}</span>
                </td>
                <td className={DT.tdClipInset}>
                  <span className={DT.tdWrapSpan}>How often scheduled backups run when automatic backups are enabled.</span>
                </td>
                <td className={DT.tdControl}>
                  <div className={DT.controlInner}>
                    <InsetSelect
                      compact
                      value={prefs.backupFrequency}
                      disabled={!prefs.automaticBackups}
                      aria-label="Backup frequency"
                      onChange={(e) =>
                        save({
                          ...prefs,
                          backupFrequency: e.target.value as DataSettingsPreferences["backupFrequency"],
                        })
                      }
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </InsetSelect>
                  </div>
                </td>
              </DataTableRow>
              <DataTableRow multiline>
                <td className={`${DT.tdClipInset} font-medium text-zinc-900 dark:text-zinc-100`}>
                  <span className={DT.tdTextSpan}>{formatUiLabel("Email on backup")}</span>
                </td>
                <td className={DT.tdClipInset}>
                  <span className={DT.tdWrapSpan}>Notify operators when a scheduled backup completes or fails.</span>
                </td>
                <td className={DT.tdControl}>
                  <div className={DT.controlInner}>
                    <TableBoolToggle
                      on={prefs.notifyOnBackup}
                      ariaLabel="Email on backup"
                      onToggle={(next) => save({ ...prefs, notifyOnBackup: next })}
                    />
                  </div>
                </td>
              </DataTableRow>
            </DataTableBody>
          </DataTable>
        </DataTableShell>
        <div className="flex justify-end">
          <button type="button" className={`${BUTTON.secondaryRow} shrink-0`} onClick={prepareManualBackup}>
            Manual Backup
          </button>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{formatUiLabel("Backup history")}</h2>
        <DataTableShell scrollableBody>
          <DataTable>
            <colgroup>
              <col className="w-[22%]" />
              <col className="w-[16%]" />
              <col className="w-[16%]" />
              <col className="w-[14%]" />
              <col className="w-[32%]" />
            </colgroup>
            <DataTableHead>
              <tr>
                <th className={DT.thTextInset}>{formatUiLabel("Created")}</th>
                <th className={DT.thTextInset}>{formatUiLabel("Type")}</th>
                <th className={DT.thTextInset}>{formatUiLabel("Status")}</th>
                <th className={DT.thTextInset}>{formatUiLabel("Size")}</th>
                <th className={DT.thControl}>
                  <div className={DT.controlInner}>{formatUiLabel("Action")}</div>
                </th>
              </tr>
            </DataTableHead>
            <DataTableBody>
              {history.map((row) => (
                <DataTableRow key={row.id} multiline>
                  <td className={`${DT.tdClipInset} font-mono text-xs`}>
                    <span className={DT.tdTextSpan}>{row.createdAt.replace("T", " ").slice(0, 16)}</span>
                  </td>
                  <td className={DT.tdClipInset}>
                    <span className={`${DT.tdTextSpan} capitalize`}>{row.kind}</span>
                  </td>
                  <td className={DT.tdClipInset}>
                    <span
                      className={`${DT.tdTextSpan} font-medium capitalize ${
                        row.status === "completed" ? "text-emerald-700 dark:text-emerald-300" : "text-red-700 dark:text-red-300"
                      }`}
                    >
                      {row.status}
                    </span>
                  </td>
                  <td className={DT.tdClipInset}>
                    <span className={DT.tdTextSpan}>{row.sizeLabel}</span>
                  </td>
                  <td className={DT.tdControl}>
                    <div className={DT.controlInner}>
                      {row.status === "completed" ? (
                        <button type="button" className={BUTTON.secondaryCompact}>
                          Download
                        </button>
                      ) : (
                        <span className="text-xs text-zinc-400">—</span>
                      )}
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
