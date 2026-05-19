# LiNKaios UI/UX Review Backlog

Maintained by the LiNKaios UI/UX review agents.
Status: `open` | `in-progress` | `fixed`

## Page: `/` — Overview / Home

### UIUX-HOME-002 — Mobile sidebar: no collapse/drawer at <768px
**Status:** open
**Effort:** complex/long
**Category:** responsiveness

The sidebar must be hidden by default below `md`, opened by a hamburger button, shown as a drawer with overlay, closed on nav click, and always visible at desktop width.

Likely files:
- `LiNKaios/linkaios-web/src/components/shell-sidebar.tsx`
- `LiNKaios/linkaios-web/src/components/shell-layout.tsx`
- `LiNKaios/linkaios-web/src/components/shell-main-frame.tsx`

### UIUX-HOME-007 — System status banner redesign
**Status:** open
**Effort:** medium
**Category:** visual polish / UX

Remove sticky behavior, remove generic Settings link, collapse to a slim status chip, expand issue list on click, and use direct issue links.

Likely files:
- `LiNKaios/linkaios-web/src/components/overview-home.tsx`
- `LiNKaios/linkaios-web/src/lib/overview-dashboard.ts`

### UIUX-HOME-010 — Overview last-refreshed timestamp
**Status:** open
**Effort:** medium
**Category:** information architecture

Add unobtrusive `Refreshed X ago` timestamp and optional refresh action for dashboard data.

Likely files:
- `LiNKaios/linkaios-web/src/app/(shell)/page.tsx`
- `LiNKaios/linkaios-web/src/components/overview-home.tsx`

### UIUX-HOME-011 — Quick actions grid
**Status:** open
**Effort:** easy/fast
**Category:** visual polish / responsiveness

Use a responsive grid so the four quick actions render as one equal-width row on wide screens and 2x2 at medium widths.

Likely files:
- `LiNKaios/linkaios-web/src/components/overview-home.tsx`
- `LiNKaios/linkaios-web/src/lib/ui-standards.ts`

### UIUX-HOME-012 — System status issue icons
**Status:** open
**Effort:** medium
**Category:** visual polish / UX

Implement together with `UIUX-HOME-007`. Use purpose-specific icons and severity colors for issue rows.

## Page: `/work/messages` — Messages

### UIUX-MESSAGES-010 — Slack and Telegram tabs not fully wired
**Status:** open
**Effort:** complex/long
**Category:** UX/workflow

Support non-Zulip channel threads when existing data/mock structures provide them. Keep backend gateway/schema work deferred unless already present.

Likely files:
- `LiNKaios/linkaios-web/src/app/(shell)/work/work-messages-workspace.tsx`
- `LiNKaios/linkaios-web/src/app/(shell)/work/messages/page.tsx`
- `LiNKaios/linkaios-web/src/lib/work-messages.ts`
- `LiNKaios/linkaios-web/src/lib/ui-mocks/channel-threads.ts`

## Page: `/workers` and `/workers/[id]/*` — LiNKbots

### UIUX-WORKERS-001 — Double breadcrumb on worker detail pages
**Status:** open
**Effort:** medium
**Category:** information architecture

Remove redundant inline breadcrumb from `WorkerDetailHeader`; keep the shell breadcrumb as the only breadcrumb.

Likely file:
- `LiNKaios/linkaios-web/src/components/worker-detail-header.tsx`

### UIUX-WORKERS-002 — Worker status card pills
**Status:** open
**Effort:** medium
**Category:** visual polish

Replace plain Registry/Presence values with color-coded pills matching fleet badges.

Likely files:
- `LiNKaios/linkaios-web/src/components/worker-detail-header.tsx`
- `LiNKaios/linkaios-web/src/app/(shell)/workers/page.tsx`

### UIUX-WORKERS-003 — LiNKbrain Entries structure
**Status:** open
**Effort:** medium
**Category:** visual polish / information architecture

Improve entries with icon, title, date/tag, hover state, and clear row structure.

Likely files:
- `LiNKaios/linkaios-web/src/app/(shell)/workers/[id]/brain/page.tsx`
- `LiNKaios/linkaios-web/src/lib/ui-mocks/worker-ui.ts`

## Product Model Follow-ups

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

## Conventions

- IDs are stable; do not renumber existing items.
- Add new items under the relevant section.
- When an item is implemented, change status to `fixed`, add the commit SHA, and note files changed.
- Effort labels: `easy/fast` = under 1 hour, `medium` = 1-4 hours, `complex/long` = more than 4 hours.
