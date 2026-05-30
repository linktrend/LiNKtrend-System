# Wire LiNKdev — Install Checklist

Complete every step in order. Confirm each checkbox before the install agent proceeds.

## 0. Prerequisites

- [ ] Git repository with `development`, `staging`, `main` branches (or documented equivalents)
- [ ] GitHub remote connected
- [ ] Cursor account with Automations enabled
- [ ] Codex account with automations enabled (peer executor)
- [ ] Principal understands: **Go**, scheduled **Continue**, **`staging`/`main`** only by Principal

## 1. Copy pack

- [ ] `LiNKdev/` exists at repository root (copy entire folder for new products)
- [ ] Install portable Cursor shim: `cp -R LiNKdev/factory/install/portable-cursor/.cursor ./`
- [ ] Read `LiNKdev/README.md` and `LiNKdev/factory/SPEC.md`
- [ ] Add product-specific `.cursor/rules/01`–`08` only if this product needs them (LiNKtrend reference: this repo)

## 2. GitHub labels

**Agent runs** (Principal confirms output):

```bash
LiNKdev/factory/scripts/install-labels.sh
```

Creates/updates all labels from [contracts/labels.md](../contracts/labels.md) via `gh` (idempotent).

- [ ] Script exited 0; `gh label list` shows `linkdev:*`, `runtime:*`, `tier:*`

## 3. GitHub Actions (optional guard)

- [ ] Workflow `.github/workflows/LiNKdev-guard.yml` enabled (validates STATE JSON on PR touching `LiNKdev/factory/STATE.md`)

## 4. Cursor automations

Configure per [automations/cursor/README.md](../automations/cursor/README.md):

- [ ] Orchestrator — trigger: merge to `development`
- [ ] Reviewer — trigger: label `linkdev:review-ready`
- [ ] Integrator — trigger: label `linkdev:merge-ready`
- [ ] Executor — trigger: `linkdev:ready` + `runtime:cursor`

## 5. Codex automations

Configure per [automations/codex/README.md](../automations/codex/README.md):

- [ ] Executor — trigger: `linkdev:ready` + `runtime:codex` (same label contract as Cursor)

## 6. Skills

- [ ] Agents use [LiNKdev/skills/SKILLS_CATALOG.md](../skills/SKILLS_CATALOG.md) only
- [ ] Review [MERGE-LOG.md](../skills/MERGE-LOG.md) if duplicate skill behavior appears
- [ ] `.cursor/rules/00-linkdev-bootstrap.mdc` installed (no root `AGENTS.md` — entry is `LiNKdev/AGENTS.md`)

## 7. Product program

- [ ] Create `LiNKdev/product/programs/<product>/PROGRAM.md`
- [ ] Run Planner (pre-Go) → Principal approves plan
- [ ] Planner checklist: Codex automations created for every `runtime: codex` issue group

## 8. Go

- [ ] Principal clicks **Go**
- [ ] `STATE.md` phase = `running`
- [ ] Orchestrator sets first parallel group to `linkdev:ready`

## 9. Proof of wire

- [ ] Test issue: automation fired without manual executor launch
- [ ] Report contains proof block
- [ ] `LiNKdev/factory/scripts/verify.sh` exits 0 before merge-ready

## Done

LiNKdev is **wired**. Runtime mode is autonomous until `linkdev:principal-stop` or blocker.
