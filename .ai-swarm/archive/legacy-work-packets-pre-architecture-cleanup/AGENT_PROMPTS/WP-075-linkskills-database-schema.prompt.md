# WP-075 Agent Prompt - LinkSkills Database Schema

You are working on the LiNKtrend-System repo.

Execute work packet `.ai-swarm/WORK_PACKETS/WP-075-linkskills-database-schema.md`.

## Clean Worktree Requirement

Use a separate clean worktree/checkout for this packet. Do not run this packet in a shared dirty repo folder.

1. Start from `/Users/linktrend/Projects/LiNKtrend-System`.
2. Run `git fetch origin --prune`.
3. Create a packet-specific worktree or checkout from latest `origin/development`.
4. Use branch `dev/codex/WP-075-linkskills-database-schema`.
5. Run `git status --short --branch` before editing.
6. If unrelated dirty files exist, stop before editing and report the blocker.

Example worktree command:

```bash
git worktree add ../LiNKtrend-System-WP-075 -b dev/codex/WP-075-linkskills-database-schema origin/development
```

## Required Reading

- `.cursor/rules/00-linktrend-master-rule.mdc`
- `.cursor/rules/01-ecosystem-boundaries.mdc`
- `.cursor/rules/03-agent-swarm-coordination.mdc`
- `.cursor/rules/08-database-and-api-standards.mdc`
- `.ai-swarm/LINKSKILLS_COMPLETION_PLAN.md`
- `.ai-swarm/CONTRACTS_MVO.md`
- `.ai-swarm/WORK_PACKETS/WP-075-linkskills-database-schema.md`
- `/Users/linktrend/Projects/LiNKskills/SOP_MVO_CLASS_A.md`
- `/Users/linktrend/Projects/LiNKskills/SOP_MACHINE_MVO_CLASS_A.md`

## Mission

Create the LinkSkills database foundation for capability catalog, lease ledger, idempotency cache, and kill switches with tenant-aware RLS and contract-aligned fields.

## Hard Boundaries

- Schema/migration only unless a tiny type/export helper is required by the repo pattern.
- Do not change existing LiNKbrain audit tables.
- Do not implement catalog APIs or lease runtime here; later packets own those.
- Do not invent Odoo/Payload/Zulip business configuration beyond capability metadata.

## Proof Required

- Migration/schema validation appropriate to the repo.
- Tests or SQL validation if existing migration test pattern exists.
- No duplicate migration numbering.
- Update `.ai-swarm/AGENT_REPORTS/linkskills-agent.md` with files changed, commands run, proof, blockers, branch, and commit SHA.

## Finish

1. Commit only this packet's files.
2. Commit message: `feat: add LinkSkills governance schema`
3. Push branch to origin.
4. Report branch, commit SHA, commands run, proof, and blockers.
