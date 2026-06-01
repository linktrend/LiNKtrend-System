# WP-081 Agent Prompt - LinkSkills Integration Tests

Recommended model/tool: Cursor Kimi or Composer. Do not use Codex.

Execute `.ai-swarm/WORK_PACKETS/WP-081-linkskills-integration-tests.md`.

## Clean Worktree Requirement

Use a separate clean worktree/checkout for this packet. Do not run this packet in a shared dirty repo folder.

```bash
cd /Users/linktrend/Projects/LiNKtrend-System
git fetch origin --prune
git worktree add ../LiNKtrend-System-WP-081 -b dev/cursor/WP-081-linkskills-integration-tests origin/development
cd ../LiNKtrend-System-WP-081
git status --short --branch
```

If unrelated dirty files exist, stop before editing and report the blocker.

## Required Reading

- `.ai-swarm/LINKSKILLS_COMPLETION_PLAN.md`
- `.ai-swarm/CONTRACTS_MVO.md`
- `.ai-swarm/WORK_PACKETS/WP-081-linkskills-integration-tests.md`
- `LiNKskills/services/logic-engine/src/`

## Mission

Add integration-style tests for the completed LinkSkills logic-engine pieces: catalog, lease lifecycle, idempotency, kill switch, and audit-shaped outputs. If WP-080 is not integrated yet, skip disclosure-specific tests and document that dependency.

## Hard Boundaries

- Tests only unless a tiny test helper export is required.
- Do not change production behavior.
- Do not require live DB if existing package is in-memory/mock-oriented.

## Proof Required

- Test run output.
- Reusable fixtures/helpers where appropriate.
- Update `.ai-swarm/AGENT_REPORTS/linkskills-agent.md`.

## Finish

Commit message: `test: add LinkSkills integration harness`
Push branch and report branch, commit SHA, proof, and blockers.
