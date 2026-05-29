# WP-216 — LiNKaios Cockpit Proof Surface

## Objective
Make LiNKaios display the full LinkSites runtime proof: run status, stages, leases, LiNKbot sessions, LiNKautowork refs, LiNKbrain audit/memory, CRM/Plane stubs, and preview URL.

## Repo / Worktree
- Repo: `/Users/linktrend/Projects/LiNKtrend-System`
- Worktree: `.worktrees/WP-216-linkaios-cockpit-proof-surface`
- Branch: `wp-216-linkaios-cockpit-proof-surface`

Use a separate clean worktree/checkout for this packet. Do not run this packet in a shared dirty repo folder.

1. Verify the starting checkout is clean with `git status --short --branch`.
2. If unrelated dirty files exist, stop before editing and report the blocker.
3. Create or use a packet-specific branch/worktree before making changes.

## Allowed Files
- `LiNKaios/linkaios-web/`
- Module display helpers under `modules/linksites/`
- Related tests and report

## Prohibited Files
- Peer-plane ownership logic except read/display adapters
- External repos
- Real side effects

## Required Context
- `modules/linksites/workflow.*`
- `dev-swarm/command-center/CONTRACTS_MVO.md`
- `docs/architecture/system-completion-targets.md`
- WP-212 through WP-215 reports if present
- `.worktrees/WP-212-linksites-runtime-spine/dev-swarm/reports/legacy-ai-swarm/WP-212-linksites-runtime-spine.md` if present
- `dev-swarm/reports/legacy-ai-swarm/WP-213-linksites-linkskills-enforcement.md` if present
- `dev-swarm/reports/legacy-ai-swarm/WP-214-linksites-linkbot-role-execution.md` if present
- `dev-swarm/reports/legacy-ai-swarm/WP-215-linksites-linkbrain-trace-proof.md` if present
- `.worktrees/WP-215-linksites-linkbrain-trace-proof/dev-swarm/reports/legacy-ai-swarm/WP-215-linksites-linkbrain-trace-proof.md` if present

## Steps
1. First fix the integration topology blocker reported by WP-212 if still present: ensure the checkout/workspace graph resolves `@linktrend/linkaios-web` to `LiNKaios/linkaios-web`, not legacy `apps/linkaios-web`, and ensure internal workspace dependencies build/resolve.
2. Consume successful Wave 2 artifacts where available: WP-213 LinkSites lease status, WP-214 LinkSites LiNKbot role/session refs, and WP-215 LinkSites trace assembly helpers. If WP-215 changes are only present in its worktree, copy or port the required SDK files into this packet before using them.
3. Add or complete a LinkSites run detail/proof page in LiNKaios.
4. Display stage timeline, status, preview URL, leases, workflow refs, bot sessions, and audit/memory refs.
5. Add blocked/failure states that tell the operator what failed and where.
6. Add focused tests for data mapping and UI-safe server helpers.
7. Verify production build.

## Acceptance Criteria
- Operator can inspect the LinkSites run end to end from LiNKaios.
- No raw DB/table reading is required to understand the MVO proof.
- Build/typecheck pass.

## Proof Required
- `pnpm --filter @linktrend/linkaios-web typecheck`
- `NEXT_PUBLIC_SUPABASE_URL=https://example.supabase.co NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=pk_test_public pnpm --filter @linktrend/linkaios-web build`
- Focused LiNKaios tests for proof data helpers

## Report File
Update `dev-swarm/reports/legacy-ai-swarm/WP-216-linkaios-cockpit-proof-surface.md`.
