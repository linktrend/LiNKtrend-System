/**
 * Shared layout tokens for command-centre screens: consistent control widths,
 * button heights, and badge sizing. Import these into `className` strings.
 *
 * Cross-page **dimensions** for attention-queue pills live in `ui-theme.ts` (`ATTENTION_QUEUE_BADGE`).
 */
export const FIELD = {
  label: "text-sm font-medium text-zinc-800 dark:text-zinc-200",
  /** Default width for stacked form fields on a screen */
  control:
    "w-full max-w-xl rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 disabled:opacity-60 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100",
  /** Wider controls (JSON, long text) */
  wide:
    "w-full max-w-3xl rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 disabled:opacity-60 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100",
  mono:
    "w-full max-w-3xl rounded-lg border border-zinc-200 bg-white px-3 py-2 font-mono text-sm text-zinc-900 shadow-sm outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 disabled:opacity-60 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100",
  /** Inline / table-style controls */
  controlCompact:
    "w-full max-w-[13rem] rounded-md border border-zinc-200 bg-white px-2 py-1.5 text-xs text-zinc-900 shadow-sm outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 disabled:opacity-60 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100",
} as const;

/**
 * Button-style control tokens (`<button>` or `<Link className={BUTTON.*}>`).
 *
 * **Groups**
 * - **Toolbar row** (`min-h-9`, ~`min-w-[8.5rem]`): `primaryRow`, `secondaryRow`, `ghostRow`, `dangerRow`,
 *   `approveRow`, `rejectRow`, `editRow`, `primaryRowUniform`, `secondaryRowUniform`, `secondaryCardAction`, …
 * - **Compact / dense tables** (`min-h-8`, `min-w-[5.25rem]`): `primaryCompact`, `secondaryCompact` — same
 *   primary vs outline pairing as row variants, smaller footprint.
 * - **Compact governance** (variable width): `approveCompact`, `rejectCompact`
 * - **Sky “open / edit”** (distinct from primary): `editTextLink`, `editCompact` — use when the action is
 *   explicitly “edit” or “open editor”, not the main forward action in a row.
 *
 * **Corners:** these tokens use `rounded-lg` for a consistent control radius. Exceptions are intentional
 * (for example {@link TABS} / {@link screenTabLinkClass} use `rounded-t-md` for tab strips).
 */
export const BUTTON = {
  /** Primary: use in horizontal toolbars (min width, no forced full width). */
  primaryRow:
    "inline-flex min-h-9 min-w-[8.5rem] shrink-0 items-center justify-center rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200",
  /** Same as primaryRow but fixed width for a row of actions (longest label on screen, e.g. “Upload to LiNKbrain”). */
  primaryRowUniform:
    "inline-flex min-h-9 min-w-[15.5rem] shrink-0 items-center justify-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200",
  /** Primary: stretches to parent width — pair with {@link STACK.actions}. */
  primaryBlock:
    "inline-flex min-h-9 w-full items-center justify-center rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200",
  secondaryRow:
    "inline-flex min-h-9 min-w-[8.5rem] shrink-0 items-center justify-center rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-900 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:bg-zinc-900",
  /** Secondary row with width matched to longest label in a group (e.g. work dashboard footer links). */
  secondaryRowUniform:
    "inline-flex min-h-9 min-w-[13.5rem] shrink-0 items-center justify-center rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-900 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:bg-zinc-900",
  /**
   * Same visual weight as secondaryRow, but `self-start` so flex-column cards do not stretch the control
   * to the full column width (Overview workforce / work summary footers).
   */
  secondaryCardAction:
    "inline-flex min-h-9 min-w-[8.5rem] shrink-0 self-start items-center justify-center rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-900 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:bg-zinc-900",
  secondaryBlock:
    "inline-flex min-h-9 w-full items-center justify-center rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-900 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:bg-zinc-900",
  ghostRow:
    "inline-flex min-h-9 min-w-[8.5rem] shrink-0 items-center justify-center rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-800 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:bg-zinc-900",
  ghostBlock:
    "inline-flex min-h-9 w-full items-center justify-center rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-800 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:bg-zinc-900",
  dangerRow:
    "inline-flex min-h-9 min-w-[8.5rem] shrink-0 items-center justify-center rounded-lg border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-950 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-50",
  dangerBlock:
    "inline-flex min-h-9 w-full items-center justify-center rounded-lg border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-950 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-50",
  /** Approve / confirm positive action */
  approveRow:
    "inline-flex min-h-9 min-w-[8.5rem] shrink-0 items-center justify-center rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-emerald-600 dark:hover:bg-emerald-500",
  /** Reject / destructive dismissal (outline) */
  rejectRow:
    "inline-flex min-h-9 min-w-[8.5rem] shrink-0 items-center justify-center rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-800 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-900/60 dark:bg-zinc-950 dark:text-red-200 dark:hover:bg-red-950/30",
  /** Compact toolbar (governance rows, dense tables) */
  approveCompact:
    "inline-flex min-h-8 items-center justify-center rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-emerald-600 dark:hover:bg-emerald-500",
  rejectCompact:
    "inline-flex min-h-8 items-center justify-center rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-800 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-900/60 dark:bg-zinc-950 dark:text-red-200 dark:hover:bg-red-950/30",
  /**
   * Compact primary — same fill/hover language as {@link BUTTON.primaryRow}, for dense tables.
   * Pair with {@link BUTTON.secondaryCompact} for a standard primary + outline row.
   */
  primaryCompact:
    "inline-flex min-h-8 min-w-[5.25rem] shrink-0 items-center justify-center rounded-lg bg-zinc-900 px-2.5 py-1 text-xs font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200",
  /** Compact secondary / outline — pairs with {@link BUTTON.primaryCompact} in table toolbars */
  secondaryCompact:
    "inline-flex min-h-8 min-w-[5.25rem] shrink-0 items-center justify-center rounded-lg border border-zinc-300 bg-white px-2.5 py-1 text-xs font-semibold text-zinc-900 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:bg-zinc-800",
  /** Edit / open-for-edit (outlined, sky) */
  editRow:
    "inline-flex min-h-9 min-w-[8.5rem] shrink-0 items-center justify-center rounded-lg border border-sky-300 bg-sky-50 px-4 py-2 text-sm font-semibold text-sky-950 transition hover:bg-sky-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-sky-800 dark:bg-sky-950/40 dark:text-sky-50 dark:hover:bg-sky-900/60",
  /** Text-only edit link aligned with button rows */
  editTextLink:
    "inline-flex min-h-9 items-center text-sm font-semibold text-sky-700 underline-offset-2 hover:underline dark:text-sky-400",
  /** Compact sky outline — “open editor” / edit affordance; not the same weight as {@link BUTTON.primaryCompact}. */
  editCompact:
    "inline-flex min-h-8 min-w-[5.25rem] shrink-0 items-center justify-center rounded-lg border border-sky-300 bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-950 transition hover:bg-sky-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-sky-700 dark:bg-sky-950/40 dark:text-sky-100 dark:hover:bg-sky-900/60",
} as const;

