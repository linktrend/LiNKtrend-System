# WP-224 — Codex LEXOS LiNKapps Operator Rerun

## Objective
Rerun the Wave 4 LEXOS and LiNKapps operator implementation on a valid integrated topology, because WP-220 and WP-221 stopped before implementation on stale worktrees.

## Repo / Worktree
- Repo: `/Users/linktrend/Projects/LiNKtrend-System`
- Base: WP-223 output if it exists, otherwise WP-222 integration worktree
- Branch: `wp-224-codex-lexos-linkapps-operator-rerun`

Do not start from stale commit `4f3f7ba`. The worktree must contain:
- `LiNKaios/linkaios-web`
- `modules/lexos/litigation`
- `modules/linkapps`
- `docs/architecture/repo-architecture-target.md`

## Allowed Files
- `modules/lexos/litigation/`
- `modules/linkapps/`
- `LiNKaios/linkaios-web/src/**`
- Thin adapter/export files in owning planes only when required for route proof
- `dev-swarm/product/reports/archive/legacy-ai-swarm/`

## Prohibited Files
- External `/Users/linktrend/Projects/LiNKtrend-LEXOS`
- External `/Users/linktrend/Projects/LiNKapps`
- Real legal/customer data
- Live provider calls, billing, provisioning, or production side effects

## Required Context
- `dev-swarm/product/reports/archive/legacy-ai-swarm/WP-220-lexos-litigation-operator-flow.md`
- `dev-swarm/product/reports/archive/legacy-ai-swarm/WP-221-linkapps-app-factory-operator-flow.md`
- `.worktrees/WP-222-final-integration-proof-and-percentage-audit/dev-swarm/product/reports/archive/legacy-ai-swarm/WP-222-final-integration-proof-and-percentage-audit.md`
- `modules/lexos/litigation/workflow.*`
- `modules/linkapps/workflow.*`
- `dev-swarm/product/grounding/CONTRACTS_MVO.md`
- `docs/architecture/repo-architecture-target.md`

## Steps
1. Verify the current worktree has the valid `LiNKaios/linkaios-web` and `modules/` topology. If not, stop and report.
2. Implement or complete LEXOS Litigation operator routes/pages for matter intake, evidence/research status, tasks, and trace proof.
3. Implement or complete LiNKapps operator routes/pages for app brief, squad status, provider readiness, tasks, and handoff package.
4. Wire governed stub refs for LinkSkills leases, LiNKautowork status, LiNKbrain events, LiNKbot roles, and Plane tasks.
5. Add focused tests or route/server-helper proof for both modules.

## Acceptance Criteria
- LEXOS and LiNKapps have visible/runnable operator flows in LiNKaios.
- Both flows produce status/trace/task proof payloads or equivalent server-helper proof.
- No live side effects occur.

## Proof Required
- `pnpm --filter @linktrend/linkaios-web typecheck`
- Focused LEXOS route/server-helper tests
- Focused LiNKapps route/server-helper tests
- Route/status proof payload summary for each module

## Report File
Update `dev-swarm/product/reports/archive/legacy-ai-swarm/WP-224-codex-lexos-linkapps-operator-rerun.md`.
