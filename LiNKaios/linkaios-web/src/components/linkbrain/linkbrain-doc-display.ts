import { brainFileKindLabel, inboxItemTypeLabel, inboxSubmitterLabel } from "@/components/linkbrain/linkbrain-labels";

import type { BrainInboxRow } from "@linktrend/linklogic-sdk";

/** Last path segment for display (filename). */
export function filenameFromLogicalPath(path: string): string {
  const trimmed = path.trim();
  if (!trimmed) return "Untitled draft";
  const parts = trimmed.split("/").filter(Boolean);
  return parts[parts.length - 1] ?? trimmed;
}

/** Primary inbox title — what kind of submission needs review. */
export function inboxReviewTitle(d: BrainInboxRow): string {
  return inboxItemTypeLabel(d.inbox_item_type);
}

/** Secondary line: filename and optional document category when it adds information. */
export function inboxReviewSubtitle(d: BrainInboxRow): string {
  const filename = filenameFromLogicalPath(d.logical_path);
  const kind = brainFileKindLabel(d.file_kind);
  const submission = inboxItemTypeLabel(d.inbox_item_type);
  if (kind && kind !== submission && kind.toLowerCase() !== "standard") {
    return `${filename} · ${kind}`;
  }
  return filename;
}

export function inboxBodyPreviewLabel(d: BrainInboxRow): string {
  if (d.inbox_item_type === "edit_proposal") return "Proposed changes";
  if (d.inbox_item_type === "upload") return "Uploaded content preview";
  return "Content preview";
}

export function inboxSubmittedByLine(d: BrainInboxRow): string {
  return `Submitted by: ${inboxSubmitterLabel(d.inbox_item_type)}`;
}

/** Memory list row — document category as title, path/filename below. */
export function memoryDocTitle(fileKind: string): string {
  return brainFileKindLabel(fileKind);
}

export function memoryDocSubtitle(logicalPath: string): string {
  return logicalPath.startsWith("/") ? logicalPath : `/${logicalPath}`;
}
