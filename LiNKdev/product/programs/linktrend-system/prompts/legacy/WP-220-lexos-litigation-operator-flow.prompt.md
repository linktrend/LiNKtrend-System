# WP-220-lexos-litigation-operator-flow Prompt

Model: Kimi

Execute `LiNKdev/product/programs/linktrend-system/issues/legacy/WP-220-lexos-litigation-operator-flow.md` exactly. This is a LEXOS operator-flow completion packet.

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
- `LiNKdev/product/grounding/CONTRACTS_MVO.md`
- `LiNKdev/product/grounding/REPO_INVENTORY.md`
- the assigned work packet

Wave 3 carry-forward:

- Read `.worktrees/WP-216-linkaios-cockpit-proof-surface/LiNKdev/product/reports/archive/legacy-ai-swarm/WP-216-linkaios-cockpit-proof-surface.md` if present. If the packet worktree still has legacy `apps/linkaios-web` only and lacks `LiNKaios/linkaios-web`, stop and report that WP-219/WP-222 integration baseline must run first.
- Read `.worktrees/WP-218-linksites-proof-runbook-and-local-preview/LiNKdev/product/reports/archive/legacy-ai-swarm/WP-218-linksites-proof-runbook-and-local-preview.md` if present for proof/runbook carry-forward expectations.

Important execution rules:

- Fix blockers that are inside the packet scope. Do not only document fixable blockers.
- Keep all work inside this repo unless the work packet explicitly says otherwise.
- Do not edit real secrets or commit `.env`.
- Do not perform live outreach, live publishing, billing, provider provisioning, or production side effects.
- Preserve service ownership boundaries: LiNKaios cockpit/orchestration, LiNKbrain memory/audit, LinkSkills leases/connectors, LiNKautowork deterministic workflow gateway, LiNKbot role runtime, modules workflow maps.
- Update the required `LiNKdev/product/reports/archive/legacy-ai-swarm/WP-220-lexos-litigation-operator-flow.md` before stopping.
- Include files changed, commands run, proof produced, blockers, and next step in the report.

Stop only after acceptance criteria and proof commands have been attempted. If proof fails, fix it when the root cause is in scope; otherwise document the exact file-level/root-cause blocker and the command output summary.
