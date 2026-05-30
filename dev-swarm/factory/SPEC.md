# Dev Swarm Specification

Version: 2.0  
Status: active (2026-05-30)

## 1. What Dev Swarm is

Dev Swarm is a **portable AI software factory**: Programs → Modules → Phases → **Issues**, coordinated through **GitHub + files**, with **Cursor-primary** control plane and **Codex** as peer executor automations.

Copy **`.cursor/`** and **`dev-swarm/`** into a new repository. The **product** subtree starts empty (except grounding stubs). **Factory** subtree is complete.

## 2. Layout

| Path | Purpose |
|------|---------|
| `dev-swarm/factory/` | Portable factory: SPEC, STATE, contracts, templates, scripts, install, prompts, bootstrap program |
| `dev-swarm/product/` | This repo only: grounding, programs, reports |
| `dev-swarm/skills/gstack/` | Universal product-development workflows (required in every template) |
| `dev-swarm/skills/host/` | This repository only (empty in virgin template) |

There is no `skills/factory/`. Factory roles use **gstack** and **host** via `dev-swarm/skills/SKILLS_CATALOG.md`. On conflict: **host wins** over gstack.

## 3. Coordination

Agents do not share one chat session. Coordination is:

- GitHub **labels**
- **`dev-swarm/factory/STATE.md`** (active wave only; Orchestrator is authoritative writer)
- Issue specs, **report_path**, branches, commits

## 4. Hierarchy

| Level | Name | Meaning |
|-------|------|---------|
| 1 | **Program** | Body of work |
| 2 | **Module** | Major area inside program |
| 3 | **Phase** | Stage group inside module |
| 4 | **Issue** | Single agent assignment |

Filesystem (new work):

`dev-swarm/product/programs/<program-id>/modules/<module-id>/phases/<phase-id>/issues/<issue-id>.md`

`PROGRAM.md` at program root is the DAG source of truth.

Reports mirror issues:

`dev-swarm/product/reports/<program-id>/<module-id>/<phase-id>/<issue-id>.md`

Integrator maintains `dev-swarm/product/reports/<program-id>/STATUS.md`.

## 5. Roles and runtimes

| Role | Runtime | Responsibility |
|------|---------|----------------|
| **Planner** | Cursor cloud (on **Go**) | Q&A with Chairman → finished-product narrative → OK → create program + issues |
| **Orchestrator** | Cursor automation | Advance STATE, set `swarm:ready` (active wave cap in PROGRAM.md) |
| **Executor** | Cursor or Codex cloud | Implement issue on branch |
| **Reviewer** | Cursor automation | Spec + proof; reject vacuous PASS |
| **Integrator** | Cursor automation | Merge to `development`; program STATUS |
| **Chairman** | Human | Go, Continue, staging/main, Release OK, optional pilot wave |

**Codex** executors: `swarm:ready` + `runtime:codex`.

## 6. Virgin repo → wire → UI → Go

1. Copy `.cursor/` + `dev-swarm/` (product/programs empty; product/grounding stubs; skills/host empty).
2. **Local Cursor — wire:** `dev-swarm/factory/install/WIRE-PROMPT.md` (no provider UI).
3. **Codex computer use:** `factory/install/automations/CODEX-CREATE-AUTOMATIONS.md` and `CURSOR-CREATE-AUTOMATIONS.md` per `AUTOMATION-MANIFEST.md`.
4. **Chairman Go — cloud Cursor Planner:** Q&A until ≥95% clarity → plain-English **finished product** description (what users get when all issues are done) → Chairman OK → Planner **creates** `product/programs/<program-id>/` (no program exists before Go).
5. **Loop starts automatically:** Orchestrator → Executor → Reviewer → Integrator → … until program complete or `swarm:chairman-stop`.

**Chairman Continue** clears chairman stop and resumes Orchestrator.

Repos with an existing program (e.g. LiNKtrend migration) may run Planner without Go to update the plan.

## 7. Bootstrap program

`dev-swarm/factory/programs/bootstrap/` — frozen history of building the factory (DS-001…046). Not re-run after wire. Reports under `dev-swarm/factory/reports/bootstrap/`.

## 8. Branches

- Integration: **`development`**
- Issue work: `issue/<id>-<slug>` or `dev/<machine><ide>` per host SOP
- Chairman only: **`staging`**, **`main`**

## 9. Labels

See [contracts/labels.md](contracts/labels.md).

Executor sets `swarm:merge-ready` only when `dev-swarm/factory/scripts/verify.sh` exits 0 (tier-aware). Release-phase **critical** issues may set `DEV_SWARM_SCOPE=.` (repo root).

## 10. Issue contract

Frontmatter: [contracts/issue-frontmatter.schema.json](contracts/issue-frontmatter.schema.json).

Planner **copies** `factory/templates/issue.md` — fill fields; do not invent structure.

- `read_first`: exact paths only
- `read_forbidden`: includes `dev-swarm/archive/**`, `dev-swarm/product/reports/**` (except own `report_path`), glob reads of `grounding/**`

## 11. Product grounding (anti-drift)

`dev-swarm/product/grounding/` — stable product truth for **this repo**. Planner fills after Go OK. Issues link specific files; agents do not list the whole tree.

## 12. Program Definition of Done

Every `PROGRAM.md` includes **Program Definition of Done** and a **release** module/phase with **critical** issues: verify, proof manifest, `grounding/SHIP_CRITERIA.md`, demo evidence. Chairman **Release OK** before staging/main.

See [BORROW-PACK.md](BORROW-PACK.md) B14–B18.

## 13. Borrow pack

[BORROW-PACK.md](BORROW-PACK.md) — UBS-inspired gates; not full UBS. No second orchestration stack. No mandatory gstack `/ship` on every issue (release phase only).

## 14. Skills

- Catalog: `dev-swarm/skills/SKILLS_CATALOG.md`
- Routing: `dev-swarm/factory/install/SKILLS-ALLOWLIST.md`
- Merge history: `dev-swarm/skills/MERGE-LOG.md`

## 15. Wire

[install/WIRE-PROMPT.md](install/WIRE-PROMPT.md) → [install/CHECKLIST.md](install/CHECKLIST.md).

## 16. LiNKtrend hosting

Legacy work packets: `dev-swarm/product/programs/linktrend-system/issues/legacy/`. Migration: [../product/programs/linktrend-system/MIGRATION.md](../product/programs/linktrend-system/MIGRATION.md).
