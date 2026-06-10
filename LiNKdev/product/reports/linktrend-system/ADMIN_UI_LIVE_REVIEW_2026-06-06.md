# LiNKaios Admin — Live UI Review (2026-06-06)

## Status

- **Review phase:** documentation only (no code changes)
- **Source:** Principal live review on DigitalOcean deployment (`linkdroplet-00`)
- **Deploy reference:** Wave 6/7/10 branch `issue/wave6-7-10-studio-forward` (commit `f6251f7` and related) — this is what DO likely runs; current workspace branch `issue/g1-bootstrap-handlers` does **not** include all Wave 6 sidebar wiring
- **Agreement:** Principal confirmed these items still require work before a targeted development pass
- **Scope:** Admin **Suites** (1–19), **Work** (20–26), **Projects** (27–35, 58), **Metrics** (36–39), **LiNKbots** (40–57), **LiNKskills** (59–63), **LiNKbrain** (64–67), **Clients / Licensees** (68–70), **Settings** (71–78), **Meta** (79)
- **Principal follow-up (2026-06-08):** Projects model **refined** (admin programs, not client bleed); Metrics + LiNKbots reviewed
- **Principal follow-up (final):** LiNKskills, LiNKbrain, Clients/Licensees, Settings, Customer Service gap, executive assessment

## Summary

| Metric | Suites | Work | Projects | Metrics | LiNKbots | LiNKskills | LiNKbrain | Clients | Settings | Meta | **Total** |
|--------|-------:|-----:|---------:|--------:|---------:|-----------:|----------:|--------:|---------:|-----:|----------:|
| Findings | 19 | 7 | 10 | 4 | 18 | 5 | 4 | 3 | 8 | 1 | **79** |
| Blocker | 3 | 1 | 2 | 0 | 1 | 2 | 1 | 2 | 0 | 0 | **12** |
| High | 6 | 3 | 3 | 2 | 5 | 2 | 1 | 1 | 3 | 1 | **27** |
| Medium | 8 | 3 | 4 | 2 | 10 | 1 | 2 | 0 | 4 | 0 | **34** |
| Low | 2 | 0 | 1 | 0 | 2 | 0 | 0 | 0 | 1 | 0 | **6** |

**Suites theme:** The Admin Suites area is largely a **mock/demo scaffold** — composition editing, persistence, Stripe API integration, LiNKbots/Automations tabs, and table lifecycle actions are incomplete or stubbed. Navigation on the live deploy nests LiNKsuitegen and Fleet v1 **outside** the Suites accordion DOM. Title Case and action-column conventions violate LiNKaios UI standards.

**Work theme:** Top **Work stream** cards navigate correctly, but **Alerts** crashes in production, the **Action queue** surfaces raw LiNKbrain/trace JSON instead of human-actionable items, **Messages** shows unconfigured Slack/Telegram tabs and broken Zulip deep links, and **Sessions** action/layout columns do not match operator expectations.

**Projects theme (refined 2026-06-08):** Admin must **not** show **client/licensee projects** (tenant project management bleed). Admin **should** retain a **Projects** section repurposed: each project = **admin program** — vendor/studio work assigned to **admin LiNKbots**, tracked on Plane when applicable. Current `/admin/projects/*` mirrors are still **client bleed** until replaced. Finding **58** captures the target model.

**Metrics theme:** **Live** when `LINKAIOS_UI_MOCKS` is off — aggregates real `linkaios.traces`; **0 / 0%** on DO is a **sparse empty deploy**, not mock math. **Mock** only when `LINKAIOS_UI_MOCKS=1` (`demoMetricsSnapshot()`). Admin **Cost** view is always partly fixture. Direct answer for Principal in **Metrics → Principal answer**.

**LiNKbots theme:** Admin **LiNKbots** monitors **admin linkbots + all deployed linkbots across licensees** (fleet oversight/troubleshoot). **Add LiNKbot** on Admin is **removed** — bot creation belongs in **suite builder/composition** only. **Projects** tab on worker detail: show **only for admin LiNKbots**; **hide for client tenant bots** under monitoring. LiNKbrain tab still **crashes** on `mission_id` (finding 48 / 64).

**LiNKskills theme:** All hub tabs broken on DO — missing migrations (`skills.category_id`, `linkaios.tools`) and Leases tenant-resolution crash (same pattern as Project Leases finding 35).

**LiNKbrain theme:** Admin purpose = **shared vendor brain** (knowledge from all linkbots), not client-tenant memory UI. All memory tabs crash on `memory_entries.mission_id` post-migration 033.

**Clients / Licensees theme:** Nav label **Licensees** is closer to intent than **Company**, but Client **Company / Brand** profile UI still bleeds and **crashes** (`registeredOffice` undefined). Principal wants **Clients / Licensees** registry — consult licensee details, not corporate governance for the studio.

**Settings theme:** Shared Client settings hub bleeds into Admin — delete account, plan/billing, support, licensee integrations inappropriate for licensor operators. **Platform** settings exist but tab visibility depends on role tier.

**Principal meta-assessment (Suites):** *"Quite far from being done"* — every control must be exercised end-to-end before calling that section complete.

**Principal architectural decision (Projects — refined):** Admin does **not** manage **client projects**. Admin **does** need **admin programs** (vendor ops projects on Plane, led by admin LiNKbots). See **Projects → Principal question** and finding **58**.

---

## Suites

### 1. LiNKsuitegen and Fleet v1 outside Suites submenu dropdown

- **Principal comment:** LiNKsuitegen and Fleet v1 appear outside the Suites submenu dropdown DOM; they should be properly nested or relocated.
- **Current behavior:** On the live Wave 6/7/10 deploy (`f6251f7`), `shell-sidebar.tsx` renders `LicensorSuitesSidebarSection` (accordion with nested rail), then a **separate** sibling block:

  ```tsx
  {isAdmin ? (
    <div className={subMenuRail + " mt-1"}>
      <AdminLinksuitegenSidebarLink />
      <Link href={appHref("/admin/fleet")}>Fleet v1</Link>
    </div>
  ) : null}
  ```

  That block is **not** inside `{open ? <div className={subMenuRail}>…</div> : null}` of `LicensorSuitesSidebarSection`, so visually it looks like orphaned sub-items under Suites without sharing the accordion parent. `AdminLinksuitegenSidebarLink` (`admin-linksuitegen-sidebar.tsx`) includes a `Factory` icon on the sub-link.

  On the current workspace branch, this sibling block is **absent** — only the three nested items exist (All suites, Add suite, Stripe products).
- **Expected behavior:** LiNKsuitegen and Fleet v1 should live **inside** the Suites expanded submenu (or be relocated to a clearly separate top-level section if product decides they are not suite-catalogue concerns). DOM structure should match visual hierarchy.
- **Severity:** high
- **Likely files:** `LiNKaios/linkaios-web/src/components/shell-sidebar.tsx`, `LiNKaios/linkaios-web/src/components/suites/licensor-suites-sidebar-section.tsx`, `LiNKaios/linkaios-web/src/components/admin/admin-linksuitegen-sidebar.tsx`
- **Open question:** Should LiNKsuitegen be under **Suites** or its own top-level Admin nav (per `LiNKsuitegen/docs/PRODUCT_REQUIREMENTS.md` §4.2 it is an Admin-only suite, not a client marketplace product)?

---

### 2. Why is Fleet v1 under Suites nav?

- **Principal comment:** Questions why Fleet v1 appears in the Suites section at all.
- **Current behavior:** Live deploy links `/admin/fleet` as sidebar label **"Fleet v1"** immediately below LiNKsuitegen, visually grouped with Suites. Fleet v1 is the OpenClaw + Agent Zero runtime dashboard (Wave 6.5 — `fleet-v1-dashboard-panel.tsx`, `lib/kernel/fleet/fleet-dashboard.ts`). LiNKbot-core `deploy/README.md` documents Fleet v1 as five OpenClaw profiles — a **runtime/operations** concern, not suite product composition.
- **Expected behavior:** Fleet runtime health belongs under **LiNKbots** (or Platform/Settings), not Suites. If a fleet summary is needed while composing suites, it should be contextual on the builder, not a permanent Suites sibling.
- **Severity:** medium
- **Likely files:** `LiNKaios/linkaios-web/src/components/shell-sidebar.tsx`, `LiNKaios/linkaios-web/src/app/(admin-shell)/admin/fleet/page.tsx`
- **Open question:** Relocate to LiNKbots submenu vs. remove from nav until fleet ops UI is productized?

---

### 3. Redundant "Add suite" sidebar link

- **Principal comment:** If the suites list already has an "Add suite" button, is the sidebar "Add suite" link redundant?
- **Current behavior:** Duplicate entry points:
  - Sidebar: `licensor-suites-sidebar-section.tsx` → `/suites/new` with Plus icon
  - List page: `licensor-suites-index.tsx` → `BUTTON.addRow` "Add suite" in `ShellPageHeaderClient` actions
  Both routes hit `suites/new/page.tsx`, which is itself a **mock flow** (no persistence; footer says *"Mock flow — new drafts are not persisted yet"*).
- **Expected behavior:** One canonical **Add Suite** affordance per UI standards (`BUTTON.addRow` on the list page). Sidebar should either drop the duplicate or replace it with a non-redundant shortcut only if Principal wants persistent quick-add.
- **Severity:** low
- **Likely files:** `licensor-suites-sidebar-section.tsx`, `licensor-suites-index.tsx`, `suites/new/page.tsx`
- **Open question:** Keep sidebar shortcut for power users, or sidebar = navigation only (All Suites, Stripe products, LiNKsuitegen)?

---

### 4. Icons on submenu items

- **Principal comment:** LiNKsuitegen has an icon on a submenu item; submenu items should not have icons.
- **Current behavior:** Violations in licensor Admin nav:
  - `Add suite` sidebar link wraps `<Plus className="h-3 w-3" />` inside the sub-link (`licensor-suites-sidebar-section.tsx`)
  - `AdminLinksuitegenSidebarLink` wraps `<Factory className="h-3 w-3" />` (live deploy)
  Top-level accordion rows correctly use icons (`Layers3` on Suites, `Bot` on LiNKbots); nested items elsewhere (Work, LiNKskills) are text-only.
- **Expected behavior:** Submenu links = text only per shell pattern (`subLinkClass` blocks without icons). Icons reserved for top-level accordion buttons.
- **Severity:** medium
- **Likely files:** `licensor-suites-sidebar-section.tsx`, `admin-linksuitegen-sidebar.tsx`
- **Open question:** None

---

### 5. Stripe products sidebar item — tab vs subsection

- **Principal comment:** Either a Stripe tab per suite **or** a Stripe subsection under Suites for glancing at all products; Principal is fine with either; overview subsection may be OK.
- **Current behavior:**
  - Sidebar: **Stripe products** → `/suites/billing` (`licensor-suites-sidebar-section.tsx`)
  - Billing page: platform + suite product tables from static `LICENSOR_SUITE_PRODUCTS` mock (`suites/billing/page.tsx`) — **no Stripe API**
  - Builder: Stripe link only in composition bar → `/suites/billing` or shows hardcoded `stripeProductId` string (`licensor-suite-builder-panel.tsx`)
- **Expected behavior:** Cross-suite Stripe overview under Suites nav is acceptable to Principal. Per-suite Stripe mapping should become a dedicated **Stripe** tab on the builder (finding 13), not only a sidebar page + progress-bar link.
- **Severity:** medium
- **Likely files:** `licensor-suites-sidebar-section.tsx`, `suites/billing/page.tsx`, `licensor-suite-builder-panel.tsx`
- **Open question:** Confirm whether per-suite Stripe tab **replaces** or **complements** the global `/suites/billing` overview.

---

### 6. Double header

- **Principal comment:** Duplicate headers visible (screenshot referenced).
- **Current behavior:** Suites routes call `suppressesAutoShellPageHeader()` (`shell-page-meta.ts` line 254), so `ShellAutoPageHeader` should not inject a second title. Pages still render:
  1. **Breadcrumb row** (`ShellMainFrame` → `AutoBreadcrumbs`)
  2. **Page header** (`ShellPageHeaderClient` / `ShellPageHeader` inside page `main`)
  3. **Licensor scope row** (`LicensorScopeLine` inside every `ShellPageHeader` on Admin — *View: All licensees* + optional Read-only pill)

  On builder pages this stacks: breadcrumbs → suite name header → scope line → composition bar — which can read as two headers plus a banner. Live LiNKsuitegen page (`admin/linksuitegen/page.tsx`) adds `ShellPageHeader` + dashboard content with its own section headings.

  UI standards (`.cursor/rules/08-linkaios-ui-standards.mdc`) mandate **one header per page** and no duplicate title inside content.
- **Expected behavior:** Single clear page title block; breadcrumbs only; scope line integrated without looking like a second page title; no inner `h2` duplicating the shell title on the same screen.
- **Severity:** high
- **Likely files:** `shell-main-frame.tsx`, `shell-page-header.tsx`, `licensor-scope-banner.tsx`, `licensor-suites-index.tsx`, `licensor-suite-builder-panel.tsx`, `admin/linksuitegen/page.tsx`
- **Open question:** Which exact route did the screenshot capture (list, builder, billing, LiNKsuitegen)?

---

### 7. Yellow highlighted area

- **Principal comment:** What is the yellow highlighted area?
- **Current behavior (codebase candidates on Suites surfaces):**

  | Element | Location | Styling |
  |---------|----------|---------|
  | **Data environment badge** | Top of every shell page when mock/review mode | `DataEnvironmentBadge` → `StatusPill` tone **warning** (amber/yellow) — *"Mock data"* |
  | **Ready publish pill** | Builder/list status column | `licensorSuitePublishTone("ready")` → **warning** (amber) |
  | **Read-only scope pill** | Under page header on Admin | `LicensorScopeLine` → warning pill when All licensees |
  | **Intro callout** | Suites list | `border-zinc-200 bg-zinc-50` (gray, not yellow) |
  | **Composition bar** | Builder | `bg-zinc-50` (gray) |
  | **Mock builder footer** | Builder bottom | plain zinc text |

  Most likely Principal highlight: **`DataEnvironmentBadge`** (persistent amber warning strip) or the **Ready** status pill in the header action cluster.
- **Expected behavior:** If mock/stub, label clearly once; avoid ambiguous yellow bands that look like errors. If it is environment badge, consider suppressing on Admin production review or moving to settings.
- **Severity:** medium
- **Likely files:** `data-environment-badge.tsx`, `licensor-suite-builder-panel.tsx`, `licensor-scope-banner.tsx`, `lib/ui-mocks/licensor-suite-catalog.ts` (`licensorSuitePublishTone`)
- **Open question:** Confirm against screenshot which element was highlighted.

