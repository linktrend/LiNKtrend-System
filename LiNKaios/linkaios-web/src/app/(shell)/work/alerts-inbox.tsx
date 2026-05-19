"use client";

import { AlertCircle, AlertTriangle, Info } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { acknowledgeTraceAlertAction } from "@/app/(shell)/work/alert-acknowledgments-actions";
import { WorkInboxModal } from "@/components/work-inbox-modal";
import { WORK_ALERT_BADGE } from "@/lib/ui-theme";
import type { WorkAlert } from "@/lib/work-alerts";

const RESOLVED_STORAGE_KEY = "linkaios_work_alerts_resolved_ids_v1";

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

type AlertFilter = "all" | "critical" | "warning" | "info" | "resolved";

function loadResolvedIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.sessionStorage.getItem(RESOLVED_STORAGE_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw) as unknown;
    if (!Array.isArray(arr)) return new Set();
    return new Set(arr.filter((x): x is string => typeof x === "string"));
  } catch {
    return new Set();
  }
}

function saveResolvedIds(ids: Set<string>) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(RESOLVED_STORAGE_KEY, JSON.stringify([...ids]));
}

function initialResolvedSet(props: { traceAckPersistenceEnabled: boolean; initialResolvedIds: string[] }): Set<string> {
  const s = new Set<string>(props.initialResolvedIds);
  if (!props.traceAckPersistenceEnabled) {
    for (const x of loadResolvedIds()) s.add(x);
  }
  return s;
}

function severityLabel(sev: WorkAlert["severity"]) {
  switch (sev) {
    case "critical": return "Critical";
    case "warning": return "Warning";
    default: return "Info";
  }
}

function severityIconClass(sev: WorkAlert["severity"], isResolved: boolean): string {
  if (isResolved) return "mt-0.5 h-4 w-4 shrink-0 text-emerald-500 dark:text-emerald-400";
  if (sev === "critical") return "mt-0.5 h-4 w-4 shrink-0 text-red-600 dark:text-red-400";
  if (sev === "warning") return "mt-0.5 h-4 w-4 shrink-0 text-yellow-500 dark:text-yellow-400";
  return "mt-0.5 h-4 w-4 shrink-0 text-sky-500 dark:text-sky-400";
}

function rowShell(sev: WorkAlert["severity"], isResolved: boolean): string {
  if (isResolved) return "border-l-4 border-l-emerald-500 dark:border-l-emerald-500";
  if (sev === "critical") return "border-l-4 border-l-red-600 dark:border-l-red-500";
  if (sev === "warning") return "border-l-4 border-l-yellow-400 dark:border-l-yellow-400";
  return "border-l-4 border-l-sky-500 dark:border-l-sky-500";
}

function rowHover(sev: WorkAlert["severity"], isResolved: boolean): string {
  if (isResolved) return "hover:bg-emerald-50/70 dark:hover:bg-emerald-950/30";
  if (sev === "critical") return "hover:bg-red-50/80 dark:hover:bg-red-950/30";
  if (sev === "warning") return "hover:bg-yellow-50/90 dark:hover:bg-yellow-950/25";
  return "hover:bg-sky-50/70 dark:hover:bg-sky-950/25";
}

function goToFixHref(a: WorkAlert): string {
  const blob = `${a.title} ${a.summary} ${a.source}`.toLowerCase();
  if (blob.includes("gateway") || blob.includes("zulip") || blob.includes("stream")) return "/settings/gateway";
  if (blob.includes("brain") || blob.includes("memory") || blob.includes("draft")) return "/memory?tab=inbox";
  if (blob.includes("skill") || blob.includes("tool")) return "/skills/skills";
  return "/workers";
}

