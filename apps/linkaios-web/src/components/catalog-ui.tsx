"use client";

/** Longest lifecycle label across skills + tools for fixed-width pills. */
const LIFECYCLE_MIN = "min-w-[6.75rem] justify-center";

const LIFECYCLE_STYLES: Record<string, string> = {
  draft: "bg-zinc-100 text-zinc-800 ring-zinc-200 dark:bg-zinc-800 dark:text-zinc-200 dark:ring-zinc-600",
  approved: "bg-emerald-50 text-emerald-900 ring-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-200 dark:ring-emerald-800",
  deprecated: "bg-amber-50 text-amber-900 ring-amber-200 dark:bg-amber-950/40 dark:text-amber-200 dark:ring-amber-800",
  archived: "bg-amber-50 text-amber-900 ring-amber-200 dark:bg-amber-950/40 dark:text-amber-200 dark:ring-amber-800",
};

export function LifecyclePill(props: { status: string }) {
  const cls = LIFECYCLE_STYLES[props.status] ?? LIFECYCLE_STYLES.draft;
  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold capitalize ring-1 ${LIFECYCLE_MIN} ${cls}`}
    >
      {props.status}
    </span>
  );
}

/** Green = on / available; red = off / not available. */
export function CatalogueBoolToggle(props: {
  on: boolean;
  disabled?: boolean;
  onToggle: (next: boolean) => void;
  ariaLabel: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={props.on}
      aria-label={props.ariaLabel}
      disabled={props.disabled}
      onClick={() => props.onToggle(!props.on)}
      className={
        "relative inline-flex h-5 w-9 shrink-0 rounded-full border border-transparent transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 disabled:cursor-not-allowed disabled:opacity-40 " +
        (props.on ? "bg-emerald-600 dark:bg-emerald-500" : "bg-red-600 dark:bg-red-600")
      }
    >
      <span
        className={
          "pointer-events-none inline-block h-3.5 w-3.5 translate-y-0.5 transform rounded-full bg-white shadow ring-0 transition-transform " +
          (props.on ? "translate-x-[1.125rem]" : "translate-x-0.5")
        }
      />
    </button>
  );
}
