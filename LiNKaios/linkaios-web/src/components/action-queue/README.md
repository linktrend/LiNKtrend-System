# Action Queue (Family B)

Full-width feed rows with a left accent stripe — alerts, messages, sessions, LiNKbrain inbox.

**Not** an HTML `<table>`. Use **`ActionQueueList`** + **`ActionQueueRow`**.

## Source of truth

| Layer | Location |
|-------|----------|
| Tokens | `src/lib/ui-standards.ts` → `ACTION_QUEUE` |
| List wrapper | `ActionQueueList` |
| Row | `ActionQueueRow` |
| Attention feed preset | `AttentionQueueRow` |
| Accent colours | `action-queue-accent.ts` |

## Mandatory rules

1. **Always 3 content lines** — title, subtitle, meta (`\u00A0` when empty).
2. **Equal line spacing** — `gap-1` between all three lines; single-line clamp per line.
3. **Single action** — whole row clickable (`href` or `onRowClick`); **no trailing icons**.
4. **Multiple actions** — row hover only; **icons at far right**; row click does nothing.
5. **No chevron** — hover background denotes clickability.
6. **No divider** between content and icon rail.
7. Icons centered vertically and horizontally in the action rail.

## Canonical examples

- `/work` Action Queue — `AttentionQueueRow` + `href`
- `/work/alerts` — `ActionQueueRow` + `onRowClick` → modal

## Agent skill

See `.cursor/skills/action-queue/SKILL.md`.
