# WP-115 - LiNKaios Vertical Plugin Route Registration

## Objective

Wire safe, development-mode route/navigation registration for active vertical plugins so LinkSites, LEXOS, and LiNKapps are visible from LiNKaios without creating production side effects.

## Repo / branch

- Repo: `/Users/linktrend/Projects/LiNKtrend-System`
- Branch: `dev/cursor/WP-115-linkaios-vertical-plugin-route-registration`
- Base: `origin/development`

## Allowed files

- `apps/linkaios-web/src/app/**`
- `apps/linkaios-web/src/components/**`
- `apps/linkaios-web/src/lib/plugins/**`
- `dev-swarm/reports/legacy-ai-swarm/WP-115-linkaios-vertical-plugin-route-registration.md`

## Prohibited files

- No provider credentials or production config.
- No LiNKautowork workflow behavior changes.
- No LinkSkills lease runtime changes.
- No edits to unrelated vertical plugin manifests.

## Required context

- `.cursor/rules/07-ui-and-frontend-standards.mdc`
- `plugins/vertical/linkapps/manifest.yaml`
- `dev-swarm/command-center/LEXOS_LINKBOT_ROLE_CONTRACTS.md`
- `dev-swarm/command-center/LINKSITES_VERTICAL_MVO_V2.md`
- `apps/linkaios-web/src/app/(shell)/linkapps/factory/page.tsx`

## Steps

1. Inspect existing app shell/navigation patterns.
2. Add or update a vertical plugin landing/route surface for Linkapps and LEXOS using static/mock development data only.
3. Add a route/navigation entry if the local shell has a clear, existing pattern.
4. Preserve LinkSites/WebsiteFactory existing routes.
5. Run `pnpm --filter @linktrend/ui build`, `pnpm --filter @linktrend/linklogic-sdk build`, and `pnpm --filter @linktrend/linkaios-web typecheck`.
6. Update the packet-specific report.

## Acceptance criteria

- Linkapps and LEXOS have visible LiNKaios development-mode entry points.
- No live provider calls or production side effects.
- Web typecheck passes after required workspace dependency builds.

## Proof required

- Typecheck output.
- File/route listing.
- Report with files changed, commands run, proof, blockers, branch, and commit SHA.
