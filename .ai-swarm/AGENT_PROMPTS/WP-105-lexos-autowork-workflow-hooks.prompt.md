# WP-105 Agent Prompt - LEXOS LiNKautowork Workflow Hooks

Recommended model/tool: Cursor Kimi or Gemini 3.1 Pro for coding. Use Composer only if keeping this to docs/stub mapping. Do not use Antigravity. Do not use Codex unless the orchestrator explicitly allocates the single Codex slot.

Execute `.ai-swarm/WORK_PACKETS/WP-105-lexos-autowork-workflow-hooks.md`.

## Clean Worktree Requirement

Use a separate clean worktree/checkout for this packet. Do not run this packet in a shared dirty repo folder.

```bash
cd /Users/linktrend/Projects/LiNKtrend-System
git fetch origin --prune
git worktree add ../LiNKtrend-System-WP-105 -b dev/cursor/WP-105-lexos-autowork-workflow-hooks origin/development
cd ../LiNKtrend-System-WP-105
git status --short --branch
```

If unrelated dirty files exist, stop before editing and report the blocker.

## Required Reading

- `.cursor/rules/00-linktrend-master-rule.mdc`
- `.cursor/rules/01-ecosystem-boundaries.mdc`
- `.cursor/rules/03-agent-swarm-coordination.mdc`
- `.ai-swarm/LEXOS_VERTICAL_PLUGIN_CONVERSION_PLAN.md`
- `.ai-swarm/CONTRACTS_MVO.md`
- `packages/linklogic-sdk/src/lexos-contracts.ts`
- `LiNKautowork/gateway/src/workflows/linksites-v2.ts`
- `.ai-swarm/WORK_PACKETS/WP-105-lexos-autowork-workflow-hooks.md`

## Mission

Add deterministic development-mode LiNKautowork workflow hook contracts/handlers for LEXOS workflow handles.

## Hard Boundaries

- No live legal research API calls.
- No court filing, production document submission, or external provider writes.
- Do not weaken existing LinkSites workflow behavior.
- Keep any implementation deterministic and local/stub-only.

## Proof Required

- Relevant `@linktrend/autowork-gateway` test output.
- `rg` proof showing all LEXOS workflow handles are registered or documented.
- Confirmation no live external provider call is introduced.
- Update `.ai-swarm/AGENT_REPORTS/WP-105-lexos-autowork-workflow-hooks.md`.

## Finish

Commit message: `feat: add LEXOS workflow hooks`
Push branch to GitHub.
