import type { AttentionFeedItem } from "@/lib/work-attention-feed";
import type { WorkAlert } from "@/lib/work-alerts";

export type ActionQueueAccent =
  | "alert-critical"
  | "alert-warning"
  | "alert-info"
  | "alert-resolved"
  | "message"
  | "session"
  | "brain";

export function accentFromAttentionItem(item: AttentionFeedItem): ActionQueueAccent {
  if (item.kind === "alert" && item.alertSeverity === "critical") return "alert-critical";
  if (item.kind === "alert" && item.alertSeverity === "warning") return "alert-warning";
  if (item.kind === "alert") return "alert-info";
  if (item.kind === "session") return "session";
  if (item.kind === "brain") return "brain";
  return "message";
}

export function accentFromAlert(severity: WorkAlert["severity"], isResolved: boolean): ActionQueueAccent {
  if (isResolved) return "alert-resolved";
  if (severity === "critical") return "alert-critical";
  if (severity === "warning") return "alert-warning";
  return "alert-info";
}

export function actionQueueStripeClass(accent: ActionQueueAccent): string {
  switch (accent) {
    case "alert-critical":
      return "border-l-4 border-l-red-600 dark:border-l-red-500";
    case "alert-warning":
      return "border-l-4 border-l-yellow-400 dark:border-l-yellow-400";
    case "alert-resolved":
      return "border-l-4 border-l-emerald-500 dark:border-l-emerald-500";
    case "session":
      return "border-l-4 border-l-indigo-500 dark:border-l-indigo-400";
    case "brain":
      return "border-l-4 border-l-sky-500 dark:border-l-sky-500";
    case "message":
    case "alert-info":
    default:
      return "border-l-4 border-l-sky-500 dark:border-l-sky-500";
  }
}

export function actionQueueIconClass(accent: ActionQueueAccent): string {
  const base = "mt-0.5 h-4 w-4 shrink-0";
  switch (accent) {
    case "alert-critical":
      return `${base} text-red-600 dark:text-red-400`;
    case "alert-warning":
      return `${base} text-yellow-500 dark:text-yellow-400`;
    case "alert-resolved":
      return `${base} text-emerald-500 dark:text-emerald-400`;
    case "session":
      return `${base} text-indigo-600 dark:text-indigo-400`;
    case "brain":
    case "message":
    case "alert-info":
    default:
      return `${base} text-sky-600 dark:text-sky-400`;
  }
}

export function actionQueueHoverClass(accent: ActionQueueAccent): string {
  switch (accent) {
    case "alert-critical":
      return "hover:bg-red-50/80 dark:hover:bg-red-950/40";
    case "alert-warning":
      return "hover:bg-yellow-50/90 dark:hover:bg-yellow-950/30";
    case "alert-resolved":
      return "hover:bg-emerald-50/70 dark:hover:bg-emerald-950/30";
    case "session":
      return "hover:bg-indigo-50/80 dark:hover:bg-indigo-950/30";
    case "brain":
    case "message":
    case "alert-info":
    default:
      return "hover:bg-sky-50/70 dark:hover:bg-sky-950/25";
  }
}
