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
  /** Inline / table-style controls — text inputs only; never use on `<select>` */
  controlCompact:
    "w-full max-w-[13rem] rounded-md border border-zinc-200 bg-white px-2 py-1.5 text-xs text-zinc-900 shadow-sm outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 disabled:opacity-60 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100",
  /** Multi-line text — capped width (narrow panels) */
  textarea:
    "w-full max-w-3xl rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 disabled:opacity-60 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100",
  /** Multi-line text — full width of the form card */
  textareaFull:
    "block w-full min-w-0 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 disabled:opacity-60 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100",
  /** Full-width control inside cards and wide panels (no max-width cap) */
  controlFull:
    "block w-full min-w-0 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 disabled:opacity-60 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100",
  /** Select controls — always pair with {@link FORM.selectChevronWrap} + {@link FORM.selectChevron} (use `InsetSelect` / `FormSelect`) */
  selectFull:
    "block w-full min-w-0 appearance-none rounded-lg border border-zinc-200 bg-white py-2 pl-3 pr-10 text-sm text-zinc-900 shadow-sm outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 disabled:opacity-60 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100",
  select:
    "w-full max-w-xl appearance-none rounded-lg border border-zinc-200 bg-white py-2 pl-3 pr-10 text-sm text-zinc-900 shadow-sm outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 disabled:opacity-60 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100",
  /** Table / toolbar selects — inset chevron via {@link FORM.selectChevronCompact} */
  selectCompact:
    "w-full max-w-[13rem] appearance-none rounded-md border border-zinc-200 bg-white py-1.5 pl-2 pr-8 text-xs text-zinc-900 shadow-sm outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 disabled:opacity-60 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100",
} as const;

/** Personal-information form layout, validation, and requirement hints. */
export const FORM = {
  labelRow: "mb-1.5 flex items-baseline justify-between gap-2",
  requiredMark: "shrink-0 text-xs font-normal text-rose-600 dark:text-rose-400",
  requiredAsterisk: "text-rose-600 dark:text-rose-400",
  hint: "mt-1 text-xs text-zinc-500 dark:text-zinc-400",
  error: "mt-1 text-xs text-rose-600 dark:text-rose-400",
  validationList: "mt-1.5 space-y-0.5",
  validationItem: "flex items-center gap-1.5 text-xs",
  validationMet: "text-emerald-600 dark:text-emerald-400",
  validationPending: "text-zinc-500 dark:text-zinc-400",
  invalidControl:
    "border-rose-500 focus:border-rose-500 focus:ring-rose-500 dark:border-rose-500",
  /** Label above control — use `FormField` instead of `<label><span className={FIELD.label}>` + `mt-1` */
  fieldStack: "flex flex-col gap-1.5",
  selectChevronWrap: "relative",
  /** Inset from right edge — not flush to border (matches Gender reference) */
  selectChevron:
    "pointer-events-none absolute right-3.5 top-1/2 h-0 w-0 -translate-y-1/2 border-x-[5px] border-x-transparent border-t-[6px] border-t-zinc-500 dark:border-t-zinc-400",
  selectChevronCompact:
    "pointer-events-none absolute right-2.5 top-1/2 h-0 w-0 -translate-y-1/2 border-x-[4px] border-x-transparent border-t-[5px] border-t-zinc-500 dark:border-t-zinc-400",
  fieldGroup: "grid gap-4 md:grid-cols-2",
  nameGroup: "grid gap-4 md:grid-cols-4",
} as const;

/** Read-only profile / settings field grids (view mode). */
export const PROFILE = {
  readonlyField: "space-y-0.5",
  readonlyFieldItem: "w-max shrink-0",
  readonlyFieldItemWide: "w-max max-w-[16rem] shrink-0",
  readonlyLabel: "text-xs leading-none",
  readonlyValue: "text-sm leading-snug text-zinc-900 dark:text-zinc-100",
  /** Four-column read-only grid — columns hug content; skip columns via col-start (e.g. Username → col 3). */
  viewGrid4Col:
    "grid grid-cols-[repeat(4,max-content)] items-start gap-x-10 gap-y-6",
  /** Name + username block (cols 2–4) — nudge left as one unit under Title / beside Display Name. */
  viewGrid4ColBlock:
    "col-span-3 col-start-2 row-span-2 -ml-6 grid grid-cols-[repeat(3,max-content)] items-start gap-x-10 gap-y-6",
  /** Two-column read-only grid — paired fields (e.g. street + line 2, city + state). */
  viewGrid2Col:
    "grid grid-cols-[repeat(2,max-content)] items-start gap-x-4 gap-y-2",
  viewStack: "space-y-3",
  sectionLabelGap: "mt-1.5",
} as const;

