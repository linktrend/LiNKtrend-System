# WP-208 — LiNKapps App Factory MVO Completion

## Objective

Move LiNKapps app-factory module toward operational MVO: module manifest, squad orchestration flow, sidebar/operator panels, required capability connectors, LiNKbot roles, LiNKautowork workflow hooks, and LiNKbrain event schema.

## Repo / Worktree

- Repo: `/Users/linktrend/Projects/LiNKtrend-System`
- Worktree: `.worktrees/WP-208-linkapps-app-factory-mvo`
- Branch: `wp-208-linkapps-app-factory-mvo`

Use a separate clean worktree/checkout for this packet. Do not run this packet in a shared dirty repo folder.

1. Verify the starting checkout is clean with `git status --short --branch`.
2. If unrelated dirty files exist, stop before editing and report the blocker.
3. Create or use a packet-specific branch/worktree before making changes.

## Allowed Files

- `modules/linkapps/`
- LiNKapps-facing UI integration under `LiNKaios/linkaios-web/`
- LiNKapps connector docs/manifests under `LiNKskills/capability-connectors/`
- LiNKapps role definitions under `LiNKbot/roles/`
- LiNKapps workflow declarations under `LiNKautowork/`
- LiNKapps contracts/events in `packages/linklogic-sdk/`
- `LiNKdev/product/reports/archive/legacy-ai-swarm/`

## Prohibited Files

- Recreating `plugins/vertical`
- External `/Users/linktrend/Projects/LiNKapps` edits
- Live repo/service provisioning
- Real billing/payment side effects

## Required Context

- `docs/architecture/repo-architecture-target.md`
- `docs/architecture/system-completion-targets.md`
- `LiNKdev/product/grounding/LINKAPPS_VERTICAL_PLUGIN_CONVERSION_PLAN.md`
- `LiNKdev/product/grounding/LINKAPPS_SQUAD_ORCHESTRATION_SPEC.md`
- `LiNKdev/product/grounding/LINKAPPS_CAPABILITY_REQUIREMENTS.md`
- `modules/linkapps/manifest.yaml`

## Steps

1. Inspect current LiNKapps module manifest and docs.
2. Complete squad orchestration and operator panel integration needed for MVO.
3. Declare required capability connectors, roles, workflow hooks, and LiNKbrain events.
4. Keep external LiNKapps repo as referenced source, not edited target.
5. Verify imports/typechecks and module readiness.

## Acceptance Criteria

- LiNKapps app-factory module has a clear operational MVO path.
- Required connectors, roles, workflows, and events are declared and visible.
- Operator UI exposes enough status for final UI/UX pass.

## Proof Required

- Typecheck or import verification for changed TS/TSX files
- YAML/manifest validation if applicable
- Summary of remaining non-MVO or UI/UX gaps

## Report File

Update `LiNKdev/product/reports/archive/legacy-ai-swarm/WP-208-linkapps-app-factory-mvo.md`.
