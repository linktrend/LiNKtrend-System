# WP-225 — Codex LEXOS LiNKapps Topology And Operator Closure

## Objective
Finish the work that WP-224 did not implement. Start from the WP-223 fixed integrated state, import the missing module/docs topology from the active workspace where it exists, then implement LEXOS and LiNKapps operator flows.

## Why This Packet Exists
WP-224's report says it stopped at the pre-edit topology gate. Its worktree contains only `LiNKdev/product/reports/archive/legacy-ai-swarm/WP-224-codex-lexos-linkapps-operator-rerun.md` and no implementation changes. The user later saw a message claiming implementation/proof completed, but the filesystem/worktree does not show that.

## Repo / Worktree
- Repo: `/Users/linktrend/Projects/LiNKtrend-System`
- Required base: `.worktrees/WP-223-codex-linkaios-typecheck-build-closure`
- Branch: `wp-225-codex-lexos-linkapps-topology-and-operator-closure`

Do not start from stale `4f3f7ba` or from WP-224's blocked state.

## Allowed Files
- `modules/lexos/litigation/`
- `modules/linkapps/`
- `docs/architecture/` only to import existing target docs if missing from the WP-223 worktree
- `LiNKaios/linkaios-web/src/**`
- Thin adapter/export files in `packages/linklogic-sdk/src/**` only when required for typed route proof
- `LiNKdev/product/reports/archive/legacy-ai-swarm/`

## Prohibited Files
- External `/Users/linktrend/Projects/LiNKtrend-LEXOS`
- External `/Users/linktrend/Projects/LiNKapps`
- Real secrets, `.env`, service-role keys
- Real legal/customer data
- Live provider calls, billing, provisioning, outreach, or production side effects

## Required Context
- `.worktrees/WP-223-codex-linkaios-typecheck-build-closure/LiNKdev/product/reports/archive/legacy-ai-swarm/WP-223-codex-linkaios-typecheck-build-closure.md`
- `.worktrees/WP-224-codex-lexos-linkapps-operator-rerun/LiNKdev/product/reports/archive/legacy-ai-swarm/WP-224-codex-lexos-linkapps-operator-rerun.md`
- `LiNKdev/product/reports/archive/legacy-ai-swarm/WP-220-lexos-litigation-operator-flow.md`
- `LiNKdev/product/reports/archive/legacy-ai-swarm/WP-221-linkapps-app-factory-operator-flow.md`
- `modules/lexos/litigation/workflow.*` from the active workspace or WP-211 worktree
- `modules/linkapps/workflow.*` from the active workspace or WP-211 worktree
- `LiNKdev/product/grounding/CONTRACTS_MVO.md`
- `docs/architecture/repo-architecture-target.md`

## Steps
1. Create a new branch/worktree from WP-223's fixed integrated state.
2. If `modules/lexos/litigation`, `modules/linkapps`, or `docs/architecture/repo-architecture-target.md` are missing in the WP-223 worktree, import the existing versions from the active workspace `/Users/linktrend/Projects/LiNKtrend-System` or from `.worktrees/WP-211-module-workflow-map-gap-prep`. Do not invent replacement topology.
3. Verify `LiNKaios/linkaios-web` exists and `pnpm --filter @linktrend/linkaios-web typecheck` still passes before feature edits.
4. Implement LEXOS Litigation operator routes/pages or server helpers for matter intake, evidence/research status, tasks, and trace proof.
5. Implement LiNKapps operator routes/pages or server helpers for app brief, squad status, provider readiness, tasks, and handoff package.
6. Wire governed stub refs for LinkSkills leases, LiNKautowork workflow/status, LiNKbrain events, LiNKbot roles, and Plane tasks.
7. Add focused tests or proof scripts for both module flows.

## Acceptance Criteria
- LEXOS and LiNKapps have visible/runnable operator flows or typed server-helper equivalents in LiNKaios.
- Both flows produce status/trace/task proof payloads.
- `@linktrend/linkaios-web` typecheck remains green.
- No live side effects occur.

## Proof Required
- `pnpm install`
- `pnpm --filter @linktrend/linkaios-web typecheck`
- Focused LEXOS route/server-helper tests or proof command
- Focused LiNKapps route/server-helper tests or proof command
- Route/status proof payload summary for each module

## Report File
Update `LiNKdev/product/reports/archive/legacy-ai-swarm/WP-225-codex-lexos-linkapps-topology-and-operator-closure.md`.