/** Premium profile / identity surfaces — soft containers, minimal borders. */
export const PROFILE_CARD = {
  shell:
    "rounded-2xl border border-zinc-200/70 bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_32px_rgba(0,0,0,0.04)] dark:border-zinc-800/70 dark:bg-zinc-950 dark:shadow-[0_1px_2px_rgba(0,0,0,0.2),0_8px_32px_rgba(0,0,0,0.25)]",
  shellEditing:
    "ring-1 ring-sky-500/15 bg-zinc-50/40 dark:bg-zinc-900/30",
  heroShell:
    "rounded-2xl border border-zinc-200/70 bg-gradient-to-br from-white via-white to-zinc-50/80 p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_40px_rgba(0,0,0,0.05)] dark:border-zinc-800/70 dark:from-zinc-950 dark:via-zinc-950 dark:to-zinc-900/80",
  metricTile:
    "flex h-full min-h-[5.75rem] flex-col rounded-xl border border-zinc-200/60 bg-zinc-50/50 px-4 py-3 dark:border-zinc-800/60 dark:bg-zinc-900/40",
  metricLabel: "line-clamp-2 min-h-[2rem] text-[11px] font-medium leading-4 tracking-wide text-zinc-500 dark:text-zinc-400",
  metricValue: "mt-auto flex min-h-8 items-end text-2xl font-semibold tabular-nums leading-none tracking-tight text-zinc-900 dark:text-zinc-50",
  metricValueStatus:
    "mt-auto flex min-h-8 items-center whitespace-nowrap text-xs font-semibold leading-none",
  metaLabel: "text-[11px] font-medium tracking-wide text-zinc-500 dark:text-zinc-400",
  metaValue: "text-sm text-zinc-800 dark:text-zinc-200",
  /** Hero field columns beside avatar — 2 stacks (Username/Email/TZ · Status/Phone/Location). */
  heroMetaColumns: "grid grid-cols-[repeat(2,max-content)] items-start gap-x-10",
  heroMetaStack: "flex flex-col gap-4",
  heroStatsGrid:
    "grid w-full shrink-0 auto-rows-fr grid-cols-3 gap-3 sm:max-w-md xl:w-[26rem]",
  sectionTitle: "text-base font-semibold tracking-tight text-zinc-900 dark:text-zinc-100",
  sectionDescription: "mt-0.5 text-sm text-zinc-500 dark:text-zinc-400",
  accessRow:
    "flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left transition hover:bg-zinc-50 dark:hover:bg-zinc-900/60",
  accessRowLabel: "text-sm font-medium text-zinc-800 dark:text-zinc-200",
  accessRowMeta: "text-xs tabular-nums text-zinc-500 dark:text-zinc-400",
  editLink:
    "text-xs font-medium text-zinc-500 transition hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200",
} as const;

/** Label + value row layout for company profile cards */
export const COMPANY_FORM_ROW =
  "grid gap-1 sm:grid-cols-[minmax(10rem,14rem)_minmax(0,1fr)] sm:items-center sm:gap-x-6";
export const COMPANY_FORM_ROW_TOP =
  "grid gap-1 sm:grid-cols-[minmax(10rem,14rem)_minmax(0,1fr)] sm:items-start sm:gap-x-6";