---

### 8. Add module/phase/issue/LiNKbot/automation buttons are stubs

- **Principal comment:** Buttons show title *"Mock — composition editor not wired yet"*; must work, not stubs.
- **Current behavior:** `BUILDER_STUB_ACTIONS` in `licensor-suite-builder-panel.tsx` render `StubAddButton` with empty `onClick` and `title="Mock — composition editor not wired yet"`. Footer explicitly states: *"Mock builder — state changes and composition edits persist in a later wave."* Data source is static `LICENSOR_SUITE_PRODUCTS` in `lib/ui-mocks/licensor-suite-catalog.ts` (demo modules from `modules-catalog-demo`).
- **Expected behavior:** Working composition CRUD wired to real persistence (kernel/Supabase or approved MVO store), updating module/phase/issue tree and counts; no mock tooltips.
- **Severity:** blocker
- **Likely files:** `licensor-suite-builder-panel.tsx`, `lib/ui-mocks/licensor-suite-catalog.ts`, `hooks/use-licensor-suite-publish.ts`, suite builder API (not yet present)
- **Open question:** Persistence target for MVO — kernel RPC vs. licensor product table?

---

### 9. "Live in licensee Marketplace" redundant when published

- **Principal comment:** Unnecessary when suite already shows published state.
- **Current behavior:** When `publishState === "published"`, header actions render both:
  - `StatusPill` label **Published** (success tone)
  - Static span **"Live in licensee Marketplace"**
- **Expected behavior:** Published state communicated once via status pill (and list column). Remove redundant text or replace with actionable item (e.g. **View in Marketplace**, **Unpublish**).
- **Severity:** low
- **Likely files:** `licensor-suite-builder-panel.tsx`
- **Open question:** None

---

### 10. LiNKbots tab empty/wrong content

- **Principal comment:** Should show linkbots and linkbot type, not empty/wrong content.
- **Current behavior:** `linkbots` tab renders only a paragraph with aggregate count (`suite.linkbotCount`) — no list, no role/type, no links. Contrast: `project-linkbots-automations-panel.tsx` shows name, **Role · {role}**, status, heartbeat, and link to `/workers/{id}`.
- **Expected behavior:** Tab lists each LiNKbot assignee from composition (display name, role/type, assignee kind), with drill-down to fleet profile where applicable.
- **Severity:** high
- **Likely files:** `licensor-suite-builder-panel.tsx`, `lib/ui-mocks/licensor-suite-catalog.ts` (`countComposition`), reference pattern `project-linkbots-automations-panel.tsx`
- **Open question:** None

---

### 11. Automations tab empty/wrong content

- **Principal comment:** Should show automations with name or what they do.
- **Current behavior:** `automations` tab shows only count text (`suite.automationCount`) — no workflow names, handles, or descriptions. Reference pattern: `ProjectAutomationsList` uses `humanizeWorkflowHandle()` for readable names.
- **Expected behavior:** List automations with name/purpose, LiNKautowork workflow handle, and link to automation detail where available.
- **Severity:** high
- **Likely files:** `licensor-suite-builder-panel.tsx`, `project-linkbots-automations-panel.tsx`, composition mock data
- **Open question:** None

---

### 12. Composition X% complete bar — purpose

- **Principal comment:** Wants confirmation that progress is toward publication; elaborate what completeness measures.
- **Current behavior:** `suiteBuilderCompleteness()` in `licensor-suite-catalog.ts`:

  ```ts
  // Published suites → always 100%
  const checks = [
    name non-empty,
    summary non-empty,
    moduleCount > 0,
    phaseCount > 0,
    issueCount > 0,
    linkbotCount > 0,
    automationCount > 0,
  ];
  return round(done / 7 * 100);
  ```

  - Does **not** include Stripe linkage in percentage (Stripe is separate in the bar UI).
  - `canMarkSuiteReady()` requires `publishState === "draft"` AND completeness **≥ 85%** (~6/7 checks).
  - Displayed in gray bar (`bg-zinc-50`) with Cog icon on builder; also **Complete** column on list table.

  **Interpretation:** Completeness = checklist toward **ready for review / publication**, not runtime health or marketplace revenue.
- **Expected behavior:** Principal-aligned: bar = progress toward publishable suite definition. Consider adding Stripe to checks or documenting why excluded; surface checklist breakdown in UI (not only %).
- **Severity:** medium
- **Likely files:** `lib/ui-mocks/licensor-suite-catalog.ts`, `licensor-suite-builder-panel.tsx`, `licensor-suites-index.tsx`
- **Open question:** Should Stripe product link be part of completeness % or a hard gate only at publish (current: gate at publish via `canPublishSuite`)?

---

### 13. Link Stripe product — needs Stripe tab

- **Principal comment:** Should pull from Stripe API per suite/module; Stripe should be its own tab alongside Modules, LiNKbots, Automations (not just a link in the progress bar).
- **Current behavior:**
  - Builder tabs: **Modules & phases**, **LiNKbots**, **Automations** only
  - Stripe: inline link in composition bar → `/suites/billing` or static `prod_*` id from mock catalog
  - Billing page: static fixture IDs, no API
  - `canPublishSuite()` requires `stripeProductId != null` (mock string suffices today)
- **Expected behavior:** Add **Stripe** tab on builder; fetch/link products via Stripe API (governed capability); show per-suite and optionally per-module mapping; progress bar should not be the primary Stripe surface.
- **Severity:** high
- **Likely files:** `licensor-suite-builder-panel.tsx`, `suites/billing/page.tsx`, new Stripe integration layer, `hooks/use-licensor-suite-publish.ts`
- **Open question:** Module-level vs suite-level Stripe products for MVO?

---

### 14. Mark ready button — unclear UX

- **Principal comment:** Does not know what Mark ready does; explain and flag if UX is unclear/broken.
- **Current behavior:**
  - Visible when `publishState === "draft"`
  - `disabled` unless `canMarkSuiteReady(suite)` (completeness ≥ 85%)
  - `title` tooltip: *"Mark suite ready for review"* or *"Finish composition first"*
  - `onClick` → `transitionPublish(suite.id, "mark_ready")` → state **draft → ready** stored in `localStorage` key `linkaios-licensor-suite-publish-v1` (browser-only override on mock catalog)
  - When **ready**, **Publish to marketplace** appears (requires linked Stripe id)

  **Lifecycle:** Draft → **Ready** (internal review) → **Published** (marketplace). No server persistence; refresh on another browser loses overrides unless synced.

  **UX gap:** Label "Mark ready" is jargon; no inline explanation; no confirmation; disabled state easy to misread as broken.
- **Expected behavior:** Clear label (e.g. **Submit for Review**), helper text tying to completeness checklist, server-backed state, visible next step after click.
- **Severity:** high
- **Likely files:** `licensor-suite-builder-panel.tsx`, `hooks/use-licensor-suite-publish.ts`, `lib/admin-vendor-ops.ts` (`nextSuitePublishState`)
- **Open question:** Is **Ready** a human approval gate or automatic when checklist passes?

---

### 15. Title Case — action buttons

- **Principal comment:** "Add module", "Add phase", etc. should be Title Case.
- **Current behavior:** `BUILDER_STUB_ACTIONS` labels: `"Add module"`, `"Add phase"`, `"Add issue"`, `"Add LiNKbot"`, `"Add automation"`. Empty-state copy: *"Use **Add module** to start…"*
- **Expected behavior:** **Add Module**, **Add Phase**, **Add Issue**, **Add LiNKbot**, **Add Automation** per `08-linkaios-ui-standards.mdc` (`Add {Entity}`).
- **Severity:** medium
- **Likely files:** `licensor-suite-builder-panel.tsx`
- **Open question:** None

---

### 16. Title Case — "Modules & phases" tab

- **Principal comment:** Tab should be **Modules & Phases** (or per UI standards).
- **Current behavior:** Tab label string `"Modules & phases"` (line 133).
- **Expected behavior:** **Modules & Phases** (`formatUiLabel` / Title Case ampersand rule).
- **Severity:** medium
- **Likely files:** `licensor-suite-builder-panel.tsx`
- **Open question:** None

---

### 17. Title Case — sidebar "Add suite"

- **Principal comment:** Sidebar should be **Add Suite**.
- **Current behavior:** `"Add suite"` in sidebar, list header button, and `/suites/new` page title (`suites/new/page.tsx`).
- **Expected behavior:** **Add Suite** everywhere user-visible.
- **Severity:** medium
- **Likely files:** `licensor-suites-sidebar-section.tsx`, `licensor-suites-index.tsx`, `suites/new/page.tsx`
- **Open question:** None

---

### 18. Action column — Edit, Publish, Unpublish/Suspend

- **Principal comment:** Action column should be: **Edit**, **Publish** (or show published state), **Unpublish/Suspend** to take suite offline.
- **Current behavior:** Single `DataTableIconAction` with wrench icon → builder URL. Label varies (*Continue building* vs *Open builder*). No Publish/Unpublish/Suspend. Backend supports `unpublish` in `nextSuitePublishState()` but **no UI** calls it. Publish only on builder header when state is **ready**.
- **Expected behavior:** Row actions: **Edit** (builder), **Publish** / published indicator, **Unpublish** or **Suspend** for marketplace takedown; consistent with licensor ops workflow.
- **Severity:** blocker
- **Likely files:** `licensor-suites-index.tsx`, `hooks/use-licensor-suite-publish.ts`, `lib/admin-vendor-ops.ts`
- **Open question:** **Unpublish** (ready) vs **Suspend** (force offline) — one action or two?

---

### 19. Overall — far from done (meta)

- **Principal comment:** *"Quite far from being done"* — requires testing every functionality; much is not working.
- **Current behavior (evidence):**
  - Mock catalog + localStorage publish overrides (`licensor-suite-catalog.ts`, `use-licensor-suite-publish.ts`)
  - Stub composition buttons (finding 8)
  - Non-persistent **Add suite** flow
  - Empty LiNKbots/Automations tabs
  - No Stripe API
  - Table actions incomplete
  - Nav/DOM issues on live deploy (findings 1–2)
  - Explicit mock disclaimers in builder footer and new-suite form

  **Definition of done (inferred):** Principal can compose a suite, assign bots/automations, link Stripe, move Draft → Ready → Published/Unpublished from list and builder, and see accurate tabs/lists — all without mock tooltips or local-only state.
- **Expected behavior:** Full licensor suite product lifecycle operable on DO with audit/trace where MVO requires.
- **Severity:** blocker (meta)
- **Likely files:** Entire Admin Suites surface (see route map below)
- **Open question:** Acceptance test script for Principal sign-off?

---

## Work

> **Screenshot references:** Alerts crash — `browser-screenshot-7f29036a-76e6-49d0-8fc5-4e147e47d122.png`; All Work / action queue — `browser-screenshot-450126c8-e73d-4bee-98d5-aaa6ddf4742e.png`

### 20. Alerts page — Server Components render error (production)

- **Principal comment:** Whole alerts section doesn't work — screenshot shows **"Something Went Wrong"** with *"An error occurred in the Server Components render"* (digest omitted in production).
- **Current behavior:**
  - Route: `/admin/work/alerts` re-exports `(shell)/work/alerts/page.tsx` (`admin/work/alerts/page.tsx`).
  - On failure, `(shell)/error.tsx` renders the exact message Principal saw.
  - **All Work** (`/admin/work`) loads successfully on the same deploy (same Supabase session), so env/auth is not globally broken.
  - Alerts page queries traces with a **deprecated column name**:

    ```tsx
    .select("id, event_type, mission_id, created_at, payload")
    ```

    Canonical schema and `fetchRecentTraces()` use **`project_id`** (`services/migrations/002_linkaios.sql`, `lib/traces-db.ts`). Selecting `mission_id` fails against migrated DB.
  - All Work uses `fetchRecentTraces()` (correct columns) and still populates the Alerts card — explaining why the dashboard shows alert counts while the Alerts sub-page crashes.
  - `AlertsInbox` (client component) calls `useSearchParams()` without a parent `<Suspense>` boundary on the alerts page — a known Next.js pattern that can throw during Server Components render in production.
  - Secondary risk: `trace_alert_acknowledgments` table (migration `014`) missing or RLS-blocked would degrade resolve persistence but should not alone crash the page.
- **Expected behavior:** Alerts page renders a filterable inbox (or a clear empty/integration state). No production Server Components crash.
- **Severity:** blocker
- **Likely files:** `LiNKaios/linkaios-web/src/app/(shell)/work/alerts/page.tsx`, `alerts-inbox.tsx`, `lib/traces-db.ts`, `app/(shell)/error.tsx`
- **Open question:** Confirm DO migration state — is `mission_id` absent from `linkaios.traces` while All Work traces query succeeds via `project_id`?

---

### 21. Action queue — raw trace/event feed, not human actions

- **Principal comment:** Does not understand **Action queue** — when live, sees repetitive rows like **"project · created"** with raw JSON snippets (`cadence`, `suite_id`, `tenant_id`, …). Looks like an unformatted brain/event feed, not an operator action queue.
- **Current behavior:**
  - `buildAttentionFeed()` (`lib/work-attention-feed.ts`) merges **all** alerts, up to 8 messages, waiting sessions, brain inbox, and other sessions into one sorted list.
  - Trace rows are converted by `traceToWorkAlert()` (`lib/work-alerts.ts`):

    ```ts
    title: type.replace(/\./g, " · "),  // "project.created" → "project · created"
    summary: JSON.stringify(payload).slice(0, 160)  // raw JSON in subtitle
    ```

  - Routine **info**-severity events (e.g. `project.created`) appear as Alert rows with identical titles and JSON subtitles — matching Principal screenshot (six duplicate-looking entries).
  - `AttentionQueueRow` displays `item.subtitle` verbatim; no humanization, deduplication, or project title lookup.
  - Empty queue shows `WorkEmptyState` (*"Nothing in the queue"*) — Principal's deploy has trace volume so the queue is never empty, but content is not actionable.
  - **Work stream cards** (Alerts, Messages, Sessions, LiNKbrain Inbox) link correctly via `WorkStreamCard` → `appHref("/work/…")` — Principal confirmed these work.
