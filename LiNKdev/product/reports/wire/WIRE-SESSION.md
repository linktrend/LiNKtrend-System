# LiNKdev wire session — LiNKtrend-System

- **Repo:** linktrend/LiNKtrend-System
- **Branch:** development (dispatch workflows promoted to **main**, tip `90d697d`)
- **Wire agent:** Cursor (Step A + Step B prep)
- **Session date:** 2026-06-01 (dispatch v2 wire)

## Principal launch (only these lines)

See `LiNKdev/factory/install/PRINCIPAL-LAUNCH.md`.

| Step | Status |
|------|--------|
| A — `EXECUTE-WIRE-LINKDEV.md` | **complete** |
| B — `EXECUTE-LINKDEV-DISPATCH-INSTALL.md` | **complete** (2026-06-01) |
| C — `EXECUTE-WIRE-LINKDEV-POST-DISPATCH.md` | **complete_pending_go** (verify.sh + Actions orchestrator dispatch) |
| Legacy UI — `EXECUTE-LINKDEV-UI-AUTOMATIONS.md` | **superseded** by dispatch v2 (optional cleanup in Cursor UI) |
| 8 — Go (Planner) | **complete** (2026-06-01 — `linkdev-go`) |

## Dispatch v2 (Step B — 2026-06-01)

- **Status:** **complete** on branch `development` (template **v1.2.0** sync + workflow copy).
- **Workflows:** `.github/workflows/linkdev-dispatch.yml`, `linkdev-guard.yml`, `branch-source-policy.yml` on **main** (promotion `development` → `main`, `{main_sha}`).
- **Secret:** `CURSOR_API_KEY` — **configured** (`gh secret list`, name only; value not readable).
- **Local dry-run:** `node LiNKdev/factory/scripts/dispatch-cursor-agent.mjs --role orchestrator --dry-run --repo linktrend/LiNKtrend-System` → exit 0.
- **Legacy UI automations (2026-05-31):** superseded; optional to disable duplicate Cursor Automations to avoid double-firing.

## Step C (post-dispatch — 2026-06-01)

- **verify.sh:** exit 0 (tier A gates passed).
- **Actions proof:** `gh workflow run "LiNKdev dispatch" --ref main -f role=orchestrator` → success — https://github.com/linktrend/LiNKtrend-System/actions/runs/26728188505
- **Wire status:** `complete` — Planner Go issued; STATE `phase: running` for `linktrend-system`.

## Checklist (CHECKLIST.md)

### §0 Prerequisites — complete

- [x] Branches: `development`, `staging`, `main` present locally and on origin
- [x] GitHub remote: `gh repo view` → `linktrend/LiNKtrend-System` (default branch `main`)
- [x] Cursor/Codex accounts: assumed enabled for deployed instance (not verifiable from CLI)
- [x] Principal policy: **Go**, **Continue**, `staging`/`main` promotion are Principal-only per SPEC §5–6

### §1 Copy pack — complete

- [x] `LiNKdev/` at repository root
- [x] `.cursor/rules/00-linkdev-bootstrap.mdc` present (matches portable-cursor template)
- [x] `LiNKdev/README.md` and `LiNKdev/factory/SPEC.md` present
- [x] Product rules: `.cursor/rules/01`–`08` present (host repo)

### §2 GitHub labels — complete

- [x] `LiNKdev/factory/scripts/install-labels.sh` exited 0 (15 definitions)
- [x] All `linkdev:*`, `runtime:*`, `tier:*` labels visible via `gh label list`

### §3 GitHub Actions guard — complete

- [x] `.github/workflows/linkdev-guard.yml` on `development`
- [x] Enabled when workflow file is on `development` (no Principal toggle required)

### §4 Cursor automations — complete

- [x] LiNKdev-orchestrator — merge to `development`
- [x] LiNKdev-reviewer — `linkdev:review-ready`
- [x] LiNKdev-integrator — `linkdev:merge-ready`
- [x] LiNKdev-executor-cursor — `linkdev:ready` + `runtime:cursor`

### §5 Codex automations — blocked

- [ ] LiNKdev-executor-codex — `linkdev:ready` + `runtime:codex`

### §6 Skills — complete

- [x] `LiNKdev/skills/SKILLS_CATALOG.md` present
- [x] Bootstrap rule points to `LiNKdev/skills/` (not flat `.cursor/skills/` bodies)
- [x] No root `AGENTS.md` (entry via `.cursor/rules/00-linkdev-bootstrap.mdc`)

