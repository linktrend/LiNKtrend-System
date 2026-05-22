# Data Table (Family A)

Columnar HTML `<table>` surfaces for catalogues, indexes, audit logs, and settings lists.

**Not** for feed-style attention rows — use `@/components/action-queue` (Family B).

## Source of truth

| Layer | Location |
|-------|----------|
| Tokens | `src/lib/ui-standards.ts` → `DATA_TABLE`, `TABLE` |
| Composed classes | `data-table-classes.ts` → `DT` |
| Shell / scroll | `DataTableShell` |
| Row actions | `DataTableIconAction`, `TableBoolToggle` |
| Catalogue col widths | `capability-catalog-table-layout.tsx` |

## Mandatory rules

1. Wrap tables in **`DataTableShell`** (`scrollableBody` when height-capped).
2. Use **`DataTable`** + **`DT.*`** classes — do not invent parallel table shells.
3. **`table-fixed`** + `<colgroup>` percentages — avoid horizontal scroll at shell width.
4. Text columns: **`DT.tdClip`** + **`DATA_TABLE.tdText`** (1 line) or **`tdWrap`** (up to 3 lines).
5. Header alignment matches cell content:
   - Text → `DT.thText` / `DT.thTextInset`
   - Badges, toggles, icons → `DT.thControl` + `DT.controlInner`
   - Numeric timestamps → `DT.thNumeric` + `DT.tdNumeric` (left-align timestamps unless truly numeric)
6. **Equal row height** — `DT.tr` or `DT.trMultiline` on every body row.
7. **Actions** — bare **`DataTableIconAction`** icons, same size; show disabled when unavailable.
8. **No redundant name links** when the actions column duplicates navigation.
9. **Overflow columns** — when too many columns, move detail to a modal + details icon (`ExternalLink`).
10. Title Case column headers via visible text; use `formatTableColumnLabel()` for dynamic keys.

## Canonical examples

- Skills catalogue — `skills-catalog-table.tsx`
- Tools catalogue — `tools-catalog-table.tsx`
- Metrics recent runs — `metrics-recent-runs-table.tsx`
- Projects index — `projects-index-table.tsx`

## Agent skill

See `.cursor/skills/data-table/SKILL.md`.
