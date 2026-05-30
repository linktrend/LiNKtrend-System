# WP-122 - LEXOS UI Workspace Scaffold

## Objective

Add a development-mode LEXOS LiNKaios UI workspace scaffold for intake, matter overview, evidence, assertions, and support matrix views.

## Repo / branch

- Repo: `/Users/linktrend/Projects/LiNKtrend-System`
- Branch: `dev/cursor/WP-122-lexos-ui-workspace-scaffold`
- Base: `origin/development`

## Allowed files

- `apps/linkaios-web/src/components/lexos/**`
- `apps/linkaios-web/src/app/**/lexos/**`
- `apps/linkaios-web/src/lib/plugins/lexos/**` only for UI fixtures/types
- `dev-swarm/product/grounding/LEXOS_UI_WORKSPACE_SCAFFOLD.md`
- `dev-swarm/product/reports/archive/legacy-ai-swarm/WP-122-lexos-ui-workspace-scaffold.md`

## Prohibited files

- No server mutation implementation.
- No provider calls.
- No changes to Linkapps or LinkSites UI.
- No production legal data.

## Required context

- `.cursor/rules/07-ui-and-frontend-standards.mdc`
- `dev-swarm/product/grounding/LEXOS_VERTICAL_PLUGIN_CONVERSION_PLAN.md` §7
- `dev-swarm/product/grounding/LEXOS_LINKBOT_ROLE_CONTRACTS.md`
- `packages/linklogic-sdk/src/lexos-contracts.ts`

## Steps

1. Inspect current LiNKaios component/page conventions.
2. Add static/mock LEXOS workspace components and a route scaffold if a safe route pattern exists.
3. Include trace/status and capability lease placeholders, not live actions.
4. Add fixture/types under LEXOS-specific paths.
5. Run web typecheck after required workspace builds.
6. Update the packet-specific report.

## Acceptance criteria

- LEXOS has a visible development-mode workspace scaffold.
- UI is isolated under LEXOS-specific paths.
- No production legal data or external calls.
- Web typecheck passes.

## Proof required

- Typecheck output.
- Component/route listing.
- Report with files changed, commands run, proof, blockers, branch, and commit SHA.