/**
 * Button-style control tokens (`<button>` or `<Link className={BUTTON.*}>`).
 *
 * **Groups**
 * - **Toolbar row** (`min-h-9`, ~`min-w-[8.5rem]`): `primaryRow`, `secondaryRow`, `ghostRow`, `dangerRow`,
 *   `approveRow`, `rejectRow`, `editRow`, `addRow`, `primaryRowUniform`, `secondaryRowUniform`, `secondaryCardAction`, …
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
  /** Approve — outlined emerald, pairs visually with editRow */
  approveOutlineRow:
    "inline-flex min-h-9 min-w-[8.5rem] shrink-0 items-center justify-center rounded-lg border border-emerald-300 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-50 dark:hover:bg-emerald-900/60",
  /** Reject — outlined red, pairs visually with editRow */
  rejectOutlineRow:
    "inline-flex min-h-9 min-w-[8.5rem] shrink-0 items-center justify-center rounded-lg border border-red-300 bg-red-50 px-4 py-2 text-sm font-semibold text-red-950 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-100 dark:hover:bg-red-950/30",
  /**
   * Add / create — outlined black zinc, same row family as {@link BUTTON.editRow}.
   * Page headers: label as `Add {Entity}` (e.g. Add Project, Add LiNKbot, Add Skill).
   */
  addRow:
    "inline-flex min-h-9 min-w-[8.5rem] shrink-0 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-100 px-4 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-200 dark:bg-zinc-900 dark:text-zinc-50 dark:hover:bg-zinc-800",
  /** Text-only edit link aligned with button rows */
  editTextLink:
    "inline-flex min-h-9 items-center text-sm font-semibold text-sky-700 underline-offset-2 hover:underline dark:text-sky-400",
  /** Compact sky outline — “open editor” / edit affordance; not the same weight as {@link BUTTON.primaryCompact}. */
  editCompact:
    "inline-flex min-h-8 min-w-[5.25rem] shrink-0 items-center justify-center rounded-lg border border-sky-300 bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-950 transition hover:bg-sky-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-sky-700 dark:bg-sky-950/40 dark:text-sky-100 dark:hover:bg-sky-900/60",
  /** Card-header edit — uniform width with Save, Cancel, and + Add on profile section cards. */
  editTight:
    "inline-flex min-h-8 w-[4.125rem] shrink-0 items-center justify-center rounded-lg border border-sky-300 bg-sky-50 px-2.5 py-1.5 text-sm font-semibold text-sky-950 transition hover:bg-sky-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-sky-800 dark:bg-sky-950/40 dark:text-sky-50 dark:hover:bg-sky-900/60",
  /** Card edit-mode primary — uniform width (Save). */
  primaryTight:
    "inline-flex min-h-8 w-[4.125rem] shrink-0 items-center justify-center rounded-lg bg-zinc-900 px-2.5 py-1.5 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200",
  /** Card edit-mode secondary — uniform width (Cancel); sets width for the tight action group. */
  secondaryTight:
    "inline-flex min-h-8 w-[4.125rem] shrink-0 items-center justify-center rounded-lg border border-zinc-300 bg-white px-2.5 py-1.5 text-sm font-medium text-zinc-900 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:bg-zinc-900",
  /** Card edit-mode ghost — uniform width (+ Add). */
  ghostTight:
    "inline-flex min-h-8 w-[4.125rem] shrink-0 items-center justify-center rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-sm font-medium text-zinc-800 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:bg-zinc-900",
} as const;

/** Vertical stack so every button stretches to the same width (max-w-xs). */
export const STACK = {
  actions: "flex w-full max-w-xs flex-col gap-2",
} as const;

/**
 * Table column headers — Title Case, semibold (soft-bold), never ALL CAPS.
 *
 * - Apply {@link TABLE.thead} (or {@link TABLE.theadBordered}) on `<thead>`.
 * - Apply {@link TABLE.thText} on text columns (header aligns left with row text).
 * - Apply {@link TABLE.thControl} on badge, toggle, and icon columns (header centered with row controls).
 * - Apply {@link TABLE.thNumeric} on numeric / timestamp columns (header aligns right with row values).
 * - Label copy: Title Case ("Work Streams", "Module", "Plane Sync") via {@link formatTableColumnLabel}.
 * - Do not use `uppercase`, `tracking-wide`, or `sr-only` for column titles — headers must show readable text.
 * - Icon-only affordances belong in row cells; header cells still include the text label.
 */
export const TABLE = {
  thead: "bg-zinc-50 text-xs font-semibold text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400",
  theadBordered:
    "border-b border-zinc-200 bg-zinc-50 text-xs font-semibold text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-400",
  thText: "text-left font-semibold",
  thControl: "text-center font-semibold",
  thNumeric: "text-right font-semibold",
  /** Center label or control inside narrow `table-fixed` columns */
  thControlInner: "flex w-full items-center justify-center gap-1 whitespace-nowrap",
} as const;

/**
 * Data Table — columnar `<table>` surfaces (catalogues, leases, audit logs).
 * Pair with {@link DataTableShell} and {@link DataTableIconAction} / {@link TableBoolToggle}.
 */
