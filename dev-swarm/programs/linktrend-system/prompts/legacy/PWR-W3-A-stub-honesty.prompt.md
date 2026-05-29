# PWR-W3-A — Stub honesty badges + disabled actions

## Objective
Make demo/stub surfaces honest so wiring sprint does not confuse operators.

## Branch
`dev/pwr-w3-a-stub-honesty` from `development` after Wave 2

## Allowed files
- `LiNKaios/linkaios-web/src/app/(shell)/settings/page.tsx`
- `LiNKaios/linkaios-web/src/app/(shell)/settings/**/page.tsx` (stub pages only)
- `LiNKaios/linkaios-web/src/components/settings/**`
- `LiNKaios/linkaios-web/src/app/(shell)/projects/[id]/mission-tools-section.tsx`
- `LiNKaios/linkaios-web/src/app/api/projects/[missionId]/plane-sync/route.ts` (response shape only)
- `LiNKaios/linkaios-web/src/components/stub-badge.tsx` (new)

## Tasks
1. Create reusable `StubBadge` / `ComingSoonBadge` using shadcn Badge or StatusPill pattern
2. Settings hub: badge on stub-only routes (billing, data-export, integrations, etc.)
3. Plane Sync panel: badge + disable primary action OR show "Demo response" toast on submit
4. API route returns `{ status: "stub", message: "..." }` consistently

## Prohibited
- Real Plane integration
- Real billing

## Acceptance
- [ ] No stub page looks fully live without badge
- [ ] Plane sync clearly labeled

## Report
`dev-swarm/reports/legacy-ai-swarm/PWR-W3-A-stub-honesty.md`

## Commit
`fix(ui): add stub honesty badges on demo surfaces`
