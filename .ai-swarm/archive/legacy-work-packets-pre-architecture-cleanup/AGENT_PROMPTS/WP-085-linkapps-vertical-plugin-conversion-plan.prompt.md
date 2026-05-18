# WP-085 Agent Prompt - LiNKapps Vertical Plugin Conversion Plan

Recommended model/tool: Cursor Gemini 3 Flash, Gemini 3.1 Pro Low, or Kimi. Do not use Codex.

Execute `.ai-swarm/WORK_PACKETS/WP-085-linkapps-vertical-plugin-conversion-plan.md`.

## Clean Worktree Requirement

Use a separate clean worktree/checkout for this packet. Do not run this packet in a shared dirty repo folder.

```bash
cd /Users/linktrend/Projects/LiNKtrend-System
git fetch origin --prune
git worktree add ../LiNKtrend-System-WP-085 -b dev/cursor/WP-085-linkapps-vertical-plugin-conversion-plan origin/development
cd ../LiNKtrend-System-WP-085
git status --short --branch
```

If unrelated dirty files exist, stop before editing and report the blocker.

## Mission

Create `.ai-swarm/LINKAPPS_VERTICAL_PLUGIN_CONVERSION_PLAN.md` and follow-up packets for converting LiNKapps into the App Factory vertical plugin without moving code yet.

## Required Reading

- `.ai-swarm/WORK_PACKETS/WP-085-linkapps-vertical-plugin-conversion-plan.md`
- `.ai-swarm/LINKAPPS_VERTICAL_DISCOVERY.md`
- `.ai-swarm/PLUGIN_ARCHITECTURE_V2.md`
- `.ai-swarm/CONTRACTS_MVO.md`
- `/Users/linktrend/Projects/LiNKapps/docs/`
- `/Users/linktrend/Projects/LiNKapps/.agent/`
- `/Users/linktrend/Projects/LiNKapps/scripts/`

## Hard Boundary

Separate LiNKapps App Factory vertical concerns from Linktrend Development pod concerns. If the boundary is unclear, mark it as a user decision.

## Finish

Commit message: `docs: define LiNKapps vertical plugin conversion plan`
Push branch and report branch, commit SHA, proof, and blockers.
