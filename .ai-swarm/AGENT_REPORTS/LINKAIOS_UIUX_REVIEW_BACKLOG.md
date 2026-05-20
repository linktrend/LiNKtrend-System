# LiNKaios UI/UX Review Backlog

Maintained by the LiNKaios UI/UX review agents.
Status: `open` | `in-progress` | `fixed`

## Fixed In UIUX Backlog Pass

### UIUX-HOME-002 — Mobile sidebar drawer
**Status:** fixed
**Effort:** complex/long
**Commit:** 90a83be

Implemented mobile navigation with a hamburger trigger, overlay, drawer behavior, desktop persistence, and route-change close behavior.

### UIUX-HOME-007 — System status banner redesign
**Status:** fixed
**Effort:** medium
**Commit:** 90a83be

Removed the sticky oversized banner pattern and generic Settings link. Added a collapsible status chip with issue count, severity icons, and direct issue actions.

### UIUX-HOME-010 — Overview refreshed timestamp
**Status:** fixed
**Effort:** medium
**Commit:** 90a83be

Added relative refresh timestamp and manual refresh action to the overview header.

### UIUX-HOME-011 — Quick actions grid
**Status:** fixed
**Effort:** easy/fast
**Commit:** 90a83be

Changed quick actions to a responsive grid that fits four actions in one row on wide screens and adapts at smaller breakpoints.

### UIUX-HOME-012 — System status issue icons
**Status:** fixed
**Effort:** medium
**Commit:** 90a83be

Implemented together with `UIUX-HOME-007` using purpose-specific issue icons and direct fix affordances.

### UIUX-MESSAGES-010 — Slack and Telegram tabs
**Status:** fixed for UI/mock surface
**Effort:** complex/long
**Commit:** 90a83be

Messages workspace now supports channel filtering beyond Zulip when channel-tagged threads are available. Live gateway/schema work remains a backend integration follow-up.

### UIUX-WORKERS-001 — Double breadcrumb on worker detail pages
**Status:** fixed
**Effort:** medium
**Commit:** 90a83be

Removed redundant inline breadcrumb from `WorkerDetailHeader`; shell breadcrumb remains the navigation context.

### UIUX-WORKERS-002 — Worker status card pills
**Status:** fixed
**Effort:** medium
**Commit:** 90a83be

Registry and presence now use shared color-coded worker status badge helpers.

### UIUX-WORKERS-003 — LiNKbrain Entries structure
**Status:** fixed
**Effort:** medium
**Commit:** 90a83be

Worker LiNKbrain entries now have row structure, icons, dates/tags, and hover treatment.

## Overview Page Review (Round 1) — 2026-05-20

### Fixed this session (Overview `/`)

| ID | Title | Status |
|----|-------|--------|
| UIUX-OVERVIEW-001 | System status accessible label | fixed |
| UIUX-OVERVIEW-002 | Operator-friendly system issue copy | fixed |
| UIUX-OVERVIEW-003 | Temporary sidebar LiNKaios icon + wordmark | fixed |
| UIUX-OVERVIEW-004 | Remove duplicate “Open All Work” in Work summary | fixed |
| UIUX-OVERVIEW-006 | Page title = breadcrumb name; subtitle; header above content | fixed (Overview only — app-wide rollout backlogged) |
| UIUX-OVERVIEW-007 | Workforce summary mobile grid | fixed |
| UIUX-OVERVIEW-ADD-001 | System status expanded list: white panel + row hover | fixed |
| UIUX-OVERVIEW-ADD-002 | Attention feed: All Work action queue pattern | fixed (shared `attention-queue-row.tsx`) |
| UIUX-OVERVIEW-M005 | Hydration mismatch on refresh timestamp | fixed |

**Files touched:** `overview-home.tsx`, `shell-sidebar.tsx`, `shell-page-header.tsx`, `attention-feed-row.tsx`, `status-colors.ts`, `operator-copy.ts`

### Rejected (Overview round 1)

| ID | Title | User decision |
|----|-------|---------------|
| UIUX-OVERVIEW-008 | Mark mock/fixture rows differently | Rejected — mock data is required during UI/UX review to preview real-life layouts |

---

### UIUX-GLOBAL-001 — Centralized UI/UX design system (ShadCN + tokens + status colours)
**Status:** backlogged  
**Effort:** complex/long  
**Page/route:** App-wide  
**Related system:** LiNKaios shell, all modules  

**Problem:** UI controls, badges, buttons, fields, icons-vs-links rules, and status colour semantics are scattered. Chairman requested a single centralized system (reference: LiNKapps design tokens / saas starter kit) using ShadCN, Lucide, multi-theme support beyond light/dark, and the full status colour matrix (Project, Workflow, Issue, Run, Approval, Lease, LinkBot, Sync, etc.).

**Desired improvement:** One canonical token + component layer that every page imports — no per-page colour guessing.

**User notes:** Original request was ignored by prior agents; must be rebuilt properly.

**Likely files:** `packages/ui/`, `LiNKaios/linkaios-web/src/lib/ui-standards.ts`, `ui-theme.ts`, `status-colors.ts` (started), ShadCN init if approved  

**Acceptance criteria:** All badges/pills/status rows pull from one module; documented colour map for every object status; theme switch supports future brand themes.

**Verification:** Spot-check Overview, Work, Projects, Workers, Skills for consistent controls and status colours.

---

### UIUX-GLOBAL-002 — Shared page header on every screen + AI help assistant
**Status:** in-progress (header shell done; AI assistant backlogged)  
**Effort:** medium  
**Page/route:** App-wide  

