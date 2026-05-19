# LiNKaios UI/UX Review Backlog

Maintained by the LiNKaios UI/UX review agent.  
Each item includes Codex-ready implementation context.  
Status: `open` | `in-progress` | `fixed`

---

## Page: `/` — Overview / Home

### UIUX-HOME-002 — Mobile sidebar: no collapse/drawer at <768px
**Status:** open  
**Effort:** complex/long  
**Category:** responsiveness

**Observed problem:**  
The sidebar (`shell-sidebar.tsx`) is always rendered at a fixed `w-60` (240px) with no hamburger/toggle or mobile drawer. At 390px viewport the content area shrinks to ~150px — the app is not usable on tablet or small laptop screens.

**Desired improvement:**  
- Add a hamburger button to the top of the main content area (or in the sidebar itself) visible below `md` breakpoint  
- Slide the sidebar in as a drawer with an overlay/backdrop on mobile  
- Collapse by default at `<md`; expand on click  
- Close on nav link click (use `usePathname` effect already in place)

**Likely files to inspect:**  
- `LiNKaios/linkaios-web/src/components/shell-sidebar.tsx`  
- `LiNKaios/linkaios-web/src/components/shell-layout.tsx`  
- `LiNKaios/linkaios-web/src/components/shell-main-frame.tsx`

**Recommended approach:**  
1. Wrap the sidebar in an `md:relative md:translate-x-0` pattern; at mobile use `fixed inset-y-0 left-0 z-50 -translate-x-full transition-transform` and toggle a `data-open` state  
2. Add a hamburger `<button>` in the top-left of the main scroll area (below `md` only); clicking it sets state  
3. Add a dark overlay `<div>` behind the open sidebar on mobile that closes it on click  
4. This is a client-side state change — `shell-sidebar.tsx` is already `"use client"` so the state can live there or be lifted to `shell-layout.tsx`

**Acceptance criteria:**  
- At 390px, sidebar is hidden by default; hamburger is visible  
- Clicking hamburger opens sidebar as a drawer with overlay  
- Clicking a nav link closes the drawer  
- At ≥768px, sidebar is always visible with no hamburger  

**Verification steps:**  
- Resize browser to 390px, confirm sidebar hidden and hamburger visible  
- Open sidebar, click nav item, confirm sidebar closes  
- Resize to 1280px, confirm sidebar always visible

**Browser evidence:** Desktop screenshot captured 2026-05-19 session — mobile viewport shows crushed layout.

---

### UIUX-HOME-007 — System status banner: redesign with better structure, remove Settings link
**Status:** open  
**Effort:** medium  
**Category:** visual polish / UX/workflow

**Observed problem:**  
The system status banner is `sticky top-0 z-20`, variable in height (up to ~140px with two issues), and permanently obscures content as you scroll. The banner design mixes a shield icon, small "SYSTEM STATUS" uppercase label, a large "Attention" H-level text, a summary sentence, a divider, and a bulleted issue list — all in one flat section. The top-right "Settings" link is generic; operators don't know what settings to change for a given issue.

**User note:** "I think you need to re-design this section much better with icons and better UI/UX. I don't understand why the Settings link."

**Desired improvement:**  
- Remove the static "Settings" link; each issue item already links to the relevant config page — that is sufficient
- Remove sticky behaviour or collapse to a slim one-line status bar (icon + label + count badge) that expands on click/hover, like a system health chip  
- Collapsed state example: `[shield icon] System: Attention (2 issues) ▾`  
- Expanded state shows the issue list inline below  
- Use distinct severity icons per issue line: `AlertCircle` (info/blue), `AlertTriangle` (warning/amber), `XCircle` (critical/red)  
- Each issue row should show icon + short label + a right-aligned "Fix →" chevron link rather than a plain `→` arrow text  

**Likely files to inspect:**  
- `LiNKaios/linkaios-web/src/components/overview-home.tsx` — `OverviewHome` function, `statusBarTone`, `statusLabel`  
- `LiNKaios/linkaios-web/src/lib/overview-dashboard.ts` — `SystemStatusLevel`, `SystemStatusIssue` types

