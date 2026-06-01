# PWR-W5-B — Empty states + preview polish

- **Date:** 2026-05-22
- **Branch:** `dev/pwr-w5-b-polish`
- **Base:** `origin/development`
- **IDE/Agent:** Cursor (frontend-specialist subagent)

## Status

Complete (packet scope).

## Files changed

- `LiNKaios/linkaios-web/src/app/(shell)/work/work-empty-state.tsx` — shared empty panel (icon + title + description + CTA links/buttons)
- `LiNKaios/linkaios-web/src/app/(shell)/work/page.tsx` — action queue empty state
- `LiNKaios/linkaios-web/src/app/(shell)/work/alerts-inbox.tsx` — filter-aware alerts empty state
- `LiNKaios/linkaios-web/src/app/(shell)/work/work-messages-workspace.tsx` — channel / LiNKbot filter empty states
- `LiNKaios/linkaios-web/src/app/(shell)/work/sessions-inbox.tsx` — sessions empty / filter empty states
- `LiNKaios/linkaios-web/src/app/(shell)/metrics/page.tsx` — zero-activity banner + subtitle copy tweak
- `LiNKaios/linkaios-web/src/components/cockpit-dashboard.tsx` — runs, leases, suite health empty states; suite copy on cards

## What changed

1. **Consistent empty states** — Dashed panel pattern aligned with projects/workers empty states: Lucide icon, title, helper line, primary/secondary CTAs (`UiButton` + `BUTTON` tokens).
2. **Metrics** — Top-of-page empty banner when `totalTraces === 0` (non-demo, no load error). Subtitle uses “project” wording consistently.
3. **Cockpit** — Recent runs, recent leases, and suite health use the shared panel; suite card meta reads “{kind} suite · N capabilities”.

## Commands run

```bash
git checkout -B dev/pwr-w5-b-polish origin/development
cd LiNKaios/linkaios-web && npm run typecheck
```

## Proof

```text
> npm run typecheck
tsc --noEmit — exit 0
```

## Acceptance criteria

- [x] Empty states follow icon + title + CTA pattern
- [x] typecheck passes in linkaios-web

## Blockers

- **Follow-up (out of allowed files):** Inline empty hints inside `components/metrics-dashboard.tsx` and `components/metrics-recent-runs-table.tsx` still use plain text paragraphs. Page-level banner covers the primary “no activity” case; integrator may wire `WorkEmptyState` into those components in a later packet.

## Next step

Integrator: merge `dev/pwr-w5-b-polish` → `development`; manual QA on `/work`, `/work/alerts`, `/work/messages`, `/work/sessions`, `/metrics` (mocks off), and cockpit dashboard empty DB path.
