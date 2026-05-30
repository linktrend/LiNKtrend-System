---
name: data-table
description: LiNKaios columnar HTML table surfaces (Family A) — DataTableShell, DT classes, toggles, icon actions, catalogue layouts. Use when building or migrating catalogues, indexes, audit logs, settings lists, or any `<table>` in shell UI.
---

# Data Table (LiNKaios — Family A)

Columnar **HTML `<table>`** surfaces. For feed-style attention rows, use **Action Queue** (Family B) instead.

## When to use

- Skills/tools catalogues, project indexes, lease logs, API keys, sessions list, settings tables, generic entity dumps
- Any shell UI that presents **columns + rows** in a bordered card

## Imports

```tsx
import {
  DataTable,
  DataTableBody,
  DataTableEmptyRow,
  DataTableHead,
  DataTableRow,
  DataTableShell,
  DataTableIconAction,
  TableBoolToggle,
  DT,
} from "@/components/data-table";
import { DATA_TABLE, formatTableColumnLabel } from "@/lib/ui-standards";
import { CapabilityCatalogColGroup, CapabilityToolsCatalogColGroup } from "@/components/capability-catalog-table-layout";
```

Tokens: `DATA_TABLE` + `TABLE` in `LiNKaios/linkaios-web/src/lib/ui-standards.ts`.  
Composed cell classes: `DT` in `components/data-table/data-table-classes.ts`.

## Layout rules (mandatory)

1. **`DataTableShell`** — outer border/shadow; pass `scrollableBody` when max-height + vertical scroll.
2. **`DataTable`** + **`table-fixed`** + **`<colgroup>`** — no horizontal scroll at shell width.
3. **Header alignment matches cells:**
   - Text → `DT.thText` / `DT.thTextInset` + `DT.tdClip` + `DT.tdTextSpan`
   - Badges/toggles/icons → `DT.thControl` + `DT.tdControl` + `DT.controlInner`
   - Numeric (rare) → `DT.thNumeric` + `DT.tdNumeric`
4. **Row height** — `DataTableRow` or `DT.tr` / `DT.trMultiline` (3-line description cells).
5. **Truncation** — `DT.tdClip` on every text column; `line-clamp-3` via `DT.tdWrapSpan` for descriptions.
6. **Toggles** — `TableBoolToggle` only (green on / red off).
7. **Actions** — bare `DataTableIconAction` icons; no redundant links in name column when actions duplicate navigation.
8. **Overflow** — too many columns → drop to modal + `ExternalLink` details icon.
9. **Title Case** column headers via `TABLE_COLUMN` or `formatTableColumnLabel()`. Section headings and form labels use the same Title Case rule via `formatUiLabel()` — see `.cursor/rules/07-ui-and-frontend-standards.mdc`.

## Catalogue presets

| Preset | File |
|--------|------|
| Skills 7-col | `skills-catalog-table.tsx` + `CapabilityCatalogColGroup` |
| Tools 8-col | `tools-catalog-table.tsx` + `CapabilityToolsCatalogColGroup` |
| Projects index | `projects-index-table.tsx` |
| Metrics runs | `metrics-recent-runs-table.tsx` |
| Generic key/value | `entity-table.tsx` |

Extend presets before inventing inline tables.

## Anti-patterns

- Raw `overflow-x-auto rounded-xl border` table wrappers
- Ad-hoc `px-4 py-3` on `<th>`/`<td>` instead of `DT.*`
- `CatalogueBoolToggle` in new tables (use `TableBoolToggle`)
- Name column links when actions column already navigates
- Horizontal scroll for shell-width tables

See `LiNKaios/linkaios-web/src/components/data-table/README.md` and `.cursor/rules/07-ui-and-frontend-standards.mdc`.
