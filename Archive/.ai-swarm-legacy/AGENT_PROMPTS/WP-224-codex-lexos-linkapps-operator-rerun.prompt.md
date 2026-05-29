# WP-224 Codex Prompt — LEXOS And LiNKapps Operator Rerun

Model: Codex

Execute `.ai-swarm/WORK_PACKETS/WP-224-codex-lexos-linkapps-operator-rerun.md` exactly.

This packet exists because WP-220 and WP-221 did not implement their operator flows. They stopped correctly because their worktrees were created from stale commit `4f3f7ba`, which lacked `LiNKaios/linkaios-web` and `modules/`.

Start from the newest valid integrated state:

1. Prefer WP-223 output if `wp-223-codex-linkaios-typecheck-build-closure` exists and passed.
2. Otherwise start from `.worktrees/WP-222-final-integration-proof-and-percentage-audit`.
3. Do not start from stale commit `4f3f7ba`.

Before editing, verify these paths exist:

- `LiNKaios/linkaios-web`
- `modules/lexos/litigation`
- `modules/linkapps`
- `docs/architecture/repo-architecture-target.md`

If any are missing, stop and report the topology blocker.

Before editing, read:

- `.ai-swarm/WORK_PACKETS/WP-224-codex-lexos-linkapps-operator-rerun.md`
- `.ai-swarm/AGENT_REPORTS/WP-220-lexos-litigation-operator-flow.md`
- `.ai-swarm/AGENT_REPORTS/WP-221-linkapps-app-factory-operator-flow.md`
- `.worktrees/WP-222-final-integration-proof-and-percentage-audit/.ai-swarm/AGENT_REPORTS/WP-222-final-integration-proof-and-percentage-audit.md`
- `modules/lexos/litigation/workflow.*`
- `modules/linkapps/workflow.*`
- `.ai-swarm/CONTRACTS_MVO.md`
- `docs/architecture/repo-architecture-target.md`
- `.cursor/rules/01-ecosystem-boundaries.mdc`
- `.cursor/rules/05-security-cost-and-side-effects.mdc`

Implement both operator flows with focused, narrow changes. Use governed stubs/shadow refs only. Do not call real providers, do not edit `.env`, and do not use real customer/legal data.

Required proof:

- `pnpm --filter @linktrend/linkaios-web typecheck`
- Focused LEXOS route/server-helper tests
- Focused LiNKapps route/server-helper tests
- Route/status proof payload summary for LEXOS and LiNKapps

Update `.ai-swarm/AGENT_REPORTS/WP-224-codex-lexos-linkapps-operator-rerun.md` before stopping with files changed, commands run, proof produced, blockers, and next step.
