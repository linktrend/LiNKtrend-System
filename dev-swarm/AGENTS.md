# Dev Swarm — agent entry

Copy **only** **`.cursor/`** + **`dev-swarm/`** to new repos. Do **not** add a root `AGENTS.md` — Cursor uses `.cursor/rules/00-dev-swarm-bootstrap.mdc` to reach this file. Read **`dev-swarm/factory/SPEC.md`** first.

## Layout

| Path | Role |
|------|------|
| `dev-swarm/factory/` | Portable factory (SPEC, STATE, install, prompts, templates, bootstrap) |
| `dev-swarm/product/` | This repo: grounding, programs, reports |
| `dev-swarm/skills/gstack/` | Required on every product |
| `dev-swarm/skills/host/` | This repo only (empty in virgin template) |

## Progressive disclosure

1. `dev-swarm/factory/SPEC.md`
2. Active **issue** file (from label/STATE) — includes `read_first` only
3. `report_path` for that issue only
4. `dev-swarm/skills/SKILLS_CATALOG.md` — open **one** skill path listed on issue or role table
5. `dev-swarm/product/grounding/` — **only** files listed in `read_first`

Do **not** list or glob `product/reports/`, `archive/`, or full `grounding/`.

## Skills

- **gstack** — universal workflows (review, ship, investigate, …)
- **host** — this repository; **wins** over gstack on conflict
- Catalog: `dev-swarm/skills/SKILLS_CATALOG.md`
- Routing: `dev-swarm/factory/install/SKILLS-ALLOWLIST.md`

## Roles

| Role | Prompt |
|------|--------|
| Wire | `factory/install/WIRE-PROMPT.md` (local) |
| UI automations | `factory/install/automations/CODEX-CREATE-AUTOMATIONS.md` |
| Go → Planner | `factory/prompts/planner/ROLE.md` (cloud) |
| Orchestrator / Executor / Reviewer / Integrator | `factory/prompts/<role>/ROLE.md` |

## Go (virgin repo)

Chairman **Go** → cloud Planner Q&A → finished-product narrative → OK → create program under `product/programs/` → loop **automatic**.

## Chairman

Go, Continue, Release OK, staging/main only.

## LiNKtrend

Product rules: `.cursor/rules/`. Legacy issues: `product/programs/linktrend-system/issues/legacy/`.