- **Expected behavior:** Action queue lists **items requiring operator action** — critical/warning alerts, waiting sessions, unread messages, brain drafts awaiting triage — with plain-language titles, project names, and next-step affordances. Routine audit traces belong in **System logs** (`/settings/traces`), not the operator queue.
- **Severity:** high
- **Likely files:** `lib/work-attention-feed.ts`, `lib/work-alerts.ts`, `components/action-queue/attention-queue-row.tsx`, `app/(shell)/work/page.tsx`
- **Open question:** Should info-level `project.*` lifecycle traces appear in Action queue at all, or only in Alerts/System logs with severity filters?

---

### 22. Messages — Slack and Telegram tabs shown when not configured

- **Principal comment:** Slack and Telegram are not configured. UI should **only** show a link/example to install **Zulip** — hide or replace Slack/Telegram tabs when those channels are not configured.
- **Current behavior:**
  - `WorkMessagesWorkspace` always renders three tabs: **Zulip**, **Slack**, **Telegram** (`work-messages-workspace.tsx` lines 197–214) — no capability/config gate.
  - Empty Slack/Telegram tabs show *"Connect {channel} in platform settings"* with link to `/settings/platform`.
  - When `LINKAIOS_UI_MOCKS` is enabled, `DEMO_CHANNEL_THREADS` includes a **Slack** fixture thread (`demo-channel-slack`) even though no Slack integration exists — misleading on review deploys.
  - Live Zulip data comes from `gateway.zulip_message_links`; Slack/Telegram have **no** equivalent DB queries in `messages/page.tsx`.
- **Expected behavior:** When only Zulip is MVO-required, show Zulip-only UI (or single-channel mode). Unconfigured channels: omit tabs entirely and surface one **Set up Zulip** CTA (docs link or platform settings), per Principal direction.
- **Severity:** medium
- **Likely files:** `work-messages-workspace.tsx`, `lib/ui-mocks/channel-threads.ts`, `app/(shell)/work/messages/page.tsx`
- **Open question:** Is Slack/Telegram intentionally deferred post-MVO, or should capability-lease status drive tab visibility?

---

### 23. Messages — fixture/sample threads mixed with live Zulip data

- **Principal comment:** On Zulip tab — are sample messages being shown? Is Zulip actually working?
- **Current behavior:**
  - When `isUiMocksEnabled()` (`LINKAIOS_UI_MOCKS` / `linkaiosUiMocksEnabled()`), server pages merge `DEMO_CHANNEL_THREADS` **before** live `gateway.zulip_message_links` rows (`messages/page.tsx`, `work/page.tsx`).
  - Demo threads use fictional projects (*LiNKaios Rollout*, *Brightfield Co. Onboarding*, …) and `openHref: "/settings/platform"` — not real Zulip URLs.
  - Live deploy screenshot shows **"Zulip: Stream 5 - general"** in Messages card (likely real `zulip_message_links` data) **and** **"Demo agent"** in Sessions card — indicates **UI mocks are enabled** on production review, mixing demo and live rows.
  - Zulip integration path: ingest → `gateway.zulip_message_links` → `groupZulipIntoThreads()` → UI. No in-app reply; read-only mirror.
- **Expected behavior:** Production Admin review shows **live Zulip threads only** (or clearly labeled fixtures when mock mode is intentional). Principal can tell whether Zulip ingest is working without fictional operators/bots.
- **Severity:** medium
- **Likely files:** `lib/ui-mocks/flags.ts`, `lib/ui-mocks/channel-threads.ts`, `app/(shell)/work/messages/page.tsx`, `lib/work-messages.ts`
- **Open question:** Should `LINKAIOS_UI_MOCKS=0` be enforced on DO production regardless of review mode?

---

### 24. Messages — "Open in Zulip" opens Settings, not Zulip

- **Principal comment:** **Open in Zulip** button goes to Settings section instead of opening Zulip; should open popup/new tab with the Zulip application.
- **Current behavior:**
  - `platformOpenHref` falls back to `/settings/platform` when message/thread has no external URL (`work-messages-workspace.tsx` line 168).
  - `buildZulipThreadUrl()` (`lib/zulip-links.ts`) returns `/settings/platform` when `ZULIP_SITE_URL` env is unset or invalid:

    ```ts
    if (!base) return "/settings/platform";
    ```

  - Demo fixtures hardcode `openHref: "/settings/platform"` (`channel-threads.ts`).
  - `prepareChannelThreads()` only rewrites Zulip hrefs when `zulipSiteUrl` is truthy; otherwise links stay on settings.
  - `.env.example` documents `ZULIP_SITE_URL=` (empty default); `deploy/prod/.env.example` shows `https://zulip.linktrend.internal`.
- **Expected behavior:** **Open in Zulip** opens Zulip web app in a new tab (stream/topic narrow or message permalink) when Zulip is configured. If not configured, show explicit *"Zulip URL not configured"* state — not a silent redirect to Platform Settings.
- **Severity:** high
- **Likely files:** `work-messages-workspace.tsx`, `lib/zulip-links.ts`, `lib/work-messages.ts`, `lib/ui-mocks/channel-threads.ts`, deploy env for `ZULIP_SITE_URL`
- **Open question:** Is `ZULIP_SITE_URL` missing on DO, or set but not passed into the web container?

---

### 25. Sessions — action column missing View + Cancel on all rows

- **Principal comment:** Actions column needs **View** and **Cancel session** icons for **all** sessions. If session completed/not running: still show cancel icon but **disabled**.
- **Current behavior:**
  - `SessionsCatalogTable` always renders **View** (`Eye` → `s.openHref`).
  - **Stop** (`X`) icon renders **only** when `sessionStopEligible()` — status `running` or `waiting` **and** UUID session id (`sessions-catalog-table.tsx` lines 131–139).
  - Completed/failed sessions: View only; no disabled cancel affordance.
  - `stopWorkerSessionAction` server action exists and works for eligible sessions (`session-actions.ts`).
  - Principal reports functionality is *mostly correct* aside from action column rules.
- **Expected behavior:** Every row: **View** + **Cancel session** (or **Stop**). Cancel disabled (greyed, `aria-disabled`) when session is not stoppable; tooltip explains why.
- **Severity:** high
- **Likely files:** `components/sessions-catalog-table.tsx`, `app/(shell)/work/sessions-inbox.tsx`, `app/(shell)/work/session-actions.ts`
- **Open question:** Label **Cancel session** vs **Stop session** — align with LiNKaios UI standards?

---

### 26. Sessions — column widths; agent name truncated

- **Principal comment:** Column widths/text layout broken — agent name won't display properly.
- **Current behavior:**
  - `SessionsCatalogColGroup` fixed widths (`sessions-catalog-table-layout.tsx`):

    | Column | Width |
    |--------|------:|
    | Title | 14% |
    | Summary | 12% |
    | **Agent** | **11%** |
    | **Project** | **27%** |
    | Status | 10% |
    | Last activity | 12% |
    | Actions | 10% |

  - Agent column is the **narrowest** text column while Project gets 27% — long `display_name` values truncate via `DT.tdClipInset` / `DT.tdTextSpan` without min-width recovery.
  - Seven columns in a scrollable table compounds horizontal pressure on smaller viewports.
- **Expected behavior:** Agent name readable at a glance; rebalance columns (wider Agent, narrower Project/Summary if needed) or allow agent column to flex. Consistent with other catalogue tables (skills, projects).
- **Severity:** medium
- **Likely files:** `components/sessions-catalog-table-layout.tsx`, `components/sessions-catalog-table.tsx`, `lib/ui-standards.ts` (`DATA_TABLE`)
- **Open question:** Should agent column link to LiNKbot profile (`/workers/{id}`)?

---

## Projects

> **Screenshot references:** Add Project Launch error — `browser-screenshot-ba01da58-5ce2-4fab-b7fa-0f48499fd756.png`; Leases tab crash — `browser-screenshot-122eb23f-8bf5-4d9c-8882-08f41b42dfea.png`

### Principal question: Why Projects in Admin? — **REFINED (2026-06-08, partial reversal)**

**Principal decision (refined):** LiNKtrend plays **two roles** with **two surfaces**. Admin must **not** expose **client/licensee project management** when monitoring client LiNKbots or operating as vendor. Admin **should** have a **Projects** section — **repurposed** — where each project is an **admin program**: vendor/studio ops work assigned to **admin LiNKbots**, tracked on **Plane** when applicable. This is **not** client project bleed.

| Role | Surface | Project / program work |
|------|---------|------------------------|
| **Vendor / Licensor** | **LiNKtrend Admin** | **Admin programs** (vendor ops on Plane), fleet, suite catalogue, licensees, suite troubleshooting — **not** tenant client project boards |
| **Client licensee** (includes **Linktrend’s own tenant** for suite runs) | **LiNKaios Client** | Subscribe suites, **launch Projects**, runs, LiNKbots on tenant work, approvals, traces |

**Clarifications recorded:**

- **Client projects** (licensee tenant work, LinkSites MVO on studio tenant, etc.) belong on **Client only** — never mirrored into Admin as today's shared `(shell)/projects/*` pages.
- **Admin programs** = internal vendor/studio work (e.g. suite factory ops, platform maintenance) led by **admin LiNKbots**; may sync to Plane as execution kitchen.
- **No** cross-tenant **client** project viewer in Admin — rejected as confusing.
- **Current state:** `/admin/projects/*` re-exports **Client** project UI = **bleed** until replaced with admin-program model (finding **58**).
- **`LICENSOR_NAV`** omits `projects` today — nav must be **re-added** only when admin-program surface ships; until then, block client mirrors.

| Source | What it says |
|--------|----------------|
| `PRINCIPAL_PRODUCT_DEFINITION.md` §4 | **Client:** launch Projects. **Admin:** licensees, Suites, fleet LiNKbots, troubleshoot |
| `repo-architecture-target.md` | **Client** — tenant projects. **Admin** — tenants, suite catalogue, fleet, **vendor ops** |
| `app-roles.ts` `LICENSOR_NAV` | No `projects` today — interim; future Admin programs nav TBD |

**Code evidence (current bleed):**

- Admin routes re-export Client pages: `/admin/projects` → `(shell)/projects/page.tsx`.
- `canCreateProject()` allows licensor Admin — gates **client** project create, not admin programs.
- Sidebar may still show **Projects** on DO — nav gating bug until client mirrors removed and admin-program nav wired.

**MVO studio demo:** LinkSites **tenant** project work runs on **Client**. Vendor **admin programs** (if any) would be separate Admin-program rows — not today's mirror.

---

### 27. Projects list — Client bleed in Admin (replace with admin programs)

- **Principal comment:** Only the old project screen — **superseded:** Admin should **not** host **client** project management; should host **admin programs** instead (finding **58**).
- **Current behavior:**
  - Route: `/admin/projects` → `(shell)/projects/page.tsx` — lifecycle summary cards + **All projects** table (`ProjectsIndexTable`) — **tenant client project UI**.
  - Header includes `AddProjectHeaderAction` → `/projects/new` (`canCreateProject` allows licensor Admin).
  - Sidebar: Projects accordion visible on DO despite `LICENSOR_NAV` omission — implementation leak.
  - Empty state offers Add Project + Browse Marketplace (Client affordances).
- **Expected behavior:** Remove **client** project mirror. Replace with **Admin programs** list (vendor ops, admin LiNKbot assignees, Plane sync). Block or redirect `/admin/projects/*` until replacement ships. **Client** project list/create stays on **Client only**.
- **Severity:** high (product boundary)
- **Likely files:** `components/shell-sidebar.tsx`, `lib/app-roles.ts`, `app/(admin-shell)/admin/projects/*`, new admin-program routes (TBD)
- **Open question:** Plane project namespace for admin programs vs studio tenant Plane — separate workspace?

---

### 28. Projects list — Actions column Plane affordance

- **Principal comment:** Actions column arrow icon should open a **popup** that opens Plane — not current behavior.
- **Current behavior:** `ProjectsIndexTable` actions column (`projects-index-table.tsx`):
  - **Eye** icon → `/projects/{id}` (LiNKaios project detail).
  - **ExternalLink** icon → `planeProjectHref` or workspace href — opens Plane **directly in a new tab** when configured; disabled when no href.
  - No modal/popup intermediary; no in-app Plane preview.
- **Expected behavior:** **ExternalLink** (or single primary action) opens a **popup/modal** (pattern: `WorkInboxModal`) confirming context, then **Open in Plane ↗** — consistent with other governed external links and Principal’s Plane-as-kitchen model.
- **Severity:** high
- **Likely files:** `components/projects-index-table.tsx`, `components/work-inbox-modal.tsx` (pattern), `lib/plane-links.ts`
- **Open question:** Should Eye remain for LiNKaios detail, or should Plane become the sole external action?

---

### 29. Add Project wizard — Internal server error on Launch

- **Principal comment:** Screenshot shows **Internal server error** on Launch step after Suite **LiNKapps**, **Continuous**, module **App factory operator**.
- **Screenshot:** `browser-screenshot-ba01da58-5ce2-4fab-b7fa-0f48499fd756.png`
- **Path:** `/projects/new` (Admin mirror: `/admin/projects/new` — same wizard).
- **Current behavior:**
  - `NewProjectWizard.launchProject()` POSTs `/api/projects` with `{ name, suiteId, moduleIds, cadence }` (`new-project-wizard.tsx`).
  - API route catches non-`CreateProjectError` and returns `{ error: "Internal server error" }` with **500** (`app/api/projects/route.ts`) — matches red **Internal server error** in UI (wizard surfaces `payload.error`).
  - When persistence enabled (`NEXT_PUBLIC_SUPABASE_URL` + `SUPABASE_SECRET_KEY`, `LINKAIOS_PROJECTS_PERSIST≠0`), `createProjectPersisted()` calls `linkaios.create_project` RPC + optional Plane sync + Zulip bootstrap (`create-project-persistence.ts`).
  - Failure candidates on DO: missing/unapplied `202606010002_project_run_spine.sql` (`create_project` RPC), `seed_demo_tenant` / tenant env mismatch, invalid `suiteId`/`moduleIds` for RPC, Plane sync throw before catch, service role denied.
- **Expected behavior:** Launch succeeds → redirect to `/projects/{id}?created=1` with Plane bootstrap + trace; or structured validation error (not opaque 500).
- **Severity:** blocker
- **Likely files:** `components/projects/new-project-wizard.tsx`, `app/api/projects/route.ts`, `lib/projects/create-project-persistence.ts`, `supabase/migrations/202606010002_project_run_spine.sql`, DO env (`MVO_E2E_TENANT_ID`, `SUPABASE_SECRET_KEY`)
- **Open question:** Confirm DO migration state and API logs for `create_project RPC failed` vs tenant seed failure.

