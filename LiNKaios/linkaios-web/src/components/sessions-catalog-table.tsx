"use client";

import { X, Eye } from "lucide-react";

import { DataTableIconAction, DataTableShell, DT } from "@/components/data-table";
import {
  SESSIONS_CATALOG_TABLE_CLASS,
  SessionsCatalogColGroup,
} from "@/components/sessions-catalog-table-layout";
import { StatusPill } from "@/components/ui/status-pill";
import type { StatusTone } from "@/lib/status-colors";
import { SESSION_DISPLAY_PILL_LABELS } from "@/lib/status-colors";
import { TABLE_COLUMN } from "@/lib/ui-standards";
import type { SessionThreadRow } from "@/lib/work-sessions";

const SESSION_UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function sessionStatusTone(st: SessionThreadRow["displayStatus"]): StatusTone {
  switch (st) {
    case "running":
      return "active";
    case "waiting":
      return "warning";
    case "completed":
      return "success";
    case "failed":
      return "danger";
    default:
      return "neutral";
  }
}

function statusLabel(st: SessionThreadRow["displayStatus"]): string {
  return st.charAt(0).toUpperCase() + st.slice(1);
}

function sessionStopEligible(s: SessionThreadRow): boolean {
  if (!SESSION_UUID_RE.test(s.id)) return false;
  return s.displayStatus === "running" || s.displayStatus === "waiting";
}

function formatRelativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short" });
}

function shortPreview(text: string, max = 48): string {
  const trimmed = text.trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max - 1)}…`;
}

export function SessionsCatalogTable(props: {
  rows: SessionThreadRow[];
  stoppingId?: string | null;
  onStop?: (session: SessionThreadRow) => void;
}) {
  return (
    <DataTableShell scrollableBody>
      <table className={SESSIONS_CATALOG_TABLE_CLASS}>
        <SessionsCatalogColGroup />
        <thead className={DT.thead}>
          <tr>
            <th className={DT.thTextInset}>{TABLE_COLUMN.title}</th>
            <th className={DT.thTextInset}>{TABLE_COLUMN.summary}</th>
            <th className={DT.thTextInset}>{TABLE_COLUMN.agent}</th>
            <th className={DT.thTextInset}>{TABLE_COLUMN.project}</th>
            <th className={DT.thControl}>
              <div className={DT.controlInner}>{TABLE_COLUMN.status}</div>
            </th>
            <th className={DT.thTextInset}>{TABLE_COLUMN.lastActivity}</th>
            <th className={DT.thControl}>
              <div className={DT.controlInner}>{TABLE_COLUMN.actions}</div>
            </th>
          </tr>
        </thead>
        <tbody className={DT.tbody}>
          {props.rows.length === 0 ? (
            <tr>
              <td colSpan={7} className={DT.emptyCell}>
                No sessions in this view.
              </td>
            </tr>
          ) : (
            props.rows.map((s) => (
              <tr key={s.id} className={DT.trMultiline}>
                <td className={`${DT.tdClipInset} text-sm font-medium text-zinc-900 dark:text-zinc-100`}>
                  <span className={DT.tdTextSpan} title={s.sessionTitle}>
                    {s.sessionTitle}
                  </span>
                </td>
                <td className={DT.tdClipInset}>
                  <span className={`${DT.tdTextSpan} line-clamp-2`} title={s.preview}>
                    {shortPreview(s.preview)}
                  </span>
                </td>
                <td className={DT.tdClipInset}>
                  <span className={DT.tdTextSpan} title={s.agentName}>
                    {s.agentName}
                  </span>
                </td>
                <td className={DT.tdClipInset}>
                  <span className={DT.tdTextSpan} title={s.projectTitle ?? undefined}>
                    {s.projectTitle ?? "—"}
                  </span>
                </td>
                <td className={DT.tdControl}>
                  <div className={DT.controlInner}>
                    <StatusPill
                      label={statusLabel(s.displayStatus)}
                      tone={sessionStatusTone(s.displayStatus)}
                      equalWidthLabels={SESSION_DISPLAY_PILL_LABELS}
                    />
                  </div>
                </td>
                <td className={DT.tdClipInset}>
                  <span className={`${DT.tdTextSpan} text-zinc-500`} title={formatRelativeTime(s.lastActivityAt)}>
                    {formatRelativeTime(s.lastActivityAt)}
                  </span>
                </td>
                <td className={DT.tdControl}>
                  <div className={DT.actionsRow}>
                    <DataTableIconAction icon={Eye} label={`Open ${s.sessionTitle}`} href={s.openHref} />
                    {sessionStopEligible(s) && props.onStop ? (
                      <DataTableIconAction
                        icon={X}
                        tone="danger"
                        label={props.stoppingId === s.id ? "Stopping session" : "Stop session"}
                        disabled={props.stoppingId === s.id}
                        onClick={() => props.onStop!(s)}
                      />
                    ) : null}
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </DataTableShell>
  );
}
