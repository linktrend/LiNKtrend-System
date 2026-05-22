# PWR-W4-A — Shell consistency: errors + venture reskin

- **Date:** 2026-05-22
- **Branch:** `dev/pwr-w4-a-shell`
- **Commit:** `2372143` (tip; feature commits `3408528`, `494fee2`)
- **Base:** `origin/development`

## Status

Complete (packet scope).

## Files changed

- `LiNKaios/linkaios-web/src/app/(shell)/error.tsx` (new)
- `LiNKaios/linkaios-web/src/app/(shell)/not-found.tsx` (new)
- `LiNKaios/linkaios-web/src/app/(shell)/suites/linkapps/ventures/[id]/page.tsx`
- `LiNKaios/linkaios-web/src/components/ventures/venture-breadcrumb-register.tsx` (new)
- `LiNKaios/linkaios-web/src/components/ventures/venture-detail-panels.tsx` (new)

## What changed

1. **Shell error boundary** — `(shell)/error.tsx` uses `ShellPageHeaderClient`, zinc/red error card, `BUTTON.secondaryRow` retry, and `BUTTON.primaryRow` link to overview.
2. **Shell not-found** — `(shell)/not-found.tsx` uses shared page header typography and overview link; no raw unstyled markup.
3. **Venture detail reskin** — Removed manual breadcrumb and shadcn-like `bg-card` / `text-muted-foreground` / ad-hoc pill colours. Page now uses `ShellPageHeaderClient`, `VentureBreadcrumbRegister`, `TitledCardHeader` + zinc card shells, `StatusPill` / `DomainStatusPill`, and `BUTTON` tokens for actions.

## Commands run

```bash
git fetch origin development
git checkout -B dev/pwr-w4-a-shell origin/development
cd LiNKaios/linkaios-web && npm run typecheck
git add <allowed files>
git commit -m "fix(ui): reskin venture detail and shell error pages"
```

## Proof

- Acceptance: venture page uses shell header, card composite, StatusPill; error/not-found pages use design-system typography and home link.
- **Typecheck:** `cd LiNKaios/linkaios-web && npm run typecheck` — exit 0.

## Blockers

None for this packet.

## Next step

Integrator: merge `dev/pwr-w4-a-shell` → `development`; manual QA on a forced `(shell)` error, unknown route 404, and `/suites/linkapps/ventures/venture-001`.
