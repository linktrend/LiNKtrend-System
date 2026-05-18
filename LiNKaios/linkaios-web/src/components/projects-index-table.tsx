"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { projectStatusDisplay } from "@/lib/project-status-ui";
import { BUTTON, STACK, TABLE } from "@/lib/ui-standards";

export type ProjectRowModal = {
  id: string;
  title: string;
  status: string;
  leadLabel: string;
  leadHref: string | null;
  code: string;
  cycle: string;
  open: number;
  blockers: number;
  updated: string;
  hasBridge: boolean;
};

function activitySummary(open: number, blockers: number, hasBridge: boolean) {
  if (!hasBridge) return "Activity not synced yet";
  if (blockers > 0) return `${open} open · ${blockers} blocker(s)`;
  if (open > 0) return `${open} open items`;
  return "Clear — no open items";
}

export function ProjectsIndexTable(props: { rows: ProjectRowModal[]; planeWorkspaceHref: string | null }) {
  const [open, setOpen] = useState<ProjectRowModal | null>(null);
  const dlg = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = dlg.current;
    if (!el) return;
    if (open) {
      el.showModal();
    } else if (el.open) {
      el.close();
    }
  }, [open]);

  return (
    <>
      <div className="mt-4 overflow-x-auto rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <table className="min-w-[720px] w-full divide-y divide-zinc-200 text-left text-sm dark:divide-zinc-800">
          <thead className="bg-zinc-50 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
            <tr>
              <th className={`px-4 py-3 ${TABLE.thText}`}>Name</th>
              <th className={`px-4 py-3 ${TABLE.thControl}`}>
                <div className={TABLE.thControlInner}>Plane</div>
              </th>
              <th className={`px-4 py-3 ${TABLE.thText}`}>Status</th>
              <th className={`px-4 py-3 ${TABLE.thText}`}>LiNKbot</th>
              <th className={`px-4 py-3 ${TABLE.thText}`}>Activity</th>
              <th className={`px-4 py-3 ${TABLE.thControl}`}>
                <div className={TABLE.thControlInner}>Details</div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {props.rows.map((r) => (
              <tr key={r.id} className="text-zinc-800 hover:bg-zinc-50/80 dark:text-zinc-200 dark:hover:bg-zinc-900/60">
                <td className="px-4 py-3">
                  <Link
                    href={`/projects/${encodeURIComponent(r.id)}`}
                    className="font-semibold text-zinc-900 underline-offset-2 hover:underline dark:text-zinc-100"
                  >
                    {r.title}
                  </Link>
                </td>
                <td className={`px-4 py-3 ${TABLE.thControl}`}>
                  {props.planeWorkspaceHref ? (
                    <a
                      href={props.planeWorkspaceHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
                    >
                      Open in Plane ↗
                    </a>
                  ) : (
                    <span className="text-xs text-zinc-400">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300">{projectStatusDisplay(r.status)}</td>
                <td className="px-4 py-3">
                  {r.leadHref ? (
                    <Link href={r.leadHref} className="text-violet-800 underline-offset-2 hover:underline dark:text-violet-300">
                      {r.leadLabel}
                    </Link>
                  ) : (
                    <span className="text-zinc-500">—</span>
                  )}
                </td>
                <td className="max-w-[14rem] px-4 py-3 text-xs text-zinc-600 dark:text-zinc-400">
                  {activitySummary(r.open, r.blockers, r.hasBridge)}
                </td>
                <td className={`px-4 py-3 ${TABLE.thControl}`}>
                  <button
                    type="button"
                    className={`${BUTTON.ghostRow} text-xs`}
                    onClick={() => setOpen(r)}
                  >
                    Summary
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <dialog
        ref={dlg}
        className="w-[min(100vw-2rem,28rem)] rounded-2xl border border-zinc-200 bg-white p-6 text-sm shadow-2xl backdrop:bg-black/40 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
        onCancel={(e) => {
          e.preventDefault();
          setOpen(null);
        }}
      >
        {open ? (
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">{open.title}</h2>
              <button
                type="button"
                className="rounded-md px-2 py-1 text-xs text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                onClick={() => setOpen(null)}
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-zinc-500">Status</dt>
                <dd className="font-medium">{projectStatusDisplay(open.status)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-zinc-500">Assigned LiNKbots</dt>
                <dd className="text-right font-medium">
                  {open.leadHref ? (
                    <Link href={open.leadHref} className="text-violet-800 underline dark:text-violet-300">
                      {open.leadLabel}
                    </Link>
                  ) : (
                    "—"
                  )}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-zinc-500">Activity</dt>
                <dd className="text-right text-xs font-medium text-zinc-800 dark:text-zinc-200">
                  {activitySummary(open.open, open.blockers, open.hasBridge)}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-zinc-500">Last updated</dt>
                <dd className="text-xs text-zinc-600">{open.updated}</dd>
              </div>
            </dl>
            <div className={`mx-auto w-full border-t border-zinc-100 pt-4 dark:border-zinc-800 ${STACK.actions}`}>
              {props.planeWorkspaceHref ? (
                <a
                  href={props.planeWorkspaceHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={BUTTON.primaryBlock}
                >
                  Open in Plane ↗
                </a>
              ) : (
                <p className="text-center text-xs text-zinc-500">Plane is not connected for this deployment.</p>
              )}
              <Link href={`/projects/${encodeURIComponent(open.id)}`} className={BUTTON.secondaryBlock}>
                Open in LiNKaios
              </Link>
            </div>
          </div>
        ) : null}
      </dialog>
    </>
  );
}
