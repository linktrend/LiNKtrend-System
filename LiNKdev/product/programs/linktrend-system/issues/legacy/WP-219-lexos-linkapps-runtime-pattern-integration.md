# WP-219 — LEXOS And LiNKapps Runtime Pattern Integration

## Objective
Apply the proven LinkSites runtime pattern to LEXOS Litigation and LiNKapps at the integration level, ensuring both modules have runnable route/workflow skeletons and cross-plane proof hooks.

## Repo / Worktree
- Repo: `/Users/linktrend/Projects/LiNKtrend-System`
- Worktree: `.worktrees/WP-219-lexos-linkapps-runtime-pattern-integration`
- Branch: `wp-219-lexos-linkapps-runtime-pattern-integration`

Use a separate clean worktree/checkout for this packet. Do not run this packet in a shared dirty repo folder.

1. Verify the starting checkout is clean with `git status --short --branch`.
2. If unrelated dirty files exist, stop before editing and report the blocker.
3. Create or use a packet-specific branch/worktree before making changes.

## Allowed Files
- `modules/lexos/litigation/`
- `modules/linkapps/`
- Thin LiNKaios route/start/status integration
- Cross-plane contracts in `packages/linklogic-sdk/`
- Reports

## Prohibited Files
- External LEXOS or LiNKapps repo edits
- Live legal/customer data
- Real service provisioning or billing

## Required Context
- LinkSites runtime implementation from Waves 2-3
- `modules/lexos/litigation/workflow.*`
- `modules/linkapps/workflow.*`
- `LiNKdev/product/grounding/CONTRACTS_MVO.md`
- `docs/architecture/system-completion-targets.md`
- `.worktrees/WP-216-linkaios-cockpit-proof-surface/LiNKdev/product/reports/archive/legacy-ai-swarm/WP-216-linkaios-cockpit-proof-surface.md` if present
- `LiNKdev/product/reports/archive/legacy-ai-swarm/WP-217-autowork-status-idempotency-visibility.md` if present
- `.worktrees/WP-218-linksites-proof-runbook-and-local-preview/LiNKdev/product/reports/archive/legacy-ai-swarm/WP-218-linksites-proof-runbook-and-local-preview.md` if present
- `.worktrees/WP-215-linksites-linkbrain-trace-proof/LiNKdev/product/reports/archive/legacy-ai-swarm/WP-215-linksites-linkbrain-trace-proof.md` if present

## Steps
1. First fix the repo topology baseline in this packet worktree if still present: `@linktrend/linkaios-web` must resolve to `LiNKaios/linkaios-web`, not legacy `apps/linkaios-web`; `docs/architecture/*target*.md`, active WP-219 artifacts, and module paths must exist before runtime replication starts.
2. Port/consume required successful carry-forward artifacts if they are only present in worktrees: WP-215 LinkSites trace SDK files and WP-218 preview/runbook files.
3. Identify the reusable LinkSites runtime pattern from the current canonical LiNKaios/module layout.
4. Apply it to LEXOS and LiNKapps as runnable MVO skeletons, not just declarations.
5. Ensure start/status endpoints or pages exist for both modules.
6. Wire placeholder/stubbed cross-plane refs for roles, workflows, leases, events, Plane tasks, and LiNKautowork status.
7. Leave real external repo execution for specialized module packets.

## Acceptance Criteria
- LEXOS and LiNKapps can be started or simulated from LiNKaios through their module workflow maps.
- Their runs produce traceable cross-plane refs.
- No unapproved live side effects occur.

## Proof Required
- `pnpm --filter @linktrend/linkaios-web typecheck`
- `NEXT_PUBLIC_SUPABASE_URL=https://example.supabase.co NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=pk_test_public pnpm --filter @linktrend/linkaios-web build`
- Focused route/runtime tests for LEXOS and LiNKapps skeletons
- Proof payloads or screenshots where possible

## Report File
Update `LiNKdev/product/reports/archive/legacy-ai-swarm/WP-219-lexos-linkapps-runtime-pattern-integration.md`.
