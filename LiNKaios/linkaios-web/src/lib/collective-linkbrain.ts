import type { BrainInboxRow, BrainVirtualFileEnriched } from "@linktrend/linklogic-sdk";
import { inboxItemToSubmissionSource, type InboxSubmissionSource } from "@/components/linkbrain/linkbrain-labels";
import type { BrainInboxItemType } from "@linktrend/linklogic-sdk";

import { ALL_LICENSEES_SCOPE, type LicensorScope } from "@/lib/app-roles";
import { LICENSEE_REGISTRY } from "@/lib/licensee-registry";

/** Partition of collective memory (maps to Project / LiNKbot / Licensee tabs). */
export type CollectiveMemoryPartition = "project" | "agent" | "licensee";

/** Source provenance retained for licensor governance — body text is anonymised. */
export type CollectiveMemoryProvenance = {
  licenseeId: string;
  licenseeName: string;
  partition: CollectiveMemoryPartition;
  projectId?: string;
  projectTitle?: string;
  linkbotId?: string;
  linkbotName?: string;
};

export type CollectiveMemoryTags = {
  industry?: string;
  pattern?: string;
  useCase?: string;
};

export type CollectiveMemoryFile = BrainVirtualFileEnriched & {
  collective: {
    provenance: CollectiveMemoryProvenance;
    tags: CollectiveMemoryTags;
  };
};

export type CollectiveInboxDraft = BrainInboxRow & {
  collective: {
    provenance: CollectiveMemoryProvenance;
    tags: CollectiveMemoryTags;
  };
};

export type CollectiveTagFilters = {
  industry?: string;
  pattern?: string;
  useCase?: string;
  submissionSource?: Exclude<InboxSubmissionSource, "all">;
};

export const COLLECTIVE_SUBMISSION_FILTER_OPTIONS: {
  id: Exclude<InboxSubmissionSource, "all">;
  label: string;
}[] = [
  { id: "human_upload", label: "Human — file upload" },
  { id: "human_create", label: "Human — created in LiNKaios" },
  { id: "human_edit", label: "Human — edit to existing memory" },
  { id: "executioner", label: "LiNKbot or automation" },
];

export const COLLECTIVE_TAG_OPTIONS: {
  key: keyof CollectiveTagFilters;
  label: string;
  allLabel: string;
  values: string[];
}[] = [
  {
    key: "industry",
    label: "Industry",
    allLabel: "All Industries",
    values: ["Marketing", "Legal", "Healthcare", "Professional Services"],
  },
  {
    key: "pattern",
    label: "Pattern",
    allLabel: "All Patterns",
    values: ["Lead Intake", "Governance", "Onboarding", "Incident Response"],
  },
  {
    key: "useCase",
    label: "Use Case",
    allLabel: "All Use Cases",
    values: ["CRM Handoff", "Document Review", "Workflow Automation", "Retrieval"],
  },
];

export function collectiveProvenanceLine(p: CollectiveMemoryProvenance): string {
  const parts = [`Licensee: ${p.licenseeName}`];
  if (p.partition === "project" && p.projectTitle) parts.push(`Project: ${p.projectTitle}`);
  if (p.partition === "agent" && p.linkbotName) parts.push(`LiNKbot: ${p.linkbotName}`);
  if (p.partition === "licensee") parts.push("Licensee-wide");
  return parts.join(" · ");
}

export function collectiveTagLine(tags: CollectiveMemoryTags): string | null {
  const parts = [tags.industry, tags.pattern, tags.useCase].filter(Boolean);
  return parts.length ? parts.join(" · ") : null;
}

export function submissionSourceFromInboxType(type: BrainInboxItemType): Exclude<InboxSubmissionSource, "all"> {
  return inboxItemToSubmissionSource(type);
}

export function submissionSourceFromFileKind(fileKind: string, hasPublishedEdit = false): Exclude<InboxSubmissionSource, "all"> {
  if (hasPublishedEdit) return "human_edit";
  if (fileKind === "upload") return "human_upload";
  if (fileKind === "librarian") return "executioner";
  return "human_create";
}

export function matchesLicensorScope(scope: LicensorScope, licenseeId: string): boolean {
  if (scope === ALL_LICENSEES_SCOPE) return true;
  return scope === licenseeId;
}

export function matchesCollectiveTagFilters(
  tags: CollectiveMemoryTags,
  filters: CollectiveTagFilters,
  submissionSource?: Exclude<InboxSubmissionSource, "all">,
): boolean {
  if (filters.industry && tags.industry !== filters.industry) return false;
  if (filters.pattern && tags.pattern !== filters.pattern) return false;
  if (filters.useCase && tags.useCase !== filters.useCase) return false;
  if (filters.submissionSource) {
    if (!submissionSource || filters.submissionSource !== submissionSource) return false;
  }
  return true;
}

export function licenseeNameForId(id: string): string {
  return LICENSEE_REGISTRY.find((r) => r.id === id)?.name ?? id;
}
