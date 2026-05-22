"use client";

import { Eye, FileEdit, FileText, Pencil, Upload } from "lucide-react";
import Link from "next/link";

import { publishBrainDraftFromInboxForm, rejectBrainDraftFromForm } from "@/app/(shell)/memory/brain-actions";
import {
  inboxBodyPreviewLabel,
  inboxReviewSubtitle,
  inboxReviewTitle,
  inboxSubmittedByLine,
} from "@/components/linkbrain/linkbrain-doc-display";
import type { LinkbrainPageData } from "@/lib/linkbrain-data";
import { BUTTON } from "@/lib/ui-standards";

import { summarizeBrainInboxTextDiff, type BrainInboxRow } from "@linktrend/linklogic-sdk";

function inboxIcon(type: string) {
  if (type === "upload") return Upload;
  if (type === "edit_proposal") return FileEdit;
  return FileText;
}

function inboxContextLine(d: BrainInboxRow, data: LinkbrainPageData): string {
  if (d.scope === "company") return "Company-wide memory";
  if (d.scope === "mission" && d.mission_id) {
    const hit = data.missionRows.find((r) => String(r.mission.id) === String(d.mission_id));
    return hit ? `Project: ${hit.mission.title}` : "Project memory";
  }
  if (d.scope === "agent" && d.agent_id) {
    const hit = data.agents.find((a) => a.id === d.agent_id);
    return hit ? `LiNKbot: ${hit.display_name}` : "LiNKbot memory";
  }
  return `Scope: ${d.scope}`;
}

export function LinkbrainInboxRow(props: { draft: BrainInboxRow; data: LinkbrainPageData }) {
  const d = props.draft;
  const Icon = inboxIcon(d.inbox_item_type);

  return (
    <li
      className={
        "rounded-xl border border-zinc-200 bg-white shadow-sm transition hover:bg-amber-50/40 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-amber-950/15 " +
        "border-l-4 border-l-amber-500 dark:border-l-amber-400"
      }
    >
      <div className="flex flex-wrap items-start justify-between gap-2 border-b border-zinc-100 px-4 py-3 dark:border-zinc-800">
        <div className="flex min-w-0 items-start gap-2">
          <Icon className="mt-0.5 h-4 w-4 shrink-0 text-amber-700 dark:text-amber-300" aria-hidden />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{inboxReviewTitle(d)}</p>
            <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">{inboxReviewSubtitle(d)}</p>
          </div>
        </div>
      </div>
      {d.inbox_item_type === "edit_proposal" && d.predecessor_body != null ? (
        <p className="px-4 pt-3 text-xs text-zinc-500 dark:text-zinc-400">
          {summarizeBrainInboxTextDiff(d.predecessor_body, d.body).summary}
        </p>
      ) : null}
      <p className="px-4 pt-2 text-xs text-zinc-600 dark:text-zinc-300">
        {inboxSubmittedByLine(d)} · {inboxContextLine(d, props.data)}
      </p>
      <p className="px-4 pt-2 text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
        {inboxBodyPreviewLabel(d)}
      </p>
      <p className="line-clamp-6 px-4 pt-1 text-sm leading-relaxed text-zinc-800 dark:text-zinc-200">{d.body}</p>
      <div className="flex flex-wrap items-center gap-3 px-4 pb-3 pt-2 text-xs text-zinc-500">
        <span>
          Submitted{" "}
          <time dateTime={d.created_at}>{d.created_at.replace("T", " ").slice(0, 19)}</time>
        </span>
        <span className="capitalize">Sensitivity: {d.sensitivity}</span>
      </div>
      <div className="flex flex-wrap items-center gap-3 border-t border-zinc-100 px-4 py-3 dark:border-zinc-800">
        <Link href={`/memory/drafts/${d.id}`} className={BUTTON.editRow}>
          Edit
        </Link>
        <form action={publishBrainDraftFromInboxForm} className="inline">
          <input type="hidden" name="versionId" value={d.id} />
          <button type="submit" className={BUTTON.approveOutlineRow}>
            Approve
          </button>
        </form>
        <form action={rejectBrainDraftFromForm} className="inline">
          <input type="hidden" name="versionId" value={d.id} />
          <button type="submit" className={BUTTON.rejectOutlineRow}>
            Reject
          </button>
        </form>
      </div>
    </li>
  );
}

/** Icon action for memory document rows (View / Edit). */
export function MemoryDocIconAction(props: {
  href: string;
  label: string;
  icon: "view" | "edit";
  title?: string;
}) {
  const Icon = props.icon === "view" ? Eye : Pencil;
  const tone =
    props.icon === "view"
      ? "border-sky-300 bg-sky-50 text-sky-900 hover:bg-sky-100 dark:border-sky-800 dark:bg-sky-950/40 dark:text-sky-100 dark:hover:bg-sky-900/60"
      : "border-violet-300 bg-violet-50 text-violet-900 hover:bg-violet-100 dark:border-violet-800 dark:bg-violet-950/40 dark:text-violet-100 dark:hover:bg-violet-900/60";

  return (
    <Link
      href={props.href}
      title={props.title ?? props.label}
      aria-label={props.label}
      className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition ${tone}`}
    >
      <Icon className="h-4 w-4" aria-hidden />
    </Link>
  );
}
