# WP-069 Agent Prompt - LiNKautowork Retry Backoff

You are working on the LiNKtrend-System repo.

Execute work packet `.ai-swarm/WORK_PACKETS/WP-069-linkautowork-retry-backoff.md`.

## Clean Worktree Requirement

Use a separate clean worktree/checkout for this packet. Do not run this packet in a shared dirty repo folder.

1. Start from `/Users/linktrend/Projects/LiNKtrend-System`.
2. Run `git fetch origin --prune`.
3. Create a packet-specific worktree or checkout from latest `origin/development`.
4. Use branch `dev/codex/WP-069-linkautowork-retry-backoff`.
5. Run `git status --short --branch` before editing.
6. If unrelated dirty files exist, stop before editing and report the blocker.

Example worktree command:

```bash
git worktree add ../LiNKtrend-System-WP-069 -b dev/codex/WP-069-linkautowork-retry-backoff origin/development
```

## Required Reading

- `.cursor/rules/00-linktrend-master-rule.mdc`
- `.cursor/rules/01-ecosystem-boundaries.mdc`
- `.cursor/rules/03-agent-swarm-coordination.mdc`
- `.ai-swarm/CONTRACTS_MVO.md`
- `.ai-swarm/LINKAUTOWORK_COMPLETION_PLAN.md`
- `.ai-swarm/WORK_PACKETS/WP-069-linkautowork-retry-backoff.md`
- `LiNKautowork/gateway/src/lib/workflow-runner.ts`

## Mission

Implement deterministic retry logic for LiNKautowork workflow handler invocation: exponential backoff with delays `[1000, 4000, 16000]`, max 3 attempts, and fail-fast behavior for non-retryable failures.

## Hard Boundaries

- Do not modify persistent idempotency store work; WP-068 owns that.
- Do not change workflow handler semantics beyond retry wrapping.
- Do not add live n8n integration.
- Do not broaden failure codes beyond canonical contract mapping.

## Proof Required

- Focused tests for success on first attempt, success after retry, final retry exhaustion, and non-retryable fail-fast.
- Run the relevant LiNKautowork gateway test/typecheck command.
- Update `.ai-swarm/AGENT_REPORTS/linkautowork-agent.md` with files changed, commands run, proof, blockers, branch, and commit SHA.

## Finish

1. Commit only this packet's files.
2. Commit message: `feat: add LiNKautowork retry backoff`
3. Push branch to origin.
4. Report branch, commit SHA, commands run, proof, and blockers.
