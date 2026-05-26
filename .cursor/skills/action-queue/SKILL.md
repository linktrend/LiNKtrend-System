---
name: action-queue
description: LiNKaios feed-style attention rows (Family B) — ActionQueueList, ActionQueueRow, left accent stripe, single vs multi-action click rules. Use for alerts, work attention feed, inbox lists that are NOT HTML tables.
---

# Action Queue (LiNKaios — Family B)

Full-width **feed rows** with a left accent stripe. **Not** an HTML `<table>`.

## When to use

- Work attention feed (`/work`)
- Alerts inbox (`/work/alerts`)
- Any “inbox” where each item is a **card-like row** with title + subtitle + meta

Use **Data Table** when the UI is columnar (sessions table, catalogues, settings).

## Imports

```tsx
import {
  ActionQueueList,
  ActionQueueRow,
  AttentionQueueRow,
  accentFromAlert,
  accentFromAttentionItem,
  actionQueueIconClass,
} from "@/components/action-queue";
import { ACTION_QUEUE } from "@/lib/ui-standards";
```

Tokens: `ACTION_QUEUE` in `LiNKaios/linkaios-web/src/lib/ui-standards.ts`.

## Layout rules (mandatory)

1. **Three lines always** — title, subtitle, meta; use `\u00A0` when a line is empty.
2. **Equal spacing** — `gap-1` between lines; single-line truncate per line (`ACTION_QUEUE.rowSubtitle`, `rowMeta`).
3. **Single action** — whole row clickable via `href` (navigation) or `onRowClick` (modal); **no trailing icons**.
4. **Multiple actions** — `rightActions` icon array at far right; row hover only; **row click does nothing**.
5. **No chevron** — hover background indicates clickability.
6. **No vertical divider** between content and icon rail.
7. **Icons centered** in the action rail (`ACTION_QUEUE.rowActionRail`).

## Row API

```tsx
// Single action — navigate
<ActionQueueRow href="/work/alerts" accent="warning" icon={...} title="..." subtitle="..." meta="Alert" />

// Single action — modal
<ActionQueueRow onRowClick={() => setSelected(item)} accent="..." icon={...} title="..." subtitle="..." meta="50m ago" />

// Multiple actions
<ActionQueueRow
  accent="..."
  icon={...}
  title="..."
  subtitle="..."
  meta="..."
  rightActions={[
    { icon: ExternalLink, label: "Go to fix", href: "/settings/platform" },
    { icon: MoreHorizontal, label: "Details", onClick: () => openModal() },
  ]}
/>
```

## Presets

| Preset | Use for |
|--------|---------|
| `AttentionQueueRow` | `/work` unified attention feed |
| Custom `ActionQueueRow` | Alerts, future inboxes |

## Anti-patterns

- HTML `<table>` for attention feeds
- Chevron or “open row” affordance on the right for single-action rows
- Icons when only one action exists
- Uneven line spacing (avoid `min-h` hacks on subtitle/meta)

See `LiNKaios/linkaios-web/src/components/action-queue/README.md` and `.cursor/rules/07-ui-and-frontend-standards.mdc`.