### §7 Product program — complete

- [x] `LiNKdev/product/programs/linktrend-system/PROGRAM.md` exists (status: draft)
- [x] STATE.md updated: `program_id: linktrend-system`, `phase: awaiting_go` (Go not faked)
- [x] Planner / issue-group automations deferred until Principal **Go**

### §8 Go — not executed (Principal only)

- [x] Principal says **Go** (2026-06-01)
- [x] Program STATE phase = `running` (Planner G2 PASS)

### §9 Proof of wire — complete_pending_go (dispatch v2)

- [x] `verify.sh` exits 0 (2026-06-01)
- [x] Local dispatch dry-run (orchestrator) exit 0
- [x] GitHub Actions **LiNKdev dispatch** run URL recorded — https://github.com/linktrend/LiNKtrend-System/actions/runs/26728188505
- [ ] Dry-run test issue: executor path fired via Actions (optional full E2E)

## Agent log

### Commands run (Step A)

```bash
git branch -a
# development, staging, main + feature branches

gh repo view --json nameWithOwner,defaultBranchRef
# {"nameWithOwner":"linktrend/LiNKtrend-System","defaultBranchRef":{"name":"main"}}

LiNKdev/factory/scripts/install-labels.sh
# OK: labels ensured on linktrend/LiNKtrend-System (15 definitions)

gh label list --limit 200 | grep -E 'linkdev:|runtime:|tier:'
# 13 linkdev:* + runtime:cursor + runtime:codex + tier:standard + tier:critical

LiNKdev/factory/scripts/verify.sh
# == verify passed ==
# VERIFY OK: tier A gates passed
```

### verify.sh summary (Step A proof)

```
== LiNKdev verify (tier=standard scope=LiNKdev) ==
state json ok
VERIFY OK: no obvious secret assignments in LiNKdev
VERIFY OK: scripts present
VERIFY OK: contracts json valid
== verify passed ==
GATE OK: verify_subset, secrets_scan
VERIFY OK: tier A gates passed
```

### STATE transition

- **Before:** `program_id: bootstrap`, `phase: complete` (bootstrap DS-001…046 frozen)
- **After:** `program_id: linktrend-system`, `phase: awaiting_go`, `issues: {}`, `next_orchestrator_trigger: go`

---

## Wire re-run (Cursor subagent — 2026-05-31)

Step A re-executed per `EXECUTE-WIRE-LINKDEV.md` (§0–3, §6–7 only; §4–5 `pending_codex_ui`; §8–9 skipped).

```bash
git branch -a
# * development, main, staging (+ feature branches); remotes origin/development, origin/main, origin/staging

gh repo view
# linktrend/LiNKtrend-System

LiNKdev/factory/scripts/install-labels.sh
# OK: labels ensured on linktrend/LiNKtrend-System (15 definitions)

gh label list --limit 200 | grep -E 'linkdev:|runtime:|tier:'
# 11 linkdev:* + runtime:cursor + runtime:codex + tier:standard + tier:critical

diff -q .cursor/rules/00-linkdev-bootstrap.mdc LiNKdev/factory/install/portable-cursor/.cursor/rules/00-linkdev-bootstrap.mdc
# (no output — identical)

LiNKdev/factory/scripts/verify.sh
# == verify passed == ; VERIFY OK: tier A gates passed ; exit 0
```

**Result:** All Step A checks pass. No file changes outside report. UI automations remain **pending_codex_ui**.

---

## Dispatch v2 wire (Cursor agent — 2026-06-01)

Part of Principal-authorized template publish **LiNKdev v1.2.0** (`964b66b`).

```bash
# Template sync from LiNKdev clone
./scripts/sync-installations.sh /Users/linktrend/Projects/LiNKtrend-System

cp LiNKdev/factory/install/github/linkdev-dispatch.yml .github/workflows/linkdev-dispatch.yml

gh secret list
# CURSOR_API_KEY present

node LiNKdev/factory/scripts/dispatch-cursor-agent.mjs --role orchestrator --dry-run --repo linktrend/LiNKtrend-System
# DRY_RUN: would POST /v1/agents … exit 0

LiNKdev/factory/scripts/verify.sh
# == verify passed == ; VERIFY OK: tier A gates passed
```

**GitHub Actions run URL (Step C):** https://github.com/linktrend/LiNKtrend-System/actions/runs/26728188505 (workflow_dispatch, orchestrator, ref `main`, promotion SHA `90d697d`).

