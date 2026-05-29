# WP-216-linkaios-cockpit-proof-surface Prompt

Model: Codex

Execute `dev-swarm/programs/linktrend-system/issues/legacy/WP-216-linkaios-cockpit-proof-surface.md` exactly. This is a LiNKaios cockpit proof surface packet.

Use a separate clean worktree/checkout for this packet. Do not run this packet in a shared dirty repo folder.

1. Verify the starting checkout is clean with `git status --short --branch`.
2. If unrelated dirty files exist, stop before editing and report the blocker.
3. Create or use a packet-specific branch/worktree before making changes.

Before editing, read these context files:

- `.cursor/rules/00-linktrend-master-rule.mdc`
- `.cursor/rules/01-ecosystem-boundaries.mdc`
- `.cursor/rules/03-agent-swarm-coordination.mdc`
- `.cursor/rules/05-security-cost-and-side-effects.mdc`
- `docs/architecture/repo-architecture-target.md`
- `docs/architecture/system-completion-targets.md`
- `dev-swarm/command-center/CONTRACTS_MVO.md`
- `dev-swarm/command-center/REPO_INVENTORY.md`
- the assigned work packet

Wave 2 carry-forward:

- Read `.worktrees/WP-212-linksites-runtime-spine/dev-swarm/reports/legacy-ai-swarm/WP-212-linksites-runtime-spine.md` if present. WP-212 reported a workspace topology blocker where `@linktrend/linkaios-web` resolved to legacy `apps/linkaios-web` instead of `LiNKaios/linkaios-web`; fix this if still present before cockpit work.
- Read `dev-swarm/reports/legacy-ai-swarm/WP-213-linksites-linkskills-enforcement.md` if present. WP-213 completed LinkSites lease enforcement and should be consumed for lease/status display.
- Read `dev-swarm/reports/legacy-ai-swarm/WP-214-linksites-linkbot-role-execution.md` if present. WP-214 completed LinkSites role/session refs and should be consumed for bot/session display.
- Read `dev-swarm/reports/legacy-ai-swarm/WP-215-linksites-linkbrain-trace-proof.md` and `.worktrees/WP-215-linksites-linkbrain-trace-proof/dev-swarm/reports/legacy-ai-swarm/WP-215-linksites-linkbrain-trace-proof.md` if present. WP-215 proof passed but may be uncommitted in its worktree; copy or port required trace SDK files if needed.

Important execution rules:

- Fix blockers that are inside the packet scope. Do not only document fixable blockers.
- Keep all work inside this repo unless the work packet explicitly says otherwise.
- Do not edit real secrets or commit `.env`.
- Do not perform live outreach, live publishing, billing, provider provisioning, or production side effects.
- Preserve service ownership boundaries: LiNKaios cockpit/orchestration, LiNKbrain memory/audit, LinkSkills leases/connectors, LiNKautowork deterministic workflow gateway, LiNKbot role runtime, modules workflow maps.
- Update the required `dev-swarm/reports/legacy-ai-swarm/WP-216-linkaios-cockpit-proof-surface.md` before stopping.
- Include files changed, commands run, proof produced, blockers, and next step in the report.

Stop only after acceptance criteria and proof commands have been attempted. If proof fails, fix it when the root cause is in scope; otherwise document the exact file-level/root-cause blocker and the command output summary.
