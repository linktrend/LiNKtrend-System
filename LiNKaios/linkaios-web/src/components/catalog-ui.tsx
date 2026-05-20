"use client";

/** Longest lifecycle label across skills + tools for fixed-width pills. */
const LIFECYCLE_MIN = "min-w-[6.75rem] justify-center";

const LIFECYCLE_STYLES: Record<string, string> = {
  draft: "bg-zinc-100 text-zinc-800 ring-zinc-400 dark:bg-zinc-800 dark:text-zinc-200 dark:ring-zinc-500",
  approved: "bg-emerald-50 text-emerald-900 ring-emerald-300 dark:bg-emerald-950/50 dark:text-emerald-200 dark:ring-emerald-700",
  deprecated: "bg-yellow-50 text-yellow-900 ring-yellow-300 dark:bg-yellow-950/40 dark:text-yellow-200 dark:ring-yellow-600",
  archived: "bg-yellow-50 text-yellow-900 ring-yellow-300 dark:bg-yellow-950/40 dark:text-yellow-200 dark:ring-yellow-600",
};

const CONNECTOR_STATUS_STYLES: Record<string, string> = {
  implemented: "bg-emerald-50 text-emerald-900 ring-emerald-300 dark:bg-emerald-950/50 dark:text-emerald-200 dark:ring-emerald-700",
  declared: "bg-sky-50 text-sky-900 ring-sky-300 dark:bg-sky-950/40 dark:text-sky-200 dark:ring-sky-700",
  pending: "bg-zinc-100 text-zinc-800 ring-zinc-400 dark:bg-zinc-800 dark:text-zinc-200 dark:ring-zinc-500",
};

function formatLifecycleLabel(status: string) {
  if (status === "draft") return "Draft";
  if (status === "approved") return "Approved";
  if (status === "deprecated") return "Deprecated";
  if (status === "archived") return "Archived";
  return status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatConnectorStatus(status: string) {
  if (status === "implemented") return "Implemented";
  if (status === "declared") return "Declared";
  if (status === "pending") return "Pending";
  return status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function LifecyclePill(props: { status: string }) {
  const cls = LIFECYCLE_STYLES[props.status] ?? LIFECYCLE_STYLES.draft;
  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ${LIFECYCLE_MIN} ${cls}`}
    >
      {formatLifecycleLabel(props.status)}
    </span>
  );
}

export function ConnectorStatusPill(props: { status: string }) {
  const cls = CONNECTOR_STATUS_STYLES[props.status] ?? CONNECTOR_STATUS_STYLES.pending;
  return (
    <span
      className={`inline-flex min-w-[6.75rem] justify-center rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ${cls}`}
    >
      {formatConnectorStatus(props.status)}
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
