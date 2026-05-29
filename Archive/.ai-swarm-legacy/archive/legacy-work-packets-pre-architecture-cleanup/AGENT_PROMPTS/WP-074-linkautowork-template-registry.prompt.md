# WP-074 Agent Prompt - LiNKautowork Workflow Template Registry

You are working on the LiNKtrend-System repo.

Execute work packet `.ai-swarm/WORK_PACKETS/WP-074-linkautowork-template-registry.md`.

## Clean Worktree Requirement

Use a separate clean worktree/checkout for this packet. Do not run this packet in a shared dirty repo folder.

1. Start from `/Users/linktrend/Projects/LiNKtrend-System`.
2. Run `git fetch origin --prune`.
3. Create a packet-specific worktree from latest `origin/development`.
4. Use branch `dev/codex/WP-074-linkautowork-template-registry`.
5. Run `git status --short --branch` before editing.
6. If unrelated dirty files exist, stop before editing and report the blocker.

Example:

```bash
git worktree add ../LiNKtrend-System-WP-074 -b dev/codex/WP-074-linkautowork-template-registry origin/development
```

## Required Reading

- `.cursor/rules/00-linktrend-master-rule.mdc`
- `.cursor/rules/01-ecosystem-boundaries.mdc`
- `.cursor/rules/03-agent-swarm-coordination.mdc`
- `.ai-swarm/LINKAUTOWORK_COMPLETION_PLAN.md`
- `.ai-swarm/CONTRACTS_MVO.md`
- `.ai-swarm/WORK_PACKETS/WP-074-linkautowork-template-registry.md`
- `LiNKautowork/gateway/src/workflows/index.ts`
- `LiNKautowork/gateway/src/lib/n8n-client.ts`

## Mission

Add an additive workflow template registry for LiNKautowork so future automations can be added as versioned templates rather than hardcoded changes.

## Hard Boundaries

- Additive only; do not remove existing workflow handlers.
- Do not change workflow contracts.
- No production promotion automation.
- Templates may reference n8n but must not require production n8n.

## Proof Required

- Tests for loading, validating, listing, versioning, and environment filtering templates.
- Sample template(s) under `LiNKautowork/templates/`.
- Relevant `LiNKautowork/gateway` tests.
- Update `.ai-swarm/AGENT_REPORTS/linkautowork-agent.md` with files changed, commands run, proof, blockers, branch, and commit SHA.

## Finish

1. Commit only this packet's files.
2. Commit message: `feat: add LiNKautowork template registry`
3. Push branch to origin.
4. Report branch, commit SHA, commands run, proof, and blockers.
