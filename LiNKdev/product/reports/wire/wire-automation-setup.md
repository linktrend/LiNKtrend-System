# Wire automation setup log

Repo: **linktrend/LiNKtrend-System** · Branch: **development** · **Factory dispatch:** v2 (GitHub Actions)

Canonical: `LiNKdev/factory/docs/DISPATCH.md`. Workflow: `.github/workflows/linkdev-dispatch.yml`.

**Dispatch v2 replaces** Cursor Automations UI for orchestrator, reviewer, integrator, and executor-cursor (2026-06-01, template **v1.2.0**). Legacy UI automations from 2026-05-31 may still exist in Cursor; GitHub Actions is the authoritative trigger path.

| Factory role | Provider | Created (workflow) | Trigger verified | Trigger |
|--------------|----------|-------------------|------------------|---------|
| orchestrator | GitHub Actions | Y | pending | PR **closed** merged to `development` |
| reviewer | GitHub Actions | Y | pending | Issue label `linkdev:review-ready` |
| integrator | GitHub Actions | Y | pending | Issue label `linkdev:merge-ready` |
| executor-cursor | GitHub Actions | Y | pending | Issue labels `linkdev:ready` **and** `runtime:cursor` |
| executor-codex | — | N | N | Not wired (Codex Computer Use blocked) |

**Secret:** `CURSOR_API_KEY` in GitHub Actions — **configured** (verified via `gh secret list`, 2026-06-01).

_Update **Trigger verified** after a successful Actions run (Step C proof)._
