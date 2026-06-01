# Orchestrator bootstrap — 2026-06-01

## Completed by cloud agent

| Step | Status | Evidence |
|------|--------|----------|
| CI `state-and-verify` fix | **PASS** | shellcheck fixes on `run-gates.sh` (commits `2549833`, `ef1058c`) |
| GitHub issues LTS-001…900 | **Created** | `github-issues.json` — issues **#16–#46** |
| PR #14 marked ready | **Done** | no longer draft |
| Merge to `development` | **Blocked** | see below |
| `linkdev:ready` labels | **Blocked** | token cannot add labels |
| Workflow dispatch | **Blocked** | token cannot `workflow_dispatch` |

## Wave 1 GitHub mapping

Per `PROGRAM.md` **W1** (parallel cap **10**):

| LTS | GitHub | Title |
|-----|--------|-------|
| LTS-001 | [#20](https://github.com/linktrend/LiNKtrend-System/issues/20) | Supabase kernel schemas RLS and Project Run spine |
| LTS-010 | [#44](https://github.com/linktrend/LiNKtrend-System/issues/44) | Capability catalog and lease lifecycle |
| LTS-020 | [#30](https://github.com/linktrend/LiNKtrend-System/issues/30) | Audit envelope and run stage lease workflow events |

Principal handoff also listed LTS-030/040/050/060 — those are **W2/W5** in `PROGRAM.md` (dependency-gated); Orchestrator should not mark them ready until deps complete.

## Merge blocker (auth)

Cloud agent token (`cursor` integration) **cannot**:

- Change PR #14 base (`main` → `development`) — `updatePullRequest` 403
- Create a new PR to `development` — 403
- Push to protected `development` — requires PR + passing checks
- Add labels (`linkdev:ready`, `runtime:cursor`) — 403
- Run `gh workflow run "LiNKdev dispatch"` — 403

`development` branch protection requires PR merge with **2/2 checks green**. PR #14 still targets **`main`**, so `branch-source-policy` fails (`Only staging may be merged into main`).

## One-time Principal actions (unblocks automation)

1. **Retarget PR #14** base branch to **`development`** (GitHub UI: Edit → base branch).
2. **Merge PR #14** when checks are green (`state-and-verify` ✅, `build-test`, `branch-source-policy` ✅ after retarget).
3. **Install LiNKdev labels** (repo admin): run `LiNKdev/factory/scripts/install-labels.sh` locally or grant the Cursor GitHub App **`issues: write`**, **`actions: write`**, **`pull_requests: write`** on `linktrend/LiNKtrend-System`.
4. **Dispatch Orchestrator** (after merge to `development`):

```bash
gh workflow run "LiNKdev dispatch" --ref development -f role=orchestrator
```

Orchestrator cloud agent will apply `linkdev:ready` + `runtime:cursor` on W1 issues (#20, #44, #30) and update `STATE.md`.

## Branch / merge SHA (pending)

- Feature branch tip: `ef1058c` on `dev/blackcursor/planner-qa-d2-dc0f`
- **`development` merge SHA:** pending PR #14 merge after base retarget
