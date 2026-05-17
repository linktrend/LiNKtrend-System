# WP-110 Agent Prompt - LiNKapps UI Panel Design

Recommended model/tool: Cursor Composer for design/spec-first work, or Gemini 3 Flash for light scaffolding. Use Kimi only if substantial React code is needed. Do not use Codex or Antigravity.

Execute `.ai-swarm/WORK_PACKETS/WP-110-linkapps-ui-panel-design.md`.

## Clean Worktree Requirement

Use a separate clean worktree/checkout for this packet. Do not run this packet in a shared dirty repo folder.

```bash
cd /Users/linktrend/Projects/LiNKtrend-System
git fetch origin --prune
git worktree add ../LiNKtrend-System-WP-110 -b dev/cursor/WP-110-linkapps-ui-panel-design origin/development
cd ../LiNKtrend-System-WP-110
git status --short --branch
```

If unrelated dirty files exist, stop before editing and report the blocker.

## Required Reading

- `.cursor/rules/00-linktrend-master-rule.mdc`
- `.cursor/rules/01-ecosystem-boundaries.mdc`
- `.cursor/rules/03-agent-swarm-coordination.mdc`
- `.cursor/rules/07-ui-and-frontend-standards.mdc`
- `plugins/vertical/linkapps/manifest.yaml`
- `.ai-swarm/LINKAPPS_SQUAD_ORCHESTRATION_SPEC.md`
- `.ai-swarm/LINKAPPS_CAPABILITY_REQUIREMENTS.md`
- `.ai-swarm/WORK_PACKETS/WP-110-linkapps-ui-panel-design.md`

## Mission

Create a LiNKapps app-factory UI panel design and safe lightweight scaffold for LiNKaios.

## Hard Boundaries

- No backend workflow implementation.
- No real provisioning or external provider calls.
- No changes to LinkSites UI.
- Keep any component scaffold isolated under Linkapps-specific paths.

## Proof Required

- Component/file listing or design doc citation.
- Lint/typecheck output for touched frontend files, or precise blocker if baseline prevents it.
- Screenshot only if a local app route is already available without extra integration work.
- Update `.ai-swarm/AGENT_REPORTS/WP-110-linkapps-ui-panel-design.md`.

## Finish

Commit message: `docs: design LiNKapps UI panels`
Push branch to GitHub.
