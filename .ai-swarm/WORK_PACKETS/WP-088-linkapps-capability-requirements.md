# WP-088 - LiNKapps Capability Requirements Spec

## Objective

Define precise capability lease requirements for all LiNKapps operations, per capability plugin contract pack v1.

## Repo / branch

- Repo: `/Users/linktrend/Projects/LiNKtrend-System`
- Branch: `dev/cursor/WP-088-linkapps-capability-requirements`
- Base: `development`

## Allowed files

- `.ai-swarm/LINKAPPS_CAPABILITY_REQUIREMENTS.md`
- `.ai-swarm/WORK_PACKETS/WP-088*.md`
- `.ai-swarm/AGENT_REPORTS/linkskills-agent.md`

## Prohibited files

- Implementing capability plugins
- Changes to LinkSkills service
- Moving LiNKapps code

## Required context

- `LINKAPPS_VERTICAL_PLUGIN_CONVERSION_PLAN.md` §5
- `CONTRACTS_MVO.md` §0.A.5, §0.A.5.1 (Capability plugin contract pack)
- `LiNKapps/scripts/create-app-repo.sh` (operations needed)
- `LiNKapps/scripts/release-readiness.sh` (validation needs)

## Acceptance criteria

- [ ] Capability matrix (operation × mode × lease)
- [ ] Per-capability contract tables for:
  - `cap.github.repo_management`
  - `cap.supabase.provisioning`
  - `cap.stripe.product_management`
  - `cap.vercel.deployment`
  - `cap.eas.build`
  - `cap.plane.execution_tracking`
  - `cap.zulip.run_messaging`
- [ ] Idempotency key patterns for each operation
- [ ] Failure mapping to canonical error codes (§5.4)
- [ ] Kill switch requirements
- [ ] `not_configured` list per capability

## Proof required

- Document follows `CONTRACTS_MVO.md` §0.A.5.1 table format
- All operations have idempotency rules
- All capabilities have explicit `not_configured` lists
