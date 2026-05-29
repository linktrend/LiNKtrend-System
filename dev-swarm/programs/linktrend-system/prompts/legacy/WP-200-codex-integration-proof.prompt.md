# WP-200 Prompt — Cross-System Integration And Proof

Model: Codex.

Execute `dev-swarm/programs/linktrend-system/issues/legacy/WP-200-codex-integration-proof.md`.

Use a separate clean worktree/checkout for this packet. Do not run this packet in a shared dirty repo folder.

1. Verify the starting checkout is clean with `git status --short --branch`.
2. If unrelated dirty files exist, stop before editing and report the blocker.
3. Create or use a packet-specific branch/worktree before making changes.

You are the integration/proof agent. Read the required context listed in the packet, then verify and harden the end-to-end MVO across LiNKaios, LiNKbrain, LinkSkills, LiNKautowork, LiNKbot, LinkSites, LEXOS, LiNKapps, and LiNKguard after the repo cleanup. Run the available typechecks/tests/builds, identify broken contracts, fix only integration blockers, and produce proof commands plus remaining UI/UX-check items. Update `dev-swarm/reports/legacy-ai-swarm/WP-200-codex-integration-proof.md` before stopping.
