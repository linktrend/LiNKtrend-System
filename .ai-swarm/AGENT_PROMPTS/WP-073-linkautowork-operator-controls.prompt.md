# WP-073 Agent Prompt - LiNKautowork Operator Controls

You are working on the LiNKtrend-System repo.

Execute work packet `.ai-swarm/WORK_PACKETS/WP-073-linkautowork-operator-controls.md`.

## Clean Worktree Requirement

Use a separate clean worktree/checkout for this packet. Do not run this packet in a shared dirty repo folder.

1. Start from `/Users/linktrend/Projects/LiNKtrend-System`.
2. Run `git fetch origin --prune`.
3. Create a packet-specific worktree from latest `origin/development`.
4. Use branch `dev/codex/WP-073-linkautowork-operator-controls`.
5. Run `git status --short --branch` before editing.
6. If unrelated dirty files exist, stop before editing and report the blocker.

Example:

```bash
git worktree add ../LiNKtrend-System-WP-073 -b dev/codex/WP-073-linkautowork-operator-controls origin/development
```

## Required Reading

- `.cursor/rules/00-linktrend-master-rule.mdc`
- `.cursor/rules/01-ecosystem-boundaries.mdc`
- `.cursor/rules/03-agent-swarm-coordination.mdc`
- `.cursor/rules/07-ui-and-frontend-standards.mdc`
- `.ai-swarm/LINKAUTOWORK_COMPLETION_PLAN.md`
- `.ai-swarm/CONTRACTS_MVO.md`
- `.ai-swarm/WORK_PACKETS/WP-073-linkautowork-operator-controls.md`
- `LiNKautowork/gateway/src/lib/health.ts`
- `LiNKautowork/gateway/src/lib/metrics.ts`

## Mission

Add development-mode operator controls for LiNKautowork: pause/resume tenant runs, cancel run tracking, queue status primitives, and a minimal LiNKaios panel/API surface if existing patterns support it.

## Hard Boundaries

- Development-mode controls only.
- Do not implement production circuit breaker infrastructure.
- Do not modify workflow handlers.
- Avoid deep workflow-runner changes unless strictly needed for pause/cancel checks.

## Proof Required

- Tests for pause/resume/cancel state behavior.
- UI/API proof if a panel is added.
- Relevant `LiNKautowork/gateway` and/or `linkaios-web` tests.
- Update `.ai-swarm/AGENT_REPORTS/linkautowork-agent.md` with files changed, commands run, proof, blockers, branch, and commit SHA.

## Finish

1. Commit only this packet's files.
2. Commit message: `feat: add LiNKautowork operator controls`
3. Push branch to origin.
4. Report branch, commit SHA, commands run, proof, and blockers.
