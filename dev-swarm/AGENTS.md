# Dev Swarm — portable agent brief

Factory coordination for Programs → Issues. Copy this file with `dev-swarm/` to new repos.

## Operating model

Cursor is the architecture and integration IDE. Codex, Antigravity, Gemini/Kimi, and other agents are bounded workers operating through `dev-swarm/` programs and issues.

Repository files, Git history, `dev-swarm/` documents, and committed implementation files are the source of truth. Do not rely on chat memory, IDE memory, or unstated assumptions.

## Read first

1. `dev-swarm/SPEC.md`
2. `dev-swarm/skills/SKILLS_CATALOG.md`
3. `dev-swarm/rules/` (generic dev + swarm rules)
4. Product rules in `.cursor/rules/` when present (LiNKtrend identity, boundaries, MVO, security)
5. `dev-swarm/STATE.md` (runtime)
6. `dev-swarm/command-center/ARCHITECT_REVIEW_REPORT.md` if present
7. `docs/architecture/repo-architecture-target.md`
8. `docs/architecture/system-completion-targets.md`
9. `dev-swarm/command-center/MASTER_PLAN.md`
10. `dev-swarm/command-center/ARCHITECTURE_RULES.md`
11. `dev-swarm/command-center/CONTRACTS_MVO.md`
12. `dev-swarm/command-center/REPO_INVENTORY.md`
13. `dev-swarm/command-center/DECISIONS.md`
14. the active issue under `dev-swarm/programs/<program>/issues/`

Use `dev-swarm/skills/SKILLS_CATALOG.md` for progressive disclosure. Do not bulk-load every skill file.

## Coordination

GitHub labels + `STATE.md` + issue specs + reports. Agents do not share one chat session.

Legacy `.ai-swarm/` and prior cursor rule copies are archived under `dev-swarm/archive/`.

## Skills

Canonical: `dev-swarm/skills/` only. See `dev-swarm/skills/MERGE-LOG.md` for dedupe history.

On conflict with imported generic skills: product rules (`.cursor/rules/`) win for product scope; `dev-swarm/rules/` win for factory workflow.

## Roles

| Surface | Location |
|---------|----------|
| Role prompts | `dev-swarm/prompts/<role>/ROLE.md` |
| Agent definitions | `dev-swarm/agents/` |
| Factory rules | `dev-swarm/rules/` |
| Reports | `dev-swarm/reports/` |
| Command center | `dev-swarm/command-center/` |

## LiNKtrend product posture

The first MVO is the LinkSites / WebsiteFactory lead-to-preview-site flow.

Development is reuse-first: inspect active and archived repos before creating new implementation.

New work must use canonical post-cleanup folders: `LiNKaios/`, `LiNKbrain/`, `LiNKskills/`, `LiNKautowork/`, `LiNKbot/`, `LiNKguard/`, and `modules/`. Do not create new work under legacy `plugins/vertical` or moved `apps/*` runtime paths.

For module work, start in the module folder and maintain one canonical workflow map there. The module workflow map is the readable source of truth; other planes implement referenced parts through their own ownership folders.

## Chairman

- **Go** / **Continue** on schedule
- **`staging` / `main`** promotion by Chairman only

## Wire

`dev-swarm/install/WIRE-PROMPT.md`
