# Agent Prompt — WP-226 LiNKaios Product Model UI Foundation

You are Codex working as a senior frontend/product-systems engineer.

Execute `dev-swarm/programs/linktrend-system/issues/legacy/WP-226-linkaios-product-model-ui-foundation.md` exactly.

## Model / Mode

Use GPT-5.3 Codex or equivalent code-focused model.

## Mandatory Context

Read before editing:

1. `dev-swarm/programs/linktrend-system/issues/legacy/WP-226-linkaios-product-model-ui-foundation.md`
2. `dev-swarm/reports/legacy-ai-swarm/CURRENT_STATE_VERIFICATION_WARNING.md`
3. `.cursor/rules/01-ecosystem-boundaries.mdc`
4. `.cursor/rules/03-agent-swarm-coordination.mdc`
5. `.cursor/rules/07-ui-and-frontend-standards.mdc`
6. `docs/architecture/repo-architecture-target.md`
7. `dev-swarm/command-center/ARCHITECTURE_RULES.md`
8. `dev-swarm/command-center/CONTRACTS_MVO.md`
9. `dev-swarm/command-center/REPO_INVENTORY.md`
10. `dev-swarm/command-center/DECISIONS.md`

## Product Decisions To Implement

- User-facing model: Module -> Project Type -> Project -> Workflow -> Issue -> Run -> Trace.
- Hide `Mission` from touched user-facing UI; backlog repo-wide internal rename for later.
- One LiNKaios app/login; vendor/client views differ by role/scope.
- Vendor-only sections must be visibly marked.
- Client-visible sections must not expose protected project-type/workflow internals.
- Company means client company in client UI.
- Do not create completion percentages.

## Required UI/UX Skills And Abilities

Use available UI/UX skills/tooling: `frontend-design`, `web-design-guidelines`, `webapp-testing`, `nextjs-react-expert`, `tailwind-patterns`, `testing-patterns`, `control-ui`, `deslop`, `verify-this`; use `shadcn` only after verifying whether it is initialized in the relevant app.

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

Run focused tests if you add helpers/components with testable behavior.

## Required Report

Write `dev-swarm/reports/legacy-ai-swarm/WP-226-linkaios-product-model-ui-foundation.md` with:

- files changed
- commands run
- proof produced
- blockers
- vendor/client UI markers added
- backlog items added
- final commit SHA

## Completion

Before stopping:

1. Commit all intended code, docs, reports, generated topology files, and proof artifacts on the packet branch.
2. Record the final commit SHA, files changed, commands run, proof produced, blockers, and next step in the required report.
3. Verify `git status --short` is clean after the commit, except for explicitly documented excluded files.
4. Push the packet branch unless the user explicitly forbids pushing.
