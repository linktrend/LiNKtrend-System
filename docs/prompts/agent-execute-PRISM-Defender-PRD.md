# Agent prompt — Execute `docs/PRISM-Defender-PRD.md` (v1 defensive sidecar)

Paste everything below the line into a **new Agent** chat. Repository root: **`LiNKtrend-System`**.

---

## Authority

Single source of truth: **`docs/PRISM-Defender-PRD.md`**.  
Cross-check **`docs/260414 - LiNKtrend Agentic System PRD.md` §9** for intent; if conflict, **this PRD wins** for v1 scope (narrower).

## Preconditions

Read:

- `docs/PRISM-Defender-PRD.md` (full)
- `apps/prism-defender/src/index.ts`, `residue-sweep.ts`, `heartbeat-retention.ts`
- `apps/bot-runtime/src/index.ts`
- `packages/shared-config/src/index.ts`
- `services/migrations/004_prism.sql`, `008_rls_and_prism_swept.sql`, `010_operator_roles_rls.sql` (prism policies)
- `packages/linklogic-sdk/src/trace.ts` (pattern for new `recordPrismSessionEnd` if used)

## Implementation checklist (order flexible; justify in PR)

1. **shared-config:** Add env vars from PRD §4 + `BOT_RUNTIME_RESIDUE_ROOTS` (optional). Parse with defaults; document in PRD §10 table (edit PRD in same PR).

2. **linklogic-sdk:** Add `recordPrismSessionEnd(env, { workerSessionId, detail })` (or name aligned with repo) inserting into `prism.cleanup_events` with `action: worker_session_end`, using service client; export from package index.

3. **bot-runtime:** On shutdown path **before** `closeWorkerSession`, call `recordPrismSessionEnd` best-effort (log on failure; optional short timeout). Read optional `BOT_RUNTIME_RESIDUE_ROOTS` into `detail`.

4. **prism-defender — FS module:** New module e.g. `fs-residue-cleanup.ts`:

   - Parse `PRISM_RESIDUE_ROOTS`, enforce root prefix safety, min age, max files/tick, deny prefixes.
   - Integrate after `sweepWorkerResidue` success path **or** as sub-step per session batch (design choice: avoid double full-tree walk per tick—prefer batch tied to newly swept sessions).
   - Emit `cleanup_events` per PRD §8 vocabulary.

5. **prism-defender — main loop:** Wire FS module behind `PRISM_FS_CLEANUP` / `PRISM_FS_DRY_RUN`; keep existing heartbeat + prune + sweep.

6. **LiNKaios:** Minimal UI per PRD §7 (card or `/settings/prism`).

7. **Migrations:** Only if new columns needed; prefer **no migration** if `cleanup_events.action` + `detail` JSON suffice. If you add indexes (e.g. `(action, created_at)`), ship `018_*` + `ALL_IN_ONE.sql` tail update.

8. **Tests:** `apps/prism-defender` or `packages/linklogic-sdk` — Vitest for path canonicalization / deny rules / “would delete” logic (pure functions). Mock `fs` where needed.

9. **Lint:** Replace `echo "no lint"` in `apps/prism-defender/package.json` with real eslint **or** align with monorepo turbo lint pattern used by other apps.

10. **Verification (must run and report):**

    - `pnpm --filter @linktrend/prism-defender build` (and `test` if added)
    - `pnpm --filter @linktrend/linklogic-sdk build && pnpm --filter @linktrend/linklogic-sdk test`
    - `pnpm --filter @linktrend/bot-runtime build` (or package name as in repo)
    - `pnpm --filter @linktrend/linkaios-web typecheck` if UI touched

## Constraints

- **Never** unlink paths outside `PRISM_RESIDUE_ROOTS` resolution rules.
- Default **`PRISM_FS_CLEANUP` off**; production requires explicit opt-in.
- Do **not** implement process kill / cgroups (PRD §11).

## Deliverables

- PR description: env vars, shutdown ordering diagram (text ok), screenshots or notes for LiNKaios minimal UI.
- Updated **`docs/PRISM-Defender-PRD.md` §10** operator table filled with final variable names and defaults.

## Stop condition

If multi-host deployment makes FS cleanup unsafe without shared volume, ship **session-end signal + dry-run + docs** only, mark FS apply as “requires co-located volume” in PRD §10, and list remaining gap explicitly — do not pretend cross-host FS cleanup works.

---

**Start by** quoting PRD §1 acceptance bullets, map to files, then implement.
