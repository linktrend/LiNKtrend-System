"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import { Headphones } from "lucide-react";

import { ShadowModeBadge } from "@/components/stub-badge";
import { DomainStatusPill } from "@/components/ui/status-pill";
import { WorkEmptyState } from "@/app/(shell)/work/work-empty-state";
import { useAppSurface } from "@/components/app-surface-provider";
import { mergeSupportTicketSources, type SupportTicketsQueueMode } from "@/lib/support-tickets-data";
import { resolveLicenseeRegistry } from "@/lib/licensee-registry";
import { SUPPORT_TICKET_PILL_LABELS } from "@/lib/status-colors";
import {
  EVENT_SUPPORT_TICKETS_CHANGED,
  hydrateSupportTicketsState,
  readSupportTickets,
  SUPPORT_BACKEND_LABEL,
  SUPPORT_BACKEND_REPO,
  SUPPORT_CAPABILITY_SCOPE,
  updateSupportTicketStatus,
  type SupportTicket,
  type SupportTicketStatus,
} from "@/lib/support-tickets";
import { BUTTON } from "@/lib/ui-standards";

type TicketFilter = "all" | "open" | "in_progress" | "resolved";

function filterTickets(rows: SupportTicket[], filter: TicketFilter): SupportTicket[] {
  if (filter === "all") return rows;
  return rows.filter((t) => t.status === filter);
}

function filterBtnClass(active: boolean): string {
  const pill = "rounded-full px-3 py-1 text-xs font-semibold transition";
  return active
    ? `${pill} bg-zinc-900 text-white ring-1 ring-zinc-700 dark:bg-zinc-100 dark:text-zinc-900`
    : `${pill} bg-zinc-100 text-zinc-700 ring-1 ring-zinc-300 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-200 dark:ring-zinc-600`;
}