**Problem:** Only Overview uses the new header pattern (title = page name, short subtitle, refresh right, help button).

**Desired improvement:** Same header component on every page; Help opens an AI assistant that explains the current page and app operation.

**User notes:** Help button is placeholder (“coming soon”) on Overview until assistant is built.

**Progress:** `ShellAutoPageHeader` + `shell-page-meta.ts` inject title/subtitle/Help/Refresh on all routes except Overview, Work, and worker detail (which keep custom headers). Worker tab sections now have Help via `WorkerTabSectionHeader`.

**Likely files:** `shell-page-header.tsx`, `shell-auto-page-header.tsx`, `shell-page-meta.ts`, new help/chat surface  

**Acceptance criteria:** Every route shows consistent title/subtitle/actions; help assistant answers page-specific guidance.

---

### UIUX-GLOBAL-003 — Standard attention/action queue row pattern app-wide
**Status:** backlogged  
**Effort:** medium  
**Page/route:** `/work`, `/work/alerts`, other queue tables  

**Problem:** Coloured left border + icon badge + hover row pattern implemented on Overview only.

**Desired improvement:** Same row behaviour everywhere similar lists appear.

**User notes:** Chairman prefers All Work action queue over coloured icon boxes; Overview updated to match.

**Likely files:** `attention-queue-row.tsx`, `attention-queue-row-styles.ts`, Work inbox components  

**Note for later reviews:** Partially implemented — Overview + All Work share `AttentionQueueRow`. Alerts/Messages thread lists still pending.

---

## LiNKBots Section Review — 2026-05-20

### Fixed this session

| ID | Page | Title | Status |
|----|------|-------|--------|
| UIUX-WORKERS-E001 | App-wide | Auto `ShellPageHeader` on routes without custom header (`shell-auto-page-header.tsx`) | fixed |
| UIUX-WORKERS-E002 | `/workers` | Shared page header (Help + Refresh) via auto header | fixed |
| UIUX-WORKERS-E003 | `/workers` | Single status badge (Inactive/Busy/Idle/Online); list row = name, role, projects, heartbeat | fixed |
| UIUX-WORKERS-E004 | `/workers` | Demo fleet mock alignment (Lisa Busy, Eric Idle; 2 bots only in mock mode) | fixed |
| UIUX-WORKERS-E005 | `/workers` | Removed confusing “Visible” stat card | fixed |
| UIUX-WORKERS-E006 | `/workers/[id]/projects` | Demo agent Projects tab 404 — mock fixtures | fixed |
| UIUX-WORKERS-E007 | worker tabs | Help button on tab section headers | fixed |
| UIUX-WORKERS-E008 | worker mocks | “mission” → “project” in demo skill/brain copy | fixed |
| UIUX-WORKERS-E009 | worker detail | Snapshot card: one status badge, heartbeat, primary model, projects | fixed |

**Files touched:** `workers/page.tsx`, `worker-detail-header.tsx`, `worker-header-model.ts`, `demo-fleet-profiles.ts`, `linkbot-fleet-status.ts`, `shell-page-meta.ts`, `shell-auto-page-header.tsx`, `shell-main-frame.tsx`, `worker-tab-section-header.tsx`, `workers/[id]/projects/page.tsx`, worker tab pages, `worker-ui.ts`

### UIUX-WORKERS-M001 — Stat cards stay informational; filter pills below tabs
**Status:** backlogged (accepted design)  
**User decision:** Stats not clickable; filter badges remain the filter control.

### UIUX-WORKERS-M002 — Equal-width status pills
**Status:** backlogged → UIUX-GLOBAL-001

### UIUX-WORKERS-H001 — Worker detail profile + snapshot redesign
**Status:** backlogged  
**User spec (item 17):** Left = employee-style profile (name, role, description, id). Right = operational snapshot (single status badge, heartbeat, primary model, projects, uptime). Collapsible header optional.  
**Current state:** Partial — snapshot card updated; full IA pass still needed.

### UIUX-WORKERS-H002 — Projects + Modules combined tab
**Status:** backlogged  
**User spec:** LiNKbots execute issues → workflows → processes → projects → modules. Consider one “Work context” tab bundling modules + projects instead of separate Modules tab.

### UIUX-WORKERS-H003 — Respond/Stop on worker Sessions tab
**Status:** backlogged (same as UIUX-WORK-SESS-M001/H001)  
**Note:** Actions appear on `/workers/[id]/sessions`, not fleet list.

### UIUX-WORKERS-H004 — Sidebar Recent/Pinned LiNKBots
**Status:** backlogged — leave placeholders during UI review (user decision).

---

## Projects Section Review — 2026-05-20

### Fixed this session

| ID | Title | Status |
|----|-------|--------|
| UIUX-PROJECTS-E001 | Single list header + New Project in header actions | fixed |
| UIUX-PROJECTS-E002 | Plain-English list subtitle | fixed |
| UIUX-PROJECTS-E003 | Per-row Plane link kept; uses project code when mapped (`planeProjectBoardHref`) | fixed |
| UIUX-PROJECTS-E004 | Detail title = project name (not “Projects”) | fixed |
| UIUX-PROJECTS-E005 | Removed duplicate detail breadcrumb | fixed |

**Also:** `ShellPageHeader` now accepts optional `actions` slot for page-specific buttons.

### UIUX-PROJECTS-M001 — Varied demo lifecycle statuses in “At a glance”
**Status:** backlogged  
**Suggested fix:** Mix draft/completed/attention fixtures in `missions-fixtures.ts`.

