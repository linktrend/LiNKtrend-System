"use client";

import { FileEdit, FileText, Upload } from "lucide-react";
import Link from "next/link";

import { publishBrainDraftFromInboxForm, rejectBrainDraftFromForm } from "@/app/(shell)/memory/brain-actions";
import { inboxItemTypeLabel } from "@/components/linkbrain/linkbrain-labels";
import { LinkbrainStatusPill } from "@/components/linkbrain/linkbrain-status-pill";
import type { LinkbrainPageData } from "@/lib/linkbrain-data";
import { BUTTON } from "@/lib/ui-standards";

import { summarizeBrainInboxTextDiff, type BrainInboxRow } from "@linktrend/linklogic-sdk";

function inboxIcon(type: string) {
  if (type === "upload") return Upload;
  if (type === "edit_proposal") return FileEdit;
  return FileText;
}

function inboxSourceLine(d: BrainInboxRow, data: LinkbrainPageData): string {
  if (d.scope === "company") return "Source: company-wide knowledge";
  if (d.scope === "mission" && d.mission_id) {
    const hit = data.missionRows.find((r) => String(r.mission.id) === String(d.mission_id));
    return hit ? `Source: project “${hit.mission.title}”` : `Source: project`;
  }
  if (d.scope === "agent" && d.agent_id) {
    const hit = data.agents.find((a) => a.id === d.agent_id);
    return hit ? `Source: LiNKbot “${hit.display_name}”` : `Source: LiNKbot`;
  }
  return `Source: ${d.scope}`;
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
            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{d.logical_path || "Draft"}</p>
            <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
              {inboxItemTypeLabel(d.inbox_item_type)} · {inboxItemTypeLabel(d.file_kind)}
            </p>
          </div>
        </div>
        <LinkbrainStatusPill label="Review" tone="pending" />
      </div>
      {d.inbox_item_type === "edit_proposal" && d.predecessor_body != null ? (
        <p className="px-4 pt-3 text-xs text-zinc-500 dark:text-zinc-400">
          {summarizeBrainInboxTextDiff(d.predecessor_body, d.body).summary}
        </p>
      ) : null}
      <p className="px-4 pt-2 text-xs text-zinc-600 dark:text-zinc-300">{inboxSourceLine(d, props.data)}</p>
      <p className="line-clamp-6 px-4 pt-2 text-sm leading-relaxed text-zinc-800 dark:text-zinc-200">{d.body}</p>
      <div className="flex flex-wrap items-center gap-3 px-4 pb-3 pt-2 text-xs text-zinc-500">
        <span>{d.created_at.replace("T", " ").slice(0, 19)}</span>
        <span className="capitalize">{d.sensitivity}</span>
      </div>
      <div className="flex flex-wrap items-center gap-3 border-t border-zinc-100 px-4 py-3 dark:border-zinc-800">
        <Link href={`/memory/drafts/${d.id}`} className={BUTTON.editRow}>
          Edit
        </Link>
        <form action={publishBrainDraftFromInboxForm} className="inline">
          <input type="hidden" name="versionId" value={d.id} />
          <button type="submit" className={BUTTON.approveRow}>
            Approve
          </button>
        </form>
        <form action={rejectBrainDraftFromForm} className="inline">
          <input type="hidden" name="versionId" value={d.id} />
          <button type="submit" className={BUTTON.rejectRow}>
            Reject
          </button>
        </form>
      </div>
    </li>
  );
}
