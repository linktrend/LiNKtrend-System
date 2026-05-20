import type { AttentionFeedItem } from "@/lib/work-attention-feed";

/** Left accent stripe — matches All Work action queue (preferred operator pattern). */
export function queueRowShellClass(item: AttentionFeedItem): string {
  if (item.kind === "alert" && item.alertSeverity === "critical")
    return "border-l-4 border-l-red-600 dark:border-l-red-500";
  if (item.kind === "alert" && item.alertSeverity === "warning")
    return "border-l-4 border-l-yellow-400 dark:border-l-yellow-400";
  if (item.kind === "session") return "border-l-4 border-l-indigo-500 dark:border-l-indigo-400";
  return "border-l-4 border-l-sky-500 dark:border-l-sky-500";
}

export function queueRowHoverClass(item: AttentionFeedItem): string {
  if (item.kind === "alert" && item.alertSeverity === "critical")
    return "hover:bg-red-50/80 dark:hover:bg-red-950/40";
  if (item.kind === "alert" && item.alertSeverity === "warning")
    return "hover:bg-yellow-50/90 dark:hover:bg-yellow-950/30";
  if (item.kind === "session") return "hover:bg-indigo-50/80 dark:hover:bg-indigo-950/30";
  return "hover:bg-sky-50/70 dark:hover:bg-sky-950/25";
}

export function queueItemIconClass(item: AttentionFeedItem): string {
  if (item.kind === "alert") {
    if (item.alertSeverity === "critical") return "mt-0.5 h-4 w-4 shrink-0 text-red-600 dark:text-red-400";
    if (item.alertSeverity === "warning") return "mt-0.5 h-4 w-4 shrink-0 text-yellow-500 dark:text-yellow-400";
    return "mt-0.5 h-4 w-4 shrink-0 text-sky-600 dark:text-sky-400";
  }
  if (item.kind === "message") return "mt-0.5 h-4 w-4 shrink-0 text-sky-600 dark:text-sky-400";
  if (item.kind === "session") return "mt-0.5 h-4 w-4 shrink-0 text-indigo-600 dark:text-indigo-400";
  return "mt-0.5 h-4 w-4 shrink-0 text-sky-600 dark:text-sky-400";
}
