# WP-214-linksites-linkbot-role-execution Prompt

Model: Kimi

Execute `LiNKdev/product/programs/linktrend-system/issues/legacy/WP-214-linksites-linkbot-role-execution.md` exactly. This is a LiNKbot role execution packet.

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

Wave 1 carry-forward:

- Read the WP-210 report if it exists at `.worktrees/WP-210-baseline-fix-and-build-gate/LiNKdev/product/reports/archive/legacy-ai-swarm/WP-210-baseline-fix-and-build-gate.md`.
- Read the WP-211 report if it exists at `.worktrees/WP-211-module-workflow-map-gap-prep/LiNKdev/product/reports/archive/legacy-ai-swarm/WP-211-module-workflow-map-gap-prep.md`.
- If `modules/linksites/workflow.md` is missing in your checkout, copy it from `.worktrees/WP-211-module-workflow-map-gap-prep/modules/linksites/workflow.md` before wiring roles.
- Do not assume Wave 1 fully passed. WP-210 reported remaining LinkSkills, LiNKautowork, LiNKaios typecheck/build blockers; fix blockers that are in this packet scope.

Important execution rules:

- Fix blockers that are inside the packet scope. Do not only document fixable blockers.
- Keep all work inside this repo unless the work packet explicitly says otherwise.
- Do not edit real secrets or commit `.env`.
- Do not perform live outreach, live publishing, billing, provider provisioning, or production side effects.
- Preserve service ownership boundaries: LiNKaios cockpit/orchestration, LiNKbrain memory/audit, LinkSkills leases/connectors, LiNKautowork deterministic workflow gateway, LiNKbot role runtime, modules workflow maps.
- Update the required `LiNKdev/product/reports/archive/legacy-ai-swarm/WP-214-linksites-linkbot-role-execution.md` before stopping.
- Include files changed, commands run, proof produced, blockers, and next step in the report.

Stop only after acceptance criteria and proof commands have been attempted. If proof fails, fix it when the root cause is in scope; otherwise document the exact file-level/root-cause blocker and the command output summary.
