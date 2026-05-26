# PWR-W3-C — BUTTON → shadcn Button bridge

## Objective
Thin adapter so existing `BUTTON.*` tokens map to shadcn Button variants without mass page edits.

## Depends on
Wave 1 shadcn primitives on `development`

## Branch
`dev/pwr-w3-c-button-bridge` from `development` after Wave 2

## Allowed files
- `LiNKaios/linkaios-web/src/components/ui/button-bridge.tsx` (new)
- `LiNKaios/linkaios-web/src/lib/ui-standards.ts` (export map only)
- `LiNKaios/linkaios-web/docs/ui-system.md` (migration table update)

## Tasks
1. Map `BUTTON.approveRow`, `addRow`, `ghost`, etc. to shadcn `variant` + `size`
2. Export `UiButton` that accepts legacy className OR variant key
3. Document migration path in ui-system.md
4. Migrate **one** reference page as proof (e.g. projects empty state or wizard launch)

## Prohibited
- Mass migration of all pages (Wave 5)

## Acceptance
- [ ] Bridge compiles
- [ ] At least one production use
- [ ] typecheck

## Report
`.ai-swarm/AGENT_REPORTS/PWR-W3-C-button-bridge.md`

## Commit
`feat(ui): add BUTTON to shadcn button bridge`