---

### 30. Project detail — Draft badge (why?)

- **Principal comment:** **Draft** badge top right — why?
- **Current behavior:**
  - Header renders `ProjectLifecycleStatusPill` from raw DB `status` (`projects/[id]/page.tsx`).
  - `projectStatusDisplay()` maps `status === "draft"` → pill label **Draft** (warning/amber tone) (`project-status-ui.ts`).
  - **`create_project` RPC always inserts `status = 'draft'`** (`supabase/migrations/202606010002_project_run_spine.sql` line 53) until orchestration assigns/runs advance status (`assigned`, `running`, … per `002_linkaios.sql` check constraint).
  - Progress bar uses `projectWorkflowProgressPercent('draft')` → **12%** — heuristic, not Plane sync.
  - No inline helper explaining Draft → Active transition.
- **Expected behavior:** Operator understands Draft = **created, not yet executing** (pre–first Run / pre-assignment). Consider auto-transition on first Run or clearer copy; badge alone is jargon.
- **Severity:** medium
- **Likely files:** `lib/project-status-ui.ts`, `supabase/migrations/202606010002_project_run_spine.sql`, `app/(shell)/projects/[id]/page.tsx`
- **Open question:** When should status leave Draft — first Plane sync, first Run, or first issue assignment?

---

### 31. Project detail — Project ID card UUID wraps

- **Principal comment:** Project ID card — UUID too long, wraps ugly; reduce font size for ID and other summary cards consistently.
- **Current behavior:** `ProjectDetailMetaGrid` renders four cards (Project ID, Suite, Module, Lead LiNKbot) with `dd` at **`text-sm font-semibold`** (`project-detail-meta-grid.tsx`). Live projects pass full UUID in `value: m.id` (`projects/[id]/page.tsx`) — no `font-mono`, no truncate, no copy affordance.
- **Expected behavior:** UUID in **`text-xs font-mono`** with truncate + title tooltip (or shortened display + copy button); consistent sizing across all four meta cards per UI standards.
- **Severity:** medium
- **Likely files:** `components/project-detail-meta-grid.tsx`, `app/(shell)/projects/[id]/page.tsx`
- **Open question:** None

---

### 32. Project detail — Project channels section (dual buttons)

- **Principal comment:** **Project channels** — good concept. Issues: don’t need separate **Open inbox** AND **Zulip stream · project-{uuid}**; should be one **Zulip Stream** button (no project ID in label) opening popup with Zulip stream; **Open inbox** should route to Admin **Work → Messages** consistently.
- **Current behavior (live DO / Wave 7.4 — `f6251f7`):** `ProjectChannelParityPanel` on project detail (`project-channel-parity-panel.tsx` on deploy branch; **absent on current workspace `issue/g1-bootstrap-handlers`**):
  - Section title **Project channels** with dual CTAs:
    - **Open inbox** → hardcoded `/work/messages` (not surface-prefixed; on Admin should be `/admin/work/messages`).
    - When `zulipStreamUrl` unset: non-link span **Zulip stream · project-{projectId}** (shows raw id suffix) — not clickable.
    - When set: **Open Zulip stream** opens new tab.
  - Stream naming convention in bootstrap: `projectStreamName()` → `project-{slug}-{suffix}` (`zulip-bootstrap.ts`) — UI should not expose raw UUID in label.
- **Expected behavior:**
  - One primary **Zulip Stream** button → modal with stream context + **Open in Zulip ↗** (requires `ZULIP_SITE_URL` + `buildZulipThreadUrl` pattern from Work finding 24).
  - Separate **Open inbox** → **Work → Messages** (`appHref("/work/messages")`) for LiNKaios mirror inbox, not duplicate Zulip entry.
- **Severity:** high
- **Likely files:** `components/project-channel-parity-panel.tsx` (deploy), `app/(shell)/projects/[id]/page.tsx`, `lib/zulip-links.ts`, `LiNKbot/communications/temporary-gateways/zulip/src/zulip-bootstrap.ts`
- **Open question:** Should project detail embed Messages threads inline, or only deep-link to Work?

---

### 33. Project detail — Modules / Phases / Issues / LiNKbots tabs empty

- **Principal comment:** **Modules**, **Phases**, **Issues**, **LiNKbots & Automations** tabs — nothing in them; can’t evaluate.
- **Current behavior (live project, mocks off):**
  - **Modules:** `ProjectModulesPanel` returns empty unless `isUiMocksEnabled()` — live path always shows *“No modules are bound to this project yet”* despite `module_ids` on project row (`project-modules-panel.tsx`).
  - **Phases:** `ProjectWorkflowsPanel` calls `loadProjectPhaseTimeline()` when mocks off — often empty/error if no persisted runs/phases.
  - **Issues:** `ProjectIssuesPanel` — **mock-only** (`demoProjectIssues` when mocks on; **empty array when mocks off**) (`project-issues-panel.tsx`).
  - **LiNKbots & Automations:** live loader exists but depends on traces/sessions/workflow runs tied to project; often empty for newly created projects (`project-linkbots-automations-panel.tsx`).
  - Demo projects (mocks on) populate all tabs — DO may mix one live + empty tabs after failed/partial create.
- **Expected behavior:** Tabs show suite-bound modules, phase tree, Plane-synced issues, and assigned LiNKbots/automations for **live** projects — minimum viable tree after Launch.
- **Severity:** high
- **Likely files:** `project-modules-panel.tsx`, `project-workflows-panel.tsx`, `project-issues-panel.tsx`, `project-linkbots-automations-panel.tsx`, `lib/project-run-phases.ts`, Plane bridge loaders
- **Open question:** Are tabs blocked on Plane live sync, or missing kernel bindings from `create_project` module_ids?

---

### 34. Project detail — Runs tab purpose

- **Principal comment:** Needs explanation — what is **Runs**, what does **Open system logs →** do (`/settings/traces?project=...`), why is it here?
- **Current behavior:**
  - **Runs** tab = `ProjectRunsPanel` → project-filtered slice of **Metrics recent runs** (`project-runs-panel.tsx`, `metrics-recent-runs-table.tsx`).
  - Data: trace-derived run rows for `missionId=projectId` via `fetchMetricsSnapshot({ days: 30, missionId })` — LiNKbot/automation execution events, not Plane cycles (terminology rule: LiNKaios **Run**, not Cycle).
  - Footer link **Open system logs →** → `/settings/traces?project={uuid}` — full audit trace viewer filtered to project (licensor settings route; Client operators may lack access).
  - Tab duplicates Overview snapshot **Runs** card linking to same tab.
- **Expected behavior:** Plain-language intro on tab: *“Each Run is one pass through project modules (continuous projects repeat Runs). Rows are governance traces; system logs opens the full audit tail.”* Link label **Open system logs** should respect surface (`appHref`) and role.
- **Severity:** medium
- **Likely files:** `components/project-runs-panel.tsx`, `components/metrics-recent-runs-table.tsx`, `lib/page-help-copy.ts`, `lib/project-tabs.ts`
- **Open question:** Should Runs tab be Client-only and hidden on Admin mirror?

---

### 35. Project detail — Leases tab Server Components crash

- **Principal comment:** **Leases** tab crashes — screenshot **Something Went Wrong** / Server Components render error.
- **Screenshot:** `browser-screenshot-122eb23f-8bf5-4d9c-8882-08f41b42dfea.png`
- **Breadcrumb:** `LiNKaios / Projects / …0fbbf6f1 / Leases`
- **Current behavior:**
  - Tab renders `ProjectLeasesPanel` → `LinkskillsLeasesPanel` with `projectId` (`project-linkbots-automations-panel.tsx`, `linkskills-leases-panel.tsx`).
  - Server component chain:
    1. `createSupabaseServiceClient(env)` — throws if service env misconfigured.
    2. `resolveCalusaTenantId()` — **throws** if `CALUSA_TENANT_ID` / `MVO_E2E_TENANT_ID` unset and `seed_demo_tenant` RPC fails (`admin-linkskills-tenant.ts`) — uncaught → production error boundary (`(shell)/error.tsx`), same UX as Work Alerts (finding 20).
    3. Project scope: dynamic import `fetchMetricsSnapshot` to filter leases by run IDs — secondary; failure returns empty runs, should not crash alone.
  - Global `/skills/leases` uses same panel — may also crash on DO when tenant resolution fails.
- **Expected behavior:** Leases tab renders project-scoped lease table or clear empty/integration state; tenant resolution failures surface actionable message, not opaque 500.
- **Severity:** blocker
- **Likely files:** `components/linkskills-leases-panel.tsx`, `lib/admin-linkskills-tenant.ts`, `app/(shell)/projects/[id]/page.tsx`, `app/(shell)/error.tsx`
- **Open question:** Should project Leases use session tenant from project row (`projects.tenant_id`) instead of hard-coded Calusa resolver?

---

### 58. Admin programs model — cross-reference (Projects + LiNKbots)

- **Principal comment (refined decision):** Admin **should** have Projects — but as **admin programs** (vendor/studio ops on Plane, admin LiNKbots), **not** client project management bleed.
- **Current behavior:** No admin-program entity or UI — only Client `(shell)/projects/*` mirrors (findings 27–35) and worker **Projects** tab listing `primary_agent_id` tenant projects (finding 46).
- **Expected behavior:**

  | Surface | Client tenant bot (monitoring) | Admin LiNKbot (vendor ops) |
  |---------|-------------------------------|----------------------------|
  | Admin Projects nav | **Hidden** — no client projects | **Admin programs** list when implemented |
  | Worker detail **Projects** tab | **Hidden** on Admin routes | **Visible** — programs where bot is lead |
  | Plane | N/A from Admin for client work | Sync for admin programs |

- **Related decisions:** **Add LiNKbot** removed from Admin (finding **41**); bot creation in **suite builder/composition** only.
- **Severity:** medium (architectural — blocks correct Admin Projects redesign)
- **Likely files:** New admin-program routes, `lib/app-roles.ts`, `lib/worker-detail-tabs.ts`, `workers-page-header.tsx`, suite builder composition
- **Open question:** Data model — `linkaios.projects` with `kind=admin_program` vs separate vendor ops table?

---

## Metrics

> **Principal comment:** *"Appears okay but unsure if mock data or actual — many things show 0 or 0%."*

### Principal answer — mock or live?

**Short answer for Principal:** On the DO review deploy, Metrics is **live, not mock** — the **0 / 0%** values mean there is **little or no trace activity** in `linkaios.traces` for the selected range, not that the page is showing fabricated demo KPIs.

| Check | Result |
|-------|--------|
| Is it mock? | **Only if** `LINKAIOS_UI_MOCKS` is enabled — then `demoMetricsSnapshot()` replaces the whole dashboard with fictional KPIs (36 demo rows). |
| Why 0 / 0%? | **Live query, empty/sparse data** — `fetchMetricsSnapshot()` → `fetchTracesInRange()` over `linkaios.traces` returns few/no run events; KPI math correctly yields zeros. |
| How to tell on screen? | Mock mode should show **Mock data** badge elsewhere in shell; Metrics page itself does **not** surface `demoMode` clearly (finding 36). |
| Cost tab exception | Admin **Cost** view (`buildLicensorCostKpiCards`) **always** uses partly fabricated margin math + `LICENSEE_REGISTRY` fixture even when traces are live (finding 38). |

**Evidence:** Same deploy shows real Demo agent UUID in Sessions while Metrics stays at zero — consistent with live-but-empty traces, not full demo snapshot (unless mocks also on for Metrics only, which code does not support — mocks replace entire initial load).

### Data source assessment (code)

| Mode | Trigger | What Principal sees |
|------|---------|---------------------|
| **Full demo** | `LINKAIOS_UI_MOCKS` enabled (`isUiMocksEnabled()`) | `demoMetricsSnapshot()` — 36 fabricated trace rows, non-zero KPIs/charts (`lib/ui-mocks/metrics-demo-snapshot.ts`). Filter dropdowns also merge `DEMO_SIDEBAR_AGENTS` / `DEMO_SIDEBAR_MISSIONS`. |
| **Live, empty** | Mocks off; few/no rows in `linkaios.traces` | Real query via `fetchMetricsSnapshot()` → `fetchTracesInRange()` — KPIs **0**, charts flat, **0%** success rates. Empty state: *"No run activity yet"* when `totalTraces === 0`. |
| **Live, populated** | Mocks off; trace volume from projects/sessions | Aggregated cost, tokens, runs, model/tool breakdowns from trace payloads — **not** mock math. |
| **Mixed on DO** | Mocks on + some live sessions | Demo snapshot **replaces** live aggregate on initial load (page prefers demo when mocks on even if live fetch fails). |

Admin and Client share the same `(shell)/metrics/page.tsx` (Admin: `/admin/metrics` re-export). `LICENSOR_NAV` includes **metrics** for Admin/Super Admin tiers.

**Licensor Cost view** (`?view=cost` on Admin): `buildLicensorCostKpiCards()` applies **fabricated multipliers** on trace totals (`platformCogs = totalCostUsd * 2.4`, `stripeRevenueMock = platformCogs * 1.68`) and reads **`LICENSEE_REGISTRY` static fixture** for licensee counts — always partly mock even when traces are live.

---

### 36. Metrics — mock vs live not distinguishable on review deploy

- **Principal comment:** Unsure whether numbers are mock or real; many **0** / **0%** values.
- **Current behavior:**
  - No persistent **“Mock data”** banner on Metrics when `demoMode` is true (`MetricsDashboard` receives `demoMode` but does not surface environment badge on this page).
  - When mocks off and traces empty, zeros are **correct** live empty state — indistinguishable from “broken” without copy.
  - When mocks on, charts look healthy while Work/Sessions may also show demo rows — consistent with `LINKAIOS_UI_MOCKS` on DO (finding 23).
- **Expected behavior:** Production Admin review: mocks off → zeros with clear *“No trace activity yet”* and CTAs; intentional mock mode → visible badge. Principal can tell live vs fixture at a glance.
- **Severity:** high
- **Likely files:** `app/(shell)/metrics/page.tsx`, `components/metrics-dashboard.tsx`, `lib/ui-mocks/flags.ts`, `components/data-environment-badge.tsx`
- **Open question:** Enforce `LINKAIOS_UI_MOCKS=0` on DO for Principal sign-off?

---

### 37. Metrics — zero KPIs on sparse deploy (live empty, not stub)