### UIUX-PROJECTS-M002 — Narrower projects table + icons
**Status:** backlogged  
**User notes:** Use icons where possible to save width; drop or modal secondary columns.

### UIUX-PROJECTS-M003 — Status pills equal width
**Status:** backlogged → UIUX-GLOBAL-001

### UIUX-PROJECTS-M004 — Summary modal value
**Status:** backlogged  
**Suggested fix:** Enrich modal or remove and link straight to detail.

### UIUX-PROJECTS-M005 — New Project page header alignment
**Status:** backlogged  
**User notes:** New project only from pre-determined project types (a type = process or set of processes).

### UIUX-PROJECTS-H001 — Project detail IA redesign (operator snapshot)
**Status:** backlogged  
**User spec:** Top snapshot: project name, module, id, lead bot, what it does, **progress bar** (per issue → workflow → process). Below: single hierarchical view of processes/workflows/issues rather than many thin tabs; optional tabs for bots/automations, skills/tools, LiNKbrain items.  
**Suggested approach:** Snapshot + progress strip + expandable process tree; tabs reduced to Execution / Capabilities / Memory.

### UIUX-PROJECTS-H002 — Plane ↔ LiNKaios project mapping
**Status:** backlogged (ties PM-004)  
**User notes:** Per-row Plane deep link desired; full mapping work still pending.

### UIUX-PROJECTS-H003 — New Project wired to governed project types
**Status:** backlogged (ties PM-003)  
**User spec:** Kickoff only from pre-determined project types; each type defines process set.

### UIUX-PROJECTS-H004 — Tab naming (Tool permissions vs LiNKskills)
**Status:** backlogged → UIUX-OVERVIEW-H003 glossary

---

## Work Section Review — 2026-05-20

### Fixed this session

| ID | Page | Title | Status |
|----|------|-------|--------|
| UIUX-WORK-001 | `/work` | Plain-English subtitle + shared page header (Refresh + Help) | fixed |
| UIUX-WORK-002 | `/work` | Shared `AttentionQueueRow` component for action queue | fixed |
| UIUX-WORK-003 | `/` | Overview attention list matches All Work queue style | fixed |
| UIUX-WORK-ALERTS-001 | `/work/alerts` | Subtitle + page header; hide migration banner | fixed |
| UIUX-WORK-ALERTS-002 | alerts inbox | Plain-English resolve persistence note in modal | fixed |
| UIUX-WORK-MSG-001 | `/work/messages` | Plain-English subtitle + header; filter helper text | fixed |
| UIUX-WORK-MSG-002 | messages | Button label `Open in Zulip/Slack/Telegram` | fixed |
| UIUX-WORK-SESS-001 | `/work/sessions` | Header + subtitle (Respond/Stop behaviour); remove footnote | fixed |

### UIUX-WORK-M001 — Work stream card status pills (width + typography rules)
**Status:** backlogged  
**Effort:** medium  
**Page/route:** `/work`  

**Problem:** At some widths, Review/OK pills overflow or clip inside stream cards (see chairman screenshot). Pills also need global rules: bold, `Review` capitalization, darker border than fill, standard status colours, equal width per screen (widest label sets width for all).

**Suggested fix:** Central `StatusPill` in UIUX-GLOBAL-001 with fixed min-width from longest label on page; reduce card header to icon + count until pills fit, or stack pill below title on narrow cards.

**User decision:** Accepted — tie to UIUX-GLOBAL-001; fix overflow when centralized system lands.

---

### UIUX-WORK-M002 — Review vs OK labelling on stream cards
**Status:** backlogged  
**Suggested fix:** Rename to “Needs you” / “All clear” with one-line legend under cards.

---

### UIUX-WORK-M003 — Mobile layout for four stream cards
**Status:** backlogged  
**Suggested fix:** Single column on xs, 2-col sm, 4-col lg; test at chairman’s resize breakpoints.

---

### UIUX-WORK-H001 — Work hub information architecture
**Status:** backlogged  
**Suggested fix:** Clarify hub (counts + jump) vs detail pages (triage); reduce duplicate queue vs Overview once briefing layout (UIUX-OVERVIEW-H001) is done.

---

### UIUX-WORK-ALERTS-M001 — Alert “View” should open specific trace
**Status:** backlogged  
**Suggested fix:** Deep-link to trace/run for that alert, not generic Settings → Traces.

---

### UIUX-WORK-ALERTS-M002 — More mock alert fixtures (critical, info, resolved)
**Status:** backlogged  
**Note:** Same intent as UIUX-OVERVIEW-MOCK — app-wide mock richness.

---

### UIUX-WORK-ALERTS-H001 — Persist alert resolve to database before launch
**Status:** backlogged  

---

### UIUX-WORK-MSG-M001 — Mock threads for Slack and Telegram tabs
**Status:** backlogged  
**Suggested fix:** Add fixtures per channel when `LINKAIOS_UI_MOCKS=1`; keep identical layout across tabs.

---

### UIUX-WORK-MSG-M002 — Messages mobile two-panel layout
**Status:** backlogged  
**Suggested fix:** Stack thread list above conversation on narrow screens; full-width “Open in …” button.

---

### UIUX-WORK-MSG-M003 — Messages thread + conversation layout redesign
**Status:** backlogged  
**User spec:** Thread column shows title + unread count only; conversation pane lists unread messages first; selecting one shows full message below with scroll for long threads.  
**Suggested fix:** Three-level drill: thread list → unread message list → message body. View-only; reply via “Open in {channel}”.

---