export function AlertsInbox(props: {
  items: WorkAlert[];
  traceAckPersistenceEnabled: boolean;
  initialResolvedIds: string[];
}) {
  const [selected, setSelected] = useState<WorkAlert | null>(null);
  const [filter, setFilter] = useState<AlertFilter>("all");
  const [resolved, setResolved] = useState(() => initialResolvedSet(props));
  const [resolveError, setResolveError] = useState<string | null>(null);

  useEffect(() => {
    if (!props.traceAckPersistenceEnabled) {
      saveResolvedIds(resolved);
    }
  }, [resolved, props.traceAckPersistenceEnabled]);

  const markResolved = useCallback(
    async (id: string) => {
      setResolveError(null);
      setResolved((prev) => {
        const next = new Set(prev);
        next.add(id);
        return next;
      });

      if (props.traceAckPersistenceEnabled && id.startsWith("trace-")) {
        const r = await acknowledgeTraceAlertAction(id);
        if (!r.ok) {
          setResolved((prev) => {
            const next = new Set(prev);
            next.delete(id);
            return next;
          });
          setResolveError(r.error ?? "Could not persist resolve.");
        }
      }
    },
    [props.traceAckPersistenceEnabled],
  );

  const visible = useMemo(() => {
    return props.items.filter((a) => {
      const isResolved = resolved.has(a.id);
      if (filter === "resolved") return isResolved;
      if (isResolved) return false;
      if (filter === "critical") return a.severity === "critical";
      if (filter === "warning") return a.severity === "warning";
      if (filter === "info") return a.severity !== "critical" && a.severity !== "warning";
      return true;
    });
  }, [props.items, filter, resolved]);

  const filterBtnClass = (f: AlertFilter): string => {
    const active = filter === f;
    const pill = "min-w-[6.5rem] rounded-full px-3 py-1 text-center text-xs font-semibold transition";
    if (f === "critical")
      return active
        ? `${pill} bg-red-600 text-white ring-1 ring-red-700`
        : `${pill} bg-red-100 text-red-800 ring-1 ring-red-300 hover:bg-red-200 dark:bg-red-950/50 dark:text-red-200 dark:ring-red-800 dark:hover:bg-red-950/70`;
    if (f === "warning")
      return active
        ? `${pill} bg-yellow-400 text-yellow-950 ring-1 ring-yellow-500`
        : `${pill} bg-yellow-100 text-yellow-900 ring-1 ring-yellow-300 hover:bg-yellow-200 dark:bg-yellow-950/50 dark:text-yellow-200 dark:ring-yellow-700 dark:hover:bg-yellow-950/70`;
    if (f === "info")
      return active
        ? `${pill} bg-sky-600 text-white ring-1 ring-sky-700`
        : `${pill} bg-sky-100 text-sky-800 ring-1 ring-sky-300 hover:bg-sky-200 dark:bg-sky-950/50 dark:text-sky-200 dark:ring-sky-700 dark:hover:bg-sky-950/70`;
    if (f === "resolved")
      return active
        ? `${pill} bg-emerald-600 text-white ring-1 ring-emerald-700`
        : `${pill} bg-emerald-100 text-emerald-800 ring-1 ring-emerald-300 hover:bg-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-200 dark:ring-emerald-800 dark:hover:bg-emerald-950/70`;
    return active
      ? `${pill} bg-zinc-900 text-white ring-1 ring-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:ring-zinc-300`
      : `${pill} bg-zinc-100 text-zinc-700 ring-1 ring-zinc-300 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-200 dark:ring-zinc-600 dark:hover:bg-zinc-700`;
  };

  const filterBtn = (f: AlertFilter, label: string) => (
    <button key={f} type="button" onClick={() => setFilter(f)} className={filterBtnClass(f)}>
      {label}
    </button>
  );

  const persistenceNote = props.traceAckPersistenceEnabled
    ? "Resolve is saved for your workspace (signed-in operators with write access)."
    : "Resolve uses this browser only until the trace acknowledgments migration is applied or the table is reachable.";

  return (
    <div className="space-y-4">
      {resolveError ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50/90 px-3 py-2 text-sm text-amber-950 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100" role="alert">
          {resolveError}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {filterBtn("all", "All")}
        {filterBtn("critical", "Critical")}
        {filterBtn("warning", "Warning")}
        {filterBtn("info", "Info")}
        {filterBtn("resolved", "Resolved")}
      </div>

      <ul className="divide-y divide-zinc-200 overflow-hidden rounded-xl border border-zinc-200 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-950">
        {visible.length === 0 ? (
          <li className="px-4 py-12 text-center text-sm text-zinc-500">No alerts in this view.</li>
        ) : (
          visible.map((a) => {
            const isResolved = resolved.has(a.id);
            return (
              <li key={a.id}>
                <button
                  type="button"
                  onClick={() => setSelected(a)}
                  className={
                    "flex w-full items-start gap-3 px-4 py-4 text-left transition " +
                    rowShell(a.severity, isResolved) + " " +
                    rowHover(a.severity, isResolved)
                  }
                >
                  <span aria-hidden>
                    {isResolved ? (
                      <AlertCircle className={severityIconClass(a.severity, true)} />
                    ) : a.severity === "critical" ? (
                      <AlertTriangle className={severityIconClass(a.severity, false)} />
                    ) : a.severity === "warning" ? (
                      <AlertTriangle className={severityIconClass(a.severity, false)} />
                    ) : (
                      <Info className={severityIconClass(a.severity, false)} />
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium text-zinc-900 dark:text-zinc-100">{a.title}</span>
                      {isResolved ? (
                        <span className={WORK_ALERT_BADGE.statusResolved}>Resolved</span>
                      ) : null}
                    </div>
                    <p className="mt-1 line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400">{a.summary}</p>
                    <p className="mt-2 text-xs text-zinc-400">{formatRelativeTime(a.createdAt)}</p>
                  </div>
                </button>
              </li>
            );
          })
        )}
      </ul>

      <WorkInboxModal
        open={selected != null}
        onClose={() => setSelected(null)}
        title={selected?.title ?? ""}
        subtitle={
          selected
            ? `${severityLabel(selected.severity)} · ${resolved.has(selected.id) ? "Resolved" : "Open"}`
            : undefined
        }
        actions={
          selected
            ? [
                ...(resolved.has(selected.id)
                  ? []
                  : [
                      {
                        label: "Resolve",
                        variant: "primary" as const,
                        onClick: () => markResolved(selected.id),
                      },
                    ]),
                {
                  label: "View",
                  variant: "secondary" as const,
                  onClick: () => {
                    window.location.href = "/settings/traces";
                  },
                },
                {
                  label: "Go to fix",
                  variant: "secondary" as const,
                  onClick: () => {
                    window.location.href = goToFixHref(selected);
                  },
                },
              ]
            : undefined
        }
      >
        {selected ? (
          <div className="space-y-4">
            <p className="whitespace-pre-wrap text-zinc-700 dark:text-zinc-300">{selected.detail}</p>
            <p className="text-xs text-zinc-400">Received {formatRelativeTime(selected.createdAt)}</p>
            <p className="rounded-md border border-zinc-200 bg-zinc-50 p-2 text-[11px] text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400">
              <strong className="font-semibold text-zinc-800 dark:text-zinc-200">Note:</strong> {persistenceNote}
            </p>
          </div>
        ) : null}
      </WorkInboxModal>
    </div>
  );
}