**Recommended approach:**  
1. Make the section a `"use client"` component or extract a `SystemStatusBanner` client component  
2. Keep it non-sticky; place it at the top of the overview page content  
3. Implement collapsed/expanded toggle with `useState`  
4. Collapsed: single row pill with coloured dot + label + issue count + chevron  
5. Expanded: issue list slides in below using `grid-template-rows` transition  
6. Remove the `<Link href="/settings">Settings</Link>` entirely  

**Acceptance criteria:**  
- Banner is not sticky; does not obscure scrolling content  
- Collapsed state shows severity + count in a single row  
- Expanded state shows each issue with appropriate icon and direct link  
- No generic "Settings" link present  

**Verification steps:**  
- Scroll the overview page; confirm banner does not follow viewport  
- Click banner to expand/collapse; confirm transition  
- Confirm each issue line links to the correct page

---

### UIUX-HOME-010 — No last-refreshed timestamp on overview dashboard data
**Status:** open  
**Effort:** medium  
**Category:** information architecture

**Observed problem:**  
The overview shows live metrics (workforce counts, work counts, projects summary) with no indication of when they were loaded. In a control plane context, operators need to know if they're looking at stale data.

**Desired improvement:**  
Display a "Refreshed just now" or "Refreshed 2 min ago" line somewhere unobtrusive on the page — e.g. in small muted text below the "Control Overview" heading, or as a tooltip on the summary cards.

**Likely files to inspect:**  
- `LiNKaios/linkaios-web/src/components/overview-home.tsx`  
- `LiNKaios/linkaios-web/src/app/(shell)/page.tsx` — the server component that loads data and passes to `OverviewHome`  
- `LiNKaios/linkaios-web/src/lib/overview-dashboard.ts`

**Recommended approach:**  
1. Pass a `fetchedAt: Date` from the server page into `OverviewData` or as a separate prop  
2. Create a small client component `<RefreshedAt fetchedAt={fetchedAt} />` that renders "Refreshed X ago" using `useEffect` + `Date.now()` difference  
3. Render it below the `Control Overview` heading in a muted `text-xs text-zinc-400` style  
4. Optionally add a refresh button that calls `router.refresh()`

**Acceptance criteria:**  
- A "Refreshed X ago" timestamp is visible on the overview page  
- The time updates without a page reload (client-side relative time)  
- A manual refresh button is present and calls `router.refresh()`

**Verification steps:**  
- Load the overview page; confirm timestamp is visible  
- Wait 60s; confirm timestamp updates to "1 min ago"  
- Click refresh; confirm page data reloads and timestamp resets

---

### UIUX-HOME-011 — Quick actions: 4 buttons should sit in a single row at full width
**Status:** open  
**Effort:** easy/fast  
**Category:** visual polish / responsiveness

**Observed problem:**  
At maximum window width, the four Quick Actions buttons ("Add LiNKbot", "Create project", "Add skill", "Upload to LiNKbrain") wrap to 3+1 instead of a single 4-button row. The row also does not match the full width of the Projects Summary card above it.

**User note:** "On max resize it stays 3 buttons in one line and another in a separate line, all 4 should appear in one line if full window and all 4 together be the same width of the projects summary. On page resize then buttons can become 2x2."

**Current code location:**  
`LiNKaios/linkaios-web/src/components/overview-home.tsx` — "Quick Actions" section  
```tsx
<div className="mt-3 flex flex-wrap gap-2">
```

**Desired improvement:**  
- At full width: 4 equal-width buttons in one row filling the full container width  
- At medium width: 2×2 grid  
- At small width: stacked column

**Recommended approach:**  
Replace `flex flex-wrap gap-2` with a CSS grid:  
```tsx
<div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
```
And make each `<Link>` use `justify-center` so the icon+text is centred within each equal-width cell.  
Remove `BUTTON.primaryRowUniform` fixed width if it constrains the cell; instead let the grid distribute widths equally.