export const DATA_TABLE = {
  shell: "rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950",
  scrollX: "overflow-x-auto",
  scrollBody: "max-h-[min(70vh,32rem)] overflow-y-auto overscroll-y-contain",
  table: "w-full table-fixed divide-y divide-zinc-200 text-left text-sm dark:divide-zinc-800",
  tbody: "divide-y divide-zinc-100 dark:divide-zinc-800",
  /** Equal row height within a table; tall cell content clamps inside. */
  tr: "h-[4.5rem] align-middle text-zinc-800 dark:text-zinc-200",
  /** Single-line catalogue / settings lists — pair with {@link DATA_TABLE.tdCompactInset}. */
  trCompact: "h-9 align-middle text-zinc-800 dark:text-zinc-200",
  /** Rows with up to 3 lines of wrapped text in a cell (catalogue description). */
  trMultiline: "h-[5.5rem] align-middle text-zinc-800 dark:text-zinc-200",
  td: "px-3 py-3 align-middle",
  tdInset: "px-4 py-3 align-middle",
  tdCompactInset: "px-4 py-1.5 align-middle",
  /** Required on `table-fixed` text columns so truncate / line-clamp does not bleed into neighbors. */
  tdClip: "overflow-hidden max-w-0",
  tdText: "block min-w-0 truncate",
  tdWrap: "block min-w-0 line-clamp-3 text-xs leading-snug text-zinc-600 dark:text-zinc-400",
  tdControl: "text-center",
  tdNumeric: "whitespace-nowrap text-right tabular-nums",
  actionsRow: "flex items-center justify-center gap-3",
  emptyCell: "px-4 py-6 text-sm text-zinc-500 dark:text-zinc-400",
} as const;

/**
 * Action Queue — full-width feed rows (alerts, messages, sessions) with left accent stripe.
 * Not an HTML `<table>`. Use {@link ActionQueueList} + {@link ActionQueueRow}.
 */
export const ACTION_QUEUE = {
  list: "divide-y divide-zinc-100 overflow-hidden rounded-xl border border-zinc-200 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-950",
  listScroll: "max-h-[min(70vh,32rem)] overflow-y-auto overscroll-y-contain",
  /** Shared row height band — subtitle clamps to keep rows even. */
  rowMinH: "min-h-[5.5rem]",
  rowMaxH: "max-h-[5.5rem]",
  rowLink:
    "flex min-w-0 flex-1 items-stretch gap-0 text-left text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400/80 focus-visible:ring-offset-2 dark:focus-visible:ring-zinc-500",
  rowMain: "flex min-w-0 flex-1 flex-col justify-center gap-1 px-4 py-3",
  rowTitleRow: "flex min-w-0 items-center gap-2 font-medium leading-4 text-zinc-900 dark:text-zinc-100",
  rowSubtitle: "min-w-0 truncate pl-6 text-xs leading-4 text-zinc-600 dark:text-zinc-400",
  rowMeta: "min-w-0 truncate pl-6 text-xs leading-4 text-zinc-400 dark:text-zinc-500",
  rowNavigate: "flex shrink-0 items-center self-center px-3 text-zinc-400 dark:text-zinc-500",
  rowActionRail: "flex shrink-0 items-center justify-center gap-3 self-stretch px-3",
  icon: "h-4 w-4 shrink-0",
  navigateIcon: "h-4 w-4 shrink-0",
  actionIcon: "h-4 w-4 shrink-0",
} as const;

/**
 * Shell chrome — breadcrumb row + page title block shared by every `(shell)` route.
 *
 * - Row 1: {@link SHELL.breadcrumbRow} wraps {@link SHELL.breadcrumbNav} + toolbar (see `ShellMainFrame`).
 * - Row 2: {@link SHELL.pageHeader} via `ShellPageHeader` / `ShellPageHeaderClient` — Title Case title, one-line subtitle.
 * - Do not duplicate breadcrumbs or page titles inside page `main` content.
 */
