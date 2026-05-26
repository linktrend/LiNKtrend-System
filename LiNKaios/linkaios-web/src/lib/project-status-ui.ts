import type { StatusTone } from "@/lib/status-colors";

/** Maps raw mission status to operator-facing labels (Prompt 3). */
export function projectStatusDisplay(status: string): "Draft" | "Active" | "Completed" | "Attention" {
  const s = status.toLowerCase();
  if (s === "draft") return "Draft";
  if (s === "assigned" || s === "running") return "Active";
  if (s === "completed") return "Completed";
  return "Attention";
}

/** Every possible lifecycle pill on project detail / index surfaces — width from longest label. */
export const PROJECT_LIFECYCLE_PILL_LABELS = ["Draft", "Active", "Completed", "Attention"] as const;

export function projectStatusPillTone(label: (typeof PROJECT_LIFECYCLE_PILL_LABELS)[number]): StatusTone {
  switch (label) {
    case "Draft":
      return "warning";
    case "Active":
      return "success";
    case "Completed":
      return "success";
    case "Attention":
      return "danger";
  }
}

/** Heuristic workflow % from mission status when no stage data is linked yet. */
export function projectWorkflowProgressPercent(status: string): number {
  const s = status.toLowerCase();
  if (s === "draft") return 12;
  if (s === "assigned") return 38;
  if (s === "running") return 68;
  if (s === "completed") return 100;
  if (s === "failed") return 52;
  if (s === "cancelled") return 28;
  return 20;
}

/** Lifecycle column keys on the projects index “At a glance” cards. */
export type ProjectSummaryColumnKey = "draft" | "active" | "completed" | "attention";

/**
 * Border + background for summary stat cards aligned with lifecycle tone (no purple).
 * Pairs with column titles: Draft / Active / Completed / Attention.
 */
export function projectStatusCardTone(key: ProjectSummaryColumnKey): string {
  switch (key) {
    case "draft":
      return "border border-amber-200 bg-amber-50/90 dark:border-amber-900/60 dark:bg-amber-950/35";
    case "active":
      return "border border-sky-200 bg-sky-50/90 dark:border-sky-800/70 dark:bg-sky-950/40";
    case "completed":
      return "border border-emerald-200 bg-emerald-50/90 dark:border-emerald-800/60 dark:bg-emerald-950/35";
    case "attention":
      return "border border-rose-200 bg-rose-50/90 dark:border-rose-900/55 dark:bg-rose-950/40";
  }
}
