# PWR-W2-A — POST /api/projects create contract

- **Date:** 2026-05-22
- **Branch:** `dev/pwr-w2-a-create-api`
- **Commit:** _(filled after commit)_

## Files changed
- `src/app/api/projects/route.ts`
- `src/lib/projects/create-project.ts`
- `src/lib/projects/types.ts`
- `src/lib/projects/demo-project-registry.ts`
- `src/lib/projects/create-project.test.ts`
- `src/app/(shell)/projects/[id]/page.tsx` (registered demo project resolution)
- `src/lib/project-modules-data.ts`, `src/lib/ui-mocks/entities.ts`

## Proof
```
npm run typecheck — exit 0
npm test src/lib/projects/create-project.test.ts — 7 passed
```

## curl example
```bash
curl -s -X POST http://localhost:3000/api/projects \
  -H 'Content-Type: application/json' \
  -d '{"name":"Acme preview","suiteId":"linksites","moduleIds":["website-factory"],"cadence":"once"}'
```

## Blockers
None