export const SHELL = {
  /** Breadcrumb + refresh/help toolbar row (LiNKaios / Work). */
  breadcrumbRow: "mb-4 flex min-h-[1.75rem] items-center justify-between gap-3",
  breadcrumbNav: "text-left text-sm text-zinc-500 dark:text-zinc-400",
  breadcrumbList: "flex flex-wrap items-center gap-x-1.5 gap-y-1",
  breadcrumbSep: "text-zinc-300 dark:text-zinc-600",
  breadcrumbLink:
    "text-zinc-500 hover:text-zinc-800 hover:underline dark:text-zinc-400 dark:hover:text-zinc-200",
  breadcrumbCurrent: "font-medium text-zinc-900 dark:text-zinc-100",
  /** Wrapper when the auto header injects above page content. */
  autoPageHeaderWrap: "mb-8",
  pageHeader: "pb-2",
  pageTitle: "text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100",
  /** Subtitle row — subtitle and header actions share a baseline (actions align with subtitle bottom). */
  pageSubtitleRow: "mt-1 flex flex-wrap items-end justify-between gap-x-4 gap-y-2",
  pageSubtitle: "min-w-0 flex-1 text-sm text-zinc-500 dark:text-zinc-400",
  /** @deprecated Use {@link SHELL.pageSubtitleRow} + {@link SHELL.pageSubtitle}. */
  pageActionsRow: "flex flex-wrap items-start justify-between gap-4",
  pageActions: "flex shrink-0 flex-wrap items-center gap-2",
} as const;

/**
 * Titled content cards — icon left of title (Settings hub, profile sections, company cards).
 * Use {@link TitledCardHeader} from `@/components/titled-card-header`.
 */
export const CARD = {
  titleIconWrap: "mt-0.5 shrink-0 text-zinc-700 dark:text-zinc-300",
  titleIcon: "h-5 w-5",
  title: "text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-100",
  titleMd: "text-base font-semibold text-zinc-900 dark:text-zinc-100",
  description: "mt-1 text-sm text-zinc-600 dark:text-zinc-400",
  /** Align card body with description when header uses title icon (w-5 + gap-3). */
  contentInset: "pl-8",
} as const;

/**
 * Summary metric cards — icon + Title Case title, primary metric, optional preview line,
 * optional status pill overlapping the top-right corner (Work streams, lifecycle summaries, fleet stats).
 *
 * Use {@link SummaryMetricCard} + {@link SummaryMetricCardGrid}. Rows stretch so metric and preview lines align.
 */
export const SUMMARY_METRIC_CARD = {
  grid: "grid auto-rows-fr items-stretch gap-3 sm:grid-cols-2 lg:grid-cols-4",
  gridDense: "grid auto-rows-fr items-stretch gap-3 sm:grid-cols-2 lg:grid-cols-5",
  /** Default shell when no lifecycle/tone surface override is passed. */
  surfaceDefault: "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950",
  shell:
    "relative flex h-full flex-col overflow-visible rounded-xl border p-4 pt-4 shadow-sm transition hover:-translate-y-px hover:shadow-md",
  badgeWrap: "pointer-events-none absolute right-3 top-0 z-10 -translate-y-1/2",
  /** Single-line icon + title — as high as possible below corner badge; reserve pill width on the right. */
  titleRow:
    "mt-0 flex items-center gap-2 pr-[calc(var(--status-pill-width-ch,14)*1ch+0.75rem)]",
  titleRowPlain: "flex items-center gap-2",
  titleIcon: "h-4 w-4 shrink-0 text-zinc-500 dark:text-zinc-400",
  titleText: "whitespace-nowrap text-xs font-semibold leading-4 text-zinc-700 dark:text-zinc-300",
  body: "mt-3 flex min-h-0 flex-1 flex-col",
  metric: "shrink-0 text-3xl font-semibold leading-none tabular-nums text-zinc-900 dark:text-zinc-50",
  metricCompact: "shrink-0 text-2xl font-semibold leading-none tabular-nums text-zinc-900 dark:text-zinc-100",
  preview: "mt-2 min-h-[2rem] flex-1 line-clamp-2 text-xs leading-4 text-zinc-600 dark:text-zinc-400",
  footer: "mt-auto shrink-0 pt-3",
  sectionLabel: "text-xs font-semibold text-zinc-500 dark:text-zinc-400",
  sectionLabelWithIcon: "flex items-center gap-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400",
  /** Space between section label and card grid. */
  sectionContentGap: "mt-3",
} as const;

const SHELL_TITLE_PRESERVE = new Set([
  "LiNKaios",
  "LiNKbots",
  "LiNKbot",
  "LiNKbrain",
  "LiNKskills",
  "LiNKapps",
  "LiNKautowork",
  "LinkSkills",
  "LinkSites",
  "Linktrend",
  "LEXOS",
  "MVO",
  "API",
  "CEO",
  "CTO",
  "GDPR",
  "SMB",
]);

