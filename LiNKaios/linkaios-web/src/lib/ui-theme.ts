/**
 * Central UI theme tokens (LiNKaios web).
 *
 * Use with `ui-standards` (`BUTTON`, `FIELD`, `TABS`, …) for controls.
 * Put **cross-cutting dimensions and repeated composite styles** here so
 * badges, pills, and layout widths stay in sync across pages.
 */

/** Fixed width for every attention-queue pill (type + severity) — same box on Overview and Work. */
const attentionBadgeFrame =
  "inline-flex w-[7.25rem] shrink-0 items-center justify-center overflow-hidden text-ellipsis whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium tabular-nums ring-1";

/**
 * Attention / action queue row badges (Overview “What needs attention”, Work action queue).
 * Type and severity chips intentionally share one width token.
 */
export const ATTENTION_QUEUE_BADGE = {
  type: `${attentionBadgeFrame} bg-zinc-100 text-zinc-600 ring-zinc-300 dark:bg-zinc-800 dark:text-zinc-300 dark:ring-zinc-600`,
  severityCritical: `${attentionBadgeFrame} bg-red-100 text-red-900 ring-red-300 dark:bg-red-950/60 dark:text-red-100 dark:ring-red-800`,
  severityWarning: `${attentionBadgeFrame} bg-yellow-100 text-yellow-950 ring-yellow-300 dark:bg-yellow-950/50 dark:text-yellow-100 dark:ring-yellow-700`,
} as const;

/** Same pill language as attention-queue / session badges; compact width for inline alert rows. */
const workAlertBadgeFrame =
  "inline-flex shrink-0 items-center justify-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 tabular-nums";

export const WORK_ALERT_BADGE = {
  severityCritical: `${workAlertBadgeFrame} bg-red-100 text-red-900 ring-red-300 dark:bg-red-950/60 dark:text-red-100 dark:ring-red-800`,
  severityWarning: `${workAlertBadgeFrame} bg-yellow-100 text-yellow-950 ring-yellow-300 dark:bg-yellow-950/50 dark:text-yellow-100 dark:ring-yellow-700`,
  severityInfo: `${workAlertBadgeFrame} bg-sky-50 text-sky-800 ring-sky-200 dark:bg-sky-950/40 dark:text-sky-100 dark:ring-sky-800`,
  statusOpen: `${workAlertBadgeFrame} bg-yellow-50 text-yellow-900 ring-yellow-200 dark:bg-yellow-950/50 dark:text-yellow-100 dark:ring-yellow-700`,
  statusResolved: `${workAlertBadgeFrame} bg-emerald-50 text-emerald-800 ring-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-100 dark:ring-emerald-800`,
} as const;

/**
 * @deprecated Use `StatusPill` with `equalWidth` from `@/components/ui/status-pill` (GLOBAL-001).
 * Work stream cards (Needs action / Review / OK) now render via StatusPill on `/work`.
 */
export const WORK_STREAM_STATUS_CHIP =
  "inline-flex min-w-[12ch] justify-center text-[10px] font-medium text-zinc-600 tabular-nums dark:text-zinc-400";

