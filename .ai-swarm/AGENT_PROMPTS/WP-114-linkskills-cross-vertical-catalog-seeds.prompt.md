# WP-114 Agent Prompt - LinkSkills Cross-Vertical Capability Catalog Seeds

Use Cursor Composer for this packet. Do not use Kimi, Codex, Gemini, or Antigravity unless the orchestrator changes this assignment.

Execute `.ai-swarm/WORK_PACKETS/WP-114-linkskills-cross-vertical-catalog-seeds.md`.

## Clean Worktree Requirement

Use a separate clean worktree/checkout for this packet. Do not run this packet in a shared dirty repo folder.

```bash
cd /Users/linktrend/Projects/LiNKtrend-System
git fetch origin --prune
git worktree add ../LiNKtrend-System-WP-114 -b dev/cursor/WP-114-linkskills-cross-vertical-catalog-seeds origin/development
cd ../LiNKtrend-System-WP-114
git status --short --branch
```

If unrelated dirty files exist, stop before editing and report the blocker.

## Required Reading

- `.cursor/rules/00-linktrend-master-rule.mdc`
- `.cursor/rules/01-ecosystem-boundaries.mdc`
- `.cursor/rules/03-agent-swarm-coordination.mdc`
- `.ai-swarm/CONTRACTS_MVO.md`
- `.ai-swarm/LINKAPPS_CAPABILITY_REQUIREMENTS.md`
- `.ai-swarm/LINKSKILLS_COMPLETION_PLAN.md`
- `packages/linkaios-kernel/plugins/capabilities/lexos/*.yaml`
- `plugins/vertical/linkapps/manifest.yaml`
- `.ai-swarm/WORK_PACKETS/WP-114-linkskills-cross-vertical-catalog-seeds.md`

## Mission

Create cross-vertical capability catalog seed manifests/specs that reconcile LinkSites, LEXOS, and LiNKapps capability declarations.

## Hard Boundaries

- No LinkSkills runtime/service implementation.
- No live provider clients.
- No secrets or tenant/provider account IDs.
- Do not edit vertical manifests except to document mismatches.

## Proof Required

- Capability inventory output or table.
- File listing for seed/spec artifacts.
- Confirmation no live provider configuration was introduced.
- Update `.ai-swarm/AGENT_REPORTS/WP-114-linkskills-cross-vertical-catalog-seeds.md`.

## Finish

Commit message: `docs: seed cross-vertical capability catalog`
Push branch to GitHub.
