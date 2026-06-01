# WP-072 Agent Prompt - LiNKautowork Health Metrics

You are working on the LiNKtrend-System repo.

Execute work packet `.ai-swarm/WORK_PACKETS/WP-072-linkautowork-health-metrics.md`.

## Clean Worktree Requirement

Use a separate clean worktree/checkout for this packet. Do not run this packet in a shared dirty repo folder.

1. Start from `/Users/linktrend/Projects/LiNKtrend-System`.
2. Run `git fetch origin --prune`.
3. Create a packet-specific worktree or checkout from latest `origin/development`.
4. Use branch `dev/codex/WP-072-linkautowork-health-metrics`.
5. Run `git status --short --branch` before editing.
6. If unrelated dirty files exist, stop before editing and report the blocker.

Example:

```bash
git worktree add ../LiNKtrend-System-WP-072 -b dev/codex/WP-072-linkautowork-health-metrics origin/development
```

## Required Reading

- `.cursor/rules/00-linktrend-master-rule.mdc`
- `.cursor/rules/01-ecosystem-boundaries.mdc`
- `.cursor/rules/03-agent-swarm-coordination.mdc`
- `.ai-swarm/LINKAUTOWORK_COMPLETION_PLAN.md`
- `.ai-swarm/WORK_PACKETS/WP-072-linkautowork-health-metrics.md`
- `LiNKautowork/gateway/src/index.ts`

## Mission

Add health and metrics primitives for LiNKautowork operational visibility: health status, registered workflow count, and Prometheus-compatible metrics.

## Hard Boundaries

- No production monitoring stack.
- No Datadog or external service dependency.
- Do not modify workflow handlers.
- Do not change audit emitter behavior.
- Avoid touching `workflow-runner.ts` unless needed for a minimal metrics hook; if touched, preserve WP-069 retry behavior.

## Proof Required

- Tests for health output and Prometheus metrics format.
- Run relevant `LiNKautowork/gateway` tests/typecheck where possible.
- Update `.ai-swarm/AGENT_REPORTS/linkautowork-agent.md` with files changed, commands run, proof, blockers, branch, and commit SHA.

## Finish

1. Commit only this packet's files.
2. Commit message: `feat: add LiNKautowork health metrics`
3. Push branch to origin.
4. Report branch, commit SHA, commands run, proof, and blockers.
