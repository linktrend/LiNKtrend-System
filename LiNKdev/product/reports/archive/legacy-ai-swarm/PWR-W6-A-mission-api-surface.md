# PWR-W6-A — Mission→Project API surface prep

- **Date:** 2026-05-22
- **Branch:** `dev/pwr-w6-a-api-surface`
- **Base:** `origin/development`
- **IDE/Agent:** Cursor (backend-specialist subagent)

## Status

Complete (packet scope).

## Files changed

- `LiNKaios/linkaios-web/src/lib/api/project-mission-id.ts` — shared resolve/alias helpers + Phase D deprecation note
- `LiNKaios/linkaios-web/src/lib/api/project-mission-id.test.ts` — unit tests for alias helpers
- `LiNKaios/linkaios-web/src/lib/projects/types.ts` — `CreateProjectResponse` documents dual `missionId` alias
- `LiNKaios/linkaios-web/src/lib/projects/create-project.ts` — create stub returns both ids
- `LiNKaios/linkaios-web/src/lib/projects/create-project.test.ts` — asserts `missionId === projectId`
- `LiNKaios/linkaios-web/src/lib/projects/projects-route.test.ts` — route test expects dual fields
- `LiNKaios/linkaios-web/src/app/api/projects/[missionId]/plane-sync/route.ts` — param doc + dual-field JSON response
- `LiNKaios/linkaios-web/src/app/api/brain/retrieve/route.ts` — accepts `projectId` in body (aliases to internal mission id)
- `LiNKaios/linkaios-web/src/app/api/brain/published/route.ts` — accepts `projectId` in body (aliases to internal mission id)

## What changed

1. **Shared API aliases** — `resolveMissionIdFromRecord` prefers `projectId`, falls back to `missionId`; `dualProjectMissionIdFields` / `withMissionIdAlias` emit both keys with the same value.
2. **Responses** — `POST /api/projects` and `POST /api/projects/[missionId]/plane-sync` return `projectId` and `missionId` (same value).
3. **Requests** — Brain bridge routes accept `projectId` or `missionId` for `scope: "mission"`.
4. **plane-sync docs** — Route segment documented as LiNKaios project id; error text uses “project id”.

No Supabase migrations or column renames.

## Commands run

```bash
git checkout -B dev/pwr-w6-a-api-surface origin/development
cd LiNKaios/linkaios-web && npm run typecheck
npm test -- src/lib/api/project-mission-id.test.ts src/lib/projects/projects-route.test.ts src/lib/projects/create-project.test.ts
```

## Proof

```text
> npm run typecheck
tsc --noEmit — exit 0

> vitest run (3 files, 14 tests)
All passed
```

## Acceptance criteria

- [x] Dual-field responses documented (types + route comments + helper module)
- [x] typecheck passes
- [x] Existing UI still works (plane-sync client only reads `message`; project wizard uses `projectId`)

## Blockers

None.

## Next step

Integrator: merge `dev/pwr-w6-a-api-surface` → `development`; optional curl proof for brain routes with `projectId` vs `missionId`.
