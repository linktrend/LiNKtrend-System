import type { BrainInboxItemType } from "@linktrend/linklogic-sdk";

/** Operator-facing submission categories (4 sources into Inbox). */
export type InboxSubmissionSource = "all" | "human_upload" | "human_create" | "human_edit" | "executioner";

export const INBOX_SUBMISSION_SOURCES: { id: InboxSubmissionSource; label: string }[] = [
  { id: "all", label: "All submissions" },
  { id: "human_upload", label: "Human — file upload" },
  { id: "human_create", label: "Human — created in LiNKaios" },
  { id: "human_edit", label: "Human — edit to existing memory" },
  { id: "executioner", label: "LiNKbot or automation" },
];

const INBOX_TYPE_LABELS: Record<BrainInboxItemType, string> = {
  upload: "File upload",
  quick_note: "Quick note",
  librarian: "LiNKbot / automation proposal",
  edit_proposal: "Edit to existing memory",
  standard: "Structured document",
};

const INBOX_SUBMITTER_LABELS: Record<BrainInboxItemType, string> = {
  upload: "Operator (file upload)",
  quick_note: "Operator (created in LiNKaios)",
  librarian: "LiNKbot or automation",
  edit_proposal: "Operator (edit to existing memory)",
  standard: "Operator (created in LiNKaios)",
};

const FILE_KIND_LABELS: Record<string, string> = {
  standard: "General document",
  daily_log: "Daily log",
  upload: "Uploaded file",
  quick_note: "Quick note",
  librarian: "Librarian proposal",
};

export function inboxSubmissionSourceLabel(source: InboxSubmissionSource): string {
  return INBOX_SUBMISSION_SOURCES.find((s) => s.id === source)?.label ?? source;
}

export function inboxItemToSubmissionSource(type: BrainInboxItemType): Exclude<InboxSubmissionSource, "all"> {
  if (type === "upload") return "human_upload";
  if (type === "edit_proposal") return "human_edit";
  if (type === "librarian") return "executioner";
  return "human_create";
}

export function inboxItemMatchesSource(type: BrainInboxItemType, source: InboxSubmissionSource): boolean {
  if (source === "all") return true;
  return inboxItemToSubmissionSource(type) === source;
}

export function inboxItemTypeLabel(t: BrainInboxItemType | string): string {
  return INBOX_TYPE_LABELS[t as BrainInboxItemType] ?? t.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function inboxSubmitterLabel(t: BrainInboxItemType | string): string {
  return INBOX_SUBMITTER_LABELS[t as BrainInboxItemType] ?? "Operator";
}

export function brainFileKindLabel(k: string): string {
  return FILE_KIND_LABELS[k] ?? k.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
