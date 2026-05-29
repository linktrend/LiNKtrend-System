# PWR-W4-A — Shell consistency: errors + venture reskin

## Objective
Off-shell pages match zinc shell; error pages use design system.

## Branch
`dev/pwr-w4-a-shell` from `development` after Wave 3

## Allowed files
- `LiNKaios/linkaios-web/src/app/(shell)/error.tsx`
- `LiNKaios/linkaios-web/src/app/(shell)/not-found.tsx`
- `LiNKaios/linkaios-web/src/app/(shell)/suites/linkapps/ventures/[id]/page.tsx`
- `LiNKaios/linkaios-web/src/components/**` (venture-specific only)

## Tasks
1. Error/not-found: ShellMainFrame, ui-standards typography, link home
2. Venture detail: remove orphan shadcn-like classes; use shell + Card composite + StatusPill
3. Breadcrumbs via registry if missing

## Acceptance
- [ ] Venture page visually matches shell
- [ ] Error pages non-raw

## Report
`dev-swarm/reports/legacy-ai-swarm/PWR-W4-A-shell-error-venture.md`

## Commit
`fix(ui): reskin venture detail and shell error pages`
