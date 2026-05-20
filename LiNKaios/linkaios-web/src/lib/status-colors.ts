/**
 * App-wide status colour semantics (LiNKaios web).
 * Blue = info/planned · Green = healthy/done · Amber = waiting/review · Red = failed/offline · Indigo = active/running
 *
 * Import {@link StatusPill} from `@/components/ui/status-pill` for rendered pills — do not invent per-page colours.
 */

export type StatusTone = "info" | "success" | "warning" | "danger" | "active" | "neutral";

/** Domain keys for {@link resolveStatusPill} — extend as new surfaces adopt StatusPill. */
export type StatusDomain =
  | "project"
  | "workflow"
  | "issue"
  | "run"
  | "approval"
  | "lease"
  | "linkbot"
  | "sync"
  | "connector"
  | "memory"
  | "metric"
  | "module"
  | "subscription"
  | "generic";

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

/** Canonical pill classes — bold label, ring darker than fill (GLOBAL-001). */
export const STATUS_PILL = {
  base: "inline-flex shrink-0 items-center justify-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 tabular-nums",
  equalWidth: "min-w-[5.5rem]",
  wideEqualWidth: "min-w-[7.25rem]",
  tone: {
    info: "bg-sky-50 text-sky-900 ring-sky-300 dark:bg-sky-950/50 dark:text-sky-100 dark:ring-sky-700",
    success: "bg-emerald-50 text-emerald-900 ring-emerald-300 dark:bg-emerald-950/50 dark:text-emerald-100 dark:ring-emerald-700",
    warning: "bg-amber-50 text-amber-950 ring-amber-300 dark:bg-amber-950/40 dark:text-amber-100 dark:ring-amber-700",
    danger: "bg-red-50 text-red-900 ring-red-300 dark:bg-red-950/50 dark:text-red-100 dark:ring-red-800",
    active: "bg-indigo-50 text-indigo-900 ring-indigo-300 dark:bg-indigo-950/50 dark:text-indigo-100 dark:ring-indigo-700",
    neutral: "bg-zinc-100 text-zinc-800 ring-zinc-400 dark:bg-zinc-800 dark:text-zinc-200 dark:ring-zinc-500",
  } satisfies Record<StatusTone, string>,
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

/** Normalise free-text status strings for lookup. */
export function normaliseStatusKey(raw: string): string {
  return raw.trim().toLowerCase().replace(/\s+/g, "_").replace(/-/g, "_");
}

type PillSpec = { tone: StatusTone; label?: string };

const DOMAIN_STATUS_MAP: Partial<Record<StatusDomain, Record<string, PillSpec>>> = {
  project: {
    active: { tone: "active", label: "Active" },
    open: { tone: "info", label: "Open" },
    completed: { tone: "success", label: "Completed" },
    done: { tone: "success", label: "Done" },
    cancelled: { tone: "neutral", label: "Cancelled" },
    on_hold: { tone: "warning", label: "On hold" },
  },
  workflow: {
    running: { tone: "active", label: "Running" },
    pending: { tone: "warning", label: "Pending" },
    completed: { tone: "success", label: "Completed" },
    failed: { tone: "danger", label: "Failed" },
    skipped: { tone: "neutral", label: "Skipped" },
  },
  issue: {
    open: { tone: "info", label: "Open" },
    in_progress: { tone: "active", label: "In progress" },
    watch: { tone: "warning", label: "Watch" },
    resolved: { tone: "success", label: "Resolved" },
    closed: { tone: "neutral", label: "Closed" },
  },
  run: {
    ok: { tone: "success", label: "OK" },
    success: { tone: "success", label: "Success" },
    succeeded: { tone: "success", label: "Succeeded" },
    failed: { tone: "danger", label: "Failed" },
    error: { tone: "danger", label: "Error" },
    running: { tone: "active", label: "Running" },
    pending: { tone: "warning", label: "Pending" },
  },
  approval: {
    pending: { tone: "warning", label: "Pending" },
    approved: { tone: "success", label: "Approved" },
    rejected: { tone: "danger", label: "Rejected" },
    review: { tone: "warning", label: "Review" },
  },
  lease: {
    active: { tone: "success", label: "Active" },
    granted: { tone: "success", label: "Granted" },
    expired: { tone: "neutral", label: "Expired" },
    revoked: { tone: "danger", label: "Revoked" },
    pending: { tone: "warning", label: "Pending" },
  },
  linkbot: {
    online: { tone: "success", label: "Online" },
    offline: { tone: "danger", label: "Offline" },
    idle: { tone: "warning", label: "Idle" },
    busy: { tone: "active", label: "Busy" },
    registered: { tone: "info", label: "Registered" },
  },
  sync: {
    synced: { tone: "success", label: "Synced" },
    syncing: { tone: "active", label: "Syncing" },
    error: { tone: "danger", label: "Error" },
    stale: { tone: "warning", label: "Stale" },
  },
  connector: {
    active: { tone: "success", label: "Active" },
    implemented: { tone: "success", label: "Implemented" },
    configured: { tone: "info", label: "Configured" },
    declared: { tone: "info", label: "Declared" },
    draft: { tone: "neutral", label: "Draft" },
    disabled: { tone: "neutral", label: "Disabled" },
    pending: { tone: "warning", label: "Pending" },
    error: { tone: "danger", label: "Error" },
  },
  memory: {
    published: { tone: "success", label: "Published" },
    draft: { tone: "neutral", label: "Draft" },
    pending: { tone: "warning", label: "Review" },
    inbox: { tone: "warning", label: "Review" },
  },
  metric: {
    ok: { tone: "success", label: "OK" },
    failed: { tone: "danger", label: "Failed" },
    degraded: { tone: "warning", label: "Degraded" },
  },
  module: {
    licensed: { tone: "success", label: "Licensed" },
    active: { tone: "success", label: "Active" },
    trial: { tone: "info", label: "Trial" },
    unavailable: { tone: "neutral", label: "Unavailable" },
  },
  subscription: {
    active: { tone: "success", label: "Active" },
    trialing: { tone: "info", label: "Trialing" },
    past_due: { tone: "warning", label: "Past due" },
    canceled: { tone: "neutral", label: "Canceled" },
    not_subscribed: { tone: "neutral", label: "Not subscribed" },
  },
  generic: {
    ok: { tone: "success", label: "OK" },
    review: { tone: "warning", label: "Review" },
    failed: { tone: "danger", label: "Failed" },
  },
};

/** Map domain + raw status to display label and tone. Falls back to title-case raw + neutral. */
export function resolveStatusPill(
  domain: StatusDomain,
  rawStatus: string,
): { label: string; tone: StatusTone } {
  const key = normaliseStatusKey(rawStatus);
  const domainMap = DOMAIN_STATUS_MAP[domain] ?? DOMAIN_STATUS_MAP.generic!;
  const spec = domainMap[key] ?? DOMAIN_STATUS_MAP.generic?.[key];
  if (spec) {
    const label =
      spec.label ??
      rawStatus
        .trim()
        .replace(/_/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());
    return { label, tone: spec.tone };
  }
  const label = rawStatus.trim().replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) || "Unknown";
  return { label, tone: "neutral" };
}
