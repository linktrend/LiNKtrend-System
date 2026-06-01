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

## Wave 3 (LTS-003, LTS-005, LTS-011)

### L-014 — Duplicate Slack escalation alerts
- **Symptom:** Two identical `finished_no_pr_escalation_*` Slack messages for #17/#19 at same second.
- **Cause:** Parallel agent-watch workflow runs both passed `recentSlackSent` before either recorded marker.
- **Fix:** Record `[linkdev-slack-sent]` comment **before** Slack webhook post; re-fetch and skip if duplicate marker. **Fixed**.

### L-015 — Conflicting `linkdev:in-progress` + `linkdev:ready` labels
- **Symptom:** Wave 3 issues show both labels after auto-heal redispatch.
- **Cause:** `redispatchIssue` re-added `linkdev:ready` while `linkdev:in-progress` still set; dispatch script removes ready but heal path did not normalize.
- **Fix:** `normalizeExecutorLabelPlan` + `applyNormalizeExecutorLabels` in agent-watch each cycle. **Fixed**.

### L-016 — Infinite auto-heal after repeated FINISHED-without-PR
- **Symptom:** Cloud executors finish ~50s with no PR; factory re-dispatches forever and spams Slack.
- **Fix:** After 2 heal cycles, `escalateExecutorNoPr` applies `linkdev:principal-stop`, posts `[linkdev-local-fallback]`, stops redispatch. **Fixed**.

### L-017 — Orphan orchestrator dispatch issues (#51, #53)
- **Symptom:** Empty-label issues created when dispatch status could not attach to a program issue/PR.
- **Mitigation:** Close with pointer to program issues; future: never open standalone dispatch issues (use comments only). **Fixed** (closed 2026-06-01).

