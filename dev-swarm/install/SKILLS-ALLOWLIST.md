# Dev Swarm Skills Allowlist

Canonical skills per role. Read `.cursor/skills/SKILLS_CATALOG.md` first; load only bodies listed here.

## Dedupe policy (Skills Curator)

| Keep | Drop / alias |
|------|----------------|
| `.cursor/skills/gstack/<name>/SKILL.md` | Top-level `gstack-<name>` duplicates pointing at same tmpl |
| Project LiNKtrend skills (`data-table`, `action-queue`, etc.) | Generic duplicates when both match |

Agents must not load every gstack variant; use this table.

## Planner

- `plan-writing`
- `architecture`
- `brainstorming` (program definition only)

## Orchestrator

- `plan-writing`
- `parallel-agents`

## Executor (Cursor)

- `clean-code`
- `bash-linux`
- `lint-and-validate`
- `testing-patterns`
- `nextjs-react-expert` (when touching LiNKaios UI)
- `database-design` (when touching schema)
- `gstack/review` (optional pre-PR self-check)

## Executor (Codex)

- Same as Executor (Cursor); read root `AGENTS.md` + `dev-swarm/SPEC.md`

## Reviewer

- `code-review-checklist`
- `gstack/review`
- `systematic-debugging` (when proof fails)

## Integrator

- `architecture`
- `plan-writing`
- `gstack/fix-merge-conflicts` (when needed)

## Installer (wire session)

- `plan-writing`
- `bash-linux`

## Chairman-only (not agent default)

- `gstack/plan-ceo-review` — on request for program scope

## Progressive disclosure

1. Read this file.
2. Read selected `SKILL.md` paths only.
3. Read `.cursor/rules/` for product repos (LiNKtrend); portable rules in root `AGENTS.md`.
