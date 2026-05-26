# PWR-W2-A — POST /api/projects create contract

- **Date:** 2026-05-22
- **Branch:** `dev/pwr-w2-a-create-api`
- **IDE/Agent:** Cursor (backend-specialist subagent)

## Objective
Implement POST `/api/projects` stub with typed validation and in-memory demo registry so returned `projectId` loads on the project detail page.

## Files changed
- `LiNKaios/linkaios-web/src/app/api/projects/route.ts` (new)
- `LiNKaios/linkaios-web/src/lib/projects/types.ts` (new)
- `LiNKaios/linkaios-web/src/lib/projects/create-project.ts` (new)
- `LiNKaios/linkaios-web/src/lib/projects/demo-project-registry.ts` (new)
- `LiNKaios/linkaios-web/src/lib/projects/create-project.test.ts` (new)
- `LiNKaios/linkaios-web/src/lib/projects/projects-route.test.ts` (new)
- `LiNKaios/linkaios-web/src/app/(shell)/projects/[id]/page.tsx` — resolve stub projects from registry
- `LiNKaios/linkaios-web/src/lib/project-modules-data.ts` — module rows from registry
- `LiNKaios/linkaios-web/src/lib/ui-mocks/entities.ts` — `proj-` prefix for stub project ids

## Commands run
```bash
git fetch origin development && git checkout -B dev/pwr-w2-a-create-api
cd LiNKaios/linkaios-web && npm run typecheck
cd LiNKaios/linkaios-web && npm test -- src/lib/projects/
```

## Proof
```
npm run typecheck — exit 0
npm test -- src/lib/projects/ — 9 tests passed
```

Route handler integration test confirms 201 + registry entry for valid payload.

### curl example (requires authenticated session — same middleware as `/api/projects/*/plane-sync`)
```bash
curl -s -X POST http://localhost:3000/api/projects \
  -H 'Content-Type: application/json' \
  -H 'Cookie: <operator-session-cookies>' \
  -d '{
    "name": "Acme preview site",
    "suiteId": "linksites",
    "moduleIds": ["website-factory"],
    "cadence": "once"
  }'
```

Expected 201:
```json
{
  "projectId": "proj-<uuid>",
  "planeBootstrap": "stub",
  "createdAt": "2026-05-22T..."
}
```

Then open `/projects/<projectId>` with `LINKAIOS_UI_MOCKS` enabled — detail page renders from in-memory registry.

## Acceptance
- [x] POST works (handler + route tests; curl needs auth cookie)
- [x] Returns `projectId` loadable on project detail page (registry + page integration)
- [x] Tests pass
- [x] typecheck pass

## Blockers
- **Auth middleware:** Unauthenticated curl receives 307 → `/login` (same as existing project API stubs). Wizard wiring (PWR-W2-B) should call API from authenticated browser session.
- **In-memory registry:** Created projects are lost on server restart; wiring sprint replaces stub with Supabase insert.

## Next step
PWR-W2-B: wire new-project wizard `launchProject()` to POST `/api/projects` and navigate to returned `projectId`.

## Branch state
- Commit SHA: _(filled after commit)_