- **Principal comment:** Many metrics show **0** or **0%**.
- **Current behavior:** With mocks disabled, `buildMetricsSnapshotFromRows()` over empty trace set yields zero cost, tokens, success rate, and empty recent-runs table. Page may still render KPI grid and charts at 0 rather than only the empty state (empty state shows only when `!demoMode && !loadError && totalTraces === 0` — if a handful of non-run traces exist, KPIs stay near zero without explanation).
- **Expected behavior:** Distinguish **“no data yet”** (launch project / start session) from **“query failed”**; helper copy on KPI cards when denominator is zero (*“No runs in range”* not *0%* without context).
- **Severity:** medium
- **Likely files:** `lib/metrics-snapshot.ts`, `components/metrics-dashboard.tsx`, `lib/metrics-kpi-views.ts`
- **Open question:** None

---

### 38. Metrics — Licensor Cost view uses fabricated margin math

- **Principal comment:** (Implicit via mock vs live uncertainty on Admin Cost tab.)
- **Current behavior:** Admin default/highlight **Cost** view uses `buildLicensorCostKpiCards()` — multiplies trace-derived `totalCostUsd` by constants (2.4×, 1.68×), uses static `LICENSEE_REGISTRY` for active/trialing counts and “top cost licensee.” Labels include *(demo)* in subtitle for gross margin but not all cards.
- **Expected behavior:** Licensor platform economics from **billing + infra telemetry** APIs, or clearly labeled **fixture** until live — not trace-cost algebra posing as revenue/margin.
- **Severity:** high
- **Likely files:** `lib/metrics-licensor-kpi-views.ts`, `lib/licensee-registry.ts`, `components/metrics-dashboard.tsx`
- **Open question:** Is Cost view in MVO scope for Admin, or hide until Stripe/infra feeds exist?

---

### 39. Metrics — project/LiNKbot filters mix demo entities when mocks on

- **Principal comment:** (Related to overall mock uncertainty.)
- **Current behavior:** `metrics/page.tsx` merges `DEMO_SIDEBAR_MISSIONS` and `DEMO_SIDEBAR_AGENTS` into filter dropdowns when `uiMocksEnabled` — filtering can target fictional `demo-smb` / `demo-lisa` while table shows demo snapshot rows.
- **Expected behavior:** Admin metrics filters list **real** projects/agents per licensor scope (or tenant-scoped subset), never silent demo merge on production review.
- **Severity:** medium
- **Likely files:** `app/(shell)/metrics/page.tsx`, `lib/ui-mocks/entities.ts`
- **Open question:** Should Admin metrics default to **All licensees** aggregate with tenant filter (Company scope)?

---

## LiNKbots

> **Review subject:** Admin **LiNKbots** fleet list + **Demo agent** detail (live UUID agent on DO). Screenshot (LiNKbrain error): `browser-screenshot-e4f8247c-43ac-4e85-a585-14fb4d106483.png`

### Principal questions answered

#### A. What is the LiNKbots section in Admin supposed to do?

Per **`PRINCIPAL_PRODUCT_DEFINITION.md` §4** and **`repo-architecture-target.md`**, **LiNKtrend Admin** owns **vendor fleet operations**: monitor and troubleshoot **LiNKbots deployed for licensees**, tied to suite/runtime health — not tenant day-to-day project management.

**Intended Admin LiNKbots scope (confirmed by Principal):**

- **Monitor admin linkbots** (vendor/studio ops) **and all deployed linkbots across licensees** — fleet oversight + troubleshoot.
- **Fleet roster** with **licensor scope** (All licensees = read-only aggregate; single licensee = troubleshoot writes per `admin-fleet-troubleshoot.ts`).
- **Runtime health:** sessions, heartbeat, status, logs.
- **When viewing a client tenant bot:** monitoring/troubleshoot only — **no Projects tab** (finding **46**).
- **When viewing an admin bot:** **Projects tab OK** — shows **admin programs** on Plane (finding **58**), not client tenant projects.
- **Add LiNKbot on Admin: REMOVE** — bot creation belongs in **suite builder/composition** only (Principal agrees). Header already hides button when `isAdmin` (`workers-page-header.tsx`) but suite builder still has stub **Add LiNKbot** (Suites finding 8).

**What Principal saw:** Shared **`(shell)/workers/*`** at `/admin/workers/*` — no licensee filter, no vendor-fleet framing. Demo agent reviewed tab-by-tab.

**Fleet policy reference:** `LiNKbot-core/deploy/README.md` → `docs/ecosystem/FLEET_AND_RUNTIME_POLICY.md`; `lib/admin-fleet-troubleshoot.ts`.

#### B. Demo agent — Projects tab on Admin linkbot detail

**Projects** tab (`/workers/[id]/projects`) lists tenant projects where agent is **`primary_agent_id`** — **Client bleed** when viewing **client** bots from Admin.

**Principal decision (refined):** Hide **Projects** tab for **client tenant bots** under monitoring. Show **only for admin LiNKbots** — admin programs on Plane (finding **58**). Requires bot **kind** / admin-vs-client classification (not modeled on `linkaios.agents` today).

#### C. Add LiNKbot — **REMOVE from Admin**

Principal: bot creation belongs in **suite builder/composition** only — not a global registry insert from Admin fleet list.

**Current behavior:** `createAgentAction` inserts `{ display_name, status }` into `linkaios.agents`; suite builder **Add LiNKbot** is still a stub (`licensor-suite-builder-panel.tsx`). Admin list header already omits Add button when `isAdmin`.

**Expected:** No Admin **Add LiNKbot** anywhere. Provision bots through **suite composition** → fleet binding workflow.

#### D. Admin vs client bots visibility

| Visibility | Current code | Product intent |
|------------|--------------|----------------|
| **Client** | Tenant-scoped; workers for licensee auth | Tenant LiNKbots on **their** projects |
| **Admin** | All agents visible; no tenant filter | **All licensees’** deployed bots + **admin bots**; scope filter; troubleshoot |
| **Projects tab** | Always shown on worker detail | **Admin bots only** on Admin surface |

---

### 40. LiNKbots list — no licensee scope; purpose unclear

- **Principal comment:** What is Admin LiNKbots for? Shows bots but scope vs Client unclear.
- **Current behavior:** `workers/page.tsx` loads all `linkaios.agents` (plus `DEMO_SIDEBAR_AGENTS` when mocks on). No `LicensorScopeLine` integration; no `aggregateCrossTenantFleet()` filtering. `WorkersPageHeader` / empty state use Client-oriented copy.
- **Expected behavior:** Admin list titled for **vendor fleet**; filter by **Company / licensee** scope; All licensees = read-only aggregate; single licensee = troubleshoot write paths per `admin-fleet-troubleshoot.ts`.
- **Severity:** high
- **Likely files:** `app/(shell)/workers/page.tsx`, `components/workers-page-header.tsx`, `lib/admin-fleet-troubleshoot.ts`, `components/licensor-scope-banner.tsx`
- **Open question:** When is `tenant_id` (or equivalent) added to `linkaios.agents`?

---

### 41. Add LiNKbot — REMOVE from Admin (suite composition only)

- **Principal comment:** What does Add LiNKbot do? — **Resolved:** **Remove** from Admin; bot creation belongs in **suite builder/composition** only.
- **Current behavior:** Client workers list exposes **Add LiNKbot** (`AddLinkbotHeaderAction` when `!isAdmin`). Admin header already hides it. Modal still creates bare `linkaios.agents` row with no suite binding. Suite builder **Add LiNKbot** is a **stub** (Suites finding 8).
- **Expected behavior:** **No** Admin Add LiNKbot. Suite composition wires LiNKbot assignees to module/phase/issue templates → fleet provision. Admin fleet list is **monitor/troubleshoot** only.
- **Severity:** high (product boundary)
- **Likely files:** `components/workers-page-header.tsx`, `components/add-linkbot.tsx`, `licensor-suite-builder-panel.tsx`, suite composition persistence (TBD)
- **Open question:** None — Principal decision locked

---

### 42. Demo agent — Sessions tab action column (View + Cancel)

- **Principal comment:** View + Cancel for **all** sessions; Cancel **disabled** when completed/not running.
- **Current behavior:** `SessionsCatalogTable` — Stop icon only when `sessionStopEligible()` (running/waiting + UUID). Completed rows: View only (`sessions-catalog-table.tsx`). Matches Work finding **25** (same component in `SessionsInbox` on worker sessions page).
- **Expected behavior:** Every row: View + Cancel; Cancel disabled with tooltip when not stoppable.
- **Severity:** high
- **Likely files:** `components/sessions-catalog-table.tsx`, `app/(shell)/workers/[id]/sessions/page.tsx`
- **Open question:** Align label **Cancel session** vs **Stop**?

---

### 43. Demo agent — Session detail status not a badge

- **Principal comment:** Opening a session — no clear running vs stopped; should be badge/pill not title text only.
- **Current behavior:** Session detail (`sessions/[sessionId]/page.tsx`) shows status as plain capitalized text in `<dd>` — no `StatusPill`. List/catalog uses pills via `SESSION_DISPLAY_PILL_LABELS`. Header snapshot on **agent** detail uses badge; **session** detail does not.
- **Expected behavior:** Session detail status as **StatusPill** (Running / Waiting / Completed / Failed) consistent with Sessions table.
- **Severity:** medium
- **Likely files:** `app/(shell)/workers/[id]/sessions/[sessionId]/page.tsx`, `lib/session-display.ts`, `components/ui/status-pill.tsx`
- **Open question:** None

---

### 44. Demo agent — Session detail technical ID chevron

- **Principal comment:** Technical ID chevron opens ID number — unnecessary.
- **Current behavior:** `<details><summary>Technical id</summary>` exposes raw session UUID below session title (`sessions/[sessionId]/page.tsx` lines 133–136).
- **Expected behavior:** Remove chevron from operator view, or move to debug-only/settings trace link; ID already in breadcrumbs/backend.
- **Severity:** low
- **Likely files:** `app/(shell)/workers/[id]/sessions/[sessionId]/page.tsx`
- **Open question:** None

---

### 45. Demo agent — Open Native UI placement

- **Principal comment:** Was previously a **tab** after Lifecycle opening agent native UI popup. Should be on session screen only if link is **that session’s** native UI; if generic agent UI, keep as **tab** at end — not buried in session detail footer.
- **Current behavior:**
  - `WORKER_DETAIL_TABS` — **no Native UI tab** (tabs end at Lifecycle). Placeholder route exists: `/workers/[id]/native-ui/page.tsx` (env `NEXT_PUBLIC_LINKBOT_NATIVE_UI_BASE_URL`).
  - Session detail renders `SessionInteractionPanel` with **Open Native UI** link via `linkbotNativeUiHref(agentId)` — **agent-level** href, not session-scoped, at bottom of session page.
- **Expected behavior:** Generic agent shell → **Native UI** tab at end of worker subnav. Session-specific deep link → **Open Native UI** on session detail only when URL encodes session context.
- **Severity:** medium
- **Likely files:** `lib/worker-detail-tabs.ts`, `components/session-interaction-panel.tsx`, `lib/linkbot-native-ui.ts`, `app/(shell)/workers/[id]/native-ui/page.tsx`
- **Open question:** Does OpenClaw support per-session deep links on DO fleet?

---

### 46. Demo agent — Projects tab conditional (admin bots only)

- **Principal comment:** Why Projects tab on admin linkbot detail?
- **Current behavior:** `workers/[id]/projects/page.tsx` — tenant **`ProjectsIndexTable`** for `primary_agent_id === agent`. Always shown in `WORKER_DETAIL_TABS`. Re-exported at `/admin/workers/[id]/projects`.
- **Expected behavior (refined):** On Admin routes: **hide** for **client tenant bots** (monitoring view). **Show** for **admin LiNKbots** — lists **admin programs** on Plane (finding **58**), not client projects. Client surface unchanged.
- **Severity:** high
- **Likely files:** `lib/worker-detail-tabs.ts`, `app/(shell)/workers/[id]/projects/page.tsx`, `components/worker-subnav.tsx`, agent kind/classification (TBD)
- **Open question:** How to classify admin vs client bot in registry (`agents.kind` / suite composition metadata)?

---

### 47. Demo agent — LiNKskills tab toggles unverified

- **Principal comment:** Clicks/toggles change but unknown if actually works.
- **Current behavior:** `workers/[id]/skills/page.tsx` loads skills/tools/connectors; demo agents use `DEMO_AGENT_SKILLS` / fixture merges when mocks on. Live path uses `readSkillAdminFlags` / `readToolAdminFlags` — UI toggles call admin flag writers (needs live verification). No success/toast proof on DO review.
- **Expected behavior:** Toggle → persisted lease/flag → visible confirmation + audit trace; demo rows labeled fixture.
- **Severity:** medium
- **Likely files:** `app/(shell)/workers/[id]/skills/page.tsx`, `lib/skills-admin.ts`, `lib/tools-admin.ts`
- **Open question:** E2E test: enable skill → lease row in LinkSkills?

---

### 48. Demo agent — LiNKbrain tab crash (`mission_id` column)

- **Principal comment:** Error screenshot on LiNKbrain tab.
- **Screenshot:** `browser-screenshot-e4f8247c-43ac-4e85-a585-14fb4d106483.png` — `column memory_entries.mission_id does not exist`
- **Current behavior:** `loadLinkbrainPageData()` queries `memory_entries` selecting **`mission_id`** (`linkbrain-data.ts` line 110). Migration **`033_linkaios_project_terminology.sql`** renames `memory_entries.mission_id` → **`project_id`**. Same bleed pattern as Work Alerts (finding 20). Worker brain page surfaces `data.error` as red text — no graceful empty state.
- **Expected behavior:** Query `project_id` (or SDK helper post-migration); tab renders agent-scoped memory partition or clear migration-needed banner.
- **Severity:** blocker
- **Likely files:** `lib/linkbrain-data.ts`, `services/migrations/033_linkaios_project_terminology.sql`, `app/(shell)/workers/[id]/brain/page.tsx`
- **Open question:** Confirm DO applied migration 033 while app code still selects `mission_id`?

---

### 49. Demo agent — Models tab live vs mock unclear

- **Principal comment:** Unclear if mock or live.
- **Current behavior:** Demo IDs (`demo-lisa`, …) → `forceReadonly` + demo settings. **Live agents** (e.g. Principal’s Demo agent UUID) load `runtime_settings` from DB and allow save via `saveAgentRuntimeSettingsAction` — **live path**, but no environment badge; empty/default settings can look like placeholders. Header shows **Primary model** from parsed settings when set.
- **Expected behavior:** Clear **live registry** copy; unsaved/dirty states obvious; demo banner only on fixture IDs.
- **Severity:** medium
- **Likely files:** `app/(shell)/workers/[id]/models/page.tsx`, `components/agent-models-form.tsx`, `components/worker-role-aware-forms.tsx`
- **Open question:** None