**Likely files to inspect:**  
- `LiNKaios/linkaios-web/src/components/overview-home.tsx`  
- `LiNKaios/linkaios-web/src/lib/ui-standards.ts` — check `BUTTON.primaryRowUniform` definition

**Acceptance criteria:**  
- At ≥1024px: 4 buttons in one row, equal width, spanning the same width as the Projects Summary card  
- At 640–1023px: 2×2 grid  
- At <640px: 2×2 or stacked (2 columns minimum)  
- All buttons remain fully readable at all sizes

**Verification steps:**  
- Resize from 390px to 1440px; confirm button layout transitions correctly  
- At 1280px, visually confirm all 4 buttons are in one row aligned with the Projects Summary width

---

### UIUX-HOME-012 — System status banner: full redesign with icons (combined with 007)
**Status:** open (linked with UIUX-HOME-007)  
**Effort:** medium  
**Category:** visual polish / UX/workflow

**Observed problem:**  
Same root issue as UIUX-HOME-007. This item captures the full redesign scope specifically noted by the user.

**User note:** "I think you need to re-design this section much better with icons and better UI/UX."

**Implementation notes:**  
See UIUX-HOME-007 for full details. Implement these together as a single unit.  
Key additions from this item:  
- Each issue type (LLM API issue, tools in draft, auth issue, schema issue) should have a purpose-specific icon, not a generic arrow  
- Example icon mapping: `Zap` for LLM API, `Wrench` for tools in draft, `ShieldAlert` for auth/schema  
- Use coloured icon + coloured background chip per issue row  

---

---

## Page: `/work/messages` — Messages

### UIUX-MESSAGES-010 — Slack and Telegram tabs not yet wired; placeholder shown
**Status:** open  
**Effort:** complex/long (gateway work, not UI)  
**Category:** UX/workflow

**Observed behaviour:**  
Clicking the Slack or Telegram tab shows: "Slack/Telegram is not wired yet. When the gateway stores those threads, they will appear in this tab with the same LiNKbot filter as Zulip."

**Confirmed by code inspection:** The `WorkMessagesWorkspace` component already handles the 2-panel layout generically. The `filteredThreads` logic currently hard-filters to Zulip threads only (`isZulipThread`). When gateway support for Slack/Telegram is added, the filter just needs to include those channel tags.

**What is needed to complete this:**  
1. Gateway: store Slack/Telegram threads in the gateway schema (e.g. `gateway.slack_message_links`, `gateway.telegram_message_links`) or add channel tag to `zulip_message_links`  
2. Server page (`work/messages/page.tsx`): fetch Slack and Telegram threads alongside Zulip  
3. `work-messages-workspace.tsx`: update `isZulipThread` → `isChannelThread(channel)` and update `filteredThreads` to filter by `productChannel`  
4. The placeholder blocks can then be removed

**Likely files:**  
- `LiNKaios/linkaios-web/src/app/(shell)/work/work-messages-workspace.tsx`  
- `LiNKaios/linkaios-web/src/app/(shell)/work/messages/page.tsx`  
- `LiNKaios/linkaios-web/src/lib/work-messages.ts`  
- Gateway schema migrations

**Acceptance criteria:**  
- Clicking Slack tab shows Slack threads in the same 2-panel layout as Zulip  
- Clicking Telegram tab shows Telegram threads in the same layout  
- "Not wired yet" placeholder is removed when gateway data exists

---

## Page: `/workers` and `/workers/[id]/*` — LiNKbots section

### UIUX-WORKERS-001 — Double breadcrumb on worker detail pages
**Status:** open  
**Effort:** medium  
**Category:** information architecture

**Observed problem:**  
Every `/workers/[id]/*` page renders two breadcrumb paths simultaneously:
1. The shell breadcrumb (`LiNKaios / LiNKbots / Lisa (CEO) / Sessions`) at the top right
2. An inline breadcrumb inside `WorkerDetailHeader` (`LiNKbots / Lisa (CEO)`) just above the H1

