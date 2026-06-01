# Agent Prompt — WP-228 Projects And Plane UI Semantics

You are Codex working as a senior frontend/product UX engineer.

Execute `LiNKdev/product/programs/linktrend-system/issues/legacy/WP-228-projects-plane-ui-semantics.md` exactly.

## Model / Mode

Use GPT-5.3 Codex or equivalent code-focused model.

## Mandatory Context

Read before editing:

1. `LiNKdev/product/programs/linktrend-system/issues/legacy/WP-228-projects-plane-ui-semantics.md`
2. WP-226 report and final commit
3. `LiNKdev/product/reports/archive/legacy-ai-swarm/CURRENT_STATE_VERIFICATION_WARNING.md`
4. Existing Projects pages and Plane bridge components
5. `.cursor/rules/01-ecosystem-boundaries.mdc`
6. `.cursor/rules/03-agent-swarm-coordination.mdc`
7. `.cursor/rules/07-ui-and-frontend-standards.mdc`

## UI Requirement

Projects are client-specific instances of vendor-supplied Project Types.

Update Projects UI so:

- Projects list shows projects from all modules.
- New Project flow means choose Module -> choose Project Type -> intake/start.
- Project detail shows Module, Project Type, Workflow, Issue, actors, approvals, Plane sync, outputs, and traces where available/mockable.
- Plane is positioned as project-management board; LiNKaios is orchestration/control plane.
- Client cannot inspect protected inner project-type/workflow internals.
- Vendor-only controls/sections are visibly marked if present.

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

Capture browser screenshots for Projects index, Project detail, and New Project surface.

## Required Report

Write `LiNKdev/product/reports/archive/legacy-ai-swarm/WP-228-projects-plane-ui-semantics.md` with files changed, commands run, screenshots/proof, blockers, final commit SHA, and backlog items.

## Completion

Before stopping:

1. Commit all intended code, docs, reports, generated topology files, and proof artifacts on the packet branch.
2. Record the final commit SHA, files changed, commands run, proof produced, blockers, and next step in the required report.
3. Verify `git status --short` is clean after the commit, except for explicitly documented excluded files.
4. Push the packet branch unless the user explicitly forbids pushing.