### UIUX-WORK-MSG-H001 — No in-app reply (by design)
**Status:** backlogged / accepted design  
**User notes:** Information/view only; reply in native channel. Document in Help assistant.

---

### UIUX-WORK-SESS-M001 — Respond/Stop on demo sessions
**Status:** backlogged  
**Suggested fix:** Demo rows: hide actions or show enabled buttons that explain “Demo only” in Help; live UUID sessions keep real Respond (open bot session chat) and Stop (close session).

---

### UIUX-WORK-SESS-M002 — Sessions table mobile card layout
**Status:** backlogged  

---

### UIUX-WORK-SESS-M003 — Optional status icon column left (vs badge column)
**Status:** backlogged  
**User notes:** Fine with badges OR move status to far-left icon matching queue pattern — decide in UIUX-GLOBAL-001 pass.

---

### UIUX-WORK-SESS-H001 — Confirm Respond opens bot session chat; Stop closes session
**Status:** backlogged  
**Suggested fix:** Verify `openHref` routes to worker session chat; Stop calls runtime close; document in Help.

---

## Remaining Product Model Follow-ups
**Status:** backlogged  
**Effort:** medium  
**Page/route:** `/`  

**Problem:** Online / Busy / Idle numbers are shown without explanation or drill-down.

**Desired improvement:** Each stat links to the relevant filtered list; one-line helper text (e.g. what “Busy” means).

**User decision:** Accepted for backlog.

---

### UIUX-OVERVIEW-M006 — Quick actions that match installed business modules
**Status:** backlogged  
**Effort:** medium  
**Page/route:** `/`  

**Problem:** “Create project” is generic; does not reflect module-specific start flows (e.g. WebsiteFactory).

**Desired improvement:** Show module-aware primary actions when modules are installed.

**User decision:** Accepted for backlog.

---

### UIUX-OVERVIEW-M007 — Unified summary card layout
**Status:** backlogged  
**Effort:** medium  
**Page/route:** `/`  

**Problem:** Workforce, Work, and Projects summaries use three different internal layouts.

**Desired improvement:** One consistent summary card pattern (ties to UIUX-GLOBAL-001).

**User decision:** Accepted for backlog.

---

### UIUX-OVERVIEW-H001 — Rebuild Overview as operator “morning briefing”
**Status:** backlogged  
**Effort:** complex/long  
**Page/route:** `/`  

**Problem:** Overview is a stack of widgets; does not yet answer “what’s broken, what’s running, what needs approval” in one scan.

**Desired improvement:** Prioritized briefing layout: status → blockers → active work → fleet → recent activity → quick starts.

**User decision:** Accepted for backlog.

---

### UIUX-OVERVIEW-H002 — System health: mock for review, real wiring before launch
**Status:** backlogged  
**Effort:** complex/long  
**Page/route:** `/`  

**Problem:** Health checks mix live probes and config warnings; behaviour differs when services are down.

**Desired improvement:** During UI review, stable mock health data where needed; before staging/production, real per-service health with plain-English messages.

**User notes:** Chairman agrees with recommendation; mock is fine for current review phase.

---

### UIUX-OVERVIEW-H003 — Consistent product naming across Overview and nav
**Status:** backlogged  
**Effort:** complex/long  
**Page/route:** App-wide  

**Problem:** Sidebar and body copy use slightly different names for the same things (Work, LiNKbots, Skills, etc.).

**Desired improvement:** One glossary-aligned vocabulary everywhere.

**User decision:** Accepted for backlog.

---

### UIUX-OVERVIEW-MOCK — Rich mock data on all Overview sections during review
**Status:** backlogged  
**Effort:** medium  
**Page/route:** `/`  

**Problem:** Chairman needs to preview how the app will look and work in real life; some sections still feel empty or thin.

**Desired improvement:** Ensure demo/mock fixtures populate every Overview block during `LINKAIOS_UI_MOCKS=1` so review reflects a realistic operating day.

**User notes:** Clarifies medium items 1–3 — focus is mock completeness for review, not backend wiring yet.

---

## Remaining Product Model Follow-ups

### PM-001 — Repo-wide `mission` to `project` rename
**Status:** open
**Effort:** complex/long
**Category:** terminology / backend wiring

Replace repo-wide user-facing `mission` naming with `project` wording after UI/UX review and migration planning. Preserve internal compatibility fields until coordinated schema/runtime rename packets are approved.

### PM-002 — Live module/project-type metadata
**Status:** open
**Effort:** complex/long
**Category:** backend wiring

Replace mock/fallback module and project-type metadata on live project detail/index with canonical module/project-type joins from kernel/project records.

### PM-003 — Real New Project start flow
**Status:** open
**Effort:** complex/long
**Category:** backend wiring

Wire `Module -> Project Type -> intake/start` UI to real create/start actions once approved API contracts are available.

### PM-004 — Plane sync telemetry
**Status:** open
**Effort:** complex/long
**Category:** integration

Add per-project Plane IDs and sync telemetry so `Plane sync` shows real state beyond mock-safe placeholders.

### PM-005 — LinkBot project context live wiring
**Status:** open
**Effort:** complex/long
**Category:** backend wiring

Wire worker project context to live source-of-truth fields for module, project_type, workflow_handle, issue refs, run refs, and trace refs.

### PM-006 — LiNKbrain Issue and Workflow Memory
**Status:** open
**Effort:** complex/long
**Category:** memory / retrieval

Add explicit Issue Memory and Workflow Memory surfaces in LiNKbrain with the same client/vendor scope markers used for Company/Project/LiNKbot memory.

