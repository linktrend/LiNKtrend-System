/**
 * App-wide status colour semantics (LiNKaios web).
 * Blue = info/planned · Green = healthy/done · Amber = waiting/review · Red = failed/offline · Indigo = active/running
 */

export type StatusTone = "info" | "success" | "warning" | "danger" | "active" | "neutral";

export const STATUS_TONE = {
  info: {
    border: "border-l-sky-500 dark:border-l-sky-400",
    hover: "hover:bg-sky-50 dark:hover:bg-sky-950/30",
    iconWrap: "bg-sky-600 text-white dark:bg-sky-500",
  },
  success: {
    border: "border-l-emerald-500 dark:border-l-emerald-400",
    hover: "hover:bg-emerald-50 dark:hover:bg-emerald-950/30",
    iconWrap: "bg-emerald-600 text-white dark:bg-emerald-500",
  },
  warning: {
    border: "border-l-amber-500 dark:border-l-amber-400",
    hover: "hover:bg-amber-50 dark:hover:bg-amber-950/30",
    iconWrap: "bg-amber-500 text-white dark:bg-amber-400",
  },
  danger: {
    border: "border-l-red-500 dark:border-l-red-400",
    hover: "hover:bg-red-50 dark:hover:bg-red-950/30",
    iconWrap: "bg-red-600 text-white dark:bg-red-500",
  },
  active: {
    border: "border-l-indigo-500 dark:border-l-indigo-400",
    hover: "hover:bg-indigo-50 dark:hover:bg-indigo-950/30",
    iconWrap: "bg-indigo-600 text-white dark:bg-indigo-500",
  },
  neutral: {
    border: "border-l-zinc-400 dark:border-l-zinc-500",
    hover: "hover:bg-zinc-50 dark:hover:bg-zinc-900/50",
    iconWrap: "bg-zinc-600 text-white dark:bg-zinc-400",
  },
} as const;

export function toneForAttentionItem(input: {
  kind: "alert" | "message" | "session" | "brain";
  alertSeverity?: "critical" | "warning" | "info";
}): StatusTone {
  if (input.kind === "alert") {
    if (input.alertSeverity === "critical") return "danger";
    if (input.alertSeverity === "warning") return "warning";
    return "info";
  }
  if (input.kind === "message") return "info";
  if (input.kind === "session") return "active";
  return "info";
}