---

### 50. Demo agent — Models Save button alignment

- **Principal comment:** **Save models and limits** should align right.
- **Current behavior:** `AgentModelsForm` renders save button left-aligned after form sections (`agent-models-form.tsx` ~line 348) — not `justify-end` footer pattern used elsewhere.
- **Expected behavior:** Primary save action **right-aligned** per LiNKaios form footer convention.
- **Severity:** low
- **Likely files:** `components/agent-models-form.tsx`
- **Open question:** None

---

### 51. Demo agent — Models Title Case violations

- **Principal comment:** Title case violations on Models tab.
- **Current behavior:** Examples: button **"Save models & limits"** (should be **Save Models & Limits**); section labels via `formatCardTitle` may be correct but button/copy inconsistent with `08-linkaios-ui-standards.mdc`.
- **Expected behavior:** Title Case on buttons, section headers, and control labels per UI standards.
- **Severity:** medium
- **Likely files:** `components/agent-models-form.tsx`, `lib/agent-runtime-settings.ts` (`MODEL_CATEGORY_LABELS`)
- **Open question:** None

---

### 52. Demo agent — Cloud token cap step size

- **Principal comment:** Alert/hard cap increment **1 token per click** — should be **10,000** per click.
- **Current behavior:** `type="number"` inputs with **`step={1}`** for alert threshold and hard cap (`agent-models-form.tsx` lines 262, 283).
- **Expected behavior:** `step={10000}` (or dedicated increment control) for operator-friendly token budgets.
- **Severity:** medium
- **Likely files:** `components/agent-models-form.tsx`
- **Open question:** None

---

### 53. Demo agent — Settings LiNKbot ID marked Optional

- **Principal comment:** LiNKbot ID "optional" — should include **type**; unclear why optional.
- **Current behavior:** `CompanyEditableCard` without `required` prop renders **Optional** suffix on **LiNKbot ID** card (`company-editable-card.tsx`). Card is read-only UUID display — not editable; "Optional" is misleading for a required system identifier.
- **Expected behavior:** Show **LiNKbot ID** as read-only required system field; display **type/kind** (executive, specialist, automation liaison, etc.) when modeled — not "Optional."
- **Severity:** medium
- **Likely files:** `components/agent-settings-form.tsx`, `components/company-editable-card.tsx`
- **Open question:** Where is agent **type** canonical — `runtime_settings.linkaiosProfile` vs future `agents.kind` column?

---

### 54. Demo agent — Organisation profile should be Required

- **Principal comment:** Organisation profile marked optional — should **not** be optional; needs linkbot name, position, description.
- **Current behavior:** **Organisation profile** card uses `CompanyEditableCard` without `required` → shows **Optional**. Fields: Position/title + Description only — **display name** lives on agent row, not in this card. `canEditCompanyProfile()` is **false** for licensor kind — Admin operators may see read-only profile without edit (role gate), still labeled Optional.
- **Expected behavior:** **Required** profile: name (or link to display name), position, description; block **Active** status without complete profile; **Required** badge not Optional.
- **Severity:** medium
- **Likely files:** `components/agent-settings-form.tsx`, `lib/app-roles.ts` (`canEditCompanyProfile`), `components/company-editable-card.tsx`
- **Open question:** Should licensor Admin edit tenant bot profiles on troubleshoot, or Client Admin only?

---

### 55. Demo agent — Logs View action redirects to Sessions

- **Principal comment:** View log sends to Sessions tab — redundant if logs are session logs; should logs live inside Sessions?
- **Current behavior:** `WorkerSessionLogsTable` **View** links to `row.openHref` → `/workers/{id}/sessions/{sessionId}` (same as Sessions catalog View) — `mapWorkerSessionsToThreads` sets `openHref` to session detail, not log transcript viewer. Logs tab duplicates closed-session list filtered to ended sessions (`worker-logs-panel.tsx`).
- **Expected behavior:** Either (a) merge closed-session logs into **Sessions** tab with transcript panel, or (b) Logs **View** opens log/transcript detail — not generic session detail duplicate.
- **Severity:** medium
- **Likely files:** `components/worker-logs-panel.tsx`, `components/worker-session-logs-table.tsx`, `lib/work-sessions.ts`
- **Open question:** Product preference — separate Logs tab vs Sessions sub-panel?

---

### 56. Demo agent — Lifecycle tab could move to Settings

- **Principal comment:** Entire tab is suspend/terminate/delete — could move to bottom of Settings and remove tab.
- **Current behavior:** Dedicated **Lifecycle** tab (`worker-lifecycle-panel.tsx`) — suspend/terminate/delete with `canManageLinkbotLifecycle()` gate (licensor Admin+ allowed).
- **Expected behavior:** Destructive lifecycle actions in **Settings** danger zone; reduce tab strip noise (Sessions, LiNKskills, LiNKbrain, Models, Settings, Logs only).
- **Severity:** medium
- **Likely files:** `lib/worker-detail-tabs.ts`, `app/(shell)/workers/[id]/lifecycle/page.tsx`, `components/worker-lifecycle-panel.tsx`
- **Open question:** Keep separate tab for Super Admin only?

---

### 57. Demo agent — Font inconsistencies (meta)

- **Principal comment:** Font inconsistencies across linkbot detail pages (will review UI separately).
- **Current behavior:** Mixed `text-xs` / `text-sm` section headers, `font-semibold` vs `font-medium` on role lines, mono ID at `text-[11px]` in header vs `text-sm` in settings — no single worker-detail typography scale.
- **Expected behavior:** Consistent worker detail type ramp per `08-linkaios-ui-standards.mdc` (defer to dedicated UI pass).
- **Severity:** low
- **Likely files:** `components/worker-detail-header.tsx`, `components/worker-tab-section-header.tsx`, worker tab pages
- **Open question:** None — Principal tracking separately

---

## LiNKskills

> **Screenshot references:** Overview — `assets/browser-screenshot-230a1d9e-1ca0-4b49-85d0-16188834128c.png`; Skills — `assets/4fd7f109-ee2e-4d3c-8ca6-051dbcf67037.png`; Tools — `assets/3826f584-619b-441f-a343-852f61ae1d96.png`; Leases — `assets/4e816c11-ca83-4003-aa4e-ffc85fec9a8b.png`

**Admin purpose:** Govern **vendor-wide** skills, tools, capabilities, and leases for the platform — not a single tenant's LinkSkills admin mirror (though UI is shared `(shell)/skills/*` today).

### Root cause assessment (code + migrations)

| Symptom | Query / component | Likely cause on DO |
|---------|-------------------|-------------------|
| `skills.category_id does not exist` | `listSkills()` → `SKILL_LIST_SLIM` includes `category_id` (`packages/linklogic-sdk/src/skills-catalog.ts`) | Migration **`022_skills_progressive_disclosure.sql`** not applied — adds `category_id` + `skill_categories` |
| `Could not find the table 'linkaios.tools' in the schema cache` | `listTools()` → `linkaios.tools` (`packages/linklogic-sdk/src/tools-catalog.ts`) | Migration **`011_linkaios_tools.sql`** (or `ALL_IN_ONE.sql` §tools) not applied / `linkaios` schema not exposed in Supabase API settings |
| Capabilities could not be loaded (Overview) | `(shell)/skills/page.tsx` — blocks when **both** `listSkills` and `listTools` fail and mocks off | Combined failure of rows above |
| Leases Server Components crash | `LinkskillsLeasesPanel` → `resolveCalusaTenantId()` throws (`lib/admin-linkskills-tenant.ts`) | Same as Project Leases finding **35** — tenant env / `seed_demo_tenant` |

Health check hint: `app/api/health/supabase/route.ts` documents exposing `linkaios` schema and running `ALL_IN_ONE.sql` when tables missing.

---

### 59. LiNKskills Overview — capabilities hub load failure

- **Principal comment:** Overview tab errors — `skills.category_id does not exist`, `linkaios.tools` not in schema cache, capabilities load failure.
- **Screenshot:** `assets/browser-screenshot-230a1d9e-1ca0-4b49-85d0-16188834128c.png`
- **Current behavior:** `SkillsCapabilitiesHubPage` calls `listSkills` + `listTools` in parallel. When mocks off and either fails, renders amber *"Capabilities could not be loaded"* with per-source error lines (`skills/page.tsx` lines 64–77).
- **Expected behavior:** Hub loads live skill/tool counts, connector stats, lease summary — or clear *migrations required* banner with apply checklist.
- **Severity:** blocker
- **Likely files:** `app/(shell)/skills/page.tsx`, `packages/linklogic-sdk/src/skills-catalog.ts`, `services/migrations/022_skills_progressive_disclosure.sql`, `services/migrations/011_linkaios_tools.sql`
- **Open question:** Confirm DO migration batch — is `022` applied while `011` missing, or both absent?

---

### 60. LiNKskills Skills tab — catalogue could not be loaded

- **Principal comment:** Skills catalogue empty/error state.
- **Screenshot:** `assets/4fd7f109-ee2e-4d3c-8ca6-051dbcf67037.png`
- **Current behavior:** `skills/skills/page.tsx` — `listSkills` error → *"The skills catalogue could not be loaded"* when mocks off.
- **Expected behavior:** Skills table with publish/runtime flags; demo merge only when `LINKAIOS_UI_MOCKS` on.
- **Severity:** high
- **Likely files:** `app/(shell)/skills/skills/page.tsx`, migration `022`
- **Open question:** None

---

### 61. LiNKskills Tools tab — `linkaios.tools` missing

- **Principal comment:** Tools shows schema cache error for `linkaios.tools`.
- **Screenshot:** `assets/3826f584-619b-441f-a343-852f61ae1d96.png`
- **Current behavior:** `skills/tools/page.tsx` surfaces raw PostgREST error message in red.
- **Expected behavior:** Tools catalogue from `linkaios.tools` (seed rows: `http-fetch`, `workspace-read`, `restricted-shell` per migration `011`).
- **Severity:** high
- **Likely files:** `app/(shell)/skills/tools/page.tsx`, `services/migrations/011_linkaios_tools.sql`, Supabase API schema exposure
- **Open question:** None

---

### 62. LiNKskills Capabilities slice — overview stats broken

- **Principal comment:** Capabilities load error on overview (screenshot).
- **Current behavior:** `computeCapabilitiesSliceStats()` receives empty skill/tool sets when queries fail — hub cards show zeros or error path from finding **59**.
- **Expected behavior:** Connector + capability connector stats from governed catalog (mock merge only in review mode).
- **Severity:** medium
- **Likely files:** `lib/capabilities-slice-stats.ts`, `app/(shell)/skills/page.tsx`
- **Open question:** None — downstream of **59**

---

### 63. LiNKskills Leases tab — Server Components crash

- **Principal comment:** Leases crashes like other leases pages.
- **Screenshot:** `assets/4e816c11-ca83-4003-aa4e-ffc85fec9a8b.png`
- **Current behavior:** `skills/leases/page.tsx` → `LinkskillsLeasesPanel` — uncaught throw from `resolveCalusaTenantId()` when `CALUSA_TENANT_ID` / `MVO_E2E_TENANT_ID` unset and seed RPC fails (same chain as finding **35**).
- **Expected behavior:** Platform-wide lease table for licensor scope, or actionable config error — not production error boundary.
- **Severity:** blocker
- **Likely files:** `components/linkskills-leases-panel.tsx`, `lib/admin-linkskills-tenant.ts`, `app/(shell)/error.tsx`
- **Open question:** Admin leases should use **licensor** tenant context, not Calusa demo resolver

---

## LiNKbrain

> **Screenshot references:** Inbox `assets/ea30e550-…png`; Project Memory `assets/7cf78b08-…png`; LiNKbot Memory `assets/8505c9ee-…png`; Company Memory `assets/2e9062a2-…png`; Ask LiNKbrain `assets/8fe592f2-…png`

**Admin purpose (Principal):** Manage **shared knowledge** from all linkbots — the **vendor brain** — not client-tenant memory UI bleed. Collective / licensor-scoped memory for studio ops, learning, and cross-licensee patterns (when governed).

### Root cause (all tabs)

`loadLinkbrainPageData()` (`lib/linkbrain-data.ts` line 110) selects **`mission_id`** from `memory_entries`. Migration **`033_linkaios_project_terminology.sql`** (applied on AdminDB per `PENDING_APPLY.md`) renamed column to **`project_id`**. Same failure class as Work Alerts (**20**) and worker LiNKbrain tab (**48**).

---

### 64. LiNKbrain — all tabs crash (`memory_entries.mission_id`)

- **Principal comment:** Inbox, Project Memory, LiNKbot Memory, Company Memory, Ask LiNKbrain — all show `column memory_entries.mission_id does not exist`.
- **Screenshots:** `ea30e550`, `7cf78b08`, `8505c9ee`, `2e9062a2`, `8fe592f2`
- **Current behavior:** `MemoryPageContent` → `loadLinkbrainPageData()` for every tab; query fails against migrated DB; error surfaces on page (red text or error boundary depending on path).
- **Expected behavior:** Query `project_id` (or shared SDK helper post-033); render licensor collective memory partitions.
- **Severity:** blocker
- **Likely files:** `lib/linkbrain-data.ts`, `components/linkbrain/memory-page-content.tsx`, `services/migrations/033_linkaios_project_terminology.sql`
- **Open question:** Confirm app deploy lag — migration 033 applied on DB but web still on pre-C query strings

---

### 65. LiNKbrain — Client tenant memory bleed on Admin

- **Principal comment:** Admin should manage **shared brain**, not mirror client Company Memory / tenant partitions.
- **Current behavior:** Shared `(shell)/memory/*` tabs include **Project Memory**, **Company Memory** — tenant-scoped UX copied to Admin (`/admin/memory/*` re-exports). `LinkbrainTabNav` shows full tab strip for licensor.
- **Expected behavior:** Admin LiNKbrain emphasizes **vendor shared knowledge** (collective inbox, cross-bot learning, audit) — tenant memory stays on **Client**. Scope by licensor filter, not licensee corporate profile.
- **Severity:** high
- **Likely files:** `lib/app-roles.ts` (`linkbrain` nav), `components/linkbrain/linkbrain-tab-nav.tsx`, `lib/collective-linkbrain.ts`
- **Open question:** Tab rename — **Company Memory** → **Collective / Vendor Memory** on Admin?

