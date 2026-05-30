# WP-068 Agent Prompt - LiNKautowork Persistent Idempotency

You are working on the LiNKtrend-System repo.

Execute work packet `.ai-swarm/WORK_PACKETS/WP-068-linkautowork-persistent-idempotency.md`.

## Clean Worktree Requirement

Use a separate clean worktree/checkout for this packet. Do not run this packet in a shared dirty repo folder.

1. Start from `/Users/linktrend/Projects/LiNKtrend-System`.
2. Run `git fetch origin --prune`.
3. Create a packet-specific worktree from latest `origin/development`.
4. Use branch `dev/codex/WP-068-linkautowork-persistent-idempotency`.
5. Run `git status --short --branch` before editing.
6. If unrelated dirty files exist, stop before editing and report the blocker.

Example:

```bash
git worktree add ../LiNKtrend-System-WP-068 -b dev/codex/WP-068-linkautowork-persistent-idempotency origin/development
```

## Required Reading

- `.cursor/rules/00-linktrend-master-rule.mdc`
- `.cursor/rules/01-ecosystem-boundaries.mdc`
- `.cursor/rules/03-agent-swarm-coordination.mdc`
- `.ai-swarm/LINKAUTOWORK_COMPLETION_PLAN.md`
- `.ai-swarm/CONTRACTS_MVO.md`
- `.ai-swarm/WORK_PACKETS/WP-068-linkautowork-persistent-idempotency.md`
- `LiNKautowork/gateway/src/lib/workflow-runner.ts`
- `LiNKautowork/gateway/src/lib/retry-policy.ts`
- `LiNKautowork/gateway/src/lib/health.ts`

## Mission

Replace the in-memory LiNKautowork idempotency cache with a persistent-store abstraction and a development-safe implementation that preserves existing retry and n8n behavior.

## Hard Boundaries

- Do not change workflow handler semantics.
- Do not remove in-process workflow mode.
- Do not touch LinkSkills lease idempotency; this is LiNKautowork workflow idempotency only.
- If full Postgres wiring is blocked by existing DB package issues, provide a clean interface plus local/in-memory fallback tests and document the blocker.

## Proof Required

- Tests proving same idempotency key returns the same `workflow_run_id` without re-execution.
- Tests simulating restart across store instances if feasible.
- Relevant `LiNKautowork/gateway` tests.
- Update `.ai-swarm/AGENT_REPORTS/linkautowork-agent.md` with files changed, commands run, proof, blockers, branch, and commit SHA.

## Finish

1. Commit only this packet's files.
2. Commit message: `feat: add LiNKautowork persistent idempotency`
3. Push branch to origin.
4. Report branch, commit SHA, commands run, proof, and blockers.
