"use client";

import { useEffect, useState } from "react";

import { Headphones } from "lucide-react";

import Link from "next/link";

import { probeSupportTicketsTableAction } from "@/lib/support-tickets-actions";
import { DomainStatusPill } from "@/components/ui/status-pill";
import { ShadowModeBadge } from "@/components/stub-badge";
import { useAppSurface } from "@/components/app-surface-provider";
import { buildChatwootConversationUrl } from "@/lib/chatwoot-links";
import {
  EVENT_SUPPORT_TICKETS_CHANGED,
  readSupportTicketsForLicensee,
  refreshSupportTicketsFromServer,
  type SupportTicket,
} from "@/lib/support-tickets";
import { SUPPORT_TICKET_PILL_LABELS } from "@/lib/status-colors";
import { BUTTON } from "@/lib/ui-standards";
import { openExternalPopup } from "@/lib/zulip-links";

function startWorkLabel(status: SupportTicket["status"]): string {
  return status === "open" ? "Start Work" : "Open in Chatwoot";
}

export function LicensorLicenseeSupportPanel(props: {
  licenseeId: string;
  chatwootPublicUrl: string | null;
  chatwootAccountId: string | null;
}) {
  const { href: appHref } = useAppSurface();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [tableReady, setTableReady] = useState(false);
  const [popupError, setPopupError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const probe = await probeSupportTicketsTableAction();
      if (cancelled) return;
      setTableReady(probe.tableReady);
      if (probe.tableReady) {
        const rows = await refreshSupportTicketsFromServer({ licenseeId: props.licenseeId });
        if (!cancelled) setTickets(rows);
        return;
      }
      if (!cancelled) setTickets(readSupportTicketsForLicensee(props.licenseeId));
    }

    void load();
    const onChanged = () => void load();
    window.addEventListener(EVENT_SUPPORT_TICKETS_CHANGED, onChanged);
    return () => {
      cancelled = true;
      window.removeEventListener(EVENT_SUPPORT_TICKETS_CHANGED, onChanged);
    };
  }, [props.licenseeId]);

  function openChatwoot(ticket: SupportTicket) {
    setPopupError(null);
    if (!ticket.externalRef) {
      setPopupError("This ticket is not linked to a Chatwoot conversation yet.");
      return;
    }
    if (!props.chatwootPublicUrl || !props.chatwootAccountId) {
      setPopupError("Chatwoot operator URL is not configured. Set CHATWOOT_PUBLIC_URL and CHATWOOT_ACCOUNT_ID.");
      return;
    }
    const href = buildChatwootConversationUrl(
      props.chatwootPublicUrl,
      props.chatwootAccountId,
      ticket.externalRef,
    );
    if (!href) {
      setPopupError("Could not build Chatwoot conversation link.");
      return;
    }
    openExternalPopup(href);
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Headphones className="h-5 w-5 shrink-0 text-zinc-500" aria-hidden />
            <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">Support Queue</h2>
          </div>
          <p className="mt-2 max-w-3xl text-xs text-zinc-500 dark:text-zinc-400">
            Dashboard mirror for this licensee — open tickets in Chatwoot to work them. Unified queue:{" "}
            <Link href={appHref("/customer-service")} className="font-medium text-sky-700 hover:underline dark:text-sky-300">
              Customer Service
            </Link>
            .
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {!tableReady ? <ShadowModeBadge label="Shadow — migration 038 pending" /> : null}
          <Link href={appHref("/customer-service")} className="text-xs font-medium text-sky-700 hover:underline dark:text-sky-300">
            All licensees queue
          </Link>
        </div>
      </div>

      {popupError ? (
        <p className="text-sm text-red-700 dark:text-red-300" role="alert">
          {popupError}
        </p>
      ) : null}

      {tickets.length === 0 ? (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">No support tickets for this licensee.</p>
      ) : (
        <ul className="divide-y divide-zinc-200 rounded-xl border border-zinc-200 bg-white shadow-sm dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-950">
          {tickets.map((t) => {
            const canOpenChatwoot = Boolean(t.externalRef && props.chatwootPublicUrl && props.chatwootAccountId);
            return (
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
                  <button
                    type="button"
                    className={BUTTON.secondaryCompact}
                    disabled={!canOpenChatwoot}
                    title={
                      canOpenChatwoot
                        ? "Open this conversation in Chatwoot"
                        : "Chatwoot conversation link unavailable for this ticket"
                    }
                    onClick={() => openChatwoot(t)}
                  >
                    {startWorkLabel(t.status)}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
