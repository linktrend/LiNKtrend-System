# WP-219-lexos-linkapps-runtime-pattern-integration Prompt

Model: Codex

Execute `dev-swarm/programs/linktrend-system/issues/legacy/WP-219-lexos-linkapps-runtime-pattern-integration.md` exactly. This is a cross-module runtime pattern integration packet.

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

Wave 3 carry-forward:

- Read `.worktrees/WP-216-linkaios-cockpit-proof-surface/dev-swarm/reports/legacy-ai-swarm/WP-216-linkaios-cockpit-proof-surface.md` if present. WP-216 blocked before implementation because the worktree had legacy `apps/linkaios-web` topology and no `LiNKaios/linkaios-web`; fix this baseline first if still present.
- Read `dev-swarm/reports/legacy-ai-swarm/WP-217-autowork-status-idempotency-visibility.md` if present. WP-217 completed LiNKautowork workflow status/idempotency proof and should be consumed for status refs.
- Read `.worktrees/WP-218-linksites-proof-runbook-and-local-preview/dev-swarm/reports/legacy-ai-swarm/WP-218-linksites-proof-runbook-and-local-preview.md` if present. WP-218 produced useful preview/runbook work but may be uncommitted in its worktree.
- Read `.worktrees/WP-215-linksites-linkbrain-trace-proof/dev-swarm/reports/legacy-ai-swarm/WP-215-linksites-linkbrain-trace-proof.md` if present. WP-215 trace SDK files may also be worktree-only.

Important execution rules:

- Fix blockers that are inside the packet scope. Do not only document fixable blockers.
- Keep all work inside this repo unless the work packet explicitly says otherwise.
- Do not edit real secrets or commit `.env`.
- Do not perform live outreach, live publishing, billing, provider provisioning, or production side effects.
- Preserve service ownership boundaries: LiNKaios cockpit/orchestration, LiNKbrain memory/audit, LinkSkills leases/connectors, LiNKautowork deterministic workflow gateway, LiNKbot role runtime, modules workflow maps.
- Update the required `dev-swarm/reports/legacy-ai-swarm/WP-219-lexos-linkapps-runtime-pattern-integration.md` before stopping.
- Include files changed, commands run, proof produced, blockers, and next step in the report.

Stop only after acceptance criteria and proof commands have been attempted. If proof fails, fix it when the root cause is in scope; otherwise document the exact file-level/root-cause blocker and the command output summary.
