# WP-211 — Module Workflow Map Gap Prep

## Objective
Prepare canonical workflow maps for active modules without touching build-critical runtime files. This packet creates the source-of-truth module workflow maps that later packets must implement.

## Repo / Worktree
- Repo: `/Users/linktrend/Projects/LiNKtrend-System`
- Worktree: `.worktrees/WP-211-module-workflow-map-gap-prep`
- Branch: `wp-211-module-workflow-map-gap-prep`

Use a separate clean worktree/checkout for this packet. Do not run this packet in a shared dirty repo folder.

1. Verify the starting checkout is clean with `git status --short --branch`.
2. If unrelated dirty files exist, stop before editing and report the blocker.
3. Create or use a packet-specific branch/worktree before making changes.

## Allowed Files
- `modules/**`
- Module reference docs in `LiNKdev/product/grounding/` if needed
- `LiNKdev/product/reports/archive/legacy-ai-swarm/`

## Prohibited Files
- `LiNKaios/`, `LiNKautowork/`, `LiNKskills/`, `LiNKbot/`, `LiNKbrain/`, `packages/` runtime code
- External repos
- New workflows not grounded in existing plans or user-approved module scope

## Required Context
- `docs/architecture/repo-architecture-target.md`
- `modules/README.md`
- `modules/module-registry.md`
- `.cursor/rules/01-ecosystem-boundaries.mdc`
- `LiNKdev/product/grounding/CONTRACTS_MVO.md`

## Steps
1. Add or update canonical workflow maps for `modules/linksites`, `modules/linkapps`, and `modules/lexos/litigation`.
2. If `modules/linktrend-media` exists, add a planned workflow map without inventing unapproved runtime details.
3. Each map must list stages, inputs/outputs, gates, roles, capability connectors, LiNKautowork handles, LiNKbrain events, Plane tasks, LiNKaios UI surfaces, external repo references, and proof criteria.
4. Do not implement runtime handlers; this is a bounded prep packet.

## Acceptance Criteria
- Every active module has a readable canonical workflow map.
- LinkSites map is detailed enough to drive Wave 2 runtime implementation.
- No ownership boundaries are violated.

## Proof Required
- File list of module workflow maps
- Import/typecheck only if TypeScript files are added
- Summary of gaps to be implemented in later waves

## Report File
Update `LiNKdev/product/reports/archive/legacy-ai-swarm/WP-211-module-workflow-map-gap-prep.md`.
