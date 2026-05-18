# WP-064 Agent Prompt - LinkSkills Lease Projection and Bot Runtime Adapter

You are working on the LiNKtrend-System repo.

Execute work packet `.ai-swarm/WORK_PACKETS/WP-064-linkskills-lease-projection-and-bot-runtime-adapter.md`.

## Clean Worktree Requirement

Use a separate clean worktree/checkout for this packet. Do not run this packet in a shared dirty repo folder.

1. Start from `/Users/linktrend/Projects/LiNKtrend-System`.
2. Run `git fetch origin --prune`.
3. Create a packet-specific worktree or checkout from latest `origin/development`.
4. Use branch `dev/codex/WP-064-linkskills-lease-projection-and-bot-runtime-adapter`.
5. Run `git status --short --branch` before editing.
6. If unrelated dirty files exist, stop before editing and report the blocker.

Example:

```bash
git worktree add ../LiNKtrend-System-WP-064 -b dev/codex/WP-064-linkskills-lease-projection-and-bot-runtime-adapter origin/development
```

## Required Reading

- `.cursor/rules/00-linktrend-master-rule.mdc`
- `.cursor/rules/01-ecosystem-boundaries.mdc`
- `.cursor/rules/03-agent-swarm-coordination.mdc`
- `.ai-swarm/LINKBOT_ADAPTER_PLAN.md`
- `.ai-swarm/CONTRACTS_MVO.md`
- `.ai-swarm/WORK_PACKETS/WP-064-linkskills-lease-projection-and-bot-runtime-adapter.md`
- `LiNKbot/runtime-adapters/openclaw/bot-runtime/**`

## Mission

Add a lease-governed LinkSkills adapter flow in `LiNKbot/runtime-adapters/openclaw/bot-runtime` for skill and capability operations.

## Hard Boundaries

- No direct side-effect path bypassing LinkSkills.
- No live provider sends.
- LiNKbot remains a thin runtime shell.
- Do not edit LiNKautowork workflow runner or LiNKaios kernel dispatch unless absolutely required and documented.

## Proof Required

- Unit tests for lease-required, deny, and idempotent replay behavior.
- Package-level test/typecheck for `LiNKbot/runtime-adapters/openclaw/bot-runtime` if available.
- Update `.ai-swarm/AGENT_REPORTS/linkbot-agent.md` with files changed, commands run, proof, blockers, branch, and commit SHA.

## Finish

1. Commit only this packet's files.
2. Commit message: `feat: add LinkSkills lease projection adapter`
3. Push branch to origin.
4. Report branch, commit SHA, commands run, proof, and blockers.