### L-018 — ROOT CAUSE: dispatch omitted `autoCreatePR` and LAW-05 branch prep
- **Symptom:** Executors `FINISHED` in 47–94s on wave 3; watch shows `dev/blackcursor/...` branch but **404 on GitHub**; no PR; auto-heal loop until local implement (PRs #70–#72).
- **Root cause:**
  1. `POST /v1/agents` lacked **`autoCreatePR: true`** — Cursor supports it; factory never sent it.
  2. No **`prepare-executor-branch.mjs`** — Cursor auto-branched ephemerally; nothing pushed to origin.
  3. **`workOnCurrentBranch`** not set with a real `issue/<LTS>-<slug>` ref — LAW-05 branch never existed on GitHub.
  4. ~60s FINISH = read-only exit treated as success by Cursor, failure by factory.
- **Fix:** `linkdev-dispatch-payload.mjs` adds `autoCreatePR` + `workOnCurrentBranch`; dispatch workflow creates branch first; watch treats FINISHED-without-PR as ⚠️; 2nd heal → **LiNKdev executor actions** workflow; tests in verify. **Fixed** (2026-06-01). **Monitor** wave 4+ for PR URL in watch table.
- **Cursor cloud verdict:** Keep for orchestrator/reviewer/integrator. Executors **require** hardened dispatch; if wave 4 fails, default to executor-actions path.

### L-020 — Stale Slack/auto-heal on completed issues (LTS-001 #20)
- **Symptom:** Slack ~1 min after wave 4 start for **LTS-001** (`finished_no_pr_escalation_20` / stall) though PR #55 merged and issue **closed**.
- **Cause:**
  1. Issue **closed** without `linkdev:done` (merge-sync missed or ran before label step); stale `linkdev:in-progress` kept stall logic alive.
  2. `issueHasOpenPr` ignored **merged** PRs — factory treated done work as “no PR”.
  3. When `activeIssueNumbers` was empty on **main** STATE, stall loop scanned **entire** `github-issues.json` (L-007 regression path).
  4. Old `[linkdev-dispatch]` / FINISHED-without-PR comments on #20 still satisfied escalation heuristics.
- **Fix:** `linkdev-issue-terminal.mjs` — skip **CLOSED**, `linkdev:done` / `review-ready`, **merged PR**, and issues not in STATE active set; empty active set → no stall scan; dispatch map skips closed issues; relabel #20 `linkdev:done`. **Fixed** (2026-06-01).

### L-019 — Stale orchestrator handoff marker blocks wave advance
- **Symptom:** Wave 4 did not start after wave 3 merge despite `next_orchestrator_trigger: merge_to_development` and orchestrator dispatch (#75). No `linkdev:ready` on LTS-012 (#42).
- **Root cause:**
  1. `.linkdev/handoff/orchestrator-wave-ready.json` from wave 2 orchestrator (PR #54, merged 02:37) was **never cleared** on `development`.
  2. Staging promotion (PR #61) re-triggered **LiNKdev orchestrator bootstrap**, which hung 25m on “Merge orchestrator PR” for already-merged PR #54.
  3. Bootstrap workflow uses repo-wide concurrency (`cancel-in-progress: false`) — stuck run blocked label application for any new orchestrator handoff.
  4. Cloud orchestrator (#75) dispatched but agent-watch skips unmapped orchestrator agents — no visibility until PR/handoff lands.
- **Fix:** Cancel stuck bootstrap run; move stale marker to `.processed.json`; advance STATE wave 4 (LTS-012 `ready`); apply labels via `apply-wave-labels-from-state.sh`. **Fixed** (2026-06-01).
- **Monitor:** Bootstrap must always reach “Clear handoff marker” step; add idempotency when `pr_number` already merged.

---

## Wave 4 (LTS-012)

### L-021 — GitHub API rate limit blocked factory handoff (~04:41 UTC)
- **Symptom:** Cloud executor **FINISHED** on LTS-012 (#42) with PR #80 + `linkdev:review-ready`, but `dispatch-reviewer` failed in ~7s; agent-watch never posted FINISHED comment. Pipeline stuck until manual recovery.
- **Cause:**
  1. Factory burst: heartbeat `workflow_run` chain + dispatch completion + agent-watch each spawn many concurrent `gh` calls (issue views, PR comments, label checks).
  2. GitHub App installation token **5 000 req/hr** shared across all Actions jobs; no retry on rate limit — hard fail.
  3. `check-labels-for-dispatch.sh` reported “missing label” when `gh pr view` failed on rate limit (false negative).
  4. `sync-agent-watch.mjs` re-fetched every mapped issue/PR each cycle with no cache or skip for already-FINISHED agents.
- **Fix:**
  1. `linkdev-gh-api.mjs` — in-run cache + exponential backoff (5s / 15s / 45s) on rate-limit errors.
  2. `sync-agent-watch.mjs` — scan only STATE-active issues; skip agents with FINISHED watch marker; reuse cached issue views.
  3. `check-labels-for-dispatch.sh` — `gh_retry` wrapper with same backoff.
  4. Workflows — agent-watch concurrency (`cancel-in-progress`); remove `workflow_run` trigger from watch (heartbeat only); heartbeat throttle 240s → **480s**.
- **Status:** **Fixed** (2026-06-01).

---

## Wave 5+ autonomy (L-022)

### L-022 — Cloud orchestrator not required for wave advance or labels
- **Symptom:** Waves 2–5 stalled when cloud orchestrator failed to merge handoff PR, apply `linkdev:ready`, or clear `.linkdev/handoff/orchestrator-wave-ready.json`. Principal break-glass required for every wave.
- **Root cause:**
  1. Wave advance was delegated entirely to cloud orchestrator + bootstrap workflow; Actions merge hook only synced one issue to `done`.
  2. Stale handoff marker blocked bootstrap; bootstrap hung on already-merged PR (L-019).
  3. Cloud orchestrator tokens cannot reliably write issue labels (403).
- **Fix (template — Actions-first):**
  1. `advance-wave-on-merge.mjs` — after integrator merge to `development`, read PROGRAM DAG + STATE, promote next unblocked issues (wave cap 3), set `next_orchestrator_trigger: none`, clear handoff marker, run `apply-wave-labels-from-state.sh`.
  2. `linkdev-dispatch.yml` — post-merge job runs advance-wave **before** optional cloud orchestrator dispatch.
  3. `linkdev-orchestrator-bootstrap.yml` — skip merge when PR already MERGED; `cancel-in-progress: true`; always attempt handoff clear.
  4. L-018/L-021 ports — `autoCreatePR`, `prepare-executor-branch`, `linkdev-gh-api.mjs` rate-limit backoff.
- **What stays cloud:** Executor, reviewer, integrator, planner, and optional orchestrator for complex council/G3 decisions — not routine label/wave advance.
- **Principal proposal:** MVO can complete waves without Principal break-glass when integrator merges land; monitor wave 6+ for promotion correctness.
- **Status:** **Fixed** (2026-06-01).

---

## Template sync (installations)

After pushing LiNKdev template to `main`:

1. **Product repos:** Copy `LiNKdev/factory/` from template; copy `LiNKdev/factory/install/github/*.yml` → `.github/workflows/` on `development` and `main` (workflows are not auto-synced by `sync-installations.sh`).
2. **Tagged releases:** `registry/installations.json` repos receive `LiNKdev/factory/` via `scripts/sync-installations.sh` on tag — re-run wire copy for workflows.
3. **Order:** Template commit → push `linktrend/LiNKdev` → sync host → push host `development` + `main` for Actions.

---

## Template backlog (next iteration)

1. ~~Unit tests for `linkdev-stall-clock.mjs` (dispatch/heal/wave-ready ordering).~~ **Fixed** — `linkdev-stall-clock.test.mjs` in verify.
2. Agent-watch: post active status at most once per 30m per agent (reduce comment noise).
3. Close duplicate/orphan PRs (#48) automatically when newer PR exists for same LTS.
4. Integrator path: merge `linkdev:merge-ready` PRs without Principal when tier A green.
5. Expose single “program status” issue or pinned comment (not scattered factory log issues #51/#53).
