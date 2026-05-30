# Agent Prompt — WP-227 Modules And Project Types UI

You are Codex working as a senior frontend/product UX engineer.

Execute `dev-swarm/product/programs/linktrend-system/issues/legacy/WP-227-modules-and-project-types-ui.md` exactly.

## Model / Mode

Use GPT-5.3 Codex or equivalent code-focused model.

## Mandatory Context

Read before editing:

1. `dev-swarm/product/programs/linktrend-system/issues/legacy/WP-227-modules-and-project-types-ui.md`
2. WP-226 report and final commit
3. `dev-swarm/product/reports/archive/legacy-ai-swarm/CURRENT_STATE_VERIFICATION_WARNING.md`
4. `.cursor/rules/01-ecosystem-boundaries.mdc`
5. `.cursor/rules/03-agent-swarm-coordination.mdc`
6. `.cursor/rules/07-ui-and-frontend-standards.mdc`
7. `docs/architecture/repo-architecture-target.md`
8. Existing `modules/` docs

## UI Requirement

Implement two discovery paths into the same model:

1. Browse by Module:
   - Module Catalogue
   - Module List
   - Project Types per Module
   - Workflows per Project Type
   - Issues per Workflow

2. Browse by Project Type:
   - Project Type Catalogue
   - Project Type List
   - Selected Project Type shows its Module
   - Workflows per Project Type
   - Issues per Workflow

Vendor-side view can inspect/manage modules, project types, workflows, and issues.
Client-side view only sees licensed/published modules, project types, and client-safe operational detail.
Clearly mark vendor-only UI with `Vendor-only` badges to make human review easy.

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

Capture browser screenshots for Modules and Project Type Catalogue routes.

## Required Report

Write `dev-swarm/product/reports/archive/legacy-ai-swarm/WP-227-modules-and-project-types-ui.md` with files changed, commands run, screenshots/proof, blockers, final commit SHA, and remaining backlog items.

## Completion

Before stopping:

1. Commit all intended code, docs, reports, generated topology files, and proof artifacts on the packet branch.
2. Record the final commit SHA, files changed, commands run, proof produced, blockers, and next step in the required report.
3. Verify `git status --short` is clean after the commit, except for explicitly documented excluded files.
4. Push the packet branch unless the user explicitly forbids pushing.
