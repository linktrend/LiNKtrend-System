# LiNKdev operational learnings (linktrend-system run)

Living log from the first production program run. Each item should drive a **template fix** in `LiNKdev/factory/` before the next program.

## How to use

| Status | Meaning |
|--------|---------|
| **Fixed** | Patch landed in template + host repo |
| **Open** | Known; fix pending |
| **Monitor** | Watching next waves |

---

## Wave 1 (LTS-001, LTS-010, LTS-020)

### L-001 — Cloud executor never opened LTS-001 PR (~2h)
- **Symptom:** Issue `#20` stuck `linkdev:in-progress`; agents `CREATING` / unmapped.
- **Cause:** Cursor API strips custom agent names; watch mapped wrong FINISHED → orchestrator PR #47.
- **Fix:** `buildDispatchAgentMap()` from `[linkdev-dispatch]` comments; descriptive agent names in dispatch. **Fixed** (669e2a4).
- **Fallback:** Principal/local implement when executor fails repeatedly (PR #55).

### L-002 — Slack stall at 30m was too slow vs 10m auto-heal
- **Fix:** `STALL_NOTIFY_MINUTES = 15`. **Fixed**.

### L-003 — Auto-heal reset stall timer incorrectly
- **Cause:** `[linkdev-auto-heal]` counted as “progress” for Slack.
- **Fix:** Stall clock uses dispatch-after-heal only (`linkdev-stall-clock.mjs`). **Fixed** (this doc wave).

### L-004 — Scheduled agent-watch cron never fired
- **Symptom:** Zero `schedule` events on `linkdev-agent-watch.yml`; no watch/auto-heal/Slack between 03:24–03:40.
- **Cause:** GitHub `schedule` on watch workflow never ran (repo/org quirk or workflow never enabled on default branch early enough).
- **Fix:** `linkdev-factory-heartbeat.yml` cron → `gh workflow run` agent watch every 5m. **Fixed** (pending deploy).

### L-009 — Executor FINISHED without opening PR (wave 2 repeat)
- **Symptom:** Agents `FINISHED` ~115s on #18/#16/#39; branches exist; **no PR** on GitHub (same as LTS-001).
- **Status:** **Open** — cloud executor reliability; local implement fallback or open PR from branch in watch.

### L-005 — Guard shellcheck SC2034 / SC2317 on `run-gates.sh`
- **Fix:** Remove unused `SCRIPT_DIR`; `# shellcheck disable=SC2317`. **Fixed**.

---

## Wave 2 (LTS-002, LTS-004, LTS-060)

### L-006 — False Slack stall on fresh wave launch
- **Symptom:** Stall Slack for #18/#16/#39 at **03:23:58Z** while dispatch started **03:24:00Z**.
- **Cause:** Watch ran between `linkdev:ready` and new `[linkdev-dispatch]`; timer used **pre-wave** dispatch comments (>15m old). Auto-heal fired same second (03:23:56).
- **Fix:**
  - Stall cycle starts at latest dispatch **after** `[linkdev-auto-heal]` or `[linkdev-wave-ready]`.
  - Slack/auto-heal only for `linkdev:in-progress` (not `ready`-only).
  - `loadActiveIssueNumbers()` reads STATE `issues` (ready/in_progress), not only `active_waves`.
  - `apply-wave-labels` posts `[linkdev-wave-ready]` marker.
- **Status:** **Fixed** (pending deploy to `development`).

### L-007 — STATE has no `active_waves`; slack scanned all mapped issues
- **Symptom:** Empty `activeIssueNumbers` → stall logic ran on entire `github-issues.json`.
- **Fix:** Derive active set from STATE `issues` block. **Fixed** with L-006.

### L-008 — Manual wave advance bypassed orchestrator bootstrap PR
- **Symptom:** PR #52 conflict; Principal agent updated STATE + labels directly.
- **Mitigation:** Acceptable for unblock; orchestrator cloud path still preferred for routine waves.
- **Status:** **Open** — document “break glass” in `PRINCIPAL-MONITORING.md`.

---

## Timing reference (wave 2 launch 2026-06-01)

| Event | UTC (approx) |
|-------|----------------|
| Wave labels applied | 03:23:52 |
| False auto-heal + Slack | 03:23:56–58 |
| Fresh executor dispatch | 03:24:00 |
| Expected auto-heal (if no PR) | **03:34** (+10m from 03:24) |
| Expected real Slack stall | **03:39** (+15m from 03:24) |

Slack cooldown (`stall_*` event, 60m) suppresses repeat alerts from the false positive until ~04:24.

---

## Template backlog (next iteration)

1. Unit tests for `linkdev-stall-clock.mjs` (dispatch/heal/wave-ready ordering).
2. Agent-watch: post active status at most once per 30m per agent (reduce comment noise).
3. Close duplicate/orphan PRs (#48) automatically when newer PR exists for same LTS.
4. Integrator path: merge `linkdev:merge-ready` PRs without Principal when tier A green.
5. Expose single “program status” issue or pinned comment (not scattered factory log issues #51/#53).
