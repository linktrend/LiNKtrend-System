"use client";

import { useEffect, useState } from "react";

import { Headphones } from "lucide-react";

import Link from "next/link";

import { DomainStatusPill } from "@/components/ui/status-pill";
import { ShadowModeBadge } from "@/components/stub-badge";
import { useAppSurface } from "@/components/app-surface-provider";
import {
  EVENT_SUPPORT_TICKETS_CHANGED,
  readSupportTicketsForLicensee,
  SUPPORT_BACKEND_REPO,
  SUPPORT_BACKEND_LABEL,
  SUPPORT_CAPABILITY_SCOPE,
  updateSupportTicketStatus,
  type SupportTicket,
} from "@/lib/support-tickets";
import { SUPPORT_TICKET_PILL_LABELS } from "@/lib/status-colors";
import { BUTTON } from "@/lib/ui-standards";

export function LicensorLicenseeSupportPanel(props: { licenseeId: string }) {
  const { href: appHref } = useAppSurface();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);

  useEffect(() => {
    const sync = () => setTickets(readSupportTicketsForLicensee(props.licenseeId));
    sync();
    window.addEventListener(EVENT_SUPPORT_TICKETS_CHANGED, sync);
    return () => window.removeEventListener(EVENT_SUPPORT_TICKETS_CHANGED, sync);
  }, [props.licenseeId]);

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Headphones className="h-5 w-5 shrink-0 text-zinc-500" aria-hidden />
            <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">Support Queue</h2>
          </div>
          <p className="mt-1 max-w-3xl text-sm text-zinc-600 dark:text-zinc-400">
            Helpdesk operations for this licensee — assign, progress, and resolve tickets. Syncs to{" "}
            {SUPPORT_BACKEND_LABEL} (<code className="text-xs">{SUPPORT_BACKEND_REPO}</code>) via{" "}
            <code className="text-xs">{SUPPORT_CAPABILITY_SCOPE}</code>. New tickets surface in{" "}
            <Link href={appHref("/customer-service")} className="font-medium text-sky-700 hover:underline dark:text-sky-300">
              Customer Service
            </Link>{" "}
            and <strong className="font-medium text-zinc-800 dark:text-zinc-200">Work → Alerts</strong>.
          </p>
          <p className="mt-2 max-w-3xl text-xs text-zinc-500 dark:text-zinc-400">
            The status badge is the ticket&apos;s current state. <strong className="font-medium">Start work</strong>{" "}
            means someone is handling it; <strong className="font-medium">Resolve</strong> closes it when the customer is
            sorted.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <ShadowModeBadge label="Shadow — Chatwoot pending" />
          <Link href={appHref("/customer-service")} className="text-xs font-medium text-sky-700 hover:underline dark:text-sky-300">
            All licensees queue
          </Link>
        </div>
      </div>

      {tickets.length === 0 ? (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">No support tickets for this licensee.</p>
      ) : (
        <ul className="divide-y divide-zinc-200 rounded-xl border border-zinc-200 bg-white shadow-sm dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-950">
          {tickets.map((t) => (
            <li key={t.id} className="space-y-2 px-4 py-3 first:rounded-t-xl last:rounded-b-xl">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{t.subject}</p>
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    {t.requestedBy} · {t.pagePath} · {new Date(t.createdAt).toLocaleString()}
                  </p>
                </div>
                <DomainStatusPill
                  domain="support"
                  status={t.status}
                  equalWidthLabels={SUPPORT_TICKET_PILL_LABELS}
                />
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
                    onClick={() => updateSupportTicketStatus(t.id, "in_progress")}
                  >
                    Start work
                  </button>
                ) : null}
                {t.status !== "resolved" ? (
                  <button
                    type="button"
                    className={BUTTON.primaryCompact}
                    onClick={() => updateSupportTicketStatus(t.id, "resolved")}
                  >
                    Resolve
                  </button>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
