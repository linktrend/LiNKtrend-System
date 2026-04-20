"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { acknowledgeTraceAlertAction } from "@/app/(shell)/work/alert-acknowledgments-actions";
import { WorkInboxModal } from "@/components/work-inbox-modal";
import { WORK_ALERT_BADGE } from "@/lib/ui-theme";
import type { WorkAlert } from "@/lib/work-alerts";

const RESOLVED_STORAGE_KEY = "linkaios_work_alerts_resolved_ids_v1";

type AlertFilter = "all" | "critical" | "warning" | "resolved";

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
    case "critical":
      return "Critical";
    case "warning":
      return "Warning";
    default:
      return "Info";
  }
}

function severityBadgeClass(sev: WorkAlert["severity"]): string {
  switch (sev) {
    case "critical":
      return WORK_ALERT_BADGE.severityCritical;
    case "warning":
      return WORK_ALERT_BADGE.severityWarning;
    default:
      return WORK_ALERT_BADGE.severityInfo;
  }
}

function rowShell(sev: WorkAlert["severity"]): string {
  if (sev === "critical") return "border-l-4 border-l-red-600 bg-red-50/40 dark:border-l-red-500 dark:bg-red-950/25";
  if (sev === "warning") return "border-l-4 border-l-amber-500 bg-amber-50/35 dark:border-l-amber-400 dark:bg-amber-950/20";
  return "border-l-4 border-l-sky-400 bg-sky-50/25 dark:border-l-sky-500 dark:bg-sky-950/15";
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
      return true;
    });
  }, [props.items, filter, resolved]);

  const filterBtn = (f: AlertFilter, label: string) => (
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
                    "flex w-full items-start gap-3 px-4 py-4 text-left transition hover:bg-zinc-50 dark:hover:bg-zinc-900/70 " +
                    rowShell(a.severity)
                  }
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium text-zinc-900 dark:text-zinc-100">{a.title}</span>
                      <span className={severityBadgeClass(a.severity)}>{severityLabel(a.severity)}</span>
                      <span className={isResolved ? WORK_ALERT_BADGE.statusResolved : WORK_ALERT_BADGE.statusOpen}>
                        {isResolved ? "Resolved" : "Open"}
                      </span>
                    </div>
                    <p className="mt-1 line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400">{a.summary}</p>
                    <p className="mt-2 text-xs text-zinc-400">{new Date(a.createdAt).toLocaleString()}</p>
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
            <p className="text-xs text-zinc-400">Received {new Date(selected.createdAt).toLocaleString()}</p>
            <p className="rounded-md border border-zinc-200 bg-zinc-50 p-2 text-[11px] text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400">
              <strong className="font-semibold text-zinc-800 dark:text-zinc-200">Note:</strong> {persistenceNote}
            </p>
          </div>
        ) : null}
      </WorkInboxModal>
    </div>
  );
}