### PM-007 — LiNKbrain role/scope enforcement
**Status:** open
**Effort:** complex/long
**Category:** security / retrieval

Replace UI-only memory boundary badges with real role/scope enforcement sourced from retrieval permission checks.

### PM-008 — LinkSkills runtime catalog wiring
**Status:** open
**Effort:** complex/long
**Category:** governance / backend wiring

Connect UI terminology badges for Output vs Side Effect and client-visible vs vendor-only to real LinkSkills lease/policy/certification data.

## LiNKbrain Review (Round 1) — 2026-05-20

Chairman approved items 1–19 with inbox-first workflow preserved (Add Knowledge → Inbox → approve → LiNKbrain).

### Fixed this session (LiNKbrain)

| ID | Title | Status |
|----|-------|--------|
| UIUX-BRAIN-001 | Duplicate headers on `/memory` | fixed |
| UIUX-BRAIN-002 | Collapsible scope/approval explainer | fixed |
| UIUX-BRAIN-003 | Tab-specific subtitles | fixed |
| UIUX-BRAIN-004 | Inbox filter pill labels | fixed |
| UIUX-BRAIN-005 | Inbox Review pill styling | fixed |
| UIUX-BRAIN-006 | Shared header on draft routes | fixed |
| UIUX-BRAIN-007 | Inbox queue-style rows | fixed |
| UIUX-BRAIN-008 | Memory document queue-style rows | fixed |
| UIUX-BRAIN-009 | Scope-aware mock fixtures | fixed |
| UIUX-BRAIN-010 | Demo LiNKbot UUID fixtures | fixed |
| UIUX-BRAIN-011 | Ask tab scope narrowing UI | fixed |
| UIUX-BRAIN-012 | Consolidated Add → Inbox panel | fixed |
| UIUX-BRAIN-013 | Project terminology on draft pages | fixed |
| UIUX-BRAIN-014 | Audit trail link (Cockpit) | fixed |
| UIUX-BRAIN-015 | Issue/Workflow memory placeholders (PM-006) | fixed (footer) |
| UIUX-BRAIN-016 | Scope badge enforcement note (PM-007) | fixed (copy) |
| UIUX-BRAIN-017 | Embedding pipeline stats in footer | fixed |
| UIUX-BRAIN-018 | Legacy company-structure link → `/company` | fixed |
| UIUX-BRAIN-019 | Edit/remove via Inbox on file detail | fixed |

### Backlogged follow-ups

| ID | Title | Status |
|----|-------|--------|
| PM-006 | Issue & Workflow Memory full surfaces | backlogged |
| PM-007 | Real retrieval scope enforcement | backlogged |
| UIUX-BRAIN-H001 | Dedicated audit ledger in LiNKbrain IA | backlogged |

---

## LiNKskills Review (Round 1) — 2026-05-20

Chairman approved items 1–17. Implemented in UI review pass (no commit unless requested).

### Fixed this session (LiNKskills)

| ID | Title | Status |
|----|-------|--------|
| UIUX-SKILLS-001 | Duplicate headers on hub and catalogues | fixed |
| UIUX-SKILLS-002 | Plain-English hub subtitle | fixed |
| UIUX-SKILLS-003 | Sidebar “All Capabilities” → Overview | fixed |
| UIUX-SKILLS-004 | Breadcrumb Tools label | fixed |
| UIUX-SKILLS-005 | Breadcrumb `/skills/skills` → Skills | fixed |
| UIUX-SKILLS-006 | Glossary hub-only; brief on subpages | fixed |
| UIUX-SKILLS-007 | Capability connectors catalogue page (mock) | fixed |
| UIUX-SKILLS-008 | Narrower catalogue tables + icon headers | fixed |
| UIUX-SKILLS-009 | Hub link to Cockpit leases + governance card | fixed |
| UIUX-SKILLS-010 | Fixture vs live catalogue sections | fixed |
| UIUX-SKILLS-011 | Collapse semantic search in mock mode | fixed |
| UIUX-SKILLS-012 | Lifecycle/connector pill styling (partial GLOBAL-001) | fixed |
| UIUX-SKILLS-013 | mission → project copy in tool fixture | fixed |
| UIUX-SKILLS-014 | Catalogue vs governance cross-links | fixed |
| UIUX-SKILLS-015 | Demo skill detail for fixture rows | fixed |
| UIUX-SKILLS-016 | Add skill/tool actions retained with governed tooltip | fixed |
| UIUX-SKILLS-017 | Hub sub-nav: Skills \| Tools \| Connectors \| Governance | fixed |

### Backlogged follow-ups

| ID | Title | Status | Effort |
|----|-------|--------|--------|
| UIUX-SKILLS-H001 | Full connector detail pages + live registry sync | backlogged | complex/long |
| UIUX-SKILLS-H002 | Wire Add Skill/Tool to governed certification flow | backlogged | complex/long |
| UIUX-GLOBAL-001 | Central StatusPill across all modules | backlogged | medium |
| PM-008 | LinkSkills runtime catalog wiring to real lease/policy data | backlogged | complex/long |

**Key files:** `app/(shell)/skills/**`, `components/linkskills-*`, `components/capability-connectors-table.tsx`, `lib/ui-mocks/capability-connectors-demo.ts`, `lib/shell-page-meta.ts`, `components/auto-breadcrumbs.tsx`, `components/shell-sidebar.tsx`

---

## Modules Review (Round 1) — 2026-05-20

**Verdict:** Substantial redo required — current surface is a mock catalogue prototype, not the agreed Module → Project Type → Workflow → Issue drill-down with Start Project and role-based visibility.

