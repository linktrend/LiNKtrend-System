# WP-106 Agent Prompt - LiNKapps Plugin Manifest

Recommended model/tool: Cursor Composer or Gemini 3 Flash. Use Kimi/Gemini 3.1 Pro only if manifest validation requires deeper codebase tracing. Do not use Codex or Antigravity.

Execute `.ai-swarm/WORK_PACKETS/WP-106-linkapps-plugin-manifest.md`.

## Clean Worktree Requirement

Use a separate clean worktree/checkout for this packet. Do not run this packet in a shared dirty repo folder.

```bash
cd /Users/linktrend/Projects/LiNKtrend-System
git fetch origin --prune
git worktree add ../LiNKtrend-System-WP-106 -b dev/cursor/WP-106-linkapps-plugin-manifest origin/development
cd ../LiNKtrend-System-WP-106
git status --short --branch
```

If unrelated dirty files exist, stop before editing and report the blocker.

## Required Reading

- `.ai-swarm/LINKAPPS_VERTICAL_PLUGIN_CONVERSION_PLAN.md`
- `.ai-swarm/PLUGIN_ARCHITECTURE_V2.md`
- `.ai-swarm/CONTRACTS_MVO.md`
- `.ai-swarm/WORK_PACKETS/WP-106-linkapps-plugin-manifest.md`
- Existing plugin manifests under `plugins/` or app/plugin directories if present.

## Mission

Create the concrete LiNKapps vertical plugin manifest for `linkapps.app_factory` without moving LiNKapps code or implementing runtime logic.

## Scope

Allowed:

- Create `plugins/vertical/linkapps/manifest.yaml`.
- Update `.ai-swarm/AGENT_REPORTS/integration-agent.md`.
- If the exact manifest directory does not exist, create only the minimal directory path needed.

Hard boundaries:

- Declaration only. No stage implementation, no LinkBot runtime changes, no capability implementation.
- Do not move or edit `/Users/linktrend/Projects/LiNKapps`.
- Do not declare live mode for MVO.

## Required Manifest Coverage

- `plugin_id: linkapps.app_factory`
- `plugin_kind: vertical`
- `modes_supported: ["development"]`
- All Phase 5 stages from the conversion plan.
- Required LinkBot roles.
- Required capability plugins.
- Required LiNKautowork workflow hooks.
- Required audit events and UI panels.
- Explicit `non_goals`.

## Proof Required

- Static self-review against `PLUGIN_ARCHITECTURE_V2.md` required manifest fields.
- Report any schema gaps or fields that are inferred because no machine validator exists yet.
- Report changed files, proof, blockers, branch, and commit SHA.

## Finish

Commit message: `docs: add LiNKapps vertical plugin manifest`
Push branch to GitHub.