---

### 66. Add Knowledge — expected behavior (Admin shared brain)

- **Principal comment:** **Add Knowledge** should add to **shared brain** (admin-managed).
- **Current behavior:** `Add Knowledge` (`role-gated-ui.tsx`) links to `/memory/drafts/new` — creates **draft inbox items** per `linkbrain-scope-about.tsx` copy (*"drafts in Inbox — nothing is published until triaged"*). No distinction between admin collective vs tenant brain on Admin surface.
- **Expected behavior:** On Admin, **Add Knowledge** writes to **vendor shared brain** queue (governed inbox → librarian triage → collective memory). Audit + LinkSkills lease on publish. Not tenant-isolated client memory.
- **Severity:** medium
- **Likely files:** `components/role-gated-ui.tsx`, `app/(shell)/memory/drafts/new/page.tsx`, `components/linkbrain/linkbrain-scope-about.tsx`
- **Open question:** Librarian triage bot — admin linkbot tracked under LiNKbots, not LiNKbrain UI (see **67**)

---

### 67. LiNKbrain Audit tab — completeness unclear

- **Principal comment:** Audit tab appears complete but unclear if mock; librarian may be admin linkbot in LiNKbots.
- **Current behavior:** `LinkbrainAuditPanel` can show `linkbrain.audit_events` union when `run` query param set (LinkSites MVO). Otherwise demo/empty mix when mocks on. Principal could not fully evaluate while other tabs crash.
- **Expected behavior:** Clear **live vs fixture** labeling; document that **librarian** role is a **LiNKbot** tracked in **LiNKbots** fleet, not a LiNKbrain product surface.
- **Severity:** low
- **Likely files:** `components/linkbrain/linkbrain-audit-panel.tsx`, `lib/ui-mocks/linkbrain-demo-overlay.ts`
- **Open question:** Is Audit tab MVO-required on Admin, or defer until collective brain live?

---

## Clients / Licensees

> **Screenshot references:** Company crash — `assets/11077c2a-…png`; Brand crash — `assets/019b0c37-…png`

**Principal:** Section should **not** be **Company** — should be **Clients / Licensees** where admin consults licensee details (contacts, topology, billing, support) — not internal corporate governance for LiNKtrend studio.

Nav already labels accordion **Licensees** for licensor (`shell-sidebar.tsx`); canonical route `/admin/licensees` (`LICENSEES_PAGE_HEADER`). Client **Company / Brand** tabs still bleed when role preview or scope paths hit `CompanyPageShell` with licensee tabs.

### Crash root cause (`registeredOffice`)

`CompanyOverviewPanel` → `formatAddressDisplay(merged.registeredOffice)` → `formatPersonalAddressNatural(address)` assumes `address` object (`personal-contact-display.ts`). When `mergeCorporateProfile` receives incomplete base or licensor path resolves wrong company id, `merged.registeredOffice` can be **undefined** → `Cannot read properties of undefined (reading 'registeredOffice')` (error message may reference nested property access on undefined address parts).

`contractEntitySummaryForLicensee` also reads `profile.registeredOffice` (`licensor-licensee-profile.ts` line 159) — same fixture dependency.

---

### 68. Company → Clients / Licensees naming and purpose

- **Principal comment:** Should be **Clients / Licensees**, not Company — admin consults licensee details.
- **Current behavior:** Sidebar **Licensees** + `/admin/licensees` registry when All licensees scope; single-licensee scope opens `CompanyPageShell` with **Licensee Profile** header and Overview / Companies & Brands / Billing / Support tabs. Legacy `/admin/company` redirects to `/admin/licensees`. Client **Company** copy still in `COMPANY_PAGE_HEADER` on bleed paths.
- **Expected behavior:** Unified **Clients / Licensees** product label; no Client corporate governance (registered office, AGM, share capital) on Admin. Registry + per-licensee **service profile** only.
- **Severity:** high
- **Likely files:** `lib/company-page-copy.ts`, `components/shell-sidebar.tsx`, `components/admin/admin-company-page.tsx`
- **Open question:** Rename route `/licensees` → `/clients` or keep licensees term?

---

### 69. Company tab — runtime crash

- **Principal comment:** Company page crashes.
- **Screenshot:** `assets/11077c2a-…png`
- **Current behavior:** `CompanyEntityPanel` → `CompanyOverviewPanel` crashes on `registeredOffice` undefined (see root cause above). Triggered on Client-bleed `?tab=company` paths or role-preview licensee view on Admin.
- **Expected behavior:** Admin never renders Client corporate profile; licensor **Overview** tab uses `LicensorLicenseeOverviewPanel` without crash.
- **Severity:** blocker
- **Likely files:** `components/company-overview-panel.tsx`, `lib/company-fixtures.ts`, `components/company-page-shell.tsx`
- **Open question:** Which navigation path did Principal use — role preview as licensee?

---

### 70. Brand tab — runtime crash

- **Principal comment:** Brand page crashes (same error family).
- **Screenshot:** `assets/019b0c37-…png`
- **Current behavior:** `CompanyBrandPanel` / brand asset paths share fixture resolution; related Client-bleed tab on `?tab=brand`.
- **Expected behavior:** Admin **Companies & Brands** index (`LicensorLicenseeCompaniesPanel`) — operational index only, no Client brand asset upload cards on Admin.
- **Severity:** blocker
- **Likely files:** `components/company-brand-panel.tsx`, `components/licensor/licensor-licensee-companies-panel.tsx`
- **Open question:** None

---

## Settings

**Admin purpose:** Operator account, security, preferences, **platform data export/settings**, **credentials/API access for admin bots and capabilities** — not licensee self-service billing, support tickets, or workspace delete.

Routes: `/admin/settings` re-exports `(shell)/settings/page.tsx` → `SettingsHub`.

---

### 71. Settings Account — licensee affordances bleed

- **Principal comment:** Admin panel should have **no** delete account, **no** plan/billing, **no** support section.
- **Current behavior:** `SettingsHub` account tab: **Delete account** when `canDeleteWorkspaceAccount` (`settings-hub.tsx`). **Plan & Billing** when `kind === "licensee" && canManageBilling` — hidden for licensor. **Support** card only for `kind === "licensee"`. For licensor Admin, account tab is mostly Profile only — but role preview as licensee would show bleed cards.
- **Expected behavior:** Admin Account = **Profile Information** only (no delete, billing, support). Licensor operators are studio staff — not subscribing customers.
- **Severity:** high
- **Likely files:** `components/settings-hub.tsx`, `lib/app-roles.ts`
- **Open question:** Hard-hide delete/billing/support whenever `isAdmin` regardless of role preview?

---

### 72. Settings Account — workspace access card misfit

- **Principal comment:** Profile bottom *"companies/workspaces allowed"* may not fit admin model.
- **Current behavior:** `OperatorProfilePage` → `OperatorWorkspaceAccessCard` lists companies, modules, processes, projects from `resolveOperatorAccessScope()` — demo fixtures (`operator-access-scope.ts`) including `DEMO_SIDEBAR_MISSIONS` projects.
- **Expected behavior:** Admin operators see **platform scope** (licensor tier, assigned licensees) — not tenant workspace subscription shape.
- **Severity:** medium
- **Likely files:** `components/settings/profile/operator-workspace-access-card.tsx`, `lib/operator-access-scope.ts`
- **Open question:** Replace with licensor scope + role tier display?

---

### 73. Settings Security — roles and Add member flow

- **Principal comment:** User roles/permissions + Add member only for super admins or users with permission; Add member should **create user with all fields** then invite; on accept, **force password change**.
- **Current behavior:** `settings/access` — licensor shows **Operator Roles & Permissions** (`settings-hub.tsx`). Permission matrix in `lib/licensor-permissions-page-copy.ts`. Add-member UX not verified live — likely stub/local.
- **Expected behavior:** Gated invite/create: super admin or explicit permission; full field capture; invite email; first-login password reset required.
- **Severity:** high
- **Likely files:** `app/(shell)/settings/access/page.tsx`, `lib/licensor-permissions-page-copy.ts`, Supabase Auth admin invite API
- **Open question:** MVO — Supabase invite + `must_change_password` flag vs manual ops

---

### 74. Settings Security — 2FA appears mock

- **Principal comment:** 2FA screen seems mock — no QR preview.
- **Current behavior:** `TWO_FACTOR_COPY.pageNote` — *"Demo 2FA — verification is stored locally for MVO proof"* (`lib/two-factor-copy.ts`). Shows **demo setup key** text, not QR image; `readTwoFactorState()` uses `localStorage` (`STORAGE_2FA_KEY`).
- **Expected behavior:** Production: Supabase Auth MFA enrollment with QR; Admin review: clearly labeled demo until live.
- **Severity:** medium
- **Likely files:** `app/(shell)/settings/two-factor/page.tsx`, `lib/two-factor-copy.ts`
- **Open question:** None

---

### 75. Settings Preferences — low priority admin notes

- **Principal comment:** Generally fine; minor notes (no theme creation, notification/privacy presets) — **low priority, no change now**.
- **Current behavior:** Locale, appearance, notifications, privacy cards — shared Client/Admin; localStorage prefs.
- **Expected behavior:** Defer cosmetic admin-specific preset limits.
- **Severity:** low
- **Likely files:** `components/settings-hub.tsx`, preference sub-routes
- **Open question:** None — Principal deferred

---

### 76. Settings Data & Integrations — admin purpose aligned

- **Principal comment:** Admin needs export, data settings, credentials/API for admin bots and capabilities.
- **Current behavior:** Data tab for licensor shows **Data Export**, **Data Settings**, **API Access / Vaultwarden** (`settings-hub.tsx` lines 449–511) with licensor-specific copy. Directionally correct.
- **Expected behavior:** Keep and wire to real platform export + GSM/Vaultwarden — stubs acceptable with `StubBadge` until live.
- **Severity:** medium
- **Likely files:** `components/settings-hub.tsx`, `lib/vaultwarden-config.ts`, `lib/data-export-preferences.ts`
- **Open question:** None

---

### 77. Settings Data — Integrations card licensee bleed

- **Principal comment:** Integrations section doesn't make sense as currently shown for Admin.
- **Current behavior:** **Integrations** card (request unsupported software) renders only when `kind === "licensee"` — hidden for licensor. If role preview switches to licensee on Admin, card appears with `SUPPORTED_INTEGRATIONS` stub (`lib/integration-requests.ts`).
- **Expected behavior:** Admin manages **capability connectors** under **LiNKskills**, not licensee integration request queue. No Integrations card on Admin.
- **Severity:** high
- **Likely files:** `components/settings-hub.tsx`, `lib/integration-requests.ts`
- **Open question:** None

---

### 78. Settings Platform tab — visibility gap

- **Principal comment:** Platform page exists (linked somewhere) but **not visible** as Settings tab.
- **Current behavior:** `SETTINGS_HUB_TABS` includes **Platform** (`lib/settings-hub-tabs.ts`). `SettingsHub` sets `showPlatformTab = isAdmin` — tab should appear for Admin. **However** `visibleSettingsHubTabs()` filters to **Account + Preferences only** when `role === "user"` — licensor **User** tier hides Platform, Security, Data. Deep links: `/settings/platform` redirects to `/admin/settings?tab=platform` (`settings/platform/page.tsx`). `PlatformPanel` links gateway, traces, linkguard, governance (`components/settings/platform-panel.tsx`).
- **Expected behavior:** Platform tab visible for Admin/Super Admin tiers; document why User tier hides it; no orphan platform links.
- **Severity:** medium
- **Likely files:** `lib/settings-hub-tabs.ts`, `components/settings-hub.tsx`, `components/settings/platform-panel.tsx`
- **Open question:** Did Principal review as licensor **User** role (Customer Service tier)?

---

## Meta

### 79. Missing Customer Service section

- **Principal comment:** Admin needs **Customer Service** section — tickets/requests for clients.
- **Current behavior:** No top-level **Customer Service** nav. Partial surfaces exist:
  - **Work → Alerts** (crashes — finding **20**)
  - **Licensees → Support** tab per licensee (`LicensorLicenseeSupportPanel`) — fixture tickets via `readSupportTicketsForLicensee` (`lib/support-tickets.ts`)
  - **Settings → Support** (licensee only)
  - Floating **Support assistant** (`support-assistant-panel.tsx`) — local ticket stub
  - Planned migration **`038_support_tickets.sql`** (Chatwoot sync) — **Pending** (`services/migrations/PENDING_APPLY.md`)
  - Capability **`cap.chatwoot.customer_support`** — **Pending** in `LiNKskills/capability-connectors/connector-registry.md` → `link-chatwoot` repo
- **Expected behavior:** Dedicated Admin **Customer Service** section — unified ticket queue across licensees, governed by Chatwoot (or approved OSS) capability, operator assignment, link from Work/Alerts when integration live.
- **Severity:** high (product gap)
- **Likely files:** New nav section, `lib/support-tickets.ts`, `LiNKskills/capability-connectors/`, migration `038`, Chatwoot connector
- **Open question:** Chatwoot-first vs embedded ticket table until connector live?

---

## Executive summary & Admin product vision gap

**Principal closing assessment:** LiNKaios Admin **failed to be a true vendor UI** — too much **client-side bleed**. It should manage:

| Should manage (Admin) | Status on DO review |
|----------------------|---------------------|
| **Suites** (catalogue, composition, Stripe) | Mock scaffold — far from done (findings 1–19) |
| **LiNKskills** (platform governance) | **Broken** — missing DB migrations + leases crash (59–63) |
| **LiNKbrain** (shared vendor knowledge) | **Broken** — all tabs crash; tenant UI bleed (64–67) |
| **Admin LiNKbots** + fleet oversight of client bots | Shared Client shell; scope gaps; Add LiNKbot removed per Principal (40–57) |
| **Licensees / Clients** | Partial registry; Client Company/Brand crash bleed (68–70) |
| **Customer Service** | **Missing** section (79) |
| **Admin programs** (Projects repurposed) | Client project mirror only — not implemented (27–35, 58) |
| **Admin-scoped settings** | Partly OK; billing/support/delete bleed; Platform tab role-gated (71–78) |
| **Metrics** (platform telemetry) | **Live but empty** — not mock (36–39, Principal answer) |
| **Work** (operator queue) | Alerts crash; action queue raw JSON (20–26) |

**Missing vs vision:** customer service, proper licensee management (without corporate governance crash), admin-scoped settings, admin programs Projects model, migration-aligned queries (`project_id`, `category_id`, `tools` table).

