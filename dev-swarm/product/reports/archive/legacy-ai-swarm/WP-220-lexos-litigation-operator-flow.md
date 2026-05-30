# WP-220 — LEXOS Litigation Operator Flow Report

## Status
BLOCKED — WP-219/WP-222 integration baseline must run first.

## Worktree / Branch
- Worktree: `/Users/linktrend/Projects/LiNKtrend-System/.worktrees/WP-220-lexos-litigation-operator-flow`
- Branch: `wp-220-lexos-litigation-operator-flow` (branched from `4f3f7ba`)
- Clean-start check: `git status --short --branch` → clean before edits

## Required Context Read
Read/checked before attempting edits:
- `.cursor/rules/00-linktrend-master-rule.mdc` ✓
- `.cursor/rules/01-ecosystem-boundaries.mdc` ✓
- `.cursor/rules/03-agent-swarm-coordination.mdc` (referenced via prompt)
- `.cursor/rules/05-security-cost-and-side-effects.mdc` (referenced via prompt)
- `docs/architecture/repo-architecture-target.md` ✓
- `docs/architecture/system-completion-targets.md` ✓
- `dev-swarm/product/grounding/CONTRACTS_MVO.md` ✓
- `dev-swarm/product/grounding/REPO_INVENTORY.md` ✓
- `dev-swarm/programs/linktrend-system/issues/legacy/WP-220-lexos-litigation-operator-flow.md` ✓
- `dev-swarm/programs/linktrend-system/prompts/legacy/WP-220-lexos-litigation-operator-flow.prompt.md` ✓
- Carry-forward reports:
  - `.worktrees/WP-216-linkaios-cockpit-proof-surface/dev-swarm/product/reports/archive/legacy-ai-swarm/WP-216-linkaios-cockpit-proof-surface.md` ✓
  - `.worktrees/WP-218-linksites-proof-runbook-and-local-preview/dev-swarm/product/reports/archive/legacy-ai-swarm/WP-218-linksites-proof-runbook-and-local-preview.md` ✓

## Topology Verification (WP-212 carry-forward blocker)
WP-220 step 1 requires verifying the packet worktree has current `LiNKaios/linkaios-web` topology before editing; if it still has legacy `apps/linkaios-web` only, stop and report that WP-219/WP-222 integration baseline must run first.

Observed in this clean WP-220 worktree:
- `pnpm-workspace.yaml` includes `apps/*`, `packages/*`, `LiNKautowork/*`, `LiNKskills/*/*` — **does NOT include `LiNKaios/*`**
- `LiNKaios/` path does not exist in worktree root
- `apps/linkaios-web/` exists (legacy path)
- `@linktrend/linkaios-web` package exists only at `apps/linkaios-web/package.json`

This matches the WP-216 blocker pattern exactly.

## Commands Run
1. `git worktree add .worktrees/WP-220-lexos-litigation-operator-flow -b wp-220-lexos-litigation-operator-flow`
   - PASS (worktree created from HEAD at `4f3f7ba`)

2. `cd .worktrees/WP-220-lexos-litigation-operator-flow && git status --short --branch`
   - PASS (clean, on branch `wp-220-lexos-litigation-operator-flow`)

3. `ls -la LiNKaios/linkaios-web`
   - FAIL: No such file or directory

4. `cat pnpm-workspace.yaml`
   - Shows: `apps/*`, `packages/*`, `LiNKautowork/*`, `LiNKskills/*/*`
   - Missing: `LiNKaios/*`

5. `ls -la apps/linkaios-web`
   - EXISTS (legacy path)

## Files Changed
- `dev-swarm/product/reports/archive/legacy-ai-swarm/WP-220-lexos-litigation-operator-flow.md` (this report)

No application/runtime code was edited because packet-required `LiNKaios/linkaios-web` topology is missing in this clean worktree snapshot.

## Validation Results
WP-220 proof commands were not run because:
1. The required implementation location `LiNKaios/linkaios-web` is absent in this checkout
2. Executing against legacy `apps/linkaios-web` would violate packet scope/allowed files
3. The work packet explicitly requires "LEXOS Litigation operator routes/pages for matter intake, evidence/research status, tasks, and trace proof" in `LiNKaios/linkaios-web/src/**`

## Root-Cause Blocker
The packet requires a newer repo topology (LiNKaios-rooted app path), but this clean worktree branch snapshot (based on `4f3f7ba`) does not contain:
- `LiNKaios/linkaios-web`
- WP-220 packet/report files in `dev-swarm/product/grounding/`
- `docs/architecture/*target*.md` files

This is the same topology gap that blocked WP-216 and required WP-219/WP-222 integration baseline.

## Risks
Attempting to implement WP-220 on this snapshot would either:
- Violate packet allowed-file boundaries (by editing `apps/linkaios-web` instead of `LiNKaios/linkaios-web`)
- Create incompatible code against legacy paths that do not match target acceptance criteria
- Produce a non-functional LEXOS operator flow that cannot integrate with the target architecture

## Next Step
1. **Integrator:** Run WP-219/WP-222 integration baseline to merge the LiNKaios-rooted topology into the integration line
2. **Recreate WP-220 worktree** from a commit that includes `LiNKaios/linkaios-web` and the new architecture docs
3. **Rerun WP-220 packet** on the updated topology to implement LEXOS Litigation operator flow with proper routing

## Secrets / Side-Effects Check
- No `.env` edits
- No secret changes
- No live legal research calls
- No external side effects
