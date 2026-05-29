# Dev Swarm

Portable AI software factory for building products inside any Git repository.

**Dev Swarm is not your product.** It is the meta-system that runs Programs → Modules → Phases → Issues with agents, GitHub as the coordination bus, and minimal Chairman involvement.

## Copy to another repo

1. Copy the entire `dev-swarm/` folder to the new repository root.
2. Open an agent and say: **Wire Dev Swarm** (or run `install/WIRE-PROMPT.md`).
3. Follow `install/CHECKLIST.md` step by step until complete.
4. Create `programs/<your-product>/PROGRAM.md` and run Planner → **Go**.

## LiNKtrend-System

This repo hosts Dev Swarm to finish LiNKtrend development. Product code lives outside `dev-swarm/` (LiNKaios, modules, etc.). Legacy `.ai-swarm/` is archived at `Archive/.ai-swarm-legacy/`. Active packets live under `programs/linktrend-system/issues/legacy/`. See `programs/linktrend-system/MIGRATION.md`.

**Skills:** canonical tree is `dev-swarm/skills/` (`gstack/` + `linktrend/`). See `skills/MERGE-LOG.md`.

## Bootstrap vs runtime

| Mode | When | How work starts |
|------|------|-----------------|
| **Bootstrap** | Building Dev Swarm itself | Chairman pastes one-line launchers from `programs/bootstrap/prompts/` |
| **Runtime** | After wire + Go on a program | Cursor and Codex automations react to GitHub labels and `STATE.md` |

## Key files

| File | Purpose |
|------|---------|
| [SPEC.md](SPEC.md) | Frozen factory contract |
| [BORROW-PACK.md](BORROW-PACK.md) | Optional quality gates (DS-B1…B13) |
| [STATE.md](STATE.md) | Live orchestration state |
| [contracts/labels.md](contracts/labels.md) | GitHub label vocabulary |
| [install/CHECKLIST.md](install/CHECKLIST.md) | One-time setup steps |
| [install/WIRE-PROMPT.md](install/WIRE-PROMPT.md) | Agent-led install session |

## Chairman

- **Go** — start program loop after Planner completes.
- **Continue** — resume at scheduled stops only.
- **`staging` / `main`** — promotion by Chairman only.
- Integrator merges completed issues to `development`.
