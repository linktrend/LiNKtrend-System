# PRISM-Defender — Product Requirements (PRD)

**Status:** Draft (2026-04-15).  
**Scope:** `apps/prism-defender` and its **contracts** with `apps/bot-runtime`, Supabase `prism.*`, shared config, observability, and **minimal** LiNKaios visibility.  
**Parent context:** Monorepo PRD §9 (`docs/260414 - LiNKtrend Agentic System PRD.md`) remains the north star; **this document defines a shippable v1 milestone** (“defensive sidecar ready”) that materially advances §9 without overclaiming (no “magical invisibility”).

**Out of scope for v1:** Kernel-level syscall filtering, mandatory co-tenancy with OpenClaw inside the fork, cross-host orchestration when worker and PRISM run on different machines without a shared contract, antivirus engines, full command-centre analytics product.

---

## 1. Definition — **defensive sidecar ready** (v1)

PRISM-Defender is **ready** for this milestone when all of the following are true:

1. **Explicit residue policy:** Operators configure **which filesystem roots** PRISM may touch, **dry-run vs apply**, and **safety bounds** (max files per tick, max bytes, min file age before delete, deny prefixes).
2. **Real filesystem cleanup:** After a closed worker session is **acknowledged** in `prism.swept_sessions` (existing flow), PRISM performs **bounded deletion** of files under configured roots that match policy **or** documents why cleanup was skipped (dry-run, path outside root, policy deny).
3. **Runtime integration:** `bot-runtime` **signals session end** to central telemetry **before** `closeWorkerSession` completes, with `worker_session_id` and optional `residue_roots` hints so PRISM and operators can correlate (exact transport: see §6).
4. **Shutdown alignment:** On worker SIGINT/SIGTERM path, **ordering** is defined and implemented: signal → (optional) local cleanup trigger → `closeWorkerSession` → exit; no silent omission of session-end signal when PRISM policy expects it.
5. **Containment (v1 minimal):** When filesystem cleanup fails repeatedly for the same root or session class, PRISM emits **`prism.cleanup.fs_failed`** (or equivalent) `cleanup_events` / `linkaios.traces` per §8; product does **not** require automated process kill in v1.
6. **Observability:** Structured logs for every meaningful action; **central** records for heartbeat, sweep ack, fs batch start/end/failure; LiNKaios **read-only** strip or settings row showing **last heartbeat age** and **recent failure count** (see §7).
7. **Quality:** `prism-defender` has **Vitest** coverage for pure policy helpers; **lint** is real (replace `echo` stub); `pnpm` build/typecheck pass for touched packages.
8. **Operator runbook:** Env table + deployment note (co-located vs remote PRISM) appended to this PRD §10 or `docs/` pointer from §10.

---

## 2. Principles

1. **Fail-closed on ambiguity:** If roots are misconfigured or a path escapes allowed roots, **do not delete**; log and increment failure telemetry.
2. **Never delete outside declared roots:** Resolve paths with `path.resolve` + root prefix checks; reject symlinks that escape (or skip symlink targets).
3. **Production default:** `PRISM_FS_CLEANUP` off until explicitly enabled in prod; **dry-run** available in all environments.
4. **Honest scope:** v1 optimizes for **single-host or shared-volume** deployments where PRISM and worker share configured paths; multi-host without shared FS requires **session-end signal only** plus operator-run cleanup (documented).

---

## 3. Current baseline (do not regress)

- Heartbeat → `prism.cleanup_events` (`sidecar_heartbeat`).
- Retention prune for heartbeat rows (`heartbeat-retention.ts`).
- Residue sweep: closed `bot_runtime.worker_sessions` → `residue_sweep_ack` + `prism.swept_sessions` (`residue-sweep.ts`).
- Env: `PRISM_HEARTBEAT_MS`, `PRISM_RETENTION_DAYS`, `PRISM_RESIDUE_SWEEP`, `PRISM_RESIDUE_BATCH` (`shared-config`).

---

## 4. Residue policy (configuration)

