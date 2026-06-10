"use client";

import { useEffect, useId, useRef, useState, useTransition } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { X } from "lucide-react";

import { useAppRole } from "@/components/role-preview-provider";
import { resolveLicenseeIdForCompany } from "@/lib/licensor-licensee-profile";
import type { PageHelpContent } from "@/lib/page-help-copy";
import {
  createSupportTicket,
  SUPPORT_BACKEND_LABEL,
  SUPPORT_BACKEND_REPO,
} from "@/lib/support-tickets";
import { BUTTON, FIELD, FORM } from "@/lib/ui-standards";

/** First-line help: page guidance + AI attempt, then escalate to Chatwoot (link-chatwoot) queue. */
export function SupportAssistantPanel(props: {
  open: boolean;
  onClose: () => void;
  content: PageHelpContent;
  companyId: string | null;
  brandId: string | null;
}) {
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname() ?? "/";
  const searchParams = useSearchParams();
  const { role } = useAppRole();
  const [question, setQuestion] = useState("");
  const [aiReply, setAiReply] = useState<string | null>(null);
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketDetail, setTicketDetail] = useState("");
  const [showEscalate, setShowEscalate] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (!props.open) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") props.onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [props.open, props.onClose]);

  useEffect(() => {
    if (!props.open) {
      setQuestion("");
      setAiReply(null);
      setShowEscalate(false);
      setTicketSubject("");
      setTicketDetail("");
      setErr(null);
    }
  }, [props.open]);

  if (!props.open) return null;

  const pagePath = searchParams?.toString() ? `${pathname}?${searchParams}` : pathname;
  const licenseeId = resolveLicenseeIdForCompany(props.companyId ?? "xyz-marketing");

  function askAssistant() {
    setErr(null);
    const q = question.trim();
    if (!q) {
      setErr("Describe what you need help with.");
      return;
    }
    const hint = props.content.paragraphs[0] ?? props.content.title;
    setAiReply(
      `Based on this page (${props.content.title}): ${hint}\n\nFor "${q}", check the steps above first. If billing, access, or integration behaviour still looks wrong, open a support ticket — our team picks it up in ${SUPPORT_BACKEND_LABEL} (${SUPPORT_BACKEND_REPO}).`,
    );
    setShowEscalate(true);
    if (!ticketSubject) setTicketSubject(q.slice(0, 120));
    if (!ticketDetail) setTicketDetail(q);
  }

  function submitTicket() {
    setErr(null);
    const subject = ticketSubject.trim();
    const detail = ticketDetail.trim();
    if (!subject || !detail) {
      setErr("Subject and details are required to open a ticket.");
      return;
    }
    startTransition(async () => {
      try {
        await createSupportTicket({
          licenseeId,
          companyId: props.companyId,
          brandId: props.brandId,
          subject,
          description: detail,
          pagePath,
          requestedBy: `Licensee ${role}`,
          source: "page_help",
          aiAttemptSummary: aiReply,
        });
        window.dispatchEvent(
          new CustomEvent("linkaios-toast", {
            detail: `Support ticket sent. Track it in Settings → Support or Work → Alerts.`,
          }),
        );
        props.onClose();
      } catch (e) {
        setErr(e instanceof Error ? e.message : "Could not open support ticket.");
      }
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="presentation">
      <button type="button" className="absolute inset-0 bg-zinc-900/40 dark:bg-black/55" aria-label="Close help" onClick={props.onClose} />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative flex h-full w-full max-w-md flex-col border-l border-zinc-200 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-950"
      >
        <header className="flex items-start justify-between gap-3 border-b border-zinc-200 px-5 py-4 dark:border-zinc-800">
          <div className="min-w-0">
            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Help & support</p>
            <h2 id={titleId} className="mt-1 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              {props.content.title}
            </h2>
          </div>
          <button ref={closeRef} type="button" onClick={props.onClose} className={BUTTON.secondaryCompact} aria-label="Close">
            <X className="h-4 w-4" aria-hidden />
          </button>
        </header>

        <div className="flex-1 space-y-5 overflow-y-auto px-5 py-4">
          <div className="space-y-3 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
            {props.content.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>

          <label className={FORM.fieldStack}>
            <span className={`${FIELD.label} text-xs text-zinc-600 dark:text-zinc-400`}>Ask the assistant</span>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              rows={3}
              placeholder="What are you trying to do on this page?"
              className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
            />
          </label>
          <button type="button" className={BUTTON.primaryCompact} onClick={askAssistant} disabled={pending}>
            Ask assistant
          </button>

          {aiReply ? (
            <div className="rounded-lg border border-sky-200 bg-sky-50/80 p-3 text-sm text-sky-950 dark:border-sky-900 dark:bg-sky-950/30 dark:text-sky-100">
              <p className="whitespace-pre-wrap">{aiReply}</p>
            </div>
          ) : null}

          {showEscalate ? (
            <div className="space-y-3 rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Still need help?</p>
              <p className="text-xs text-zinc-600 dark:text-zinc-400">
                Opens a ticket in {SUPPORT_BACKEND_LABEL}. Licensor operators see it in Work → Alerts.
              </p>
              <label className={FORM.fieldStack}>
                <span className={`${FIELD.label} text-xs`}>Subject</span>
                <input
                  value={ticketSubject}
                  onChange={(e) => setTicketSubject(e.target.value)}
                  className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
                />
              </label>
              <label className={FORM.fieldStack}>
                <span className={`${FIELD.label} text-xs`}>Details</span>
                <textarea
                  value={ticketDetail}
                  onChange={(e) => setTicketDetail(e.target.value)}
                  rows={4}
                  className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
                />
              </label>
              <button type="button" className={BUTTON.primaryRow} onClick={submitTicket} disabled={pending}>
                Open support ticket
              </button>
            </div>
          ) : null}

          {err ? <p className="text-sm text-red-700 dark:text-red-300">{err}</p> : null}
        </div>

        <footer className="border-t border-zinc-200 px-5 py-3 dark:border-zinc-800">
          <button type="button" onClick={props.onClose} className={BUTTON.secondaryRow}>
            Done
          </button>
        </footer>
      </aside>
    </div>
  );
}
