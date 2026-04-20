/**
 * Central UI theme tokens (LiNKaios web).
 *
 * Use with `ui-standards` (`BUTTON`, `FIELD`, `TABS`, …) for controls.
 * Put **cross-cutting dimensions and repeated composite styles** here so
 * badges, pills, and layout widths stay in sync across pages.
 */

/** Fixed width for every attention-queue pill (type + severity) — same box on Overview and Work. */
const attentionBadgeFrame =
  "inline-flex w-[7.25rem] shrink-0 items-center justify-center overflow-hidden text-ellipsis whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide tabular-nums ring-1";

/**
 * Attention / action queue row badges (Overview “What needs attention”, Work action queue).
 * Type and severity chips intentionally share one width token.
 */
export const ATTENTION_QUEUE_BADGE = {
  type: `${attentionBadgeFrame} bg-zinc-100 text-zinc-600 ring-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:ring-zinc-600`,
  severityCritical: `${attentionBadgeFrame} bg-red-100 text-red-900 ring-red-200 dark:bg-red-950/60 dark:text-red-100 dark:ring-red-900/50`,
  severityWarning: `${attentionBadgeFrame} bg-amber-100 text-amber-950 ring-amber-200 dark:bg-amber-950/50 dark:text-amber-100 dark:ring-amber-800`,
} as const;

/** Same pill language as attention-queue / session badges; compact width for inline alert rows. */
const workAlertBadgeFrame =
  "inline-flex shrink-0 items-center justify-center rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide ring-1 tabular-nums";

export const WORK_ALERT_BADGE = {
  severityCritical: `${workAlertBadgeFrame} bg-red-100 text-red-900 ring-red-200 dark:bg-red-950/60 dark:text-red-100 dark:ring-red-900/50`,
  severityWarning: `${workAlertBadgeFrame} bg-amber-100 text-amber-950 ring-amber-200 dark:bg-amber-950/50 dark:text-amber-100 dark:ring-amber-800`,
  severityInfo: `${workAlertBadgeFrame} bg-zinc-100 text-zinc-600 ring-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:ring-zinc-600`,
  statusOpen: `${workAlertBadgeFrame} bg-amber-50 text-amber-900 ring-amber-200/90 dark:bg-amber-950/50 dark:text-amber-100 dark:ring-amber-800`,
  statusResolved: `${workAlertBadgeFrame} bg-emerald-50 text-emerald-800 ring-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-100 dark:ring-emerald-900/50`,
} as const;

/** Work dashboard stream cards — status label (Needs action / Review / OK), equal width across cards. */
export const WORK_STREAM_STATUS_CHIP =
  "inline-flex min-w-[12ch] justify-center text-[10px] font-semibold uppercase tracking-wide text-zinc-600 tabular-nums dark:text-zinc-400";

