"use client";

import { Check, ExternalLink, Eye, Loader2, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import {
  DataTable,
  DataTableBody,
  DataTableEmptyRow,
  DataTableHead,
  DataTableIconAction,
  DataTableRow,
  DataTableShell,
  DT,
} from "@/components/data-table";
import type { ProjectIndexRow } from "@/lib/project-index-rows";
import { TABLE_COLUMN } from "@/lib/ui-standards";

/** @deprecated Use ProjectIndexRow */
export type ProjectRowModal = ProjectIndexRow;

type SyncState = "synced" | "pending" | "syncing";

function PlaneSyncControl(props: {
  status: SyncState;
  title: string;
  onSync: () => void;
}) {
  if (props.status === "synced") {
    return (
      <span title="Synced to Plane">
        <Check className="h-5 w-5 text-emerald-600 dark:text-emerald-400" aria-label="Synced to Plane" />
      </span>
    );
  }

  if (props.status === "syncing") {
    return (
      <span title="Syncing with Plane…">
        <Loader2
          className="h-5 w-5 animate-spin text-zinc-500 dark:text-zinc-400"
          aria-label="Syncing with Plane"
        />
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={props.onSync}
      title={`Sync ${props.title} with Plane`}
      aria-label={`Sync ${props.title} with Plane`}
      className="inline-flex h-5 w-5 items-center justify-center rounded-md text-amber-500 transition hover:text-amber-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400/80 dark:text-amber-400 dark:hover:text-amber-300"
    >
      <RefreshCw className="h-5 w-5" aria-hidden />
    </button>
  );
}

/** Body cell text — inherits row `text-sm`; multiline clamp without smaller/muted override. */
const PROJECT_TABLE_CELL = "block min-w-0 line-clamp-3 leading-snug";

export function ProjectsIndexTable(props: {
  rows: ProjectIndexRow[];
  planeWorkspaceHref: string | null;
  /** When false, omits Suite column (suite-scoped project lists). Default true. */
  showSuiteColumn?: boolean;
  emptyMessage?: string;
}) {
  const showSuite = props.showSuiteColumn !== false;
  const [syncById, setSyncById] = useState<Record<string, SyncState>>({});

  useEffect(() => {
    setSyncById(Object.fromEntries(props.rows.map((r) => [r.id, r.planeSyncStatus])));
  }, [props.rows]);

  const syncProject = useCallback(async (row: ProjectIndexRow) => {
    setSyncById((prev) => {
      if (prev[row.id] === "synced" || prev[row.id] === "syncing") return prev;
      return { ...prev, [row.id]: "syncing" };
    });

    try {
      const res = await fetch(`/api/projects/${encodeURIComponent(row.id)}/plane-sync`, { method: "POST" });
      if (!res.ok) throw new Error("sync failed");
      setSyncById((prev) => ({ ...prev, [row.id]: "synced" }));
    } catch {
      setSyncById((prev) => ({ ...prev, [row.id]: "pending" }));
    }
  }, []);

  return (
    <DataTableShell scrollableBody className="mt-4">
      <DataTable>
        <colgroup>
          {showSuite ? (
            <>
              <col className="w-[20%]" />
              <col className="w-[12%]" />
              <col className="w-[22%]" />
              <col className="w-[22%]" />
              <col className="w-[11%]" />
              <col className="w-[13%]" />
            </>
          ) : (
            <>
              <col className="w-[24%]" />
              <col className="w-[24%]" />
              <col className="w-[24%]" />
              <col className="w-[13%]" />
              <col className="w-[15%]" />
            </>
          )}
        </colgroup>
        <DataTableHead>
          <tr>
            <th className={DT.thTextInset}>{TABLE_COLUMN.name}</th>
            {showSuite ? <th className={DT.thTextInset}>{TABLE_COLUMN.suite}</th> : null}
            <th className={DT.thTextInset}>{TABLE_COLUMN.phase}</th>
            <th className={DT.thTextInset}>{TABLE_COLUMN.issue}</th>
            <th className={DT.thControl}>
              <div className={DT.controlInner}>{TABLE_COLUMN.planeSync}</div>
            </th>
            <th className={DT.thControl}>
              <div className={DT.controlInner}>{TABLE_COLUMN.actions}</div>
            </th>
          </tr>
        </DataTableHead>
        <DataTableBody>
          {props.rows.length === 0 ? (
            <DataTableEmptyRow colSpan={showSuite ? 6 : 5}>
              {props.emptyMessage ?? "No projects yet."}
            </DataTableEmptyRow>
          ) : (
            props.rows.map((r) => {
              const planeHref = r.planeProjectHref ?? props.planeWorkspaceHref;
              const syncStatus = syncById[r.id] ?? r.planeSyncStatus;
              return (
                <DataTableRow key={r.id} multiline>
                  <td className={DT.tdClipInset}>
                    <span className={PROJECT_TABLE_CELL} title={r.title}>
                      {r.title}
                    </span>
                  </td>
                  {showSuite ? (
                    <td className={DT.tdClipInset}>
                      <span className={PROJECT_TABLE_CELL} title={r.suiteName}>
                        {r.suiteName}
                      </span>
                    </td>
                  ) : null}
                  <td className={DT.tdClipInset}>
                    <span className={PROJECT_TABLE_CELL} title={r.phaseName}>
                      {r.phaseName}
                    </span>
                  </td>
                  <td className={DT.tdClipInset}>
                    <span className={PROJECT_TABLE_CELL} title={r.activeIssue}>
                      {r.activeIssue}
                    </span>
                  </td>
                  <td className={DT.tdControl}>
                    <div className={DT.controlInner}>
                      <PlaneSyncControl status={syncStatus} title={r.title} onSync={() => void syncProject(r)} />
                    </div>
                  </td>
                  <td className={DT.tdControl}>
                    <div className={DT.actionsRow}>
                      <DataTableIconAction
                        icon={Eye}
                        label={`Open ${r.title} in LiNKaios`}
                        href={`/projects/${encodeURIComponent(r.id)}`}
                      />
                      <DataTableIconAction
                        icon={ExternalLink}
                        label={planeHref ? `Open ${r.title} in Plane` : "Plane is not connected"}
                        href={planeHref ?? undefined}
                        disabled={!planeHref}
                      />
                    </div>
                  </td>
                </DataTableRow>
              );
            })
          )}
        </DataTableBody>
      </DataTable>
    </DataTableShell>
  );
}
