/** Shared module catalogue card layout — keeps My Suites and Marketplace tiles aligned. */

export const MODULE_CARD_SHELL =
  "flex h-full min-h-[15rem] flex-col rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950";

/** Matches compact {@link ModulePricingBlock} wrapper + two-line stack (`mt-2` + ~2.25rem). */
export const MODULE_CARD_PRICING_ROW = "mt-2 min-h-[2.25rem]";

export const MODULE_CARD_DESCRIPTION =
  "mt-3 min-h-[3.75rem] line-clamp-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400";

/** Footer row height matches compact action buttons (`min-h-8` + `pt-4`). */
export const MODULE_CARD_FOOTER =
  "mt-auto flex min-h-8 flex-wrap items-center justify-end gap-2 pt-4";
