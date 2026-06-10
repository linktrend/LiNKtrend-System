"use client";

import { BookOpen, FileText } from "lucide-react";

import { memoryDocSubtitle, memoryDocTitle } from "@/components/linkbrain/linkbrain-doc-display";
import {
  CollectiveSourceBadge,
  isCollectiveMemoryFile,
  submissionSourceFromFileKind,
} from "@/components/linkbrain/collective-memory-source";
import { MemoryDocIconAction } from "@/components/linkbrain/linkbrain-inbox-row";
import { LinkbrainStatusPill } from "@/components/linkbrain/linkbrain-status-pill";
import { useMemoryPath } from "@/hooks/use-memory-href";
import type { BrainVirtualFileEnriched } from "@linktrend/linklogic-sdk";

export function LinkbrainMemoryDocRow(props: {
  file: BrainVirtualFileEnriched;
  scopeLabel: string;
  missionId?: string;
  agentId?: string;
  licensorCollective?: boolean;
  readOnly?: boolean;
}) {
  const f = props.file;
  const Icon = f.file_kind === "daily_log" ? BookOpen : FileText;
  const hrefForPath = useMemoryPath();

  return (
    <li
      className={
        "flex flex-col gap-3 rounded-xl border border-zinc-200 bg-white px-4 py-3 shadow-sm transition sm:flex-row sm:items-center sm:justify-between " +
        "border-l-4 border-l-sky-500 hover:bg-sky-50/70 dark:border-zinc-800 dark:border-l-sky-500 dark:bg-zinc-950 dark:hover:bg-sky-950/25"
      }
    >
      <div className="flex min-w-0 flex-1 items-start gap-2">
        <Icon className="mt-0.5 h-4 w-4 shrink-0 text-sky-700 dark:text-sky-400" aria-hidden />
        <div className="min-w-0">
          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{memoryDocTitle(f.file_kind)}</p>
          <p className="mt-0.5 truncate text-xs text-zinc-500 dark:text-zinc-400">{memoryDocSubtitle(f.logical_path)}</p>
          {props.licensorCollective && isCollectiveMemoryFile(f) ? (
            <div className="mt-1.5">
              <CollectiveSourceBadge
                provenance={f.collective.provenance}
                tags={f.collective.tags}
                submissionSource={submissionSourceFromFileKind(f.file_kind)}
              />
            </div>
          ) : null}
          <p className="mt-1 text-xs capitalize text-zinc-500 dark:text-zinc-400">Sensitivity: {f.sensitivity}</p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2 sm:shrink-0">
        {f.has_published ? (
          <LinkbrainStatusPill label="Published" tone="published" />
        ) : (
          <LinkbrainStatusPill label="Draft only" tone="draft" />
        )}
        <MemoryDocIconAction href={hrefForPath(`/memory/files/${f.id}`)} label="View document" icon="view" />
        {!props.readOnly ? (
          <MemoryDocIconAction
            href={hrefForPath(`/memory/files/${f.id}?edit=1`)}
            label="Edit document"
            icon="edit"
            title="Edits go through Inbox approval"
          />
        ) : null}
      </div>
    </li>
  );
}

export function LinkbrainMemoryDocList(props: {
  files: BrainVirtualFileEnriched[];
  scopeLabel: string;
  missionId?: string;
  agentId?: string;
  licensorCollective?: boolean;
  readOnly?: boolean;
}) {
  if (props.files.length === 0) {
    return (
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        {props.licensorCollective
          ? "No collective documents match these filters yet."
          : "No governed documents in this partition yet."}
      </p>
    );
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
          licensorCollective={props.licensorCollective}
          readOnly={props.readOnly}
        />
      ))}
    </ul>
  );
}
