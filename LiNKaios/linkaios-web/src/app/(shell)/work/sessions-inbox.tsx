"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";

import { stopWorkerSessionAction } from "@/app/(shell)/work/session-actions";
import { BADGE, BUTTON, TABLE } from "@/lib/ui-standards";
import type { SessionThreadRow } from "@/lib/work-sessions";

const SESSION_UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type SessionFilter = "all" | "running" | "waiting" | "completed" | "failed";

function sessionStatusBadgeClass(st: SessionThreadRow["displayStatus"]): string {
  switch (st) {
    case "running":
      return BADGE.sessionRunning;
    case "waiting":
      return BADGE.sessionWaiting;
    case "completed":
      return BADGE.sessionCompleted;
    case "failed":
      return BADGE.sessionFailed;
    default:
      return BADGE.sessionDefault;
  }
}

function statusLabel(st: SessionThreadRow["displayStatus"]): string {
  return st.charAt(0).toUpperCase() + st.slice(1);
}

function rowStatusShell(st: SessionThreadRow["displayStatus"]): string {
  switch (st) {
    case "running":
      return "border-l-[6px] border-l-emerald-500";
    case "waiting":
      return "border-l-[6px] border-l-amber-500";
    case "completed":
      return "border-l-[6px] border-l-zinc-400 dark:border-l-zinc-500";
    case "failed":
      return "border-l-[6px] border-l-red-600 dark:border-l-red-500";
    default:
      return "border-l-[6px] border-l-zinc-300";
  }
}

function sessionStopEligible(s: SessionThreadRow): boolean {
  if (!SESSION_UUID_RE.test(s.id)) return false;
  return s.displayStatus === "running" || s.displayStatus === "waiting";
}

export function SessionsInbox(props: { sessions: SessionThreadRow[] }) {
  const router = useRouter();
  const [filter, setFilter] = useState<SessionFilter>("all");
  const [stoppingId, setStoppingId] = useState<string | null>(null);
  const [stopError, setStopError] = useState<string | null>(null);

  const onStop = useCallback(
    async (s: SessionThreadRow) => {
      if (!sessionStopEligible(s)) return;
      setStopError(null);
      setStoppingId(s.id);
      const r = await stopWorkerSessionAction(s.id);
      setStoppingId(null);
      if (!r.ok) {
        setStopError(r.error ?? "Could not stop session.");
        return;
      }
      router.refresh();
    },
    [router],
  );

  const visible = useMemo(() => {
    if (filter === "all") return props.sessions;
    return props.sessions.filter((s) => s.displayStatus === filter);
  }, [props.sessions, filter]);

  const filterBtn = (f: SessionFilter, label: string) => (
    <button
      key={f}
      type="button"
      onClick={() => setFilter(f)}
      className={
        "rounded-full px-3 py-1 text-xs font-semibold transition " +
        (filter === f
          ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
          : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700")
      }
    >
      {label}
    </button>
  );

  return (
    <div className="space-y-4">
      {stopError ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50/90 px-3 py-2 text-sm text-amber-950 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100" role="alert">
          {stopError}
        </p>
      ) : null}
      <div className="flex flex-wrap gap-2">
        {filterBtn("all", "All")}
        {filterBtn("running", "Running")}
        {filterBtn("waiting", "Waiting")}
        {filterBtn("completed", "Completed")}
        {filterBtn("failed", "Failed")}
      </div>

      <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-zinc-200 bg-zinc-50 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-400">
            <tr>
              <th className={`px-4 py-3 ${TABLE.thText}`}>Title</th>
              <th className={`px-4 py-3 ${TABLE.thText}`}>Agent</th>
              <th className={`px-4 py-3 ${TABLE.thText}`}>Project</th>
              <th className={`px-4 py-3 ${TABLE.thControl}`}>
                <div className={TABLE.thControlInner}>Status</div>
              </th>
              <th className={`px-4 py-3 ${TABLE.thText}`}>Last activity</th>
              <th className={`px-4 py-3 ${TABLE.thControl}`}>
                <div className={TABLE.thControlInner}>Actions</div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {visible.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-sm text-zinc-500">
                  No sessions in this view.
                </td>
              </tr>
            ) : (
              visible.map((s) => (
                <tr
                  key={s.id}
                  className={
                    "transition hover:bg-zinc-50 dark:hover:bg-zinc-900/50 " + rowStatusShell(s.displayStatus)
                  }
                >
                  <td className="max-w-xs px-4 py-3">
                    <Link href={s.openHref} className={BUTTON.editTextLink}>
                      {s.sessionTitle}
                    </Link>
                    <p className="mt-0.5 line-clamp-2 text-xs text-zinc-600 dark:text-zinc-400">{s.preview}</p>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-zinc-800 dark:text-zinc-200">{s.agentName}</td>
                  <td className="max-w-[10rem] px-4 py-3 text-xs text-zinc-600 dark:text-zinc-400">
                    {s.projectTitle ? (
                      s.projectId ? (
                        <Link href={`/projects/${encodeURIComponent(s.projectId)}`} className="hover:underline">
                          {s.projectTitle}
                        </Link>
                      ) : (
                        s.projectTitle
                      )
                    ) : (
                      <span className="text-zinc-400">—</span>
                    )}
                  </td>
                  <td className={`px-4 py-3 ${TABLE.thControl}`}>
                    <div className={TABLE.thControlInner}>
                      <span className={sessionStatusBadgeClass(s.displayStatus)}>{statusLabel(s.displayStatus)}</span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-xs text-zinc-500">
                    {new Date(s.lastActivityAt).toLocaleString()}
                  </td>
                  <td className={`px-4 py-3 ${TABLE.thControl}`}>
                    <div className="flex flex-wrap items-center justify-center gap-2">
                      {s.displayStatus === "waiting" ? (
                        <Link
                          href={s.openHref}
                          title="Opens the session workspace. Inline reply from this list is not implemented yet."
                          className={BUTTON.primaryCompact}
                        >
                          Respond
                        </Link>
                      ) : (
                        <button
                          type="button"
                          disabled
                          title="Respond is available when the session is waiting."
                          className={BUTTON.primaryCompact}
                        >
                          Respond
                        </button>
                      )}
                      <button
                        type="button"
                        disabled={!sessionStopEligible(s) || stoppingId === s.id}
                        title={
                          sessionStopEligible(s)
                            ? "Mark this session stopped in bot_runtime (does not kill an external provider process by itself)."
                            : SESSION_UUID_RE.test(s.id)
                              ? "Stop is only available while the session is running or waiting."
                              : "Demo sessions cannot be stopped here."
                        }
                        onClick={() => void onStop(s)}
                        className={BUTTON.secondaryCompact}
                      >
                        {stoppingId === s.id ? "Stopping…" : "Stop"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <p className="text-[11px] leading-relaxed text-zinc-500 dark:text-zinc-400">
        Stop updates the row in <code className="rounded bg-zinc-100 px-1 text-[10px] dark:bg-zinc-800">bot_runtime.worker_sessions</code> when you have command-centre write access. It does not cancel an in-flight external job unless your runtime listens for that state. Respond opens the session; one-click reply from this list is not implemented.
      </p>
    </div>
  );
}
