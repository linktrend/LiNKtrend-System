# WP-084 Agent Prompt - LEXOS Vertical Plugin Conversion Plan

Recommended model/tool: Cursor Gemini 3 Flash, Gemini 3.1 Pro Low, or Kimi. Do not use Codex.

Execute `.ai-swarm/WORK_PACKETS/WP-084-lexos-vertical-plugin-conversion-plan.md`.

## Clean Worktree Requirement

Use a separate clean worktree/checkout for this packet. Do not run this packet in a shared dirty repo folder.

```bash
cd /Users/linktrend/Projects/LiNKtrend-System
git fetch origin --prune
git worktree add ../LiNKtrend-System-WP-084 -b dev/cursor/WP-084-lexos-vertical-plugin-conversion-plan origin/development
cd ../LiNKtrend-System-WP-084
git status --short --branch
```

If unrelated dirty files exist, stop before editing and report the blocker.

## Mission

Create `.ai-swarm/LEXOS_VERTICAL_PLUGIN_CONVERSION_PLAN.md` and follow-up packets for converting LEXOS into a LiNKaios vertical plugin without moving code yet.

## Required Reading

- `.ai-swarm/WORK_PACKETS/WP-084-lexos-vertical-plugin-conversion-plan.md`
- `.ai-swarm/LEXOS_VERTICAL_DISCOVERY.md`
- `.ai-swarm/PLUGIN_ARCHITECTURE_V2.md`
- `.ai-swarm/CONTRACTS_MVO.md`
- `/Users/linktrend/Projects/LiNKtrend-LEXOS/docs/`
- `/Users/linktrend/Projects/LiNKtrend-LEXOS/src/`

## Hard Boundary

If a legal-domain workflow decision is unclear, stop and mark it as a user decision. Do not invent legal workflows.

## Finish

Commit message: `docs: define LEXOS vertical plugin conversion plan`
Push branch and report branch, commit SHA, proof, and blockers.
