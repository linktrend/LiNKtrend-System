# WP-070 Agent Prompt - LiNKautowork n8n Dev Gateway

You are working on the LiNKtrend-System repo.

Execute work packet `.ai-swarm/WORK_PACKETS/WP-070-linkautowork-n8n-dev-gateway.md`.

## Clean Worktree Requirement

Use a separate clean worktree/checkout for this packet. Do not run this packet in a shared dirty repo folder.

1. Start from `/Users/linktrend/Projects/LiNKtrend-System`.
2. Run `git fetch origin --prune`.
3. Create a packet-specific worktree or checkout from latest `origin/development`.
4. Use branch `dev/codex/WP-070-linkautowork-n8n-dev-gateway`.
5. Run `git status --short --branch` before editing.
6. If unrelated dirty files exist, stop before editing and report the blocker.

Example:

```bash
git worktree add ../LiNKtrend-System-WP-070 -b dev/codex/WP-070-linkautowork-n8n-dev-gateway origin/development
```

## Required Reading

- `.cursor/rules/00-linktrend-master-rule.mdc`
- `.cursor/rules/01-ecosystem-boundaries.mdc`
- `.cursor/rules/03-agent-swarm-coordination.mdc`
- `.ai-swarm/LINKAUTOWORK_COMPLETION_PLAN.md`
- `.ai-swarm/CONTRACTS_MVO.md`
- `.ai-swarm/WORK_PACKETS/WP-070-linkautowork-n8n-dev-gateway.md`
- `LiNKautowork/gateway/src/lib/workflow-runner.ts`

## Mission

Add development-mode n8n gateway scaffolding for LiNKautowork: local Docker compose, n8n client, webhook handler, and mocked tests. This is dev-mode only and must not deploy production infrastructure.

## Hard Boundaries

- No production n8n configuration.
- No real secrets or credentials.
- No production deployment.
- Keep in-process workflow mode as default.
- If `workflow-runner.ts` has changed from WP-069, preserve retry behavior.

## Proof Required

- Tests with mocked n8n API/client.
- If Docker is unavailable, document that and provide mocked proof instead of blocking.
- Run relevant `LiNKautowork/gateway` tests/typecheck where possible.
- Update `.ai-swarm/AGENT_REPORTS/linkautowork-agent.md` with files changed, commands run, proof, blockers, branch, and commit SHA.

## Finish

1. Commit only this packet's files.
2. Commit message: `feat: add LiNKautowork n8n dev gateway`
3. Push branch to origin.
4. Report branch, commit SHA, commands run, proof, and blockers.
