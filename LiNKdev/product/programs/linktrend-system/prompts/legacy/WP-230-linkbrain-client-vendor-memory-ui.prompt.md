# Agent Prompt — WP-230 LiNKbrain Client Vendor Memory UI

You are Codex working as a senior frontend/product UX engineer.

Execute `LiNKdev/product/programs/linktrend-system/issues/legacy/WP-230-linkbrain-client-vendor-memory-ui.md` exactly.

## Model / Mode

Use GPT-5.3 Codex or equivalent code-focused model.

## Mandatory Context

Read before editing:

1. `LiNKdev/product/programs/linktrend-system/issues/legacy/WP-230-linkbrain-client-vendor-memory-ui.md`
2. WP-226 report and final commit
3. `LiNKdev/product/reports/archive/legacy-ai-swarm/CURRENT_STATE_VERIFICATION_WARNING.md`
4. Existing LiNKbrain pages/components
5. `LiNKdev/product/grounding/DECISIONS.md` D-082 memory decisions
6. `.cursor/rules/01-ecosystem-boundaries.mdc`
7. `.cursor/rules/03-agent-swarm-coordination.mdc`
8. `.cursor/rules/07-ui-and-frontend-standards.mdc`

## UI Requirement

Keep Company as client company.

Align LiNKbrain UI with:

- Client Company Memory: client-owned IP.
- Project Memory: client project instance knowledge.
- LiNKbot Memory: tenant LinkBot logs/outputs/context.
- Vendor Module Memory: vendor-owned module knowledge.
- Project Type Knowledge: vendor-owned protected IP.
- Anonymized Learning: reviewed/aggregated client-derived learning promoted to vendor memory.

Client view must not expose protected project-type internals.
Vendor view must be clearly denoted with `Vendor-only` / `Anonymized learning` / `Protected IP` markers where mocked or visible.
Ask LiNKbrain must explain permission-aware retrieval.

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

Capture browser screenshots for LiNKbrain main, Company/Project memory, and Ask surfaces.

## Required Report

Write `LiNKdev/product/reports/archive/legacy-ai-swarm/WP-230-linkbrain-client-vendor-memory-ui.md` with files changed, commands run, screenshots/proof, blockers, final commit SHA, and backlog items.

## Completion

Before stopping:

1. Commit all intended code, docs, reports, generated topology files, and proof artifacts on the packet branch.
2. Record the final commit SHA, files changed, commands run, proof produced, blockers, and next step in the required report.
3. Verify `git status --short` is clean after the commit, except for explicitly documented excluded files.
4. Push the packet branch unless the user explicitly forbids pushing.
