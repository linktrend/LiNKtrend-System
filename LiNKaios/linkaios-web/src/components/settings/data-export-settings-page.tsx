"use client";

import { useEffect, useState } from "react";

import {
  DataTable,
  DataTableBody,
  DataTableEmptyRow,
  DataTableHead,
  DataTableRow,
  DataTableShell,
  DT,
} from "@/components/data-table";
import {
  DEFAULT_EXPORT_SCOPES,
  EVENT_DATA_EXPORT_CHANGED,
  queueExportRequest,
  readExportRequests,
  type ExportFormat,
  type ExportRequestRow,
} from "@/lib/data-export-preferences";
import { FormField, FormSelect } from "@/components/forms";
import { StubPageNotice } from "@/components/stub-badge";
import { BUTTON, formatUiLabel } from "@/lib/ui-standards";

function statusTone(status: ExportRequestRow["status"]): string {
  if (status === "ready") return "text-emerald-700 dark:text-emerald-300";
  if (status === "expired") return "text-zinc-500";
  return "text-amber-700 dark:text-amber-300";
}

export function DataExportSettingsPage() {
  const [requests, setRequests] = useState<ExportRequestRow[]>(() => readExportRequests());
  const [format, setFormat] = useState<ExportFormat>("zip");
  const [flash, setFlash] = useState<string | null>(null);

  useEffect(() => {
    const sync = () => setRequests(readExportRequests());
    sync();
    window.addEventListener(EVENT_DATA_EXPORT_CHANGED, sync);
    return () => window.removeEventListener(EVENT_DATA_EXPORT_CHANGED, sync);
  }, []);

  function requestExport() {
    const row = queueExportRequest(format);
    setRequests(readExportRequests());
    setFlash(`Export queued (${row.id}). You will receive email when the archive is ready.`);
    window.setTimeout(() => setFlash(null), 5000);
  }

  return (
    <div className="space-y-6">
      <StubPageNotice message="Export requests are stored in this browser only. No archive is generated or emailed in the MVO build." />
      {flash ? (
        <p
          role="status"
          className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-100"
        >
          {flash}
        </p>
      ) : null}

      <section className="space-y-4">
        <div className="flex flex-wrap items-end gap-4">
          <div className="min-w-[12rem]">
            <FormField id="export-format" label="Export format">
              {({ id, invalid, describedBy }) => (
                <FormSelect
                  id={id}
                  compact
                  invalid={invalid}
                  describedBy={describedBy}
                  value={format}
                  onChange={(value) => setFormat(value as ExportFormat)}
                  options={[
                    { value: "zip", label: "ZIP archive" },
                    { value: "json", label: "JSON bundle" },
                    { value: "csv", label: "CSV tables" },
                  ]}
                />
              )}
            </FormField>
          </div>
          <button type="button" className={BUTTON.primaryRow} onClick={requestExport}>
            Request full export
          </button>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{formatUiLabel("Included in export")}</h2>
        <DataTableShell scrollableBody>
          <DataTable>
            <colgroup>
              <col className="w-[24%]" />
              <col className="w-[56%]" />
              <col className="w-[20%]" />
            </colgroup>
            <DataTableHead>
              <tr>
                <th className={DT.thTextInset}>{formatUiLabel("Category")}</th>
                <th className={DT.thTextInset}>{formatUiLabel("Description")}</th>
                <th className={DT.thControl}>
                  <div className={DT.controlInner}>{formatUiLabel("Included")}</div>
                </th>
              </tr>
            </DataTableHead>
            <DataTableBody>
              {DEFAULT_EXPORT_SCOPES.map((row) => (
                <DataTableRow key={row.id} multiline>
                  <td className={`${DT.tdClipInset} font-medium text-zinc-900 dark:text-zinc-100`}>
                    <span className={DT.tdTextSpan}>{formatUiLabel(row.label)}</span>
                  </td>
                  <td className={DT.tdClipInset}>
                    <span className={DT.tdWrapSpan}>{row.description}</span>
                  </td>
                  <td className={DT.tdControl}>
                    <div className={`${DT.controlInner} text-sm font-medium text-emerald-700 dark:text-emerald-300`}>Yes</div>
                  </td>
                </DataTableRow>
              ))}
            </DataTableBody>
          </DataTable>
        </DataTableShell>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{formatUiLabel("Export history")}</h2>
        <DataTableShell scrollableBody>
          <DataTable>
            <colgroup>
              <col className="w-[18%]" />
              <col className="w-[14%]" />
              <col className="w-[24%]" />
              <col className="w-[14%]" />
              <col className="w-[30%]" />
            </colgroup>
            <DataTableHead>
              <tr>
                <th className={DT.thTextInset}>{formatUiLabel("Requested")}</th>
                <th className={DT.thTextInset}>{formatUiLabel("Format")}</th>
                <th className={DT.thTextInset}>{formatUiLabel("Scope")}</th>
                <th className={DT.thTextInset}>{formatUiLabel("Status")}</th>
                <th className={DT.thControl}>
                  <div className={DT.controlInner}>{formatUiLabel("Download")}</div>
                </th>
              </tr>
            </DataTableHead>
            <DataTableBody>
              {requests.length === 0 ? (
                <DataTableEmptyRow colSpan={5}>No export requests yet.</DataTableEmptyRow>
              ) : (
                requests.map((row) => (
                  <DataTableRow key={row.id} multiline>
                    <td className={`${DT.tdClipInset} font-mono text-xs`}>
                      <span className={DT.tdTextSpan}>{row.requestedAt.replace("T", " ").slice(0, 16)}</span>
                    </td>
                    <td className={DT.tdClipInset}>
                      <span className={`${DT.tdTextSpan} uppercase`}>{row.format}</span>
                    </td>
                    <td className={DT.tdClipInset}>
                      <span className={DT.tdWrapSpan}>{row.scopeLabel}</span>
                    </td>
                    <td className={DT.tdClipInset}>
                      <span className={`${DT.tdTextSpan} font-medium capitalize ${statusTone(row.status)}`}>{row.status}</span>
                    </td>
                    <td className={DT.tdControl}>
                      <div className={DT.controlInner}>
                        {row.status === "ready" ? (
                          <button type="button" className={BUTTON.secondaryCompact}>
                            Download
                          </button>
                        ) : (
                          <span className="text-xs text-zinc-400">—</span>
                        )}
                      </div>
                    </td>
                  </DataTableRow>
                ))
              )}
            </DataTableBody>
          </DataTable>
        </DataTableShell>
      </section>
    </div>
  );
}
