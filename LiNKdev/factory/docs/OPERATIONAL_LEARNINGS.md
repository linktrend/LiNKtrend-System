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
- **Symptom:** Zero `schedule` events on `linkdev-agent-watch.yml` or heartbeat; no watch/auto-heal/Slack between 03:24–03:40.
- **Cause:** GitHub `schedule` alone never ran (repo/org quirk or new workflow not yet picked up by cron scheduler).
- **Fix:** `linkdev-factory-heartbeat.yml` cron + `workflow_run` chain (CI/dispatch/watch, throttled ≥4m) → `gh workflow run` agent watch. Manual `workflow_dispatch` verified 2026-06-01. **Fixed**.

### L-010 — Reviewer/integrator dispatch failed on Verify PR label
- **Symptom:** `dispatch-reviewer` and `dispatch-integrator` fail in ~7s on PRs #56–#59; `gh pr view` in `check-labels-for-dispatch.sh` exits 4 (no auth).
- **Cause:** Verify PR label step missing `GH_TOKEN`; `gh` CLI requires explicit token in Actions runners.
- **Fix:** Add `env: GH_TOKEN: ${{ github.token }}` to reviewer and integrator Verify PR label steps in `linkdev-dispatch.yml`. **Fixed**.

### L-009 — Executor FINISHED without opening PR (wave 2 repeat)
- **Symptom:** Agents `FINISHED` ~115s on #18/#16/#39; branches reported but **no commits/PR** on GitHub (same as LTS-001).
- **Fix:** Immediate `healFinishedWithoutPr` in agent-watch; toggle `linkdev:ready` to re-dispatch; Slack `finished_no_pr_*` event; stronger executor dispatch prompt + ROLE.md PR mandate. **Fixed** (local implement fallback for wave 2).

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
- **Status:** **Fixed**.

### L-011 — Merge did not sync STATE or linkdev:done
- **Symptom:** Integrator merge left GitHub issue labels and STATE `ready` even after PR merged.
- **Fix:** `sync-state-on-merge.mjs` in `dispatch-orchestrator-merge` — labels `linkdev:done`, updates STATE, commits to `development`, then dispatches orchestrator. **Fixed**.

### L-012 — Reviewer dispatch transient failure
- **Symptom:** `dispatch-reviewer` failed in ~7s when `gh` lacked token; also flaky API.
- **Fix:** `GH_TOKEN` on all verify steps; reviewer job retries once after 15s. **Fixed**.

### L-013 — Second FINISHED-without-PR needs Principal
- **Symptom:** Repeated cloud executor FINISHED with no PR after auto-heal.
- **Fix:** Slack `finished_no_pr_escalation_*` after 2 heal cycles; optional `gh pr create` from remote branch before re-dispatch. **Fixed**.

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

1. ~~Unit tests for `linkdev-stall-clock.mjs` (dispatch/heal/wave-ready ordering).~~ **Fixed** — `linkdev-stall-clock.test.mjs` in verify.
2. Agent-watch: post active status at most once per 30m per agent (reduce comment noise).
3. Close duplicate/orphan PRs (#48) automatically when newer PR exists for same LTS.
4. Integrator path: merge `linkdev:merge-ready` PRs without Principal when tier A green.
5. Expose single “program status” issue or pinned comment (not scattered factory log issues #51/#53).
