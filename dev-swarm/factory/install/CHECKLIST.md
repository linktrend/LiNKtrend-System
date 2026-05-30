# Wire Dev Swarm — Install Checklist

Complete every step in order. Confirm each checkbox before the install agent proceeds.

## 0. Prerequisites

- [ ] Git repository with `development`, `staging`, `main` branches (or documented equivalents)
- [ ] GitHub remote connected
- [ ] Cursor account with Automations enabled
- [ ] Codex account with automations enabled (peer executor)
- [ ] Chairman understands: **Go**, scheduled **Continue**, **`staging`/`main`** only by Chairman

## 1. Copy pack

- [ ] `dev-swarm/` exists at repository root (copy entire folder for new products)
- [ ] Install portable Cursor shim: `cp -R dev-swarm/factory/install/portable-cursor/.cursor ./`
- [ ] Read `dev-swarm/README.md` and `dev-swarm/factory/SPEC.md`
- [ ] Add product-specific `.cursor/rules/01`–`08` only if this product needs them (LiNKtrend reference: this repo)

## 2. GitHub labels

**Agent runs** (Chairman confirms output):

```bash
dev-swarm/factory/scripts/install-labels.sh
```

Creates/updates all labels from [contracts/labels.md](../contracts/labels.md) via `gh` (idempotent).

- [ ] Script exited 0; `gh label list` shows `swarm:*`, `runtime:*`, `tier:*`

## 3. GitHub Actions (optional guard)

- [ ] Workflow `.github/workflows/dev-swarm-guard.yml` enabled (validates STATE JSON on PR touching `dev-swarm/factory/STATE.md`)

## 4. Cursor automations

Configure per [automations/cursor/README.md](../automations/cursor/README.md):

- [ ] Orchestrator — trigger: merge to `development`
- [ ] Reviewer — trigger: label `swarm:review-ready`
- [ ] Integrator — trigger: label `swarm:merge-ready`
- [ ] Executor — trigger: `swarm:ready` + `runtime:cursor`

## 5. Codex automations

Configure per [automations/codex/README.md](../automations/codex/README.md):

- [ ] Executor — trigger: `swarm:ready` + `runtime:codex` (same label contract as Cursor)

## 6. Skills

- [ ] Agents use [dev-swarm/skills/SKILLS_CATALOG.md](../skills/SKILLS_CATALOG.md) only
- [ ] Review [MERGE-LOG.md](../skills/MERGE-LOG.md) if duplicate skill behavior appears
- [ ] Root [AGENTS.md](../../AGENTS.md) points to [dev-swarm/AGENTS.md](../AGENTS.md)

## 7. Product program

- [ ] Create `dev-swarm/programs/<product>/PROGRAM.md`
- [ ] Run Planner (pre-Go) → Chairman approves plan
- [ ] Planner checklist: Codex automations created for every `runtime: codex` issue group

## 8. Go

- [ ] Chairman clicks **Go**
- [ ] `STATE.md` phase = `running`
- [ ] Orchestrator sets first parallel group to `swarm:ready`

## 9. Proof of wire

- [ ] Test issue: automation fired without manual executor launch
- [ ] Report contains proof block
- [ ] `dev-swarm/factory/scripts/verify.sh` exits 0 before merge-ready

## Done

Dev Swarm is **wired**. Runtime mode is autonomous until `swarm:chairman-stop` or blocker.
