# Agent prompt — `bot-runtime` production readiness

Paste everything below the line into a **new Agent** chat. Repository root: **`LiNKtrend-System`**.

---

## Authority

Single source of truth: **`docs/bot-runtime-production-readiness-PRD.md`**.

## Preconditions

Read the PRD, then read:

- `apps/bot-runtime/src/index.ts`
- `apps/bot-runtime/src/openclaw-handoff.ts`
- `packages/shared-config/src/index.ts` (for new timeout env vars)

## Tasks

1. **shared-config:** Add optional timeout env(s) per PRD §5; run `pnpm --filter @linktrend/shared-config build`.

2. **openclaw-handoff.ts:** Use `fetch` with `signal: AbortSignal.timeout(ms)` (or equivalent) from resolved env ms; map abort to a clear `{ ok: false, status: 0, text: "timeout" }` style result.

3. **index.ts:** Apply the same timeout pattern to the Zulip notify `fetch`. Extract notify helper if it clarifies `index.ts`.

4. **Shutdown:** Wrap `closeWorkerSession` in try/catch (or `.catch`), log errors with `log("error", ...)`, still `process.exit(0)` after cleanup attempt.

5. **Governance catch:** In the outer `catch` for governance/bootstrap, call `recordTrace` best-effort with a dedicated `eventType` string per PRD §2.5.

6. **Vitest:** Add `vitest`, `vitest.config.ts`, exclude `*.test.ts` from `tsc` `dist` emit in `apps/bot-runtime/tsconfig.json`. Tests: mocked `fetch` for OpenClaw success + HTTP 500 + timeout abort; optionally one test that notify URL path builds JSON (mock fetch).

7. **ESLint:** `eslint.config.mjs` + `package.json` scripts mirroring `apps/zulip-gateway`.

8. **Docs:** Create **`docs/bot-runtime.md`** per PRD §2.6 and §5.

## Constraints

- Do **not** change OpenClaw fork; do **not** alter `linklogic-sdk` governance semantics unless fixing a proven bug.
- Keep **default behavior** when new env vars are unset (sensible timeout defaults).

## Verification (must run and report)

```bash
pnpm --filter @linktrend/shared-config build
pnpm --filter @linktrend/bot-runtime test
pnpm --filter @linktrend/bot-runtime lint
pnpm --filter @linktrend/bot-runtime build
```

If `linklogic-sdk` types change, run its build too.

## Deliverable

PR notes: new env vars, test list, and link to `docs/bot-runtime.md`.

---

**Start by** listing each `fetch` callsite and the timeout value you will apply, then implement.
