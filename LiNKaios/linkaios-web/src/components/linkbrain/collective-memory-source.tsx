"use client";

import {
  collectiveProvenanceLine,
  collectiveTagLine,
  submissionSourceFromFileKind,
  submissionSourceFromInboxType,
  type CollectiveMemoryFile,
} from "@/lib/collective-linkbrain";
import type { CollectiveInboxDraft } from "@/lib/collective-linkbrain";
import { inboxSubmissionSourceLabel } from "@/components/linkbrain/linkbrain-labels";
import type { BrainInboxItemType } from "@linktrend/linklogic-sdk";

export function CollectiveSourceBadge(props: {
  provenance: CollectiveInboxDraft["collective"]["provenance"];
  tags?: CollectiveInboxDraft["collective"]["tags"];
  submissionSource?: ReturnType<typeof submissionSourceFromInboxType>;
  submissionLabel?: string;
}) {
  const tagLine = props.tags ? collectiveTagLine(props.tags) : null;
  const submission =
    props.submissionLabel ??
    (props.submissionSource ? inboxSubmissionSourceLabel(props.submissionSource) : null);
  return (
    <div className="space-y-0.5">
      <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300">{collectiveProvenanceLine(props.provenance)}</p>
      {submission ? <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Submission: {submission}</p> : null}
      {tagLine ? <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Tags: {tagLine}</p> : null}
    </div>
  );
}

export function MemoryItemMetadataLines(props: {
  submissionType?: BrainInboxItemType;
  tags?: { industry?: string; pattern?: string; useCase?: string } | null;
}) {
  const submission = props.submissionType ? inboxSubmissionSourceLabel(submissionSourceFromInboxType(props.submissionType)) : null;
  const tagLine = props.tags ? collectiveTagLine(props.tags) : null;
  if (!submission && !tagLine) return null;
  return (
    <div className="space-y-0.5">
      {submission ? <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Submission: {submission}</p> : null}
      {tagLine ? <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Tags: {tagLine}</p> : null}
    </div>
  );
}

export { submissionSourceFromFileKind, submissionSourceFromInboxType };

export function isCollectiveInboxDraft(draft: unknown): draft is CollectiveInboxDraft {
  return Boolean(draft && typeof draft === "object" && "collective" in draft);
}

export function isCollectiveMemoryFile(file: unknown): file is CollectiveMemoryFile {
  return Boolean(file && typeof file === "object" && "collective" in file);
}