| Variable | Purpose |
|----------|---------|
| `PRISM_RESIDUE_ROOTS` | Comma-separated absolute directory roots PRISM may clean (empty ⇒ no FS cleanup). |
| `PRISM_FS_CLEANUP` | `0` / `1` — master switch for filesystem deletion (default `0`). |
| `PRISM_FS_DRY_RUN` | `0` / `1` — if `1`, log intended deletes only, no unlink. |
| `PRISM_FS_MAX_FILES_PER_TICK` | Cap deletes per sweep cycle (default e.g. 100). |
| `PRISM_FS_MIN_AGE_SEC` | Only delete files not modified within last N seconds (default e.g. 300). |
| `PRISM_FS_DENY_PREFIXES` | Optional comma list of path prefixes **never** deleted even under roots (e.g. `/.ssh,/etc`). |

Add these to `packages/shared-config` with safe parsing and defaults documented in §10.

---

## 5. Filesystem cleanup behavior

**Trigger:** After successfully inserting `swept_sessions` for a session (same tick or queued), **optionally** run FS module for that batch.

**Algorithm (normative):**

1. For each root in `PRISM_RESIDUE_ROOTS`, walk with bounded depth (configurable max depth, default sensible e.g. 6).
2. Consider only **regular files** (skip dirs, skip if symlink resolves outside root).
3. If `mtime` (or `birthtime` if available) newer than `now - PRISM_FS_MIN_AGE_SEC`, skip.
4. If dry-run: insert `cleanup_events` action `fs_cleanup_would_delete` with safe metadata (relative path, size).
5. If not dry-run and `PRISM_FS_CLEANUP=1`: `unlink`, then `fs_cleanup_deleted` event; on error `fs_cleanup_failed`.

**Idempotency:** Re-running must not assume exclusive lock; tolerate missing files.

---

## 6. `bot-runtime` integration contract

**Requirement:** When the worker receives SIGINT/SIGTERM and begins shutdown, it must insert a **`prism.cleanup_events`** row (service role) with:

- `action`: `worker_session_end`
- `worker_session_id`: current session UUID
- `detail`: `{ host, pid, residue_roots?: string[] }` where `residue_roots` is optional list copied from env `BOT_RUNTIME_RESIDUE_ROOTS` if set (new optional env for worker-advertised paths).

**Ordering:** Emit `worker_session_end` **before** `closeWorkerSession` (await insert best-effort; failure should log but not block session close indefinitely—use timeout or fire-and-forget with trace).

**Implementation location:** Prefer a small helper in `@linktrend/linklogic-sdk` (e.g. `recordPrismSessionEnd`) using `createSupabaseServiceClient`, called from `apps/bot-runtime`, to avoid duplicating Supabase wiring.

**Note:** PRISM sidecar does not have to consume this row in v1 if sweep already drives FS cleanup; the row exists for **correlation and future realtime**. Document in §10.

---

## 7. LiNKaios visibility (minimal v1)

One of:

- **Overview** or **Settings → Governance** small card: “PRISM last heartbeat”, “PRISM fs failures (24h)” from `prism.cleanup_events` counts; **viewer-safe** read.

OR

- Link from existing health copy to a thin **`/settings/prism`** page listing last 20 `cleanup_events` for `authenticated` SELECT (RLS already allows select).

Pick the smallest change that meets operator trust in §1 item 6.

---

## 8. Traces and `cleanup_events` vocabulary

Standardize `cleanup_events.action` strings (document in code + §10):

| `action` | Meaning |
|----------|---------|
| `sidecar_heartbeat` | (existing) |
| `residue_sweep_ack` | (existing) |
| `worker_session_end` | Bot shutdown signal |
| `fs_cleanup_would_delete` | Dry-run |
| `fs_cleanup_deleted` | Applied delete |
| `fs_cleanup_failed` | Error |
| `fs_cleanup_skipped_policy` | Outside root / deny rule |

Optional: mirror **critical** failures to `linkaios.traces` via existing `recordTrace` pattern **only if** product wants cross-service dashboard; otherwise `cleanup_events` + LiNKaios page is enough for v1.

---

## 9. Acceptance criteria (v1)

- [ ] With `PRISM_FS_DRY_RUN=1` and roots set, logs show would-delete entries and **no** file is removed.
- [ ] With `PRISM_FS_CLEANUP=1`, test temp files under a root older than min age are deleted and events recorded.
- [ ] Attempt to delete outside root → **skipped** + `fs_cleanup_skipped_policy` or `fs_cleanup_failed` with reason.
- [ ] `bot-runtime` emits `worker_session_end` on shutdown when Supabase configured.
- [ ] LiNKaios shows heartbeat / failure signal per §7.
- [ ] Tests + lint + build green.

