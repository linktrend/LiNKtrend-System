import type { StatusTone } from "@/lib/status-colors";

/** Maps raw project status to operator-facing labels — Draft | Active | Archived (Plane-aligned where possible). */
export function projectStatusDisplay(status: string): "Draft" | "Active" | "Archived" {
  const s = status.toLowerCase();
  if (s === "draft") return "Draft";
  if (s === "archived" || s === "completed" || s === "cancelled" || s === "failed") return "Archived";
  if (s === "assigned" || s === "running") return "Active";
  return "Active";
}

/** Every possible lifecycle pill on project detail / index surfaces — width from longest label. */
export const PROJECT_LIFECYCLE_PILL_LABELS = ["Draft", "Active", "Archived"] as const;

export function projectStatusPillTone(label: (typeof PROJECT_LIFECYCLE_PILL_LABELS)[number]): StatusTone {
  switch (label) {
    case "Draft":
      return "warning";
    case "Active":
      return "success";
    case "Archived":
      return "neutral";
  }
}

/** Heuristic workflow % from project status when no stage data is linked yet. */
export function projectWorkflowProgressPercent(status: string): number {
  const s = status.toLowerCase();
  if (s === "draft") return 12;
  if (s === "assigned") return 38;
  if (s === "running") return 68;
  if (s === "completed") return 100;
  if (s === "archived") return 100;
  if (s === "failed") return 52;
  if (s === "cancelled") return 28;
  return 20;
}

/** Lifecycle column keys on the projects index “At a glance” cards. */
export type ProjectSummaryColumnKey = "draft" | "active" | "archived";

/**
 * Border + background for summary stat cards aligned with lifecycle tone (no purple).
 * Pairs with column titles: Draft / Active / Archived.
 */
export function projectStatusCardTone(key: ProjectSummaryColumnKey): string {
  switch (key) {
    case "draft":
      return "border border-amber-200 bg-amber-50/90 dark:border-amber-900/60 dark:bg-amber-950/35";
    case "active":
      return "border border-sky-200 bg-sky-50/90 dark:border-sky-800/70 dark:bg-sky-950/40";
    case "archived":
      return "border border-zinc-200 bg-zinc-50/90 dark:border-zinc-700 dark:bg-zinc-900/50";
  }
}

/** Map raw DB status into lifecycle summary bucket for index cards. */
export function projectSummaryColumnForStatus(status: string): ProjectSummaryColumnKey {
  const label = projectStatusDisplay(status);
  if (label === "Draft") return "draft";
  if (label === "Archived") return "archived";
  return "active";
}
