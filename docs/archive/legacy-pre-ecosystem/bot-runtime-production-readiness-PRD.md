# LiNKbot Runtime (`bot-runtime`) — Production readiness PRD

**Status:** Draft (2026-04-15).  
**Scope:** `apps/bot-runtime` only — tests, lint, outbound HTTP hardening, shutdown reliability, observability, documentation.  
**Out of scope:** OpenClaw fork internals; Zulip plugin; LiNKaios UI.

---

## 1. Current baseline

- Opens worker session, pulses heartbeat, builds governance via `buildLinktrendGovernancePayload`, traces `bot_runtime.governance_built`.
- **Tool block:** skips OpenClaw, traces `tool.run.blocked`, optional POST to `ZULIP_GATEWAY_NOTIFY_URL`.
- **Happy path:** `postGovernanceToOpenClaw` with `buildOpenClawAgentIngressBody`, traces success/failure.
- **Shutdown:** SIGINT/SIGTERM → `recordPrismSessionEnd` (raced to ~2s) → `closeWorkerSession` → `process.exit(0)`.
- **No** Vitest today; **lint** is a stub (`echo`).

---

## 2. Definition — **production ready** (this PRD)

`bot-runtime` is **production ready** when:

1. **Automated tests:** Vitest covers **pure or mockable** behavior: at minimum `postGovernanceToOpenClaw` with **mocked `fetch`** (success, 4xx/5xx, missing URL); optional unit for shutdown ordering **without** live Supabase (inject env + mock SDK functions if refactor is small).
2. **Lint:** Real **ESLint** (flat config, align with `apps/zulip-gateway` or `apps/prism-defender`).
3. **Outbound HTTP timeouts:** All `fetch` calls (`openclaw-handoff`, Zulip notify) use **`AbortSignal.timeout`** or `AbortController` with a configurable default (e.g. **30s** OpenClaw, **10s** notify) and env overrides (`BOT_RUNTIME_OPENCLAW_TIMEOUT_MS`, `BOT_RUNTIME_NOTIFY_TIMEOUT_MS` or single `BOT_RUNTIME_HTTP_TIMEOUT_MS`).
4. **Shutdown hardening:** `closeWorkerSession` wrapped so failures are **logged** and do not prevent process exit; `recordPrismSessionEnd` behavior unchanged unless a bug is found.
5. **Governance failure path:** If `buildLinktrendGovernancePayload` throws, emit a **best-effort** `recordTrace` with `bot_runtime.governance_error` (or reuse existing pattern) so operators see failures in Traces, not only stdout.
6. **Documentation:** `docs/bot-runtime.md` (new, short): env table, lifecycle diagram (ASCII), “blocked run → approve in LiNKaios → re-run”, health/liveness = **session pulse** in `bot_runtime.worker_sessions` (no mandatory HTTP health server in v1).
7. **Build:** `pnpm --filter @linktrend/bot-runtime` — `test`, `lint`, `build` all pass; `shared-config` rebuilt if new env keys are added.

---

## 3. Principles

- **Fail loud in logs, bounded in time:** No unbounded `fetch` on worker startup.
- **Do not** silently swallow `closeWorkerSession` errors.
- **Minimal scope:** Prefer small helpers over growing `index.ts` beyond ~250 lines (extract `notifyToolGovernanceBlock` if needed).

---

## 4. Non-goals (v1)

- Embedded HTTP `/health` server (use DB pulse + traces for liveness).
- Kubernetes operator or supervisor config (document only).
- Retry loop for OpenClaw after transient 503 (optional follow-up).

---

## 5. Environment (additions)

| Variable | Required | Default | Purpose |
|----------|----------|---------|---------|
| `BOT_RUNTIME_HTTP_TIMEOUT_MS` | No | e.g. 30000 | Upper bound for OpenClaw POST (and optionally notify unless split). |
| `BOT_RUNTIME_NOTIFY_TIMEOUT_MS` | No | inherit or 10000 | Optional split timeout for Zulip notify POST. |

Document in `docs/bot-runtime.md` with existing vars (`BOT_RUNTIME_MISSION_ID`, `OPENCLAW_*`, `ZULIP_GATEWAY_NOTIFY_URL`, etc.).

---

## 6. Acceptance criteria

- [ ] `pnpm --filter @linktrend/bot-runtime test` passes (≥3 meaningful tests).
- [ ] `pnpm --filter @linktrend/bot-runtime lint` runs ESLint with zero errors.
- [ ] Code review: every `fetch` in `apps/bot-runtime` has an abort timeout.
- [ ] `closeWorkerSession` failure path logged; process still exits on SIGINT.
- [ ] `docs/bot-runtime.md` exists and matches behavior.

---

## 7. Document control

| Version | Date | Notes |
|---------|------|--------|
| 0.1 | 2026-04-15 | Initial PRD. |
