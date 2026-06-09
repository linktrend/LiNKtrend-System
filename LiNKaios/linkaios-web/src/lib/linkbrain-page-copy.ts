import type { LinkbrainTab } from "@/lib/linkbrain-data";
import type { AppActorKind } from "@/lib/app-roles";

export function linkbrainTabSubtitle(tab: LinkbrainTab, kind: AppActorKind = "licensee"): string {
  switch (tab) {
    case "inbox":
      return kind === "licensor"
        ? "Vendor librarian queue — triage collective submissions before they join shared LiNKbrain."
        : "Review pending knowledge — edit, approve, or reject before it is recorded in LiNKbrain.";
    case "project":
      return kind === "licensor"
        ? "Admin program memory — browse vendor studio projects (LiNKsuitegen, librarian filings), not client tenant projects."
        : "Select a project to view, edit, or add memory — new items go to Inbox first.";
    case "agent":
      return kind === "licensor"
        ? "Collective LiNKbot memory — anonymised content with declared source; browse by LiNKbot and tags."
        : "Select a LiNKbot to view, edit, or add memory — new items go to Inbox first.";
    case "company":
      return kind === "licensor"
        ? "Licensee-wide memory — anonymised submissions from subscribed tenants; browse by licensee and tags."
        : "Company-wide memory for this tenant — view, edit, or add items via Inbox approval.";
    case "ask":
      return kind === "licensor"
        ? "Query shared vendor LiNKbrain — filter by licensee, admin program, LiNKbot, or tags, then ask a question."
        : "Preview what LiNKbots see — choose scope, then ask a question.";
    case "audit":
      return kind === "licensor"
        ? "Vendor audit trail — capability runs, approvals, and automations across the shared brain."
        : "Append-only trace log — capability runs, approvals, and automations; new rows are added as work executes.";
    case "orgScope":
      return kind === "licensor"
        ? "Organisation tags that narrow licensee memory — regions, departments, and other groupings used when tagging documents."
        : "Organisation tags that narrow company memory — regions, departments, and other groupings used when tagging documents.";
    default:
      return "Governed institutional memory for this tenant.";
  }
}

export function linkbrainPageTitle(tab: LinkbrainTab, kind: AppActorKind = "licensee"): string {
  switch (tab) {
    case "inbox":
      return "Inbox";
    case "project":
      return kind === "licensor" ? "Admin Program Memory" : "Project Memory";
    case "agent":
      return "LiNKbot Memory";
    case "company":
      return kind === "licensor" ? "Licensee Memory" : "Company Memory";
    case "ask":
      return "Ask LiNKbrain";
    case "audit":
      return "Audit";
    case "orgScope":
      return "Org Scope";
    default:
      return "LiNKbrain";
  }
}

/** Tab strip / sidebar label — same as page title except inbox hub uses LiNKbrain on the page header only. */
export function linkbrainTabLabel(tab: LinkbrainTab, kind: AppActorKind = "licensee"): string {
  return linkbrainPageTitle(tab, kind);
}
