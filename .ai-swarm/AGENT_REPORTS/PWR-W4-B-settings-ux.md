# PWR-W4-B — Settings UX polish

- **Branch:** `dev/pwr-w4-b-settings`
- **Base:** `origin/development`
- **Commit (implementation):** `d924ebe8baa80c3efb41e9b638a9edceb2b1620a`
- **IDE/Agent:** Cursor (frontend-specialist subagent)
- **Date:** 2026-05-22

## Objective

Fix double headers on User settings and tighten Access intro clutter from UI audit.

## Files changed

- `LiNKaios/linkaios-web/src/app/(shell)/settings/layout.tsx` — inline settings chrome; suppress layout H1 on `/settings/user`; tighter Access page title/subtitle
- `LiNKaios/linkaios-web/src/app/(shell)/settings/access/team-permissions-section.tsx` — single intro line using shared permissions copy; non-admin note deduped

## Commands run

```bash
git checkout -b dev/pwr-w4-b-settings origin/development
cd LiNKaios/linkaios-web && npm run typecheck
git add LiNKaios/linkaios-web/src/app/(shell)/settings/layout.tsx \
  LiNKaios/linkaios-web/src/app/(shell)/settings/access/team-permissions-section.tsx
git commit -m "fix(settings): dedupe headers and tighten access intro"
```

## Proof

```text
> npm run typecheck
tsc --noEmit — exit 0
```

## Acceptance criteria

- [x] No duplicate H1 on User — layout header suppressed on `/settings/user`; profile hero retains sole H1
- [x] Access page scannable — header shortened to "Access" with one-line subtitle; team tab intro collapsed to one paragraph

## Blockers

None.

## Notes

- W3-A stub badges on billing/data/integrations hub cards unchanged (out of scope files).
- `user/page.tsx` and `access/page.tsx` required no edits after layout + team section fixes.

## Next step

Integrator: merge `dev/pwr-w4-b-settings` → `development` after Wave 4 review.
