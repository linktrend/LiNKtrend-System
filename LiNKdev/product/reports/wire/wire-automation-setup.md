# Wire automation setup log

Repo: **linktrend/LiNKtrend-System** · Branch: **main** (promoted 2026-06-01, `90d697d`) · **Factory dispatch:** v2 (GitHub Actions)

Canonical: `LiNKdev/factory/docs/DISPATCH.md`. Workflow: `.github/workflows/linkdev-dispatch.yml`.

**Dispatch v2 replaces** Cursor Automations UI for orchestrator, reviewer, integrator, and executor-cursor (2026-06-01, template **v1.2.0**). Legacy UI automations from 2026-05-31 may still exist in Cursor; GitHub Actions is the authoritative trigger path.

| Factory role | Provider | Created (workflow) | Trigger verified | Trigger |
|--------------|----------|-------------------|------------------|---------|
| orchestrator | GitHub Actions | Y | **Y** (workflow_dispatch `role=orchestrator`, [run](https://github.com/linktrend/LiNKtrend-System/actions/runs/26728188505)) | PR **closed** merged to `development`; manual dispatch on `main` |
| reviewer | GitHub Actions | Y | pending | Issue label `linkdev:review-ready` |
| integrator | GitHub Actions | Y | pending | Issue label `linkdev:merge-ready` |
| executor-cursor | GitHub Actions | Y | pending | Issue labels `linkdev:ready` **and** `runtime:cursor` |
| executor-codex | — | N | N | Not wired (Codex Computer Use blocked) |

**Secret:** `CURSOR_API_KEY` in GitHub Actions — **configured** (verified via `gh secret list`, 2026-06-01).

Step C proof (2026-06-01): orchestrator verified via workflow_dispatch on `main` — https://github.com/linktrend/LiNKtrend-System/actions/runs/26728188505
