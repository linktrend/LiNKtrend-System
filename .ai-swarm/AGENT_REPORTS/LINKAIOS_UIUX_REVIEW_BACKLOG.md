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

## Conventions

- IDs are stable; do not renumber existing items.
- Add new items under the relevant section.
- When an item is implemented, change status to `fixed`, add the commit SHA, and note files changed.
- Effort labels: `easy/fast` = under 1 hour, `medium` = 1-4 hours, `complex/long` = more than 4 hours.
