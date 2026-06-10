"use client";

import { useEffect, useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";

import { DomainStatusPill } from "@/components/ui/status-pill";
import { SUPPORT_TICKET_PILL_LABELS } from "@/lib/status-colors";
import {
  createSupportTicket,
  EVENT_SUPPORT_TICKETS_CHANGED,
  hydrateSupportTicketsState,
  readSupportTicketsForLicensee,
  SUPPORT_BACKEND_LABEL,
  SUPPORT_BACKEND_REPO,
  type SupportTicket,
} from "@/lib/support-tickets";
import { useAppRole } from "@/components/role-preview-provider";
import { BUTTON, FIELD, FORM } from "@/lib/ui-standards";

export function LicenseeSupportPanel(props: {
  licenseeId: string;
  initialTickets: SupportTicket[];
  tableReady: boolean;
}) {
  const searchParams = useSearchParams();
  const companyId = searchParams.get("companyId");
  const brandId = searchParams.get("brandId");
  const { role } = useAppRole();
  const [tickets, setTickets] = useState<SupportTicket[]>(props.initialTickets);
  const [subject, setSubject] = useState("");
  const [detail, setDetail] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    hydrateSupportTicketsState({ tableReady: props.tableReady, tickets: props.initialTickets });
    setTickets(props.initialTickets);
  }, [props.initialTickets, props.tableReady]);

  useEffect(() => {
    const sync = () => setTickets(readSupportTicketsForLicensee(props.licenseeId));
    sync();
    window.addEventListener(EVENT_SUPPORT_TICKETS_CHANGED, sync);
    return () => window.removeEventListener(EVENT_SUPPORT_TICKETS_CHANGED, sync);
  }, [props.licenseeId]);

  function submit() {
    setErr(null);
    if (!subject.trim() || !detail.trim()) {
      setErr("Subject and details are required.");
      return;
    }
    startTransition(async () => {
      try {
        await createSupportTicket({
          licenseeId: props.licenseeId,
          companyId,
          brandId,
          subject,
          description: detail,
          pagePath: "/settings/support",
          requestedBy: `Licensee ${role}`,
          source: "settings",
        });
        setSubject("");
        setDetail("");
        setTickets(readSupportTicketsForLicensee(props.licenseeId));
        window.dispatchEvent(
          new CustomEvent("linkaios-toast", {
            detail: "Ticket opened. Our team will respond via Chatwoot.",
          }),
        );
      } catch (e) {
        setErr(e instanceof Error ? e.message : "Could not open ticket.");
      }
    });
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        First-line help is the <strong className="font-medium text-zinc-800 dark:text-zinc-200">sparkle button</strong>{" "}
        on any page — ask the assistant, then escalate here. Tickets sync to {SUPPORT_BACKEND_LABEL} (
        <code className="text-xs">{SUPPORT_BACKEND_REPO}</code>) when the connector is live.
      </p>

      <section className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">Open a ticket</h2>
        <label className={FORM.fieldStack}>
          <span className={`${FIELD.label} text-xs`}>Subject</span>
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          />
        </label>
        <label className={FORM.fieldStack}>
          <span className={`${FIELD.label} text-xs`}>What do you need?</span>
          <textarea
            value={detail}
            onChange={(e) => setDetail(e.target.value)}
            rows={5}
            className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          />
        </label>
        {err ? <p className="text-sm text-red-700 dark:text-red-300">{err}</p> : null}
        <button type="button" className={BUTTON.primaryRow} onClick={submit} disabled={pending}>
          Submit ticket
        </button>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">Your tickets</h2>
        {tickets.length === 0 ? (
          <p className="text-sm text-zinc-600 dark:text-zinc-400">No support tickets yet.</p>
        ) : (
          <ul className="divide-y divide-zinc-200 rounded-xl border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
            {tickets.map((t) => (
              <li key={t.id} className="space-y-1 px-4 py-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{t.subject}</p>
                  <DomainStatusPill
                    domain="support"
                    status={t.status}
                    equalWidthLabels={SUPPORT_TICKET_PILL_LABELS}
                  />
                </div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">{t.description}</p>
                <p className="text-xs text-zinc-500">{new Date(t.createdAt).toLocaleString()}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
