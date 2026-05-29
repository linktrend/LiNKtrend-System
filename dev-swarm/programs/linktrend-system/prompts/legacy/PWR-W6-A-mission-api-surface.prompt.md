# PWR-W6-A — Mission→Project API surface prep (no DB)

## Objective
JSON/API layer accepts and returns `projectId` alongside legacy `missionId` for wiring sprint. No database rename.

## Branch
`dev/pwr-w6-a-api-surface` from `development` after Wave 5

## Allowed files
- `LiNKaios/linkaios-web/src/app/api/**` (project/mission routes)
- `LiNKaios/linkaios-web/src/lib/**` types and adapters
- `packages/linkaios-kernel/**` (types only if needed)

## Tasks
1. Add `projectId` to response DTOs where `missionId` exists
2. Accept `projectId` in request bodies; alias to missionId internally
3. Deprecation comment: missionId removed in Phase D
4. Update plane-sync route param doc: `[missionId]` is project id slug for now

## Prohibited
- Supabase migrations
- Table/column renames
- Breaking removal of missionId

## Acceptance
- [ ] Dual-field responses documented
- [ ] typecheck
- [ ] Existing UI still works

## Report
`dev-swarm/reports/legacy-ai-swarm/PWR-W6-A-mission-api-surface.md`

## Commit
`feat(api): add projectId alias on mission API surface`
