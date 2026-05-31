# PWR-W5-A — EntityTable → DataTable migration (high-traffic)

- **Date:** 2026-05-22
- **Branch:** `dev/pwr-w5-a-datatable`
- **Commit:** `a9dac55`
- **Base:** `origin/development`

## Status

Complete.

## Tables migrated (3)

| Table | New component | Former caller |
|-------|---------------|---------------|
| Stream routing | `gateway-stream-routing-table.tsx` | `gateway-dashboard.tsx` |
| Message links | `gateway-message-links-table.tsx` | `gateway-dashboard.tsx` |
| Log events | `traces-log-events-table.tsx` | `traces-view.tsx` |

All three were the only remaining `EntityTable` call sites in linkaios-web.

## Files changed

- `LiNKaios/linkaios-web/src/components/gateway-stream-routing-table.tsx` (new)
- `LiNKaios/linkaios-web/src/components/gateway-message-links-table.tsx` (new)
- `LiNKaios/linkaios-web/src/components/traces-log-events-table.tsx` (new)
- `LiNKaios/linkaios-web/src/components/gateway-dashboard.tsx`
- `LiNKaios/linkaios-web/src/components/traces-view.tsx`
- `LiNKaios/linkaios-web/src/components/entity-table.tsx` (deprecation note)
- `LiNKaios/linkaios-web/src/lib/ui-standards.ts` (TABLE_COLUMN keys for gateway/trace headers)

## Migration details

Each new table uses:

- `DataTableShell` + `DataTable` with `table-fixed` (via `DATA_TABLE.table`)
- `<colgroup>` percentage widths (no horizontal scroll at shell width)
- `DT.thTextInset` / `DT.tdClipInset` / `DT.tdTextSpan` for text columns
- `TABLE_COLUMN` Title Case headers
- Empty state via `DataTableEmptyRow`

Sort/filter preserved: traces-view filters remain in the parent form; table displays filtered rows only (unchanged behavior).

## Commands run

```bash
git fetch origin development
git checkout -B dev/pwr-w5-a-datatable origin/development
cd LiNKaios/linkaios-web && npm run typecheck
```

## Proof

- **Typecheck:** `cd LiNKaios/linkaios-web && npm run typecheck` — exit 0
- **EntityTable usages:** grep shows zero imports outside deprecated `entity-table.tsx`

## Blockers

None.

## Notes for downstream

- Workers list, skills/tools catalog, and settings access roles were already on dedicated table/list surfaces (not `EntityTable`). No additional EntityTable call sites remain.
- `EntityTable` kept with `@deprecated` JSDoc for any external/future generic dumps; new tables should follow dedicated preset pattern per data-table skill.

## Next step

Integrator: merge `dev/pwr-w5-a-datatable` → `development` after review.
