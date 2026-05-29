# WP-207 — LEXOS Litigation MVO Completion

## Objective

Move the LEXOS litigation module toward operational MVO: module manifest, litigation workspace UI integration, role contracts, capability connector requirements, Plane expectations, LiNKbrain events, and LiNKautowork workflow hooks.

## Repo / Worktree

- Repo: `/Users/linktrend/Projects/LiNKtrend-System`
- Worktree: `.worktrees/WP-207-lexos-litigation-mvo`
- Branch: `wp-207-lexos-litigation-mvo`

Use a separate clean worktree/checkout for this packet. Do not run this packet in a shared dirty repo folder.

1. Verify the starting checkout is clean with `git status --short --branch`.
2. If unrelated dirty files exist, stop before editing and report the blocker.
3. Create or use a packet-specific branch/worktree before making changes.

## Allowed Files

- `modules/lexos/litigation/`
- LEXOS connector docs/manifests under `LiNKskills/capability-connectors/`
- LEXOS role definitions under `LiNKbot/roles/` if needed
- LEXOS workflow declarations under `LiNKautowork/`
- LEXOS contracts/events in `packages/linklogic-sdk/`
- `dev-swarm/reports/legacy-ai-swarm/`

## Prohibited Files

- Recreating `plugins/vertical`
- External LEXOS repo edits
- Live legal/customer data
- Unapproved side effects

## Required Context

- `docs/architecture/repo-architecture-target.md`
- `docs/architecture/system-completion-targets.md`
- `dev-swarm/command-center/LEXOS_VERTICAL_PLUGIN_CONVERSION_PLAN.md`
- `dev-swarm/command-center/LEXOS_VERTICAL_DISCOVERY.md`
- `modules/lexos/litigation/README.md`

## Steps

1. Inspect current litigation module files and legacy migrated UI.
2. Complete manifest/workflow/role/capability requirements for litigation MVO.
3. Ensure Plane project/task expectations are declared.
4. Add LiNKbrain event/audit requirements for matter lifecycle and evidence handling.
5. Verify imports, typechecks, and module docs.

## Acceptance Criteria

- LEXOS litigation is a coherent module under `modules/lexos/litigation`.
- Required capabilities, roles, workflows, and events are declared enough for implementation.
- No old `plugins/vertical` implementation path is recreated.

## Proof Required

- Typecheck or import verification for changed TS/TSX files
- Manifest/schema validation if applicable
- Summary of module readiness and remaining UI/UX gaps

## Report File

Update `dev-swarm/reports/legacy-ai-swarm/WP-207-lexos-litigation-mvo.md`.
