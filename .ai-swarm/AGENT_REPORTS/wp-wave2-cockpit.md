# Agent Report: wp-wave2-cockpit (Wave 2 Agent E)

- **Packet:** UIUX-COCK-M001 through H001 — Cockpit Phase 2-3 retirement
- **Branch:** `wp-wave2-cockpit`
- **IDE/Agent:** Cursor (frontend-specialist subagent)

## Objective

Retire the standalone Cockpit surface: redirect legacy routes to canonical homes, remove sidebar entry, update cross-links, and simplify the cockpit dashboard component as a cross-plane summary.

## UX decisions

| Legacy route | Redirect target | Rationale |
|--------------|-----------------|-----------|
| `/cockpit` | `/` (Overview) | Overview already hosts system status, attention queue, workforce/work/projects summaries — the operator landing Cockpit duplicated. |
| `/cockpit/runs` | `/work` | Runs are operational execution (alerts, traces, sessions). Work is the live ops hub; Projects is delivery/catalogue, not run telemetry. |
| `/cockpit/modules` | `/modules` | Module catalogue and health belong in the Modules hub. |
| `/cockpit/leases` | `/skills/leases` | Already redirected (unchanged). |

## Files changed

- `LiNKaios/linkaios-web/src/app/(shell)/cockpit/page.tsx` — redirect to `/`
- `LiNKaios/linkaios-web/src/app/(shell)/cockpit/runs/page.tsx` — redirect to `/work`
- `LiNKaios/linkaios-web/src/app/(shell)/cockpit/modules/page.tsx` — redirect to `/modules`
- `LiNKaios/linkaios-web/src/app/(shell)/cockpit/layout.tsx` — pass-through layout (sub-nav removed)
- `LiNKaios/linkaios-web/src/components/cockpit-dashboard.tsx` — cross-plane summary with links to Overview, Modules, Projects, Work, LiNKskills leases, LiNKbots
- `LiNKaios/linkaios-web/src/components/shell-sidebar.tsx` — Cockpit nav item removed
- `LiNKaios/linkaios-web/src/lib/shell-page-meta.ts` — cockpit meta entries removed
- `LiNKaios/linkaios-web/src/components/modules-hub-footer.tsx` — `/modules` link (was `/cockpit/modules`)
- `LiNKaios/linkaios-web/src/components/metrics-hub-footer.tsx` — Work + Modules links (was single Cockpit link)
- `LiNKaios/linkaios-web/src/components/linkbrain/linkbrain-workspace-footer.tsx` — `/traces` (was `/cockpit/traces`)

## Commands run

```bash
git fetch origin development
git worktree add -b wp-wave2-cockpit .worktrees/wp-wave2-cockpit origin/development
pnpm install
pnpm --filter @linktrend/shared-types build
pnpm --filter @linktrend/shared-config build
pnpm --filter @linktrend/db build
pnpm --filter @linktrend/observability build
pnpm --filter @linktrend/linklogic-sdk build
pnpm --filter @linktrend/linkaios-web typecheck
```

## Proof

```
pnpm --filter @linktrend/linkaios-web typecheck
# exit 0
```

## Blockers

None.

## Next step

Integrator: merge `wp-wave2-cockpit` → `development`. Optional follow-up: delete unused `cockpit-dashboard` loader if no remaining consumers after redirect-only `/cockpit` (component kept for lib/tests compatibility).

## Branch state

- Commit SHA: _(filled after commit)_
- Pushed: _(filled after push)_
