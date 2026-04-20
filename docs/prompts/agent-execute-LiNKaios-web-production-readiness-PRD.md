# Agent prompt — LiNKaios web production readiness (no default demo, optional UI mocks)

Paste everything below the line into a **new Agent** chat. Repository root: **`LiNKtrend-System`**.

---

## Authority

Single source of truth: **`docs/LiNKaios-web-production-readiness-PRD.md`**.

## Preconditions

Read the PRD fully, then scan:

- `apps/linkaios-web/src/lib/demo-entities.ts`
- `apps/linkaios-web/src/lib/demo-worker-ui.ts`
- `apps/linkaios-web/src/components/shell-sidebar.tsx`
- `apps/linkaios-web/src/lib/overview-dashboard.ts`
- `apps/linkaios-web/src/app/(shell)/missions/page.tsx` and `missions/[id]/page.tsx`
- `apps/linkaios-web/src/app/(shell)/workers/**/*.tsx`, `work/**/*.tsx`, `metrics/**`
- `packages/shared-config/src/index.ts` (add mock flag if server-side)

## Implementation strategy

1. **Introduce `isUiMocksEnabled()`** (exact env name per PRD §7 — pick one and add to `shared-config` + `.env.example` comment).

2. **Refactor all demo merges:** Any `DEMO_SIDEBAR_*`, `DEMO_*_THREADS`, `demoMetricsSnapshot`, `DEMO_BRIDGE`, etc. must run **only** when `isUiMocksEnabled()` is true. When false, UI uses **only** query results; implement **empty states** (title + short explanation + primary CTA link where a route exists, e.g. create mission / worker).

3. **Routes with fake IDs:** For `/missions/[id]` and `/workers/[id]` (and similar), when mocks **off** and id matches known demo pattern (`isDemoMissionId` / `isDemoAgentId`) **or** id not found in DB → **`notFound()`** or redirect to list with toast-friendly pattern (choose `notFound` unless product prefers redirect).

4. **Centralize fixtures:** Move mock rows into `apps/linkaios-web/src/lib/ui-mocks/` (or agreed folder) so one banner + one flag controls all fixture injection.

5. **Shell banner:** When mocks on, show a non-dismissible (or session-dismissible) banner at top of `(shell)/layout` stating data may be synthetic.

6. **Plane / gateway copy:** Replace misleading “synced” or demo labels with truthful disconnected/config states per PRD §3.5.

7. **Surface Supabase errors** on major list pages where today errors are swallowed (minimal pattern: red inline alert + retry where easy).

## Constraints

- Do **not** change `bot-runtime`, `zulip-gateway`, or migrations unless LiNKaios strictly requires a type from shared-config.
- **No** new markdown files beyond editing this PRD §7 table if env names change (optional one-line `README` in `ui-mocks/` folder is OK if you add a folder).
- Keep diffs **focused** on demo removal + mocks + empty states; avoid unrelated refactors.

## Verification (must run and report)

```bash
pnpm --filter @linktrend/shared-config build   # if env schema changes
pnpm --filter @linktrend/linkaios-web exec tsc --noEmit
pnpm --filter @linktrend/linkaios-web lint
pnpm --filter @linktrend/linkaios-web build
```

Optional: `grep -r "demo-lisa\\|demo-smb\\|DEMO_SIDEBAR" apps/linkaios-web/src` and paste counts before/after in PR notes (expect hits only inside `ui-mocks` + `isUiMocksEnabled` branches).

## Deliverable

PR description: env flag name, list of touched routes, before/after screenshots optional, and **how the founder runs UX review** (mocks on vs off).

---

**Start by** listing every file that imports `demo-entities` or `demo-worker-ui`, then work file-by-file until grep is clean for default path.