**Ground truth:** Chairman terminology (Project Type = pre-defined Process); orchestrator nav spec; `modules/module-registry.md`; `modules/linksites/workflow.md` (10-stage spine).

### Fixed this session (Modules Phase A)

| ID | Title | Status |
|----|-------|--------|
| UIUX-MOD-001 | Triple duplicate page title | fixed |
| UIUX-MOD-002 | ShellPageHeaderClient + suppress auto header | fixed |
| UIUX-MOD-003 | Breadcrumb labels (Modules, Project types) | fixed |
| UIUX-MOD-004 | Hub sub-nav: Module catalogue \| Project type catalogue | fixed |
| UIUX-MOD-005 | Collapsible glossary | fixed |
| UIUX-MOD-006 | Start project CTA with module/projectType query | fixed |
| UIUX-MOD-007 | Project type names clickable in module browse | fixed |
| UIUX-MOD-008 | Client/Vendor toggle gated to mock mode | fixed |
| UIUX-MOD-009 | Template tasks labelled (not live issues) | fixed |
| UIUX-MOD-010 | Footer cross-links (Projects, Cockpit) | fixed |

**Key files:** `components/modules-hub-layout.tsx`, `modules-hub-nav.tsx`, `modules-glossary.tsx`, `modules-hub-footer.tsx`, `modules-catalogue.tsx`, `lib/modules-page-copy.ts`, `app/(shell)/modules/**`, `lib/shell-page-meta.ts`, `components/auto-breadcrumbs.tsx`

### Proposed for approval — Easy (shell polish, ~1 session)

| # | ID | Title | Likely files |
|---|-----|-------|--------------|
| 1 | UIUX-MOD-001 | Triple duplicate page title (shell auto + loading + inline) | `shell-page-meta.ts`, `modules/loading.tsx`, `modules-catalogue.tsx` |
| 2 | UIUX-MOD-002 | Adopt `ShellPageHeaderClient` + suppress auto header on `/modules/*` | same as LiNKskills pattern |
| 3 | UIUX-MOD-003 | Breadcrumb labels: `modules` → Modules; contextual leaf names | `auto-breadcrumbs.tsx`, `shell-page-meta.ts` |
| 4 | UIUX-MOD-004 | Hub sub-nav: Module catalogue \| Project type catalogue (replace 4-tab row) | new `modules-hub-nav.tsx`, `modules-catalogue.tsx` |
| 5 | UIUX-MOD-005 | Collapsible glossary (Module, Project Type, Project, Workflow, Task/Issue) | new copy component |
| 6 | UIUX-MOD-006 | Primary **Start Project** CTA → `/projects/new?module=&projectType=` | header actions |
| 7 | UIUX-MOD-007 | Make Project Type names clickable in module browse panel | `modules-catalogue.tsx` |
| 8 | UIUX-MOD-008 | Remove or gate Client/Vendor toggle behind dev/mock flag | `modules-catalogue.tsx` |
| 9 | UIUX-MOD-009 | Rename mock badges: template tasks labelled “Template task” not live issues | mock + copy |
| 10 | UIUX-MOD-010 | Footer cross-links: Projects (all), Cockpit module status | hub footer |

### Backlogged — Medium (structural, 1–2 sessions)

| ID | Title | Notes |
|----|-------|-------|
| UIUX-MOD-M001 | Split monolith into hub + module detail + project type detail + workflow detail routes | Agreed drill-down tree |
| UIUX-MOD-M002 | Module detail: active projects table (module-scoped) + project type cards | Mirrors Projects queue row style |
| UIUX-MOD-M003 | Project type detail: ordered workflow stepper from canonical `modules/*/workflow.md` | LinkSites demo has 2 stages; canonical has 10 |
| UIUX-MOD-M004 | Template vs instance visual language (blueprint vs running project) | Fixes conflation of template issues with live work |
| UIUX-MOD-M005 | Unify or redirect legacy `/modules/linkapps` App Factory dashboard | Ventures/Blueprints/Squads vocabulary conflicts |
| UIUX-MOD-M006 | Shared module/project-type picker component with `/projects/new` | Single source for pre-defined types |
| UIUX-MOD-M007 | Plane strip on module and project-type pages | Same pattern as Projects |
| UIUX-MOD-M008 | StatusPill for published/licensed/health (GLOBAL-001) | **partial fixed** (wp-wave1-modules): licensed/published/issue pills; META for client-visible/vendor/template |
| UIUX-MOD-M009 | Queue-style rows for workflows and template tasks | Match All Work / Inbox patterns |

### Backlogged — Hard (platform, multi-session)

| ID | Title | Notes |
|----|-------|-------|
| UIUX-MOD-H001 | Full Modules IA redesign per orchestrator spec | Chairman flagged substantial redo |
| UIUX-MOD-H002 | Load catalogue from versioned module manifests + DB sync | Hybrid repo templates → runtime |
| UIUX-MOD-H003 | Role-based visibility from auth (not `?audience=` query param) | Tenant Operator vs Module Owner vs Vendor |
| UIUX-MOD-H004 | Start Project creates LiNKaios project + Plane mirror + workflow kickoff | Cross-plane integration |
| UIUX-MOD-H005 | Module Owner project type editing with versioning | Future; not MVO for operators building processes |
| UIUX-MOD-H006 | Distinguish Cockpit `/cockpit/modules` (health) vs `/modules` (catalogue) in IA | Link + copy clarity |

**Key files today:** `app/(shell)/modules/**`, `components/modules-catalogue.tsx`, `lib/ui-mocks/modules-catalog-demo.ts`, `app/(shell)/modules/linkapps/**`, `lib/shell-page-meta.ts`

