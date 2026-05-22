import type { LinkbrainTab } from "@/lib/linkbrain-data";

export function linkbrainTabSubtitle(tab: LinkbrainTab): string {
  switch (tab) {
    case "inbox":
      return "Review pending knowledge — edit, approve, or reject before it is recorded in LiNKbrain.";
    case "project":
      return "Select a project to view, edit, or add memory — new items go to Inbox first.";
    case "agent":
      return "Select a LiNKbot to view, edit, or add memory — new items go to Inbox first.";
    case "company":
      return "Company-wide memory for this tenant — view, edit, or add items via Inbox approval.";
    case "ask":
      return "Preview what LiNKbots see — choose scope, then ask a question.";
    case "audit":
      return "Append-only trace log — capability runs, approvals, and automations; new rows are added as work executes.";
    case "orgScope":
      return "Organisation tags that narrow company memory — regions, departments, and other groupings used when tagging documents.";
    default:
      return "Governed institutional memory for this tenant.";
  }
}

export function linkbrainPageTitle(tab: LinkbrainTab): string {
  switch (tab) {
    case "inbox":
      return "Inbox";
    case "project":
      return "Project Memory";
    case "agent":
      return "LiNKbot Memory";
    case "company":
      return "Company Memory";
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
