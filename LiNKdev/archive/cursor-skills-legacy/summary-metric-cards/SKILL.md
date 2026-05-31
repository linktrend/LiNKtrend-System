---
name: summary-metric-cards
description: Build and migrate LiNKaios dashboard stat/stream/lifecycle summary tiles using SummaryMetricCard, SummaryMetricCardGrid, SUMMARY_METRIC_CARD tokens, and preset grids. Use when adding KPI rows, work stream cards, fleet stats, lifecycle summaries, or migrating inline stat card grids.
---

# Summary Metric Cards (LiNKaios)

Canonical reference: `/work` work-stream tiles.

## When to use

Any tile with **icon + title + primary number** (+ optional status pill, preview line, footer link) is a summary metric card. Do not build these inline.

## Imports

```tsx
import {
  SummaryMetricCard,
  SummaryMetricCardGrid,
  SummaryMetricCardSection,
  // preset grids — prefer these when they exist:
  ProjectLifecycleSummaryGrid,
  FleetSummaryStatsGrid,
  CapabilitiesCatalogStatsGrid,
  LeaseSummaryStatsGrid,
  CockpitSummaryStatsGrid,
  OverviewWorkforceSummaryGrid,
  OverviewProjectsSummaryGrid,
  MetricsKpiSummaryGrid,
} from "@/components/summary-metric-card";
import { SUMMARY_METRIC_CARD, formatCardTitle } from "@/lib/ui-standards";
import { WORK_STREAM_STATUS_PILL_LABELS } from "@/lib/status-colors";
import { StatusPill } from "@/components/ui/status-pill";
```

Tokens live in `LiNKaios/linkaios-web/src/lib/ui-standards.ts` (`SUMMARY_METRIC_CARD`).

## Layout rules (mandatory)

1. **Grid** — `SummaryMetricCardGrid` with `auto-rows-fr items-stretch` so preview lines align across the row.
2. **Title** — sentence-case via `formatCardTitle()`, single line (`whitespace-nowrap`), icon + title fully visible.
3. **Corner badge (optional)** — `badge` prop + `statusPillLabels` on grid with the **full label set** (e.g. `WORK_STREAM_STATUS_PILL_LABELS`).
4. **Metric** — `compactMetric` for `text-2xl` (dashboard stats) or default for `text-3xl` (work streams).
5. **Preview** — optional context line; supports `ReactNode` for trend/spark text.
6. **Footer** — card actions via `footer` + `BUTTON.secondaryCardAction`.

## New preset grid

When a page needs a reusable stat row:

1. Add `components/summary-metric-card/<name>-summary-grid.tsx` (`"use client"` — owns Lucide icons).
2. Compose `SummaryMetricCard` + `SummaryMetricCardGrid` only.
3. Export from `components/summary-metric-card/index.ts`.

Server pages import the preset grid, not raw icons into client children.

## Status pills on cards

- Pass `equalWidthLabels={WORK_STREAM_STATUS_PILL_LABELS}` (or full domain set) on **every** pill in the group.
- Do not rely on context-only equal width across server/client boundaries.

## Anti-patterns

- Inline `grid gap-4` + `rounded-xl border p-4` stat divs
- ALL CAPS titles on metric cards
- `truncate` on title row
- Custom pill widths outside `statusPillEqualWidthClass`

See `.cursor/rules/07-ui-and-frontend-standards.mdc` for full GLOBAL-001 pill rules.
