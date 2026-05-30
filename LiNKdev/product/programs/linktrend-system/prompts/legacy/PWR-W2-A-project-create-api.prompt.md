# PWR-W2-A — POST /api/projects create contract

## Objective
Single project creation entry point for wiring sprint. Stub implementation today; real Supabase insert replaces handler body later.

## Branch
`dev/pwr-w2-a-create-api` from `development` after Wave 1 merge

## Allowed files
- `LiNKaios/linkaios-web/src/app/api/projects/route.ts` (new)
- `LiNKaios/linkaios-web/src/lib/projects/create-project.ts` (new)
- `LiNKaios/linkaios-web/src/lib/projects/types.ts` (new)
- `LiNKaios/linkaios-web/src/lib/projects/demo-project-registry.ts` (new, optional)
- Tests under `LiNKaios/linkaios-web/src/lib/projects/*.test.ts`

## Prohibited
- Wizard UI (PWR-W2-B)
- DB migrations
- Renaming missions table

## Contract

### Request
```json
{
  "name": "string",
  "suiteId": "string",
  "moduleIds": ["string"],
  "cadence": "once" | "continuous"
}
```

### Response 201
```json
{
  "projectId": "string",
  "planeBootstrap": "pending" | "stub",
  "createdAt": "ISO8601"
}
```

Stub: register demo project in memory/map OR extend demo fixtures; return stable `projectId` that project detail page can render (extend demo path if needed).

## Steps
1. Implement validation + typed handler
2. Unit test validation
3. Document in code comment: wiring replaces stub body
4. typecheck

## Acceptance
- [ ] POST works with curl
- [ ] Returns projectId that loads detail page without 404
- [ ] Tests pass

## Report
`LiNKdev/product/reports/archive/legacy-ai-swarm/PWR-W2-A-project-create-api.md`

## Commit
`feat(api): add POST /api/projects create contract stub`
