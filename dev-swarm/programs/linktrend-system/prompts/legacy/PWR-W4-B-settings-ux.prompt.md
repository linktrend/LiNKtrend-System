# PWR-W4-B — Settings UX polish

## Objective
Fix double headers and Access intro clutter from UI audit.

## Branch
`dev/pwr-w4-b-settings` from `development` after Wave 3

## Allowed files
- `LiNKaios/linkaios-web/src/app/(shell)/settings/layout.tsx`
- `LiNKaios/linkaios-web/src/app/(shell)/settings/user/page.tsx`
- `LiNKaios/linkaios-web/src/app/(shell)/settings/access/page.tsx`
- `LiNKaios/linkaios-web/src/app/(shell)/settings/access/team-permissions-section.tsx`

## Tasks
1. User settings: single page title (layout vs page dedupe)
2. Access: tighten intro copy; align with terminology (Suite/Role)
3. Stub badges from W3-A should remain visible

## Acceptance
- [ ] No duplicate H1 on User
- [ ] Access page scannable

## Report
`dev-swarm/reports/legacy-ai-swarm/PWR-W4-B-settings-ux.md`

## Commit
`fix(settings): dedupe headers and tighten access intro`