/**
 * Title Case for UI copy — capitalize the first letter of **each word**.
 * Preserves LiNK* / Link* product names and entries in {@link SHELL_TITLE_PRESERVE}.
 *
 * Use for shell page titles, section headings (h2/h3), form field labels, sidebar/nav
 * items, and table column headers. Do **not** use CSS `uppercase` or ALL CAPS for these.
 *
 * **Not** for: page subtitles (sentence case), status pill labels, or body/helper text.
 */
export function formatUiLabel(label: string): string {
  return formatShellPageTitle(label);
}

/** Shell page titles — same rules as {@link formatUiLabel}. */
export function formatShellPageTitle(title: string): string {
  return title
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => {
      if (SHELL_TITLE_PRESERVE.has(word)) return word;
      if (/^LiNK[A-Za-z]/.test(word) || /^Link[A-Za-z]/.test(word)) return word;
      if (word.includes("&")) {
        return word
          .split("&")
          .map((part) => {
            const t = part.trim();
            if (!t) return t;
            const lower = t.toLowerCase();
            return lower.charAt(0).toUpperCase() + lower.slice(1);
          })
          .join(" & ");
      }
      const lower = word.toLowerCase();
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join(" ");
}

/** Summary metric card titles — Title Case; preserves LiNK* product names. */
export function formatCardTitle(title: string): string {
  return formatShellPageTitle(title);
}

/** Metrics KPI labels — only the first character is capitalised. */
export function formatMetricsCardTitle(title: string): string {
  const trimmed = title.trim();
  if (!trimmed) return trimmed;
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

/** Title Case label from snake_case keys (e.g. `user_id` → `User Id`). */
export function formatTableColumnLabel(key: string): string {
  return formatShellPageTitle(key.trim().replace(/_/g, " ").replace(/\s+/g, " "));
}

/**
 * Canonical Title Case labels for common shell table columns.
 * Prefer these (or {@link formatTableColumnLabel}) over hand-typed header copy.
 */
export const TABLE_COLUMN = {
  name: "Name",
  suite: "Suite",
  module: "Module",
  phase: "Phase",
  /** Legacy key — catalogue module column (Suite → Module hierarchy). */
  projectType: "Module",
  issue: "Issue",
  planeSync: "Plane Sync",
  actions: "Actions",
  category: "Category",
  description: "Description",
  status: "Status",
  version: "Version",
  updated: "Updated",
  title: "Title",
  summary: "Summary",
  agent: "Agent",
  project: "Project",
  lastActivity: "Last Activity",
  capability: "Capability",
  run: "Run",
  requested: "Requested",
  expires: "Expires",
  targetSoftware: "Target Software",
  usedByModules: "Used By Modules",
  time: "Time",
  event: "Event",
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
  "inline-flex min-w-[6.75rem] shrink-0 justify-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 tabular-nums";

/** Status / lifecycle chips: fixed min width so a row of badges lines up (use short labels). */
export const BADGE = {
  /** Base frame only; pair with tone classes (see workers list `statusStyles`). */
  status: pillBadgeFrame,
  /** Inbox / queue “pending” style */
  pending: `${pillBadgeFrame} bg-yellow-50 text-yellow-900 ring-yellow-200 dark:bg-yellow-950/50 dark:text-yellow-100 dark:ring-yellow-700`,
  /** Work sessions table — same shell as {@link BADGE.status} + fleet-compatible tones */
  sessionRunning: `${pillBadgeFrame} bg-sky-50 text-sky-800 ring-sky-200 dark:bg-sky-950/40 dark:text-sky-100 dark:ring-sky-800`,
  sessionWaiting: `${pillBadgeFrame} bg-yellow-50 text-yellow-900 ring-yellow-200 dark:bg-yellow-950/35 dark:text-yellow-100 dark:ring-yellow-700`,
  sessionCompleted: `${pillBadgeFrame} bg-emerald-50 text-emerald-800 ring-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-100 dark:ring-emerald-800`,
  sessionFailed: `${pillBadgeFrame} bg-red-100 text-red-900 ring-red-300 dark:bg-red-950/60 dark:text-red-100 dark:ring-red-800`,
  sessionDefault: `${pillBadgeFrame} bg-zinc-100 text-zinc-700 ring-zinc-300 dark:bg-zinc-800 dark:text-zinc-200 dark:ring-zinc-600`,
} as const;
