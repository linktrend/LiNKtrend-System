# WP-225 Codex Prompt — LEXOS LiNKapps Topology And Operator Closure

Model: Codex

Execute `.ai-swarm/WORK_PACKETS/WP-225-codex-lexos-linkapps-topology-and-operator-closure.md` exactly.

This is a corrective packet. WP-224's filesystem state shows no implementation edits, only a blocked report. Do not repeat that stop unless the active workspace also lacks the module/docs topology.

Start from the WP-223 fixed integrated state:

- `.worktrees/WP-223-codex-linkaios-typecheck-build-closure`
- branch `wp-223-codex-linkaios-typecheck-build-closure`

Create a new branch/worktree named `wp-225-codex-lexos-linkapps-topology-and-operator-closure`.

Before implementation:

1. Verify `LiNKaios/linkaios-web` exists in the WP-223-based worktree.
2. If `modules/lexos/litigation`, `modules/linkapps`, or `docs/architecture/repo-architecture-target.md` are missing, import the existing versions from the active workspace `/Users/linktrend/Projects/LiNKtrend-System` or `.worktrees/WP-211-module-workflow-map-gap-prep`.
3. Do not invent replacement topology.
4. Run `pnpm --filter @linktrend/linkaios-web typecheck` before feature edits. If it fails, fix the regression before continuing.

Read:

- `.ai-swarm/WORK_PACKETS/WP-225-codex-lexos-linkapps-topology-and-operator-closure.md`
- `.worktrees/WP-223-codex-linkaios-typecheck-build-closure/.ai-swarm/AGENT_REPORTS/WP-223-codex-linkaios-typecheck-build-closure.md`
- `.worktrees/WP-224-codex-lexos-linkapps-operator-rerun/.ai-swarm/AGENT_REPORTS/WP-224-codex-lexos-linkapps-operator-rerun.md`
- `.ai-swarm/AGENT_REPORTS/WP-220-lexos-litigation-operator-flow.md`
- `.ai-swarm/AGENT_REPORTS/WP-221-linkapps-app-factory-operator-flow.md`
- `modules/lexos/litigation/workflow.*`
- `modules/linkapps/workflow.*`
- `.ai-swarm/CONTRACTS_MVO.md`
- `docs/architecture/repo-architecture-target.md`
- `.cursor/rules/01-ecosystem-boundaries.mdc`
- `.cursor/rules/05-security-cost-and-side-effects.mdc`

Implement both operator flows with focused, narrow changes:

- LEXOS Litigation: matter intake, evidence/research status, tasks, trace proof.
- LiNKapps: app brief, squad status, provider readiness, tasks, handoff package.
- Use governed stubs/shadow refs for LinkSkills, LiNKautowork, LiNKbrain, LiNKbot, and Plane.
- Do not call real providers, do not edit `.env`, and do not use real customer/legal data.

Required proof:

- `pnpm install`
- `pnpm --filter @linktrend/linkaios-web typecheck`
- Focused LEXOS route/server-helper tests or proof command
- Focused LiNKapps route/server-helper tests or proof command
- Route/status proof payload summary for LEXOS and LiNKapps

Update `.ai-swarm/AGENT_REPORTS/WP-225-codex-lexos-linkapps-topology-and-operator-closure.md` before stopping with files changed, commands run, proof produced, blockers, and next step.
