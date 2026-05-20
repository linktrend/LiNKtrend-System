"use client";

import { Cable } from "lucide-react";

import { ConnectorStatusPill } from "@/components/catalog-ui";
import type { ConnectorCatalogRow } from "@/lib/ui-mocks/capability-connectors-demo";
import { TABLE } from "@/lib/ui-standards";

const TABLE_CLASS = "table-fixed min-w-[880px] w-full divide-y divide-zinc-200 text-left text-sm dark:divide-zinc-800";

export function CapabilityConnectorsTable(props: { rows: ConnectorCatalogRow[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <table className={TABLE_CLASS}>
        <colgroup>
          <col className="w-[14%]" />
          <col className="w-[22%]" />
          <col className="w-[12%]" />
          <col className="w-[16%]" />
          <col className="w-[36%]" />
        </colgroup>
        <thead className="bg-zinc-50 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
          <tr>
            <th className={`px-4 py-3 ${TABLE.thText}`}>
              <span className="inline-flex items-center gap-1.5">
                <Cable className="h-3.5 w-3.5" aria-hidden />
                Connector
              </span>
            </th>
            <th className={`px-4 py-3 ${TABLE.thText}`}>Capability scope</th>
            <th className={`px-4 py-3 ${TABLE.thControl}`}>
              <div className={TABLE.thControlInner}>Status</div>
            </th>
            <th className={`px-4 py-3 ${TABLE.thText}`}>Target software</th>
            <th className={`px-4 py-3 ${TABLE.thText}`}>Used by</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {props.rows.map((r) => (
            <tr key={r.id} className="text-zinc-800 dark:text-zinc-200">
              <td className="px-4 py-3 text-sm font-medium text-zinc-900 dark:text-zinc-100">{r.name}</td>
              <td className="px-4 py-3 font-mono text-xs text-zinc-600 dark:text-zinc-400">{r.capabilityScope}</td>
              <td className={`px-4 py-3 ${TABLE.thControl}`}>
                <div className={TABLE.thControlInner}>
                  <ConnectorStatusPill status={r.status} />
                </div>
              </td>
              <td className="px-4 py-3 text-xs text-zinc-600 dark:text-zinc-400">{r.targetSoftware}</td>
              <td className="px-4 py-3 text-xs text-zinc-600 dark:text-zinc-400">{r.usedBy}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
