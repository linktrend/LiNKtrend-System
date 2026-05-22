"use client";

import { useState } from "react";

import {
  DataTable,
  DataTableBody,
  DataTableHead,
  DataTableRow,
  DataTableShell,
  DT,
  TableBoolToggle,
} from "@/components/data-table";
import { StatusPill } from "@/components/ui/status-pill";
import type { DemoAgentSkillRow } from "@/lib/ui-mocks/worker-ui";

type Row = DemoAgentSkillRow & { agentName?: string };

function skillStatusTone(status: Row["status"]): "success" | "info" | "neutral" {
  if (status === "enabled") return "success";
  if (status === "pending") return "info";
  return "neutral";
}

function skillStatusLabel(status: Row["status"]): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export function AgentSkillsTable(props: { rows: Row[] }) {
  const [on, setOn] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(props.rows.map((r) => [r.id, r.defaultOn])),
  );

  if (props.rows.length === 0) {
    return <p className="text-sm text-zinc-500">No skill rows to show.</p>;
  }

  const showAgent = props.rows.some((r) => r.agentName != null);

  return (
    <DataTableShell scrollableBody>
      <DataTable>
        <colgroup>
          {showAgent ? <col className="w-[14%]" /> : null}
          <col className="w-[14%]" />
          <col className="w-[32%]" />
          <col className="w-[12%]" />
          <col className="w-[12%]" />
          <col className="w-[14%]" />
          <col className="w-[10%]" />
        </colgroup>
        <DataTableHead>
          <tr>
            {showAgent ? <th className={DT.thTextInset}>LiNKbot</th> : null}
            <th className={DT.thTextInset}>Category</th>
            <th className={DT.thTextInset}>Description</th>
            <th className={DT.thControl}>
              <div className={DT.controlInner}>Status</div>
            </th>
            <th className={DT.thTextInset}>Version</th>
            <th className={DT.thTextInset}>Updated</th>
            <th className={DT.thControl}>
              <div className={DT.controlInner}>On</div>
            </th>
          </tr>
        </DataTableHead>
        <DataTableBody>
          {props.rows.map((r) => (
            <DataTableRow key={r.id} multiline>
              {showAgent ? (
                <td className={DT.tdClipInset}>
                  <span className={DT.tdTextSpan}>{r.agentName ?? "—"}</span>
                </td>
              ) : null}
              <td className={`${DT.tdClipInset} font-medium text-zinc-900 dark:text-zinc-100`}>
                <span className={DT.tdTextSpan}>{r.category}</span>
              </td>
              <td className={DT.tdClipInset}>
                <span className={DT.tdWrapSpan} title={r.description}>
                  {r.description}
                </span>
              </td>
              <td className={DT.tdControl}>
                <div className={DT.controlInner}>
                  <StatusPill label={skillStatusLabel(r.status)} tone={skillStatusTone(r.status)} equalWidth />
                </div>
              </td>
              <td className={`${DT.tdClipInset} font-mono text-xs`}>
                <span className={DT.tdTextSpan}>{r.version}</span>
              </td>
              <td className={DT.tdClipInset}>
                <span className={DT.tdTextSpan}>{r.updated}</span>
              </td>
              <td className={DT.tdControl}>
                <TableBoolToggle
                  on={on[r.id] ?? false}
                  onToggle={(next) => setOn((s) => ({ ...s, [r.id]: next }))}
                  ariaLabel={`Toggle skill ${r.category}`}
                />
              </td>
            </DataTableRow>
          ))}
        </DataTableBody>
      </DataTable>
    </DataTableShell>
  );
}