export function CustomerServiceQueue(props: {
  initialTickets: SupportTicket[];
  queueMode: SupportTicketsQueueMode;
  tableReady: boolean;
  loadError: string | null;
  chatwootSyncReady: boolean;
  chatwootSyncError: string | null;
}) {
  const router = useRouter();
  const { href: appHref } = useAppSurface();
  const [filter, setFilter] = useState<TicketFilter>("all");
  const [tickets, setTickets] = useState<SupportTicket[]>(props.initialTickets);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    hydrateSupportTicketsState({ tableReady: props.tableReady, tickets: props.initialTickets });
    setTickets(props.initialTickets);
  }, [props.initialTickets, props.tableReady]);

  useEffect(() => {
    if (props.tableReady) return undefined;
    const sync = () => {
      const local = readSupportTickets();
      setTickets(mergeSupportTicketSources(props.initialTickets, local));
    };
    sync();
    window.addEventListener(EVENT_SUPPORT_TICKETS_CHANGED, sync);
    return () => window.removeEventListener(EVENT_SUPPORT_TICKETS_CHANGED, sync);
  }, [props.initialTickets, props.tableReady]);

  const visible = useMemo(() => filterTickets(tickets, filter), [tickets, filter]);
  const openCount = tickets.filter((t) => t.status !== "resolved").length;

  function setStatus(id: string, status: SupportTicketStatus) {
    setStatusError(null);
    startTransition(async () => {
      try {
        const updated = await updateSupportTicketStatus(id, status);
        if (updated) {
          setTickets((prev) => prev.map((t) => (t.id === id ? updated : t)));
        }
        if (props.tableReady) {
          router.refresh();
        }
      } catch (e) {
        setStatusError(e instanceof Error ? e.message : "Could not update ticket status.");
      }
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Headphones className="h-5 w-5 shrink-0 text-zinc-500" aria-hidden />
            <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">Unified Ticket Queue</h2>
            {!props.tableReady ? (
              <ShadowModeBadge label="Shadow — migration 038 pending" />
            ) : props.chatwootSyncReady ? (
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-900 ring-1 ring-emerald-300 dark:bg-emerald-950/50 dark:text-emerald-100 dark:ring-emerald-800">
                Live — Chatwoot sync
              </span>
            ) : (
              <span className="rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-sky-900 ring-1 ring-sky-300 dark:bg-sky-950/50 dark:text-sky-100 dark:ring-sky-800">
                Live store
              </span>
            )}
          </div>
          <p className="mt-1 max-w-3xl text-sm text-zinc-600 dark:text-zinc-400">
            Support requests across all licensees — assign, progress, and resolve tickets. Governed by{" "}
            <code className="text-xs">{SUPPORT_CAPABILITY_SCOPE}</code> syncing to {SUPPORT_BACKEND_LABEL} (
            <code className="text-xs">{SUPPORT_BACKEND_REPO}</code>) when the connector is live.
          </p>
          <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
            {openCount === 0
              ? "No open tickets in queue."
              : `${openCount} open ticket${openCount === 1 ? "" : "s"} need attention.`}{" "}
            Tickets from Work → Alerts link here for licensor operators.
          </p>
        </div>
      </div>

      {props.loadError ? (
        <p
          role="alert"
          className="rounded-lg border border-amber-200 bg-amber-50/90 px-3 py-2 text-sm text-amber-950 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100"
        >
          Could not load tickets from the database: {props.loadError}.
        </p>
      ) : null}

      {statusError ? (
        <p
          role="alert"
          className="rounded-lg border border-amber-200 bg-amber-50/90 px-3 py-2 text-sm text-amber-950 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100"
        >
          {statusError}
        </p>
      ) : null}

      {!props.tableReady ? (
        <p className="rounded-lg border border-sky-200 bg-sky-50/80 px-3 py-2 text-sm text-sky-950 dark:border-sky-900 dark:bg-sky-950/30 dark:text-sky-100">
          <strong className="font-semibold">Shadow mode:</strong> apply{" "}
          <code className="text-xs">services/migrations/038_support_tickets.sql</code> to persist tickets in AdminDB.
          Until then, only tickets submitted from licensee surfaces appear in this browser session.
        </p>
      ) : null}

      {props.tableReady && props.chatwootSyncError ? (
        <p
          role="alert"
          className="rounded-lg border border-amber-200 bg-amber-50/90 px-3 py-2 text-sm text-amber-950 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100"
        >
          Chatwoot sync is configured but unavailable: {props.chatwootSyncError}. Showing AdminDB tickets only.
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {(["all", "open", "in_progress", "resolved"] as const).map((f) => (
          <button key={f} type="button" onClick={() => setFilter(f)} className={filterBtnClass(filter === f)}>
            {f === "all" ? "All" : f === "in_progress" ? "In Progress" : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <WorkEmptyState
          icon={Headphones}
          title={filter === "all" ? "No support tickets" : `No ${filter.replace("_", " ")} tickets`}
          description={
            filter === "all"
              ? "When licensees open tickets via Help or Settings → Support they appear here for your team."
              : "Try another filter or wait for new requests from licensees."
          }
          actions={[
            { kind: "link", label: "Open Work alerts", href: appHref("/work/alerts") },
            { kind: "link", label: "Browse licensees", href: appHref("/licensees"), variant: "secondary" },
          ]}
        />
      ) : (
        <ul className="divide-y divide-zinc-200 rounded-xl border border-zinc-200 bg-white shadow-sm dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-950">
          {visible.map((t) => {
            const licenseeName = resolveLicenseeRegistry(t.licenseeId)?.name ?? t.licenseeId;
            return (
              <li key={t.id} className="space-y-2 px-4 py-3 first:rounded-t-xl last:rounded-b-xl">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{t.subject}</p>
                    <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                      <Link
                        href={appHref(`/licensees?licensee=${encodeURIComponent(t.licenseeId)}`)}
                        className="font-medium text-sky-700 hover:underline dark:text-sky-300"
                      >
                        {licenseeName}
                      </Link>
                      {" · "}
                      {t.requestedBy} · {t.pagePath} · {new Date(t.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <DomainStatusPill domain="support" status={t.status} equalWidthLabels={SUPPORT_TICKET_PILL_LABELS} />
                </div>
                <p className="text-sm text-zinc-700 dark:text-zinc-300">{t.description}</p>
                {t.aiAttemptSummary ? (
                  <p className="rounded-md bg-zinc-50 px-3 py-2 text-xs text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400">
                    AI attempt: {t.aiAttemptSummary}
                  </p>
                ) : null}
                <div className="flex flex-wrap gap-2">
                  {t.status === "open" ? (
                    <button
                      type="button"
                      className={BUTTON.secondaryCompact}
                      disabled={pending}
                      onClick={() => setStatus(t.id, "in_progress")}
                    >
                      Start Work
                    </button>
                  ) : null}
                  {t.status !== "resolved" ? (
                    <button
                      type="button"
                      className={BUTTON.primaryCompact}
                      disabled={pending}
                      onClick={() => setStatus(t.id, "resolved")}
                    >
                      Resolve
                    </button>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
