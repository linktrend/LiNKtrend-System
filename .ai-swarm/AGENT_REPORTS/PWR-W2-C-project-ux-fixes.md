# PWR-W2-C — Project & suite UX fixes

- **Date:** 2026-05-22
- **Branch:** `dev/pwr-w2-c-project-ux`
- **Commit:** `9bfbed7`
- **Base:** `origin/development`

## Status

Complete (packet scope).

## Files changed

- `LiNKaios/linkaios-web/src/app/(shell)/projects/page.tsx`
- `LiNKaios/linkaios-web/src/components/modules/module-owned-card.tsx`
- `LiNKaios/linkaios-web/src/components/modules/module-profile-client.tsx`

## What changed

1. **Projects empty state** — Primary CTA is **Add Project** (`/projects/new`, `BUTTON.addRow`); secondary is **Browse Marketplace** (`/suites/marketplace`, `BUTTON.secondaryRow`). Replaced LiNKbots / System logs links.
2. **Preview / expired / cancelled suite cards** — Footer adds navigation before Subscribe: **Open suite** (preview → overview) or **View catalogue** (expired/cancelled → modules tab), using `BUTTON.secondaryCompact`.
3. **Unowned `?tab=projects`** — `ModuleProfileClient` calls `router.replace` to suite overview when access is not subscribed/preview, so URL matches visible tab (`parseSuiteProfileTab` already mapped projects → overview).

## Commands run

```bash
git fetch origin development
git checkout -B dev/pwr-w2-c-project-ux origin/development
npm run typecheck                    # failed — see blockers
cd LiNKaios/linkaios-web && npm run typecheck   # failed — see blockers
git add <allowed files>
git commit -m "fix(ui): projects empty state and suite card navigation"
```

## Proof

- Acceptance: empty CTAs, preview/expired card links, tab URL sync implemented in allowed files.
- **Typecheck:** root `npm run typecheck` fails on `@linktrend/linklogic-sdk` (vitest module resolution — pre-existing on development). `linkaios-web` `npm run typecheck` fails on `src/lib/projects/create-project.ts` (unrelated to this packet; file not in allowed list).

## Blockers

- Monorepo `npm run typecheck` not green on `development` baseline (linklogic-sdk vitest types).
- `linkaios-web` has a separate TS error in `create-project.ts` (`ProjectCadence`) — likely from parallel PWR-W2-A work left dirty in the worktree; not fixed here (out of scope).

## Next step

Integrator: merge `dev/pwr-w2-c-project-ux` → `development` after W2-A typecheck baseline is clean; manual QA on `/projects` (empty mocks off), My Suites preview/expired cards, and unowned suite `?tab=projects` deep link.
