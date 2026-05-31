# WP-077 Agent Prompt - LinkSkills Lease Lifecycle

You are working on the LiNKtrend-System repo.

Execute work packet `.ai-swarm/WORK_PACKETS/WP-077-linkskills-lease-lifecycle.md`.

## Clean Worktree Requirement

Use a separate clean worktree/checkout for this packet. Do not run this packet in a shared dirty repo folder.

1. Start from `/Users/linktrend/Projects/LiNKtrend-System`.
2. Run `git fetch origin --prune`.
3. Create a packet-specific worktree from latest `origin/development`.
4. Use branch `dev/codex/WP-077-linkskills-lease-lifecycle`.
5. Run `git status --short --branch` before editing.
6. If unrelated dirty files exist, stop before editing and report the blocker.

Example:

```bash
git worktree add ../LiNKtrend-System-WP-077 -b dev/codex/WP-077-linkskills-lease-lifecycle origin/development
```

## Required Reading

- `.cursor/rules/00-linktrend-master-rule.mdc`
- `.cursor/rules/01-ecosystem-boundaries.mdc`
- `.cursor/rules/03-agent-swarm-coordination.mdc`
- `.ai-swarm/LINKSKILLS_COMPLETION_PLAN.md`
- `.ai-swarm/CONTRACTS_MVO.md`
- `.ai-swarm/WORK_PACKETS/WP-077-linkskills-lease-lifecycle.md`
- `services/migrations/030_linkskills_database_foundation.sql`
- `LiNKskills/services/logic-engine/src/capability-catalog-api.ts`
- `/Users/linktrend/Projects/LiNKskills/SOP_MACHINE_MVO_CLASS_A.md`

## Mission

Implement the LinkSkills lease lifecycle using the current repo reality. If `packages/linkskills-core` does not exist, use `LiNKskills/services/logic-engine` and document that decision.

## Important Clarification

This packet is about capability governance, not bulk skill catalog ingestion. Capabilities are governed connectors/actions for systems like Odoo, Zulip, Postiz, Payload, Plane, Paperless, etc. Skills are separate Golden Template artifacts and must not be invented here.

## Hard Boundaries

- Do not implement capability backend transports beyond stubs/adapters already present.
- Do not modify LiNKaios kernel logic.
- Do not bulk-import skills from `linktrend-skills`.
- Lease execution must check idempotency before side effects and emit audit before returning success.

## Proof Required

- Tests for request, grant/deny, execute, idempotent replay, conflict on mismatched payload, expiry/revocation where feasible.
- Relevant LinkSkills package tests/typecheck where possible.
- Update `.ai-swarm/AGENT_REPORTS/linkskills-agent.md` with files changed, commands run, proof, blockers, branch, and commit SHA.

## Finish

1. Commit only this packet's files.
2. Commit message: `feat: implement LinkSkills lease lifecycle`
3. Push branch to origin.
4. Report branch, commit SHA, commands run, proof, and blockers.
