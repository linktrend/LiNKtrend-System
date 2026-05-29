# WP-108 Agent Prompt - LiNKapps Capability Requirements

Recommended model/tool: Cursor Composer or Gemini 3 Flash. Use Kimi only if repository/source script tracing is needed. Do not use Codex or Antigravity.

Execute `.ai-swarm/WORK_PACKETS/WP-108-linkapps-capability-requirements.md`.

## Clean Worktree Requirement

Use a separate clean worktree/checkout for this packet. Do not run this packet in a shared dirty repo folder.

```bash
cd /Users/linktrend/Projects/LiNKtrend-System
git fetch origin --prune
git worktree add ../LiNKtrend-System-WP-108 -b dev/cursor/WP-108-linkapps-capability-requirements origin/development
cd ../LiNKtrend-System-WP-108
git status --short --branch
```

If unrelated dirty files exist, stop before editing and report the blocker.

## Required Reading

- `.ai-swarm/LINKAPPS_VERTICAL_PLUGIN_CONVERSION_PLAN.md` §5
- `.ai-swarm/PLUGIN_ARCHITECTURE_V2.md`
- `.ai-swarm/CONTRACTS_MVO.md` §0.A.5 and §0.A.5.1
- `.ai-swarm/WORK_PACKETS/WP-108-linkapps-capability-requirements.md`
- `/Users/linktrend/Projects/LiNKapps/scripts/create-app-repo.sh` if present
- `/Users/linktrend/Projects/LiNKapps/scripts/release-readiness.sh` if present
- `plugins/vertical/linkapps/manifest.yaml`

## Mission

Define precise capability lease requirements for LiNKapps operations. This is a spec packet only; do not implement capability plugins.

## Scope

Allowed:

- Create `.ai-swarm/LINKAPPS_CAPABILITY_REQUIREMENTS.md`.
- Update `.ai-swarm/AGENT_REPORTS/linkskills-agent.md`.

Hard boundaries:

- No LinkSkills service code changes.
- No capability implementation.
- No LiNKapps code movement or edits.
- No production side effects.

## Required Content

- Capability matrix: operation × mode × lease.
- Per-capability contract tables for:
  - `cap.github.repo_management`
  - `cap.supabase.provisioning`
  - `cap.stripe.product_management`
  - `cap.vercel.deployment`
  - `cap.eas.build`
  - `cap.plane.execution_tracking`
  - `cap.zulip.run_messaging`
- Idempotency key patterns for each operation.
- Failure mapping to canonical error codes.
- Kill switch requirements.
- Explicit `not_configured` list per capability.
- Development mode must stay mock/local/shadow-safe; live writes must be called out as future only.

## Proof Required

- Document follows `CONTRACTS_MVO.md` §0.A.5.1 table format.
- All operations have idempotency rules.
- All capabilities have explicit `not_configured` lists.
- Report changed files, proof, blockers, branch, and commit SHA.

## Finish

Commit message: `docs: define LiNKapps capability requirements`
Push branch to GitHub.
