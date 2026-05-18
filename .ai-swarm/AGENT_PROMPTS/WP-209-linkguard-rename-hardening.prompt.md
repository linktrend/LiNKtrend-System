# WP-209 Prompt — LiNKguard Rename And Sidecar Hardening

Model: Composer.

Execute `.ai-swarm/WORK_PACKETS/WP-209-linkguard-rename-hardening.md`.

Use a separate clean worktree/checkout for this packet. Do not run this packet in a shared dirty repo folder.

1. Verify the starting checkout is clean with `git status --short --branch`.
2. If unrelated dirty files exist, stop before editing and report the blocker.
3. Create or use a packet-specific branch/worktree before making changes.

You are the LiNKguard hardening agent. Verify package name, Dockerfile, compose service, residue policy tests, README/source references, and LiNKaios settings labels so no active code still depends on PRISM/prism-defender paths. Update `.ai-swarm/AGENT_REPORTS/WP-209-linkguard-rename-hardening.md` with files changed, commands run, proof, blockers, and next step.
