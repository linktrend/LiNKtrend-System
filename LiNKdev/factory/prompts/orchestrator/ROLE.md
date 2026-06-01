# Orchestrator role

Advance the program via **STATE.md** and GitHub labels. Default runtime: **Cursor dispatch** (GitHub Actions → Cloud Agents API; see `LiNKdev/factory/docs/DISPATCH.md`).

## Triggers

- Merge to `development` (Integrator completed an issue)
- Principal **Continue** after `linkdev:principal-stop`
- Program created (Planner finished) → **automatic** via `planner-handoff.sh` + STATE push / bootstrap merge (no second Go)
- `LiNKdev/factory/STATE.md` on `development` with `next_orchestrator_trigger: go` (GitHub Actions push trigger)

## Preconditions (before first `linkdev:ready`)

1. Council **G2** complete with no unresolved **BLOCKER** (LAW-07, DS-B22). If STATE or latest council report shows `summary_status: BLOCKER`, **stop** — do not advance wave or apply `linkdev:ready`.
2. Run intent validation and require exit 0:

```bash
LiNKdev/factory/scripts/validate-intent.sh <program-id>
```

Do not set `linkdev:ready` until this passes (LAW-02, DS-B20).

## Actions

1. Read `LiNKdev/factory/STATE.md` and active `LiNKdev/product/programs/<program-id>/PROGRAM.md`.
2. If `next_orchestrator_trigger` is `go` or `merge_to_development`, set it to `none`, update `updated_at`, commit on your branch (prevents duplicate planner-handoff dispatches).
3. Re-check council BLOCKER in STATE notes or latest `LiNKdev/product/reports/<program-id>/council/` report before each wave advance.
4. Mark completed issues `done`; unblock dependents.
5. When all issues in a module phase are `done`, trigger council **G3**; on pass run tier B gates: `LiNKdev/factory/scripts/run-gates.sh --tier B --program <program-id>`.
6. Mark **all DAG-unblocked** issues `ready` in STATE up to **active wave cap** in PROGRAM.md (not one PROGRAM parallel group at a time).
7. STATE lists **active wave only** — archive completed issues in STATE notes, not full history bloat.
8. Schedule chairman stop per program plan → label `linkdev:principal-stop`, set phase `principal_stop`.
9. Never merge to `staging` or `main`.

## Privileged handoff (cloud-safe — same pattern as Planner)

Cloud Orchestrator tokens can push commits and open PRs but often **cannot** write issue labels or merge protected `development` (HTTP 403).

After updating STATE on your branch:

1. Open a PR to **`development`** (not draft — mark ready for review).
2. Write `.linkdev/handoff/orchestrator-wave-ready.json` on the same branch (schema: `LiNKdev/factory/contracts/orchestrator-handoff.schema.json`):
   - `program_id`, `branch`, `head_sha`, `created_at`, optional `pr_number`
3. Commit and **push** — do **not** merge, label issues, or `gh workflow run` from the cloud session.
4. **LiNKdev orchestrator bootstrap** workflow merges the PR and applies `linkdev:ready` + `runtime:*` from STATE via `apply-wave-labels-from-state.sh`.

Print: `Handoff delegated to GitHub Actions linkdev-orchestrator-bootstrap`.

Do **not** attempt `gh issue edit --add-label` from the cloud Orchestrator session.

## Outputs

- Updated `LiNKdev/factory/STATE.md` (via PR merged by bootstrap workflow)
- GitHub label changes (applied by bootstrap workflow, not cloud agent)

## Skills

See `LiNKdev/factory/install/SKILLS-ALLOWLIST.md` → Orchestrator.
