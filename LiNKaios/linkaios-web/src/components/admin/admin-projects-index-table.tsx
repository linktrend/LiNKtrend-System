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
import type { AdminProjectIndexRow } from "@/lib/admin-projects-data";
import { ADMIN_BASE_PATH } from "@/lib/app-surface";
import { openPlaneExternalUrl } from "@/lib/plane-links";
import { TABLE_COLUMN } from "@/lib/ui-standards";

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

const PROJECT_TABLE_CELL = "block min-w-0 line-clamp-3 leading-snug";

export function AdminProjectsIndexTable(props: {
  rows: AdminProjectIndexRow[];
  planeWorkspaceHref: string | null;
  emptyMessage?: string;
}) {
  const [syncById, setSyncById] = useState<Record<string, SyncState>>({});

  useEffect(() => {
    setSyncById(Object.fromEntries(props.rows.map((r) => [r.id, r.planeSyncStatus])));
  }, [props.rows]);

  const syncProject = useCallback(async (row: AdminProjectIndexRow) => {
    setSyncById((prev) => {
      if (prev[row.id] === "synced" || prev[row.id] === "syncing") return prev;
      return { ...prev, [row.id]: "syncing" };
    });

    try {
      const res = await fetch(`/api/projects/${encodeURIComponent(row.id)}/plane-sync`, { method: "POST" });
      const body = (await res.json()) as { planeSyncStatus?: string };
      if (!res.ok || body.planeSyncStatus !== "synced") throw new Error("sync failed");
      setSyncById((prev) => ({ ...prev, [row.id]: "synced" }));
    } catch {
      setSyncById((prev) => ({ ...prev, [row.id]: "pending" }));
    }
  }, []);

  return (
    <DataTableShell scrollableBody className="mt-4">
      <DataTable>
        <colgroup>
          <col className="w-[20%]" />
          <col className="w-[12%]" />
          <col className="w-[22%]" />
          <col className="w-[22%]" />
          <col className="w-[11%]" />
          <col className="w-[13%]" />
        </colgroup>
        <DataTableHead>
          <tr>
            <th className={DT.thTextInset}>{TABLE_COLUMN.name}</th>
            <th className={DT.thTextInset}>Type</th>
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
            <DataTableEmptyRow colSpan={6}>
              {props.emptyMessage ?? "No vendor projects yet."}
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
                  <td className={DT.tdClipInset}>
                    <span className={PROJECT_TABLE_CELL} title={r.projectTypeLabel}>
                      {r.projectTypeLabel}
                    </span>
                  </td>
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
                        href={`${ADMIN_BASE_PATH}/projects/${encodeURIComponent(r.id)}`}
                      />
                      <DataTableIconAction
                        icon={ExternalLink}
                        label={planeHref ? `Open ${r.title} in Plane` : "Plane is not connected"}
                        onClick={() => openPlaneExternalUrl(planeHref)}
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