---

## Metrics Review (Round 1) — 2026-05-20

**Chairman intent:** Operators observe performance as granularly as possible — per project, project type (process), workflow, issue, LiNKbot, automation — across tokens, cost, run time, success/failure, errors, tool/skill/model usage.

**Verdict:** Solid trace aggregation backend exists (`metrics-snapshot.ts`, `metrics-kpi-views.ts`) but KPI engine was unwired; scope dimensions missing. Phase A wired KPIs + runs table; full granular observability is backlog.

### Fixed this session (Metrics Phase A)

| ID | Title | Status |
|----|-------|--------|
| UIUX-MET-001 | Duplicate headers — ShellPageHeaderClient + suppress auto header | fixed |
| UIUX-MET-002 | Subtitle aligned to performance observability (not memory-centric) | fixed |
| UIUX-MET-003 | Wire Cost / Performance / Reliability KPI strips (`buildKpiCards`) | fixed |
| UIUX-MET-004 | Replace Health/Cost/Usage tabs with Cost/Performance/Reliability | fixed |
| UIUX-MET-005 | Recent runs table (trace rows with duration, status, tokens, cost) | fixed |
| UIUX-MET-006 | Collapsible performance glossary | fixed |
| UIUX-MET-007 | Filters open by default + scope placeholders (module, project type, workflow, issue, automation) | fixed |
| UIUX-MET-008 | Fix token extraction from nested `usage` payloads | fixed |
| UIUX-MET-009 | Rename “AI usage units” → tokens | fixed |
| UIUX-MET-010 | Footer cross-links (Projects, Cockpit, System logs) | fixed |
| UIUX-MET-011 | Richer mock (tools, skills, models, duration_ms, errors) | fixed |

### Backlogged — Medium

| ID | Title |
|----|-------|
| UIUX-MET-M001 | Scope filters: module, project type, workflow, issue (live, not disabled) |
| UIUX-MET-M002 | Ranked tables by skill and by tool (not just event-type heuristics) |
| UIUX-MET-M003 | LiNKautowork / automation run dimension |
| UIUX-MET-M004 | Drill-down from project → workflow → issue metrics |
| UIUX-MET-M005 | Link run rows to trace detail / Cockpit run ledger |
| UIUX-MET-M006 | StatusPill for OK/Failed (GLOBAL-001) | **partial fixed** (wp-wave1-modules): recent runs table uses DomainStatusPill domain=metric |

### Backlogged — Hard

| ID | Title |
|----|-------|
| UIUX-MET-H001 | Full hierarchical metrics IA matching Modules/Projects tree |
| UIUX-MET-H002 | Unified cost ledger from LinkSkills leases + model routing |
| UIUX-MET-H003 | MTTR, stuck runs, human intervention from real incident model |
| UIUX-MET-H004 | Budget alerts and tenant cost caps |
| UIUX-MET-H005 | Export / scheduled performance reports |

**Key files:** `app/(shell)/metrics/**`, `components/metrics-dashboard.tsx`, `lib/metrics-snapshot.ts`, `lib/metrics-kpi-views.ts`, `lib/trace-metrics.ts`, `lib/ui-mocks/metrics-demo-snapshot.ts`

---

## Cockpit IA — Option A (dissolve sidebar) — 2026-05-20

**Decision:** Remove standalone Cockpit over time; redistribute slices to owning sections. Leases belong under LinkSkills.

### Fixed this session (Phase 1 — leases)

| ID | Title | Status |
|----|-------|--------|
| UIUX-COCK-001 | New `/skills/leases` with lease panel + hub nav tab | fixed |
| UIUX-COCK-002 | Redirect `/cockpit/leases` → `/skills/leases` | fixed |
| UIUX-COCK-003 | Hub nav Governance → Leases; sidebar LiNKskills sub-nav Leases | fixed |
| UIUX-COCK-004 | Update all links (hub cards, connectors, cockpit dashboard) | fixed |
| UIUX-COCK-005 | Remove Leases from Cockpit sub-nav | fixed |
| UIUX-COCK-006 | Cockpit subtitle notes leases live under LiNKskills | fixed |

**Key files:** `app/(shell)/skills/leases/page.tsx`, `components/linkskills-leases-panel.tsx`, `components/linkskills-hub-nav.tsx`, `app/(shell)/cockpit/leases/page.tsx` (redirect), `components/capabilities-hub-cards.tsx`, `components/shell-sidebar.tsx`

### Backlogged — Phase 2

| ID | Title |
|----|-------|
| UIUX-COCK-M001 | Move module tenant health (`/cockpit/modules`) → Modules or Settings |
| UIUX-COCK-M002 | Move cross-plane runs (`/cockpit/runs`) → Work or Projects |
| UIUX-COCK-M003 | Fold cockpit dashboard health summary → Overview |
| UIUX-COCK-M004 | Cockpit duplicate headers + mock mode for empty DB |
| UIUX-COCK-M005 | Clarify Metrics “recent runs” vs orchestration “runs” |

### Backlogged — Phase 3

| ID | Title |
|----|-------|
| UIUX-COCK-H001 | Remove Cockpit from sidebar; redirect `/cockpit` → Overview |
| UIUX-COCK-H002 | Retire `/cockpit/*` routes after redirects stable |

---

## Company Page Review — 2026-05-20

