"use client";

/** Green = on; red = off — shared across all Data Table toggle columns. */
export function TableBoolToggle(props: {
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