---

## 10. Operator runbook (deliverable content)

### 10.1 Environment variables

| Variable | Default (when unset) | Purpose |
|----------|----------------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | — | Supabase URL (required for sidecar + bot-runtime central writes). |
| `SUPABASE_SECRET_KEY` | — | Service role secret (required for `cleanup_events` inserts). |
| `PRISM_HEARTBEAT_MS` | `60000` in code if unset | Sidecar tick interval (ms). |
| `PRISM_RETENTION_DAYS` | `14` | Delete old `sidecar_heartbeat` rows from `prism.cleanup_events`. |
| `PRISM_RESIDUE_SWEEP` | on (any value except `0`) | Set to `0` to disable closed-session ack sweep. |
| `PRISM_RESIDUE_BATCH` | `25` | Max sessions to acknowledge per tick. |
| `PRISM_RESIDUE_ROOTS` | empty | Comma-separated **absolute** directory roots PRISM may scan for residue files. Empty ⇒ no filesystem cleanup runs. |
| `PRISM_FS_CLEANUP` | `0` / off | Set to `1` to allow real `unlink` when not in dry-run. **Keep `0` in production until paths are verified.** |
| `PRISM_FS_DRY_RUN` | on (`1`) when unset | When `1`, only inserts `fs_cleanup_would_delete` events; no deletes. Set to `0` to allow deletes **if** `PRISM_FS_CLEANUP=1`. |
| `PRISM_FS_MAX_FILES_PER_TICK` | `100` | Cap on delete / would-delete actions per FS cleanup invocation. |
| `PRISM_FS_MIN_AGE_SEC` | `300` | Only consider files whose mtime is at least this many seconds in the past. |
| `PRISM_FS_DENY_PREFIXES` | empty | Comma-separated absolute path prefixes never deleted (even under a root), e.g. `/.ssh,/etc`. |
| `PRISM_FS_MAX_DEPTH` | `6` | Max directory depth from each root when walking. |
| `BOT_RUNTIME_RESIDUE_ROOTS` | empty | Optional comma list copied into `worker_session_end.detail.residue_roots` for correlation (does not authorize PRISM paths). |

### 10.2 Production recommendations

- Set **`PRISM_FS_CLEANUP=0`** until residue roots are correct; use **`PRISM_FS_DRY_RUN=1`** (or unset) first and inspect `fs_cleanup_would_delete` in LiNKaios **Settings → PRISM** or SQL.
- Run **PRISM on the same host (or shared volume)** as the worker when filesystem cleanup is enabled; otherwise rely on **`worker_session_end`** plus manual operator cleanup (see §2 honest scope).
- Align **`BOT_RUNTIME_RESIDUE_ROOTS`** with what the worker actually writes (optional hints only); **`PRISM_RESIDUE_ROOTS`** is the only list that authorizes deletion.

### 10.3 Shutdown ordering (bot-runtime)

Signal received → optional `worker_session_end` insert (best-effort, ≤ ~2s) → `closeWorkerSession` → process exit. Session end is skipped when Supabase URL/secret are missing.

### 10.4 Verify telemetry

Latest heartbeat and recent rows: LiNKaios **Settings → PRISM**.

SQL (service role or SQL editor):

```sql
select action, created_at, worker_session_id, detail
from prism.cleanup_events
order by created_at desc
limit 50;
```

### 10.5 Rollback

- Disable real deletes: **`PRISM_FS_CLEANUP=0`** (and optionally **`PRISM_FS_DRY_RUN=1`**).
- Disable filesystem pass entirely: clear **`PRISM_RESIDUE_ROOTS`** or stop the sidecar.
- Disable session sweep: **`PRISM_RESIDUE_SWEEP=0`** (stops new `swept_sessions` acks; does not remove historical rows).

---

## 11. Future (not v1)

- Realtime subscription to `worker_session_end` instead of poll-only.
- Per-tool residue contracts from LiNKskills governance.
- Stronger containment (process tree, cgroups) with explicit product approval.

---

## 12. Document control

| Version | Date | Notes |
|---------|------|--------|
| 0.1 | 2026-04-15 | Initial PRD for v1 “defensive sidecar ready”. |
