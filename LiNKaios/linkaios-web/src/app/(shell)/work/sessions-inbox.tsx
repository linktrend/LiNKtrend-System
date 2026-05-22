"use client";

import { Bot, Filter } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";

import { stopWorkerSessionAction } from "@/app/(shell)/work/session-actions";
import { WorkEmptyState } from "@/app/(shell)/work/work-empty-state";
import { SessionsCatalogTable } from "@/components/sessions-catalog-table";
import type { SessionThreadRow } from "@/lib/work-sessions";

const SESSION_UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type SessionFilter = "all" | "running" | "waiting" | "completed" | "failed";

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

  const sessionFilterBtnClass = (f: SessionFilter): string => {
    const active = filter === f;
    const pill = "min-w-[6.5rem] rounded-full px-3 py-1 text-center text-xs font-semibold transition";
    if (f === "running")
      return active
        ? `${pill} bg-sky-600 text-white ring-1 ring-sky-700`
        : `${pill} bg-sky-100 text-sky-800 ring-1 ring-sky-300 hover:bg-sky-200 dark:bg-sky-950/50 dark:text-sky-200 dark:ring-sky-700 dark:hover:bg-sky-950/70`;
    if (f === "waiting")
      return active
        ? `${pill} bg-yellow-400 text-yellow-950 ring-1 ring-yellow-500`
        : `${pill} bg-yellow-100 text-yellow-900 ring-1 ring-yellow-300 hover:bg-yellow-200 dark:bg-yellow-950/50 dark:text-yellow-200 dark:ring-yellow-700 dark:hover:bg-yellow-950/70`;
    if (f === "completed")
      return active
        ? `${pill} bg-emerald-600 text-white ring-1 ring-emerald-700`
        : `${pill} bg-emerald-100 text-emerald-800 ring-1 ring-emerald-300 hover:bg-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-200 dark:ring-emerald-800 dark:hover:bg-emerald-950/70`;
    if (f === "failed")
      return active
        ? `${pill} bg-red-600 text-white ring-1 ring-red-700`
        : `${pill} bg-red-100 text-red-800 ring-1 ring-red-300 hover:bg-red-200 dark:bg-red-950/50 dark:text-red-200 dark:ring-red-800 dark:hover:bg-red-950/70`;
    return active
      ? `${pill} bg-zinc-900 text-white ring-1 ring-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:ring-zinc-300`
      : `${pill} bg-zinc-100 text-zinc-700 ring-1 ring-zinc-300 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-200 dark:ring-zinc-600 dark:hover:bg-zinc-700`;
  };

  const filterBtn = (f: SessionFilter, label: string) => (
    <button key={f} type="button" onClick={() => setFilter(f)} className={sessionFilterBtnClass(f)}>
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

      {visible.length === 0 ? (
        <WorkEmptyState
          icon={filter === "all" && props.sessions.length === 0 ? Bot : Filter}
          title={
            filter === "all" && props.sessions.length === 0 ? "No sessions yet" : "No sessions in this view"
          }
          description={
            filter === "all" && props.sessions.length === 0
              ? "When LiNKbots start work on a project, their sessions will appear here."
              : "Try another status filter or show all sessions."
          }
          actions={
            filter === "all" && props.sessions.length === 0
              ? [
                  { kind: "link", label: "Open LiNKbots", href: "/workers" },
                  { kind: "link", label: "View projects", href: "/projects", variant: "secondary" },
                ]
              : [{ kind: "button", label: "Show all sessions", onClick: () => setFilter("all") }]
          }
        />
      ) : (
        <SessionsCatalogTable rows={visible} stoppingId={stoppingId} onStop={(s) => void onStop(s)} />
      )}
    </div>
  );
}
