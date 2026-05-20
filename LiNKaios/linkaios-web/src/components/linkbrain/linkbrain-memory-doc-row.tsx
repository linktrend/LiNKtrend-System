"use client";

import { BookOpen, FileText } from "lucide-react";
import Link from "next/link";

import { brainFileKindLabel } from "@/components/linkbrain/linkbrain-labels";
import { LinkbrainStatusPill } from "@/components/linkbrain/linkbrain-status-pill";
import type { BrainVirtualFileEnriched } from "@linktrend/linklogic-sdk";

export function LinkbrainMemoryDocRow(props: {
  file: BrainVirtualFileEnriched;
  scopeLabel: string;
  missionId?: string;
  agentId?: string;
}) {
  const f = props.file;
  const Icon = f.file_kind === "daily_log" ? BookOpen : FileText;

  return (
    <li
      className={
        "flex flex-col gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-3 shadow-sm transition sm:flex-row sm:items-center sm:justify-between " +
        "border-l-4 border-l-sky-500 hover:bg-sky-50/70 dark:border-zinc-800 dark:border-l-sky-500 dark:bg-zinc-950 dark:hover:bg-sky-950/25"
      }
    >
      <div className="flex min-w-0 items-start gap-2">
        <Icon className="mt-0.5 h-4 w-4 shrink-0 text-sky-700 dark:text-sky-400" aria-hidden />
        <div className="min-w-0">
          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{f.logical_path}</p>
          <p className="mt-1 flex flex-wrap items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
            <span>{brainFileKindLabel(f.file_kind)}</span>
            <span>·</span>
            <span className="capitalize">{f.sensitivity}</span>
            {f.has_published ? (
              <LinkbrainStatusPill label="Published" tone="published" />
            ) : (
              <LinkbrainStatusPill label="Draft only" tone="draft" />
            )}
          </p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 text-sm sm:shrink-0">
        <Link href={`/memory/files/${f.id}`} className="rounded-lg px-2 py-1 font-medium text-sky-800 hover:bg-sky-50 dark:text-sky-300 dark:hover:bg-sky-950/40">
          View
        </Link>
        <Link
          href={`/memory/files/${f.id}#governance`}
          className="rounded-lg px-2 py-1 font-medium text-violet-800 hover:bg-violet-50 dark:text-violet-300 dark:hover:bg-violet-950/40"
          title="Edits and removals go through Inbox approval"
        >
          Edit
        </Link>
        <Link
          href={`/memory/drafts/new?scope=${encodeURIComponent(f.scope)}&logicalPath=${encodeURIComponent(f.logical_path)}${f.mission_id ? `&missionId=${encodeURIComponent(f.mission_id)}` : ""}${f.agent_id ? `&agentId=${encodeURIComponent(f.agent_id)}` : ""}`}
          className="rounded-lg px-2 py-1 text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
        >
          New draft
        </Link>
      </div>
    </li>
  );
}

export function LinkbrainMemoryDocList(props: {
  files: BrainVirtualFileEnriched[];
  scopeLabel: string;
  missionId?: string;
  agentId?: string;
}) {
  if (props.files.length === 0) {
    return <p className="text-sm text-zinc-500 dark:text-zinc-400">No governed documents in this partition yet.</p>;
  }
  return (
    <ul className="space-y-2">
      {props.files.map((f) => (
        <LinkbrainMemoryDocRow
          key={f.id}
          file={f}
          scopeLabel={props.scopeLabel}
          missionId={props.missionId}
          agentId={props.agentId}
        />
      ))}
    </ul>
  );
}