/** Vertical stack so every button stretches to the same width (max-w-xs). */
export const STACK = {
  actions: "flex w-full max-w-xs flex-col gap-2",
} as const;

/**
 * Table header alignment: use on `<th>` (and mirror on `<td>` for control columns).
 * - **Text / numbers / dates** → {@link TABLE.thText}
 * - **Badges, toggles, icons-only, action button clusters** → {@link TABLE.thControl}
 * - Narrow **`table-fixed`** headers: wrap the label in `<div className={TABLE.thControlInner}>…</div>` inside the `<th>`.
 */
export const TABLE = {
  thText: "text-left",
  thControl: "text-center",
  /** Center label or control inside narrow `table-fixed` columns */
  thControlInner: "flex w-full justify-center",
} as const;

/** “Open” on dashboard tiles — content width, slightly wider than the label. */
export const PANEL_LINK = {
  open:
    "inline-flex min-h-9 shrink-0 items-center justify-center whitespace-nowrap rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-800 shadow-sm transition hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-900",
} as const;

/** Horizontal screen tabs (LiNKbrain, Settings, any top-level section switcher). */
export const TABS = {
  /** Bottom border row; place tab links inside */
  row: "flex flex-wrap items-end gap-1 border-b border-zinc-200 pb-px dark:border-zinc-800",
} as const;

/**
 * Active / inactive styles for screen-level tabs — same weight and hover pattern everywhere.
 * Use on `<Link>` or on `<button type="button" role="tab">` for client-only tab strips.
 */
export function screenTabLinkClass(active: boolean): string {
  const base =
    "inline-flex min-h-[2.75rem] min-w-[5rem] items-center justify-center rounded-t-md border border-b-0 px-4 py-2.5 text-sm font-semibold transition";
  if (active) {
    return (
      base +
      " border-zinc-300 bg-white text-zinc-900 shadow-sm ring-1 ring-zinc-200/80 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100 dark:ring-zinc-700/80"
    );
  }
  return (
    base +
    " border-transparent text-zinc-600 hover:border-zinc-200 hover:bg-zinc-50/90 dark:text-zinc-400 dark:hover:border-zinc-700 dark:hover:bg-zinc-950/50"
  );
}

/**
 * Shared pill frame for status badges (fleet table, session inbox, LiNKbrain pending, etc.):
 * soft fill + `ring-1`, not solid saturated fills.
 */
const pillBadgeFrame =
  "inline-flex min-w-[6.75rem] shrink-0 justify-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 tabular-nums";

/** Status / lifecycle chips: fixed min width so a row of badges lines up (use short labels). */
export const BADGE = {
  /** Base frame only; pair with tone classes (see workers list `statusStyles`). */
  status: pillBadgeFrame,
  /** Inbox / queue “pending” style */
  pending: `${pillBadgeFrame} bg-amber-50 uppercase tracking-wide text-amber-900 ring-amber-200/90 dark:bg-amber-950/50 dark:text-amber-100 dark:ring-amber-800`,
  /** Work sessions table — same shell as {@link BADGE.status} + fleet-compatible tones */
  sessionRunning: `${pillBadgeFrame} bg-emerald-50 text-emerald-800 ring-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-100 dark:ring-emerald-900/50`,
  sessionWaiting: `${pillBadgeFrame} bg-amber-50 text-amber-900 ring-amber-200 dark:bg-amber-950/35 dark:text-amber-100 dark:ring-amber-900/40`,
  sessionCompleted: `${pillBadgeFrame} bg-zinc-100 text-zinc-700 ring-zinc-200 dark:bg-zinc-800 dark:text-zinc-200 dark:ring-zinc-600`,
  sessionFailed: `${pillBadgeFrame} bg-red-100 text-red-900 ring-red-200 dark:bg-red-950/60 dark:text-red-100 dark:ring-red-900/50`,
  sessionDefault: `${pillBadgeFrame} bg-zinc-100 text-zinc-700 ring-zinc-200 dark:bg-zinc-800 dark:text-zinc-200 dark:ring-zinc-600`,
} as const;
