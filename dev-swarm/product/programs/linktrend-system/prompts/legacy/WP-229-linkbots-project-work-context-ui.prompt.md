# Agent Prompt — WP-229 LinkBots Project Work Context UI

You are Codex working as a senior frontend/product UX engineer.

Execute `dev-swarm/product/programs/linktrend-system/issues/legacy/WP-229-linkbots-project-work-context-ui.md` exactly.

## Model / Mode

Use GPT-5.3 Codex or equivalent code-focused model.

## Mandatory Context

Read before editing:

1. `dev-swarm/product/programs/linktrend-system/issues/legacy/WP-229-linkbots-project-work-context-ui.md`
2. WP-226 report and final commit
3. `dev-swarm/product/reports/archive/legacy-ai-swarm/CURRENT_STATE_VERIFICATION_WARNING.md`
4. Existing LinkBots/Workers pages
5. `.cursor/rules/01-ecosystem-boundaries.mdc`
6. `.cursor/rules/03-agent-swarm-coordination.mdc`
7. `.cursor/rules/07-ui-and-frontend-standards.mdc`

## UI Requirement

Do not redesign LinkBots from scratch.

Enhance each specific LinkBot page, especially the Projects tab, so every project row/card can show:

- Module
- Project Type
- Project
- Workflow
- Issue
- Run/status
- whether the bot is assigned, working, completed, blocked, failed, or paused
- recent trace link where available/mockable

Use sample/mock data if live data is not wired, but label it clearly.

## Required UI/UX Skills And Abilities

Use `frontend-design`, `web-design-guidelines`, `webapp-testing`, `nextjs-react-expert`, `tailwind-patterns`, `testing-patterns`, `control-ui`, `deslop`, and `verify-this`. Use `shadcn` only after verifying initialization.

## Branch Workflow

Use a separate clean worktree/checkout for this packet. Do not run this packet in a shared dirty repo folder.

1. Verify the starting checkout is clean with `git status --short --branch`.
2. If unrelated dirty files exist, stop before editing and report the blocker.
3. Create or use a packet-specific branch/worktree before making changes.

## Proof

Run:

```bash
pnpm --filter @linktrend/linkaios-web typecheck
```

Capture browser screenshots for LinkBots list and a LinkBot Projects tab.

## Required Report

Write `dev-swarm/product/reports/archive/legacy-ai-swarm/WP-229-linkbots-project-work-context-ui.md` with files changed, commands run, screenshots/proof, blockers, final commit SHA, and backlog items.

## Completion

Before stopping:

1. Commit all intended code, docs, reports, generated topology files, and proof artifacts on the packet branch.
2. Record the final commit SHA, files changed, commands run, proof produced, blockers, and next step in the required report.
3. Verify `git status --short` is clean after the commit, except for explicitly documented excluded files.
4. Push the packet branch unless the user explicitly forbids pushing.
