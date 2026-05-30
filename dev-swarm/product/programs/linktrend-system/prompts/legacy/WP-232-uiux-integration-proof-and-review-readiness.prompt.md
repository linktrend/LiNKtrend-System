# Agent Prompt — WP-232 UI/UX Integration Proof And Review Readiness

You are Codex working as the UI/UX integration agent.

Execute `dev-swarm/product/programs/linktrend-system/issues/legacy/WP-232-uiux-integration-proof-and-review-readiness.md` exactly.

## Model / Mode

Use GPT-5.3 Codex or equivalent code-focused model.

## Mandatory Context

Read before editing:

1. `dev-swarm/product/programs/linktrend-system/issues/legacy/WP-232-uiux-integration-proof-and-review-readiness.md`
2. WP-226 through WP-231 reports and final commits
3. `dev-swarm/product/reports/archive/legacy-ai-swarm/CURRENT_STATE_VERIFICATION_WARNING.md`
4. `.cursor/rules/01-ecosystem-boundaries.mdc`
5. `.cursor/rules/03-agent-swarm-coordination.mdc`
6. `.cursor/rules/06-testing-and-proof.mdc`
7. `.cursor/rules/07-ui-and-frontend-standards.mdc`
8. `docs/architecture/repo-architecture-target.md`

## Integration Requirement

Merge/import WP-226 through WP-231 in dependency order:

1. WP-226
2. WP-227
3. WP-228
4. WP-229
5. WP-230
6. WP-231

Resolve conflicts carefully. Preserve:

- Module -> Project Type -> Project -> Workflow -> Issue -> Run -> Trace language.
- Client-safe vendor IP boundaries.
- Vendor-only markers.
- Client-visible markers.
- Company = client company.
- LinkBots project work context.
- LiNKbrain client/vendor memory model.
- LinkSkills terminology clarity.

Do not write completion percentages.

## Required UI/UX Skills And Abilities

Use `frontend-design`, `web-design-guidelines`, `webapp-testing`, `nextjs-react-expert`, `tailwind-patterns`, `testing-patterns`, `control-ui`, `run-smoke-tests`, `verify-this`, and `deslop`. Use `shadcn` only after verifying initialization.

## Branch Workflow

Use a separate clean worktree/checkout for this packet. Do not run this packet in a shared dirty repo folder.

1. Verify the starting checkout is clean with `git status --short --branch`.
2. If unrelated dirty files exist, stop before editing and report the blocker.
3. Create or use a packet-specific branch/worktree before making changes.

## Proof

Run:

```bash
pnpm dev:uiux:prepare
pnpm --filter @linktrend/linkaios-web typecheck
```

Run relevant focused tests.

Start the dev server with documented UI/dev flags and browser-review:

- Home
- Projects
- Modules
- Project Type Catalogue
- LinkBots
- LiNKbrain
- Skills
- Work
- Settings

Capture screenshots under `dev-swarm/product/reports/archive/legacy-ai-swarm/artifacts/uiux-product-model/`.

## Required Report

Write `dev-swarm/product/reports/archive/legacy-ai-swarm/WP-232-uiux-integration-proof-and-review-readiness.md` with:

- merged commits
- files changed
- commands run
- test/typecheck output summary
- screenshots/proof paths
- console/network findings
- remaining UI/UX backlog
- backend wiring deferred
- blockers
- final commit SHA

## Completion

Before stopping:

1. Commit all intended code, docs, reports, generated topology files, and proof artifacts on the packet branch.
2. Record the final commit SHA, files changed, commands run, proof produced, blockers, and next step in the required report.
3. Verify `git status --short` is clean after the commit, except for explicitly documented excluded files.
4. Push the packet branch unless the user explicitly forbids pushing.
