# WP Agent Prompt - LiNKautowork Run Control Integration

Use Cursor Kimi for this packet. Do not use any other model.

Execute `dev-swarm/product/programs/linktrend-system/issues/legacy/WP-118-linkautowork-run-control-integration.md`.

## Clean Worktree Requirement

Use a separate clean worktree/checkout for this packet. Do not run this packet in a shared dirty repo folder.

```bash
cd /Users/linktrend/Projects/LiNKtrend-System
git fetch origin --prune
git worktree add ../LiNKtrend-System-WP -b dev/cursor/WP-118-linkautowork-run-control-integration origin/development
cd ../LiNKtrend-System-WP
git status --short --branch
```

If unrelated dirty files exist, stop before editing and report the blocker.

## Required Reading

- `.cursor/rules/00-linktrend-master-rule.mdc`
- `.cursor/rules/01-ecosystem-boundaries.mdc`
- `.cursor/rules/03-agent-swarm-coordination.mdc`
- `.cursor/rules/06-testing-and-proof.mdc`
- `dev-swarm/product/programs/linktrend-system/issues/legacy/WP-118-linkautowork-run-control-integration.md`

## Mission

Execute the assigned work packet exactly. Stay within allowed files and hard boundaries. Produce proof before reporting completion.

## Hard Boundaries

- Use only the assigned Cursor model for this packet.
- Do not use production credentials or introduce live external side effects.
- Do not edit files outside the work packet's allowed file list.
- If required context contradicts the work packet, stop and report the blocker.

## Proof Required

Follow the work packet proof section. Update `dev-swarm/product/reports/archive/legacy-ai-swarm/WP-118-linkautowork-run-control-integration.md` with files changed, commands run, proof, blockers, branch, and commit SHA.

## Finish

Commit only this packet's files and push branch `dev/cursor/WP-118-linkautowork-run-control-integration` to GitHub.