**Next step (document only):** Principal will discuss this doc → finalize → convert to actionable fix plan for a **separate execution agent** while Principal reviews **Client**.

---

## Confirmed design clarifications

### Completeness bar (Suites finding 12)

| Check | Included in % |
|-------|:-------------:|
| Suite name | yes |
| Summary | yes |
| ≥1 module | yes |
| ≥1 phase | yes |
| ≥1 issue | yes |
| ≥1 LiNKbot assignee | yes |
| ≥1 automation assignee | yes |
| Stripe product linked | **no** (separate publish gate) |
| Already published | forced **100%** |

Threshold for **Mark ready:** ≥ **85%** (6 of 7 checks). Purpose: **publication readiness** of suite definition, not fleet health.

### Mark ready workflow (Suites finding 14)

```text
draft  --[Mark ready, completeness≥85%]-->  ready  --[Publish, stripeProductId set]-->  published
published  --[Unpublish]-->  ready   (supported in code, not exposed in UI)
```

State today: **client localStorage overlay** on static demo products — not authoritative server state.

### Stripe: tab vs subsection (Suites findings 5 / 13)

- Principal accepts **Suites → Stripe products** as cross-suite overview (`/suites/billing`).
- Principal also wants **per-suite Stripe tab** on builder with API-backed linking — complements global overview.

### Action queue vs Alerts (Work findings 20–21)

| Surface | Data source | Intended audience |
|---------|-------------|-------------------|
| **Work stream cards** | Counts + first-line preview | Navigate to sub-areas |
| **Action queue** | `buildAttentionFeed()` merge | Operator **next actions** |
| **Alerts inbox** | Traces + fixtures + support tickets | Severity-filtered problems |
| **System logs** | Full `linkaios.traces` | Audit / debugging |

Today the Action queue is effectively a **prioritized trace/message/session dump**, not a curated action list.

### Project Draft status (Projects finding 30)

| Status | Meaning | Set by |
|--------|---------|--------|
| **draft** | Project record created; orchestration not yet active | `linkaios.create_project` RPC default |
| **assigned** / **running** | Active work | Orchestration / Run spine (future transitions) |
| **completed** / **failed** / **cancelled** | Terminal | Run completion or operator action |

UI maps `draft` → amber **Draft** pill at 12% progress heuristic until live stage data exists.

### Runs tab vs System logs (Projects finding 34)

| Surface | Purpose |
|---------|---------|
| **Project → Runs tab** | Last 30 days of trace-derived **Runs** (LiNKbot/automation activity) for this project |
| **Open system logs →** | `/settings/traces?project=…` — full `linkaios.traces` audit tail filtered by project |
| **Plane board** | Execution kitchen — opened via **Open in Plane**, not Runs tab |

Runs ≠ Plane cycles. Continuous projects repeat **Runs** per terminology rule 07.

### Projects in Admin — refined decision (2026-06-08)

| Item | Decision |
|------|----------|
| Client/licensee projects in Admin | **Reject** — no tenant project management bleed |
| Admin **programs** (vendor ops) | **Keep concept** — Projects section repurposed (finding **58**) |
| `/admin/projects/*` client mirrors | **Remove/replace** — block until admin-program UI ships |
| Cross-tenant **client** project viewer | **Rejected** |
| Linktrend studio **tenant** project work | **Client** only |
| Admin worker **Projects** tab | **Admin bots only**; hide for client bots under monitoring (finding **46**) |
| **Add LiNKbot** on Admin | **Remove** — suite composition only (finding **41**) |

Findings 28–35 remain valid as bleed/bug evidence on current mirrors.

### Metrics mock vs live (findings 36–39)

| Condition | Data |
|-----------|------|
| `LINKAIOS_UI_MOCKS=1` | Full `demoMetricsSnapshot()` — fictional KPIs |
| Mocks off, no traces | Real zeros — not stub math |
| Mocks off, traces present | Live aggregation from `linkaios.traces` |
| Admin Cost view | Always partly mock (`metrics-licensor-kpi-views.ts`) |

### Admin LiNKbots purpose (findings 40–57)

| Surface | Intended | Today |
|---------|----------|-------|
| Fleet list | Monitor admin + all licensee bots | Shared Client workers list, no tenant filter |
| Add LiNKbot | **Suite composition only** — not Admin | Hidden on Admin list; stub in suite builder |
| Agent Projects tab | **Admin bots only** (admin programs) | Always shown — client bleed |
| LiNKbrain tab | Agent memory partition | **Crashes** on `mission_id` (finding 48) |

### LiNKskills / LiNKbrain / Licensees / Settings (findings 59–79)

| Area | Root issue |
|------|------------|
| LiNKskills | Migrations `022` (`category_id`), `011` (`tools`) likely not applied on DO |
| LiNKbrain | App queries `mission_id`; DB has `project_id` after migration 033 |
| Licensees | Client Company/Brand corporate UI crashes; naming drift |
| Settings | Client billing/support/delete bleed; Platform tab hidden for User tier |
| Customer Service | No dedicated nav; Chatwoot capability pending |

### Live deploy vs workspace branch

| Feature | Live DO (wave branch) | Current workspace |
|---------|----------------------|-------------------|
| LiNKsuitegen nav | yes (orphan sub-rail) | no |
| Fleet v1 nav | yes (orphan sub-rail) | no |
| Suites builder mock | yes | yes |
| LiNKsuitegen API routes | yes | no |
| Work Alerts page | crashes (finding 20) | same code path |
| UI mocks on DO | likely enabled (demo sessions visible) | `LINKAIOS_UI_MOCKS` env-dependent |
| Metrics on DO | demo or zeros (findings 36–37) | same code path |
| Demo agent LiNKbrain | crashes (finding 48) | same `mission_id` query |
| Project channels panel | yes (`ProjectChannelParityPanel`) | **no** (not on current branch) |
| Admin `/projects/*` mirrors | yes (client bleed) — **replace with admin programs** | yes |
| LiNKskills hub on DO | broken (migrations) | same code path |
| LiNKbrain memory tabs | all crash `mission_id` | same code path |
| Licensees Company/Brand | crash `registeredOffice` on bleed paths | same fixtures |
| Customer Service nav | **missing** | N/A |
| Projects Launch on DO | 500 Internal server error (finding 29) | same API path |
| Project Leases tab | crashes (finding 35) | same panel code |

Development pass should target **merged** Admin Suites + Work + Projects removal + LiNKbots/Metrics fixes on `development`.

---

## Route / file map

### Admin Suites

| Route | Component |
|-------|-----------|
| `/admin/suites` | `SuitesIndexRouter` → `LicensorSuitesIndex` |
| `/admin/suites/new` | `suites/new/page.tsx` |
| `/admin/suites/[id]/builder` | `LicensorSuiteBuilderPanel` |
| `/admin/suites/billing` | `suites/billing/page.tsx` |
| `/admin/linksuitegen` | `LiNKsuitegenDashboard` (live deploy) |
| `/admin/fleet` | Admin fleet page (live deploy) |

Shared: `shell-sidebar.tsx`, `licensor-suites-sidebar-section.tsx`, `lib/ui-mocks/licensor-suite-catalog.ts`, `hooks/use-licensor-suite-publish.ts`.

### Admin Work

| Route | Component | Notes |
|-------|-----------|-------|
| `/admin/work` | re-export → `(shell)/work/page.tsx` | All Work dashboard |
| `/admin/work/alerts` | re-export → `(shell)/work/alerts/page.tsx` | **Crashes** (finding 20) |
| `/admin/work/messages` | re-export → `(shell)/work/messages/page.tsx` | `WorkMessagesWorkspace` |
| `/admin/work/sessions` | re-export → `(shell)/work/sessions/page.tsx` | `SessionsInbox` → `SessionsCatalogTable` |

Shared: `lib/work-attention-feed.ts`, `lib/work-alerts.ts`, `lib/work-messages.ts`, `lib/zulip-links.ts`, `lib/work-sessions.ts`, `components/action-queue/*`, `components/work-stream-card.tsx`.

Sidebar: `shell-sidebar.tsx` — Work submenu links via `appHref("/work/…")`.

### Admin Projects

| Route | Component | Notes |
|-------|-----------|-------|
| `/admin/projects` | re-export → `(shell)/projects/page.tsx` | Client list mirrored |
| `/admin/projects/new` | re-export → `(shell)/projects/new/page.tsx` | **Launch fails** (finding 29) |
| `/admin/projects/[id]` | re-export → `(shell)/projects/[id]/page.tsx` | Tabs empty/crash (findings 33–35) |

Shared: `components/projects-index-table.tsx`, `components/projects/new-project-wizard.tsx`, `app/api/projects/route.ts`, `lib/projects/create-project-persistence.ts`, `lib/app-roles.ts` (`LICENSOR_NAV` omits `projects`).

Deploy-only: `components/project-channel-parity-panel.tsx` (Wave 7.4 on `f6251f7`).

Sidebar: `shell-sidebar.tsx` — Projects accordion **must be removed on Admin** (Principal decision); Admin mirrors reachable by URL until blocked.

### Admin Metrics

| Route | Component | Notes |
|-------|-----------|-------|
| `/admin/metrics` | re-export → `(shell)/metrics/page.tsx` | Mock or live per `LINKAIOS_UI_MOCKS` (findings 36–39) |

Shared: `components/metrics-dashboard.tsx`, `app/(shell)/metrics/actions.ts`, `lib/metrics-licensor-kpi-views.ts`, `lib/ui-mocks/metrics-demo-snapshot.ts`.

### Admin LiNKbots

| Route | Component | Notes |
|-------|-----------|-------|
| `/admin/workers` | re-export → `(shell)/workers/page.tsx` | Fleet list — no licensee scope (finding 40) |
| `/admin/workers/new` | re-export → `(shell)/workers/new/page.tsx` | Add LiNKbot modal |
| `/admin/workers/[id]/*` | re-export → `(shell)/workers/[id]/*` | Shared worker detail tabs |

Shared: `lib/worker-detail-tabs.ts`, `components/worker-subnav.tsx`, `lib/admin-fleet-troubleshoot.ts`, `lib/linkbrain-data.ts`, `components/agent-models-form.tsx`, `components/agent-settings-form.tsx`.

### Admin LiNKskills

| Route | Component | Notes |
|-------|-----------|-------|
| `/admin/skills` | re-export → `(shell)/skills/page.tsx` | Overview **broken** (59) |
| `/admin/skills/skills` | skills catalogue | **broken** (60) |
| `/admin/skills/tools` | tools catalogue | **broken** (61) |
| `/admin/skills/leases` | `LinkskillsLeasesPanel` | **Crashes** (63) |

Shared: `packages/linklogic-sdk/src/skills-catalog.ts`, `packages/linklogic-sdk/src/tools-catalog.ts`, `lib/admin-linkskills-tenant.ts`.

### Admin LiNKbrain

| Route | Component | Notes |
|-------|-----------|-------|
| `/admin/memory` | `MemoryPageContent` | All tabs **crash** (64) |
| `/admin/memory/drafts/new` | Add Knowledge | Shared brain intent (66) |

Shared: `lib/linkbrain-data.ts`, `components/linkbrain/memory-page-content.tsx`.

### Admin Clients / Licensees

| Route | Component | Notes |
|-------|-----------|-------|
| `/admin/licensees` | `AdminCompanyPage` | Registry or `CompanyPageShell` |
| `/admin/company` | redirect → `/admin/licensees` | Legacy |

Shared: `lib/company-page-copy.ts`, `lib/licensor-licensee-profile.ts`, `components/company-overview-panel.tsx`.

### Admin Settings

| Route | Component | Notes |
|-------|-----------|-------|
| `/admin/settings` | `SettingsHub` | Account/Security/Prefs/Data/Platform (71–78) |
| `/admin/settings/platform` | redirect → `?tab=platform` | Platform panel |

Shared: `components/settings-hub.tsx`, `lib/settings-hub-tabs.ts`, `components/settings/platform-panel.tsx`.

---

## Out of scope for this pass

(items Principal did **not** mention in this review)

- Licensee Client **My Suites** / marketplace subscribe UX (Client-only; not Admin review scope except mirror overlap)
- LiNKsuitegen factory orchestration internals (LiNKsuitegen repo generation pipeline)
- Full Fleet v1 dashboard content (only nav placement questioned under Suites)
- Hetzner / Wave 12 migration
- Plane/CRM integration on suite templates
- Mission → Project terminology backend migration (phases C/D) — **except** app queries must use `project_id` post-033 (findings 20, 48, 64)
- LiNKbrain inbox triage UX (only referenced via Work stream card)
- LiNKbot detail **font** polish (finding 57 — Principal separate UI pass)
- **Client** LiNKaios review (Principal parallel track)

---

## Next step

1. **Principal confirms** this document captures all review comments (full Admin pass: Suites through Customer Service gap).
2. **Projects model** — refined: **no client bleed**; **admin programs** (finding **58**). **Add LiNKbot** removed from Admin.
3. **Execution plan:** [`ADMIN_UI_FIX_PLAN.md`](./ADMIN_UI_FIX_PLAN.md) — Waves 0–6, one orchestrator agent with parallel sub-agents per wave. Principal re-review on DO after **Wave 2** and **Wave 6**.
4. **Legacy priority hint** (superseded by fix plan waves):

   **Blockers (migration / crash)**
   - Work: **20**; LiNKbrain: **48**, **64** (`mission_id` → `project_id` in `linkbrain-data.ts`, alerts page)
   - LiNKskills: **59**, **63** (apply migrations `022`, `011`; fix leases tenant resolver)
   - Licensees: **69**, **70** (guard `registeredOffice`; remove Client corporate bleed on Admin)
   - Suites: 8, 18, 19
   - Projects mirrors: **27** (block client UI until admin programs)

   **High (product boundary)**
   - Executive gap: **79** Customer Service section
   - LiNKbots: **40**, **41**, **42**, **46**; LiNKbrain: **65**; Licensees: **68**
   - Settings: **71**, **73**, **77**
   - Suites, Work, Metrics, Projects as prior list

   **Medium/Low** — per section tables above.

5. **Re-review on DO** with `LINKAIOS_UI_MOCKS=0`; apply pending migrations batch before LiNKskills/LiNKbrain re-test.

---

*Document authored from Principal live review (2026-06-06) + follow-ups (2026-06-08, final). Updated with LiNKskills, LiNKbrain, Clients/Licensees, Settings, Customer Service gap, executive assessment. No code changes in this pass.*
