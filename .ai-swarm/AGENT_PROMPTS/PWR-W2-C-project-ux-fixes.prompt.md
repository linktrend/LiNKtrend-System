# PWR-W2-C — Project & suite UX fixes (parallel with W2-A)

## Objective
Fix empty states and navigation gaps blocking wiring QA.

## Branch
`dev/pwr-w2-c-project-ux` from `development` after Wave 1

## Allowed files
- `LiNKaios/linkaios-web/src/app/(shell)/projects/page.tsx`
- `LiNKaios/linkaios-web/src/components/modules/module-owned-card.tsx`
- `LiNKaios/linkaios-web/src/lib/suites-page-copy.ts`
- `LiNKaios/linkaios-web/src/components/modules/module-profile-client.tsx`

## Tasks
1. Projects empty state: primary **Add Project**, secondary **Browse Marketplace** (use BUTTON/shadcn if available)
2. Preview/expired suite cards: add **Open suite** or **View catalogue** link
3. Unowned suite `?tab=projects`: redirect URL to overview or show subscribe gate (URL matches visible tab)
4. Optional: project table Status column stub (label only, mock data OK)

## Prohibited
- Create API (W2-A)
- Wizard (W2-B)

## Acceptance
- [ ] Empty state CTAs correct
- [ ] Preview suites navigable
- [ ] Tab URL sync fixed

## Report
`.ai-swarm/AGENT_REPORTS/PWR-W2-C-project-ux-fixes.md`

## Commit
`fix(ui): projects empty state and suite card navigation`