**Chairman decisions (locked):** Licensee company hub; LiNKbrain Inbox for uploads; locations + org structure; users = Settings; module subscribe/cancel (full flow, billing stubbed for MVP); multi-company + multi-membership; industry picklist; AI agent users are vendor-side; hybrid IA (Company sidebar + Settings admin).

### Fixed this session (Phase A — easy)

| ID | Title | Status |
|----|-------|--------|
| UIUX-COMP-001 | Single header via `ShellPageHeaderClient`; suppress auto shell header on `/company` | fixed |
| UIUX-COMP-002 | Subtitle/copy aligned to licensee company purpose | fixed |
| UIUX-COMP-003 | People & permissions → `/settings/user` (Access merges into Users later) | fixed |
| UIUX-COMP-004 | Locations vs Organization copy split; locations placeholder section | fixed |
| UIUX-COMP-005 | Website empty state (no hardcoded `linktrend.example`) | fixed |
| UIUX-COMP-006 | `CompanyGlossary` collapsible panel | fixed |
| UIUX-COMP-007 | Mock strip: profile, locations, module subscription fixtures | fixed |
| UIUX-COMP-008 | Company knowledge card + LiNKbrain Inbox / Company memory links + file count | fixed |

**Key files:** `app/(shell)/company/page.tsx`, `components/company-glossary.tsx`, `components/company-ui-mock-strip.tsx`, `lib/company-page-copy.ts`, `lib/shell-page-meta.ts`

**Proof:** `pnpm --filter @linktrend/linkaios-web typecheck` pass; browser `/company` single h1, glossary, locations, knowledge, people sections.

### Backlogged — Phase B (medium)

| ID | Title | Effort |
|----|-------|--------|
| UIUX-COMP-010 | Company switcher for multi-company tenants | medium |
| UIUX-COMP-011 | Profile expansion: description, industry picklist, logo, display vs legal name | medium |
| UIUX-COMP-012 | Locations editor (HQ flag, address, hours) | medium |
| UIUX-COMP-013 | Org parent picker dropdown (replace raw parent ID text field) | easy |
| UIUX-COMP-014 | Modules & subscriptions on Company (subscribe/cancel stub billing modal) | medium |
| UIUX-COMP-015 | People preview card (user count per company) | easy |
| UIUX-COMP-016 | Licensee vs vendor context badges on Company | medium |
| UIUX-COMP-017 | Company sub-nav tabs when page grows | medium |

### Backlogged — Phase C (hard)

| ID | Title | Effort |
|----|-------|--------|
| UIUX-COMP-020 | Multi-company membership model + RLS + shell header switcher | complex/long |
| UIUX-COMP-021 | Module subscribe/cancel with real billing + audit | complex/long |
| UIUX-COMP-022 | Company page sync from approved LiNKbrain Inbox items | medium |
| UIUX-COMP-023 | Document AI agent users vs LiNKbots in Settings Users tab | medium |
| UIUX-COMP-024 | Optional: move Company under Settings (`/settings/company`) | medium |
| UIUX-COMP-025 | Industry picklist maintenance + "Other" free text | easy |

### Settings review (next sidebar item — not started)

| ID | Title |
|----|-------|
| UIUX-SET-001 | Merge Access into Users tab; permissions on user rows |
| UIUX-SET-002 | Rename API Keys → Integrations |
| UIUX-SET-003 | New Privacy & data tab (export, backup, retention) |
| UIUX-SET-004 | Platform tab vendor-only (Advanced, traces, Integration Routing) |
| UIUX-SET-005 | Integration Routing: move Zulip routing off licensee Settings | fixed (Platform hub) |

---

## UI/UX Wave Execution — 2026-05-20 (Integrator)

**Branch:** `development` through Wave 3 + TODO sweep

### Waves 0–2 (integrated)

| Wave | Scope | Status |
|------|-------|--------|
| 0 | StatusPill + status-colors foundation | fixed |
| 1 | Work/Modules/Metrics/Cockpit pills, Company Phase B, Settings restructure | fixed |
| 2 | Cockpit retired, Modules/Metrics Phase B, static page Help | fixed |

Agent reports: `.ai-swarm/AGENT_REPORTS/wp-wave1-*.md`, `wp-wave2-*.md`

### Wave 3 + TODO sweep (this pass)

| ID | Item | Status |
|----|------|--------|
| UIUX-COMP-010 | Shell + Company switcher mock | fixed |
| UIUX-COMP-011–014 | Profile/locations/modules UI (mock persistence) | fixed (Phase B) |
| UIUX-COMP-013 | Org parent picker dropdown | fixed |
| UIUX-COMP-015–017 | People card, tabs, vendor badge | fixed |
| UIUX-COMP-016 | Licensee + Linktrend operator badges | fixed |
| UIUX-COMP-022 | LiNKbrain knowledge preview list | partial fixed |
| UIUX-COCK Phase 2–3 | Redirects + sidebar removal | fixed |
| UIUX-SET-001–005 | Settings IA | fixed |
| UIUX-GLOBAL-002 | Static Help panel | fixed (LLM TODO) |
| UIUX-GLOBAL-001 | StatusPill adoption | partial fixed |
| LINK-CLEANUP-001 | Stale `/settings/gateway`, `/settings/advanced`, `/cockpit` links | fixed |

**Remaining:** see `.ai-swarm/TODO-WAVE3-REMAINING.md`

---

## Conventions

- IDs are stable; do not renumber existing items.
- Add new items under the relevant section.
- When an item is implemented, change status to `fixed`, add the commit SHA, and note files changed.
- Effort labels: `easy/fast` = under 1 hour, `medium` = 1-4 hours, `complex/long` = more than 4 hours.
