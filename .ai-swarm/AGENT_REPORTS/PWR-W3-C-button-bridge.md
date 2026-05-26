# PWR-W3-C — BUTTON → shadcn Button bridge

- **Date:** 2026-05-22
- **Branch:** `dev/pwr-w3-c-button-bridge`
- **Base:** `origin/development`

## Files changed
- `LiNKaios/linkaios-web/src/components/ui/button-bridge.tsx` (new) — `UiButton`, `BUTTON_BRIDGE_MAP`, semantic variant aliases
- `LiNKaios/linkaios-web/src/lib/ui-standards.ts` — migration JSDoc on `BUTTON`; type re-exports
- `LiNKaios/linkaios-web/docs/ui-system.md` — migration table bridge notes + proof pointer
- `LiNKaios/linkaios-web/src/app/(shell)/projects/page.tsx` — empty-state CTA links migrated to `UiButton`

## Commands run
```bash
git checkout -B dev/pwr-w3-c-button-bridge origin/development
cd LiNKaios/linkaios-web && npm run typecheck  # exit 0
```

## Proof
- `npm run typecheck` — exit 0
- Production use: projects list empty state (`UiButton` + `buttonKey="addRow"` / `secondaryRow` with `asChild` + `Link`)

## Blockers
None on this branch after checkout from clean `origin/development`. (Prior workspace had unrelated W3-A WIP stashed.)

## Next step
Wave 5 mass migration of remaining `className={BUTTON.*}` call sites; optional W1 follow-up to add custom cva variants (`approve`, `add`, `edit`, `warning`) and drop `useLegacyClass` parity mode.
