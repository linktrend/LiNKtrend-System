import type { BrainInboxItemType } from "@linktrend/linklogic-sdk";

const INBOX_TYPE_LABELS: Record<BrainInboxItemType, string> = {
  upload: "Upload",
  quick_note: "Quick note",
  librarian: "Librarian",
  edit_proposal: "Edit proposal",
  standard: "Standard",
};

const FILE_KIND_LABELS: Record<string, string> = {
  standard: "Standard",
  daily_log: "Daily log",
  upload: "Upload",
  quick_note: "Quick note",
  librarian: "Librarian",
};

export function inboxItemTypeLabel(t: BrainInboxItemType | string): string {
  return INBOX_TYPE_LABELS[t as BrainInboxItemType] ?? t.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function brainFileKindLabel(k: string): string {
  return FILE_KIND_LABELS[k] ?? k.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
