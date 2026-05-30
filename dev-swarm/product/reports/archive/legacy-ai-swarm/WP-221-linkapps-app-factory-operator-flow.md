# WP-221 — LiNKapps App Factory Operator Flow Report

## Status
Blocked before implementation due to checkout topology mismatch with packet-required paths.

## Worktree / Branch
- Worktree: `/Users/linktrend/Projects/LiNKtrend-System/.worktrees/WP-221-linkapps-app-factory-operator-flow`
- Branch: `wp-221-linkapps-app-factory-operator-flow`
- Parent commit: `4f3f7ba` (WP-208: Add agent report for LiNKapps App Factory MVO Completion)

## Required Context Read
Read/checked before attempting edits:
- `.cursor/rules/00-linktrend-master-rule.mdc`
- `.cursor/rules/01-ecosystem-boundaries.mdc`
- `.cursor/rules/03-agent-swarm-coordination.mdc`
- `.cursor/rules/05-security-cost-and-side-effects.mdc`
- `docs/architecture/repo-architecture-target.md`
- `docs/architecture/system-completion-targets.md`
- `dev-swarm/product/grounding/CONTRACTS_MVO.md`
- `dev-swarm/product/grounding/REPO_INVENTORY.md`
- `dev-swarm/product/grounding/LINKAPPS_CAPABILITY_REQUIREMENTS.md`
- `dev-swarm/programs/linktrend-system/issues/legacy/WP-221-linkapps-app-factory-operator-flow.md`
- `dev-swarm/programs/linktrend-system/prompts/legacy/WP-221-linkapps-app-factory-operator-flow.prompt.md`
- Carry-forward report:
  - `/Users/linktrend/Projects/LiNKtrend-System/.worktrees/WP-216-linkaios-cockpit-proof-surface/dev-swarm/product/reports/archive/legacy-ai-swarm/WP-216-linkaios-cockpit-proof-surface.md`
- Module context:
  - `/Users/linktrend/Projects/LiNKtrend-System/modules/linkapps/README.md`
  - `/Users/linktrend/Projects/LiNKtrend-System/modules/linkapps/manifest.yaml`

## Topology Verification (WP-219/WP-222 Integration Baseline Blocker)
WP-221 step 1 requires verifying the packet worktree has the current `LiNKaios/linkaios-web` topology before editing.

Per work packet: "if it still has legacy `apps/linkaios-web` only, stop and report that WP-219/WP-222 integration baseline must run first."

### Observed in WP-221 worktree:
- `apps/linkaios-web/` exists with legacy package.json
- `LiNKaios/linkaios-web/` does NOT exist
- `LiNKaios/` directory does NOT exist at all
- `modules/` directory does NOT exist
- `LiNKautowork/`, `LiNKskills/` exist but are minimal

### Observed in main repo (different state):
- `LiNKaios/linkaios-web/` exists with full Next.js application
- `apps/linkaios-web/` does NOT exist (already migrated)
- `modules/linkapps/` exists with manifest.yaml

This means the WP-221 worktree was created from commit `4f3f7ba` which predates the LiNKaios-rooted topology migration that happened in WP-219/WP-222.

## Commands Run

1. `git worktree add .worktrees/WP-221-linkapps-app-factory-operator-flow -b wp-221-linkapps-app-factory-operator-flow`
   - Result: Created worktree from commit 4f3f7ba

2. `git status --short --branch` (in worktree)
   - Result: Clean, on branch wp-221-linkapps-app-factory-operator-flow

3. `ls -la LiNKaios/linkaios-web`
   - Result: No such file or directory

4. `ls -la apps/linkaios-web`
   - Result: Exists (legacy topology)

## Files Changed
- `dev-swarm/product/reports/archive/legacy-ai-swarm/WP-221-linkapps-app-factory-operator-flow.md` (this report)

No application/runtime code was edited because:
1. The required implementation location `LiNKaios/linkaios-web` is absent in this worktree
2. The required module path `modules/linkapps/` is absent in this worktree
3. Executing against legacy `apps/linkaios-web` would violate packet scope/allowed files
4. The acceptance criteria require the current topology, not the legacy one

## Root-Cause Blocker
The WP-221 worktree branch point (commit 4f3f7ba) predates the repo architecture cleanup that established:
- `LiNKaios/linkaios-web` as the canonical LiNKaios web entrypoint
- `modules/` as the module home (vs legacy `plugins/vertical/`)
- Full topology migration from WP-219/WP-222 integration baseline

The packet's allowed files explicitly state:
- `modules/linkapps/` — does not exist in this worktree
- `LiNKaios/linkaios-web/src/**` — does not exist in this worktree

## Risks
Attempting to implement WP-221 on this snapshot would either:
1. Violate packet allowed-file boundaries by editing legacy `apps/`
2. Create incompatible code against legacy paths that do not match target acceptance criteria
3. Create merge conflicts with the already-completed topology migration in main

## Next Step
The WP-219/WP-222 integration baseline packets must be completed first to establish the LiNKaios-rooted topology in the development branch. After those packets land and the topology is available:

1. Recreate WP-221 worktree from a commit that includes the LiNKaios-rooted topology
2. Verify `LiNKaios/linkaios-web/src/` exists
3. Verify `modules/linkapps/` exists
4. Re-run WP-221 packet exactly

Alternatively, merge the topology migration into the wp-221 branch first, then proceed with implementation.

## Secrets / Side-Effects Check
- No `.env` edits
- No secret changes
- No live outreach/publishing/provisioning or external side effects
- No real provider calls (GitHub/Stripe/Supabase/Vercel/EAS)
