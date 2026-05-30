# WP-222-final-integration-proof-and-percentage-audit Prompt

Model: Codex

Execute `dev-swarm/product/programs/linktrend-system/issues/legacy/WP-222-final-integration-proof-and-percentage-audit.md` exactly. This is a final integration/proof audit packet.

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
- `dev-swarm/product/grounding/CONTRACTS_MVO.md`
- `dev-swarm/product/grounding/REPO_INVENTORY.md`
- the assigned work packet

Wave 3 carry-forward:

- This packet is the integration safety net. It must reconcile committed branches and worktree-only outputs before declaring final percentages.
- Read `.worktrees/WP-216-linkaios-cockpit-proof-surface/dev-swarm/product/reports/archive/legacy-ai-swarm/WP-216-linkaios-cockpit-proof-surface.md` if present. WP-216 blocked because the worktree started from legacy topology without `LiNKaios/linkaios-web`; fix the integration topology first.
- Read `.worktrees/WP-218-linksites-proof-runbook-and-local-preview/dev-swarm/product/reports/archive/legacy-ai-swarm/WP-218-linksites-proof-runbook-and-local-preview.md` if present. WP-218 preview/runbook changes may be uncommitted and must be reconciled if valid.
- Read `.worktrees/WP-215-linksites-linkbrain-trace-proof/dev-swarm/product/reports/archive/legacy-ai-swarm/WP-215-linksites-linkbrain-trace-proof.md` if present. WP-215 trace SDK files may be uncommitted and must be reconciled if valid.
- Include WP-213, WP-214, and WP-217 committed branches/reports in the integration proof.

Important execution rules:

- Fix blockers that are inside the packet scope. Do not only document fixable blockers.
- Keep all work inside this repo unless the work packet explicitly says otherwise.
- Do not edit real secrets or commit `.env`.
- Do not perform live outreach, live publishing, billing, provider provisioning, or production side effects.
- Preserve service ownership boundaries: LiNKaios cockpit/orchestration, LiNKbrain memory/audit, LinkSkills leases/connectors, LiNKautowork deterministic workflow gateway, LiNKbot role runtime, modules workflow maps.
- Update the required `dev-swarm/product/reports/archive/legacy-ai-swarm/WP-222-final-integration-proof-and-percentage-audit.md` before stopping.
- Include files changed, commands run, proof produced, blockers, and next step in the report.

Stop only after acceptance criteria and proof commands have been attempted. If proof fails, fix it when the root cause is in scope; otherwise document the exact file-level/root-cause blocker and the command output summary.
