# Agent Report: wp-wave2-help (Wave 2 Agent H — GLOBAL-002)

- **Packet:** GLOBAL-002 — static page help for shell headers
- **Branch:** `wp-wave2-help`
- **Commit:** `492dccf`
- **IDE:** Cursor (frontend-specialist subagent)
- **Worktree:** `.worktrees/wp-wave2-help` (from `origin/development`)

## Objective

Replace disabled “Page help (coming soon)” with a working static help panel keyed by route (and selected query tabs), wired through `ShellPageHeaderClient` and `ShellAutoPageHeader` without LLM calls.

## Files changed

| Path | Change |
|------|--------|
| `LiNKaios/linkaios-web/src/lib/page-help-copy.ts` | **New** — `resolvePageHelp()` static copy for Work, Company tabs, Settings, Modules, Metrics, LiNKbrain tabs, LiNKskills, Projects, Cockpit, etc. |
| `LiNKaios/linkaios-web/src/components/page-help-panel.tsx` | **New** — accessible slide-over panel (Escape, backdrop, focus on close) |
| `LiNKaios/linkaios-web/src/components/shell-page-header.tsx` | Enabled Help button via `onHelpClick` |
| `LiNKaios/linkaios-web/src/components/shell-page-header-client.tsx` | Help state + panel; `useSearchParams` in Suspense for tab-aware copy (`?tab=` on Company, LiNKbrain) |

`shell-auto-page-header.tsx` unchanged — already renders `ShellPageHeaderClient`, which now opens help.

## Behavior

- **Help** opens a right-side panel with plain-English purpose copy for the current route.
- **Company** and **LiNKbrain** respect `?tab=` for tab-specific help.
- Footer note: static only; **TODO** documents future optional LLM assistant.
- No API or model calls.

## Commands run

```bash
cd .worktrees/wp-wave2-help
pnpm install
pnpm -r --filter './packages/*' run build
pnpm --filter @linktrend/linkaios-web typecheck
git push -u origin wp-wave2-help
```

## Proof

```
pnpm --filter @linktrend/linkaios-web typecheck
# Exit 0
```

## Blockers

None.

## Next step

Integrator: merge `wp-wave2-help` → `development` after Wave 2 review. Optional follow-up: extend `page-help-copy.ts` for remaining deep routes (skill detail, worker sub-tabs) and wire `WorkerTabSectionHeader` if in scope for a later packet.
