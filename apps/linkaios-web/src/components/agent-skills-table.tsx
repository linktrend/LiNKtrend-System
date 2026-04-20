"use client";

import { useState } from "react";

import { CatalogueBoolToggle } from "@/components/catalog-ui";
import { TABLE } from "@/lib/ui-standards";
import type { DemoAgentSkillRow } from "@/lib/ui-mocks/worker-ui";

type Row = DemoAgentSkillRow & { agentName?: string };

export function AgentSkillsTable(props: { rows: Row[] }) {
  const [on, setOn] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(props.rows.map((r) => [r.id, r.defaultOn])),
  );

  if (props.rows.length === 0) {
    return <p className="text-sm text-zinc-500">No skill rows to show.</p>;
  }

  const showAgent = props.rows.some((r) => r.agentName != null);

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
      <table className="min-w-full divide-y divide-zinc-200 text-sm">
        <thead className="bg-zinc-50 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
          <tr>
            {showAgent ? (
              <th className={`px-4 py-3 ${TABLE.thText}`}>LiNKbot</th>
            ) : null}
            <th className={`px-4 py-3 ${TABLE.thText}`}>Category</th>
            <th className={`px-4 py-3 ${TABLE.thText}`}>Description</th>
            <th className={`px-4 py-3 ${TABLE.thControl}`}>
              <div className={TABLE.thControlInner}>Status</div>
            </th>
            <th className={`px-4 py-3 ${TABLE.thText}`}>Version</th>
            <th className={`px-4 py-3 ${TABLE.thText}`}>Updated</th>
            <th className={`px-4 py-3 ${TABLE.thControl}`}>
              <div className={TABLE.thControlInner}>On</div>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100">
          {props.rows.map((r) => (
            <tr key={r.id} className="text-zinc-800">
              {showAgent ? <td className="px-4 py-3 text-zinc-600">{r.agentName ?? "—"}</td> : null}
              <td className="px-4 py-3 font-medium text-zinc-900">{r.category}</td>
              <td className="max-w-md px-4 py-3 text-zinc-600">{r.description}</td>
              <td className={`px-4 py-3 ${TABLE.thControl}`}>
                <div className={TABLE.thControlInner}>
                  <span
                    className={
                      "rounded-full px-2 py-0.5 text-xs font-medium ring-1 " +
                      (r.status === "enabled"
                        ? "bg-emerald-50 text-emerald-900 ring-emerald-200"
                        : r.status === "pending"
                          ? "bg-sky-50 text-sky-900 ring-sky-200"
                          : "bg-zinc-100 text-zinc-700 ring-zinc-200")
                    }
                  >
                    {r.status}
                  </span>
                </div>
              </td>
              <td className="px-4 py-3 font-mono text-xs">{r.version}</td>
              <td className="px-4 py-3 text-zinc-600">{r.updated}</td>
              <td className={`px-4 py-3 ${TABLE.thControl}`}>
                <div className={TABLE.thControlInner}>
                  <CatalogueBoolToggle
                  on={on[r.id] ?? false}
                  onToggle={(next) => setOn((s) => ({ ...s, [r.id]: next }))}
                  ariaLabel={`Toggle skill ${r.category}`}
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
