# LiNKdev wire session — LiNKtrend-System

- **Started:** 2026-05-30
- **Repo:** linktrend/LiNKtrend-System
- **Branch:** development (pushed)
- **Template:** LiNKdev v1.0.0 ([github.com/linktrend/LiNKdev](https://github.com/linktrend/LiNKdev))

## Readiness (code)

| Check | Status |
|-------|--------|
| `LiNKdev/` at repo root | Done |
| `.cursor/` portable shim (`00-linkdev-bootstrap.mdc`) | Done |
| Bootstrap factory `STATE.md` phase=complete | Done |
| `verify.sh` | PASS |
| `linkdev-guard.yml` workflow | Present |
| `product/programs/linktrend-system/PROGRAM.md` | Draft (Planner pre-Go) |

**Verdict:** Repo is **ready to wire** (automations + labels). Not ready for **Go** until wire sections 4–5 and test issue (section 9) pass.

## CHECKLIST progress

| Step | Status | Notes |
|------|--------|-------|
| 0 Prerequisites | Principal confirm | GitHub + Cursor Automations + Codex automations accounts |
| 1 Copy pack | Done | In-repo instance; no copy needed |
| 2 GitHub labels | Done (2026-05-30) | `install-labels.sh` fixed (pipe delimiter); re-run after push |
| 3 GitHub Actions guard | Done | Workflow on `development` |
| 4 Cursor automations | **Pending** | Codex computer-use agent — see `PROMPT-CODEX-UI-AUTOMATIONS.md` |
| 5 Codex automations | **Pending** | Same session |
| 6 Skills | Done | `LiNKdev/skills/SKILLS_CATALOG.md` |
| 7 Product program | Draft | Planner after wire |
| 8 Go | Blocked | Principal only after wire |
| 9 Proof of wire | Blocked | Needs test issue + automation fire |

## Commands run

```bash
LiNKdev/factory/scripts/verify.sh
LiNKdev/factory/scripts/install-labels.sh
git push origin development
```

## Next agent launches (Principal)

1. **Cursor (this IDE):** Run command **Wire LiNKdev** — `LiNKdev/factory/install/WIRE-PROMPT.md` — confirm checklist with Principal.
2. **Codex (computer use):** Run **LiNKdev UI automations** — `.cursor/commands/linkdev-ui-automations.md` — follow `CURSOR-CREATE-AUTOMATIONS.md` + `CODEX-CREATE-AUTOMATIONS.md`; log to `wire-automation-setup.md`.

Do **not** say **Go** until sections 4–5 and 9 are checked.
