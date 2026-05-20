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
      return "Preview what LiNKbots see — narrow the search scope, then ask a question.";
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
    default:
      return "LiNKbrain";
  }
}
