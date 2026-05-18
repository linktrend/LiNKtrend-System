# WP-078 Agent Prompt - LinkSkills Kill Switch

You are working on the LiNKtrend-System repo.

Execute work packet `.ai-swarm/WORK_PACKETS/WP-078-linkskills-kill-switch.md`.

## Clean Worktree Requirement

Use a separate clean worktree/checkout for this packet. Do not run this packet in a shared dirty repo folder.

1. Start from `/Users/linktrend/Projects/LiNKtrend-System`.
2. Run `git fetch origin --prune`.
3. Create a packet-specific worktree from latest `origin/development`.
4. Use branch `dev/codex/WP-078-linkskills-kill-switch`.
5. Run `git status --short --branch` before editing.
6. If unrelated dirty files exist, stop before editing and report the blocker.

Example:

```bash
git worktree add ../LiNKtrend-System-WP-078 -b dev/codex/WP-078-linkskills-kill-switch origin/development
```

## Required Reading

- `.cursor/rules/00-linktrend-master-rule.mdc`
- `.cursor/rules/01-ecosystem-boundaries.mdc`
- `.cursor/rules/03-agent-swarm-coordination.mdc`
- `.ai-swarm/LINKSKILLS_COMPLETION_PLAN.md`
- `.ai-swarm/CONTRACTS_MVO.md`
- `.ai-swarm/WORK_PACKETS/WP-078-linkskills-kill-switch.md`
- `services/migrations/030_linkskills_database_foundation.sql`
- `LiNKskills/services/logic-engine/src/capability-catalog-api.ts`
- `/Users/linktrend/Projects/LiNKskills/SOP_MVO_CLASS_A.md`
- `/Users/linktrend/Projects/LiNKskills/SOP_MACHINE_MVO_CLASS_A.md`

## Mission

Implement LinkSkills kill switch and safety controls for capability governance. If `packages/linkskills-core` does not exist, use `LiNKskills/services/logic-engine` and document that repo reality.

## Important Clarification

This packet controls capability execution safety. It is not a skills authoring/import task and must not bulk-import skills from `linktrend-skills`.

## Hard Boundaries

- No LiNKaios kernel implementation.
- No capability backend implementation.
- No production billing integration; cost triggers may be scaffolded/tested with in-memory or mock samples.
- Level 3 rollback remains scaffold-only unless existing code supports it cleanly.

## Proof Required

- Tests for trip, reset, check, global halt, per-capability halt, and lease-denied mapping if integrated.
- Relevant LinkSkills package tests/typecheck where possible.
- Update `.ai-swarm/AGENT_REPORTS/linkskills-agent.md` with files changed, commands run, proof, blockers, branch, and commit SHA.

## Finish

1. Commit only this packet's files.
2. Commit message: `feat: add LinkSkills kill switch controls`
3. Push branch to origin.
4. Report branch, commit SHA, commands run, proof, and blockers.
