"use client";

import { useEffect, useRef, useState } from "react";

import { ConnectorStatusPill } from "@/components/catalog-ui";
import {
  DataTable,
  DataTableBody,
  DataTableHead,
  DataTableRow,
  DataTableShell,
  DT,
} from "@/components/data-table";
import type { ConnectorCatalogRow } from "@/lib/ui-mocks/capability-connectors-demo";
import { BUTTON, TABLE_COLUMN } from "@/lib/ui-standards";

function scopePreview(scope: string, max = 48): string {
  const oneLine = scope.replace(/\s+/g, " ").trim();
  if (oneLine.length <= max) return oneLine;
  return `${oneLine.slice(0, max - 1)}…`;
}

export function CapabilityConnectorsTable(props: { rows: ConnectorCatalogRow[] }) {
  const [scopeModal, setScopeModal] = useState<{ name: string; scope: string } | null>(null);
  const dlg = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = dlg.current;
    if (!el) return;
    if (scopeModal) {
      el.showModal();
    } else if (el.open) {
      el.close();
    }
  }, [scopeModal]);

  return (
    <>
      <DataTableShell scrollableBody>
        <DataTable>
          <colgroup>
            <col className="w-[17%]" />
            <col className="w-[24%]" />
            <col className="w-[18%]" />
            <col className="w-[17%]" />
            <col className="w-[14%]" />
          </colgroup>
          <DataTableHead>
            <tr>
              <th className={DT.thTextInset}>{TABLE_COLUMN.capability}</th>
              <th className={DT.thTextInset}>Scope</th>
              <th className={DT.thTextInset}>{TABLE_COLUMN.targetSoftware}</th>
              <th className={DT.thTextInset}>{TABLE_COLUMN.usedByModules}</th>
              <th className={DT.thControl}>
                <div className={DT.controlInner}>{TABLE_COLUMN.status}</div>
              </th>
            </tr>
          </DataTableHead>
          <DataTableBody>
            {props.rows.map((r) => (
              <DataTableRow key={r.id} multiline>
                <td className={`${DT.tdClipInset} text-sm font-medium text-zinc-900 dark:text-zinc-100`}>
                  <span className={DT.tdTextSpan} title={r.name}>
                    {r.name}
                  </span>
                </td>
                <td className={DT.tdClipInset}>
                  <button
                    type="button"
                    className="block w-full text-left text-xs leading-snug text-zinc-600 underline-offset-2 hover:text-zinc-900 hover:underline dark:text-zinc-400 dark:hover:text-zinc-200"
                    title={r.capabilityScope}
                    onClick={() => setScopeModal({ name: r.name, scope: r.capabilityScope })}
                  >
                    <span className={DT.tdWrapSpan}>{scopePreview(r.capabilityScope)}</span>
                  </button>
                </td>
                <td className={DT.tdClipInset}>
                  <span className={DT.tdWrapSpan} title={r.targetSoftware}>
                    {r.targetSoftware}
                  </span>
                </td>
                <td className={DT.tdClipInset}>
                  <span className={DT.tdWrapSpan} title={r.usedBy}>
                    {r.usedBy}
                  </span>
                </td>
                <td className={DT.tdControl}>
                  <div className={DT.controlInner}>
                    <ConnectorStatusPill status={r.status} />
                  </div>
                </td>
              </DataTableRow>
            ))}
          </DataTableBody>
        </DataTable>
      </DataTableShell>

      <dialog
        ref={dlg}
        className="w-[min(100vw-2rem,32rem)] rounded-2xl border border-zinc-200 bg-white p-6 text-sm shadow-2xl backdrop:bg-black/40 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
        onCancel={(e) => {
          e.preventDefault();
          setScopeModal(null);
        }}
      >
        {scopeModal ? (
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Capability scope</h2>
              <button
                type="button"
                className="rounded-md px-2 py-1 text-xs text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                onClick={() => setScopeModal(null)}
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">{scopeModal.name}</p>
            <pre className="max-h-[min(50vh,24rem)] overflow-auto rounded-lg border border-zinc-200 bg-zinc-50 p-3 font-mono text-xs text-zinc-800 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200">
              {scopeModal.scope}
            </pre>
            <button type="button" className={BUTTON.secondaryBlock} onClick={() => setScopeModal(null)}>
              Close
            </button>
          </div>
        ) : null}
      </dialog>
    </>
  );
}
