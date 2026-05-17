# WP-104 Agent Prompt - LEXOS LinkBot Role Contracts

Use Cursor Composer for this packet. Do not use Kimi, Codex, Gemini, or Antigravity unless the orchestrator changes this assignment.

Execute `.ai-swarm/WORK_PACKETS/WP-104-lexos-linkbot-role-contracts.md`.

## Clean Worktree Requirement

Use a separate clean worktree/checkout for this packet. Do not run this packet in a shared dirty repo folder.

```bash
cd /Users/linktrend/Projects/LiNKtrend-System
git fetch origin --prune
git worktree add ../LiNKtrend-System-WP-104 -b dev/cursor/WP-104-lexos-linkbot-role-contracts origin/development
cd ../LiNKtrend-System-WP-104
git status --short --branch
```

If unrelated dirty files exist, stop before editing and report the blocker.

## Required Reading

- `.cursor/rules/00-linktrend-master-rule.mdc`
- `.cursor/rules/01-ecosystem-boundaries.mdc`
- `.cursor/rules/03-agent-swarm-coordination.mdc`
- `.ai-swarm/LEXOS_VERTICAL_PLUGIN_CONVERSION_PLAN.md`
- `.ai-swarm/CONTRACTS_MVO.md`
- `.ai-swarm/PLUGIN_ARCHITECTURE_V2.md`
- `packages/linklogic-sdk/src/lexos-contracts.ts`
- `.ai-swarm/WORK_PACKETS/WP-104-lexos-linkbot-role-contracts.md`

## Mission

Define LEXOS-specific LinkBot role contracts for the W0-W11 litigation workflow. This is declaration/spec work only.

## Hard Boundaries

- No LinkBot runtime implementation changes.
- No live legal research, court filing, external sends, or provider integration.
- No secrets, credentials, or tenant data.
- Keep LinkBot as reasoning/session only; memory belongs to LiNKbrain and side-effect permission belongs to LinkSkills.

## Proof Required

- File listing of role contracts.
- `rg` proof that every `LexosRoleIdSchema` role appears in the role contracts.
- Confirmation no role contract declares live side-effect authority.
- Update `.ai-swarm/AGENT_REPORTS/WP-104-lexos-linkbot-role-contracts.md`.

## Finish

Commit message: `docs: define LEXOS LinkBot role contracts`
Push branch to GitHub.