The inline one is redundant; the shell handles navigation context consistently across all pages.

**Desired improvement:**  
Remove the inline `<p>` breadcrumb from `WorkerDetailHeader`. The component can display agent identity via the H1 and role line alone.

**Likely files:**  
- `LiNKaios/linkaios-web/src/components/worker-detail-header.tsx` — remove the `<p>` element containing the `LiNKbots / Lisa` breadcrumb (lines ~18–24)

**Acceptance criteria:**  
- Worker detail pages show only the shell breadcrumb
- H1, role, description, and status card remain unchanged
- No layout regressions on Sessions, Projects, LiNKskills, Models, LiNKbrain, Settings sub-tabs

**Verification:**  
- Navigate to `/workers/demo-lisa/sessions` and confirm only one breadcrumb path visible

---

### UIUX-WORKERS-002 — Status card values are plain text with no color signal
**Status:** open  
**Effort:** medium  
**Category:** visual polish

**Observed problem:**  
The status card on each worker detail page shows "Registry", "Presence", and "Current activity" as plain right-aligned text (e.g. "Active", "Online · busy"). There is no color coding, pill, or icon to communicate health at a glance. A user has to read every word to understand the agent's state.

**Desired improvement:**  
Replace the plain `<dd>` text for Registry and Presence with small color-coded pills:
- Registry: "Active" → emerald pill, "Inactive" → zinc pill, "Retired" → yellow pill (matching `statusStyles` in workers/page.tsx)
- Presence: "Online · busy" → emerald, "Online · idle" → sky, "Standby/Offline" → zinc (matching `uxBadge`)

Use `BADGE.status` + the same tone functions already defined in `workers/page.tsx` (extract to shared lib if needed).

**Likely files:**  
- `LiNKaios/linkaios-web/src/components/worker-detail-header.tsx`
- `LiNKaios/linkaios-web/src/lib/worker-header-model.ts` (expose `registryStatus` and `presenceUx` as typed fields)
- `LiNKaios/linkaios-web/src/app/(shell)/workers/page.tsx` (extract `statusStyles` / `uxBadge` to shared lib)

**Acceptance criteria:**  
- Registry and Presence rows show a pill badge, not plain text
- Colors match the badges on the workers list/grid view exactly
- Current activity remains as descriptive text (no badge needed)

---

### UIUX-WORKERS-003 — LiNKbrain Entries section has no visual treatment
**Status:** open  
**Effort:** medium  
**Category:** visual polish / information architecture

**Observed problem:**  
The "Entries" section on the LiNKbrain tab shows plain text list items (`<li>` with only a `px-4 py-3` class) — no icon, date, type badge, hover state, or interactive affordance. The Persona stack table above it has clear structure; the Entries section looks unfinished by comparison.

**Desired improvement:**  
Each entry should show:
- A small icon on the left (e.g. `FileText`, `Pin`, or `BookOpen` from lucide-react) matching the entry type
- The entry title in `font-medium`
- A right-aligned mock date or tag (e.g. "pinned", "2026-03-15")
- A hover state consistent with other list rows (`hover:bg-zinc-50`)
- Potentially a link affordance (even if not yet wired)

Update mock data in `DEMO_AGENT_PERSONA` to include `type` and `date` fields on entries.

**Likely files:**  
- `LiNKaios/linkaios-web/src/app/(shell)/workers/[id]/brain/page.tsx`
- `LiNKaios/linkaios-web/src/lib/ui-mocks/worker-ui.ts` (add entry mock structure)

**Acceptance criteria:**  
- Each entry row has an icon, title, and date/tag
- Hover state matches other list items in the app
- No regression on Persona stack table above

---

## Conventions

- IDs are stable: do not renumber existing items when adding new ones  
- Add new items under the relevant page section  
- When an item is implemented: change status to `fixed`, add the commit SHA, and note the files changed  
- Effort labels: `easy/fast` = <1h, `medium` = 1–4h, `complex/long` = 4h+
