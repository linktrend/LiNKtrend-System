# WP-076 Agent Prompt - LinkSkills Capability Catalog API

You are working on the LiNKtrend-System repo.

Execute work packet `.ai-swarm/WORK_PACKETS/WP-076-linkskills-capability-catalog-api.md`.

## Clean Worktree Requirement

Use a separate clean worktree/checkout for this packet. Do not run this packet in a shared dirty repo folder.

1. Start from `/Users/linktrend/Projects/LiNKtrend-System`.
2. Run `git fetch origin --prune`.
3. Create a packet-specific worktree or checkout from latest `origin/development`.
4. Use branch `dev/codex/WP-076-linkskills-capability-catalog-api`.
5. Run `git status --short --branch` before editing.
6. If unrelated dirty files exist, stop before editing and report the blocker.

Example:

```bash
git worktree add ../LiNKtrend-System-WP-076 -b dev/codex/WP-076-linkskills-capability-catalog-api origin/development
```

## Required Reading

- `.cursor/rules/00-linktrend-master-rule.mdc`
- `.cursor/rules/01-ecosystem-boundaries.mdc`
- `.cursor/rules/03-agent-swarm-coordination.mdc`
- `.cursor/rules/08-database-and-api-standards.mdc`
- `.ai-swarm/LINKSKILLS_COMPLETION_PLAN.md`
- `.ai-swarm/CONTRACTS_MVO.md`
- `.ai-swarm/WORK_PACKETS/WP-076-linkskills-capability-catalog-api.md`
- `services/migrations/030_linkskills_database_foundation.sql`
- Existing `LiNKskills/services/logic-engine/**` catalog patterns

## Mission

Implement capability catalog discovery/validation surface for LinkSkills, seeded with the MVO `cap.*` IDs and aligned with the WP-075 schema. If `packages/linkskills-core` still does not exist, use the existing `LiNKskills/services/logic-engine` package and document the repo reality.

## Hard Boundaries

- Do not implement lease lifecycle; WP-077 owns it.
- Do not modify LiNKaios kernel code.
- Do not define internal Odoo/Payload/Zulip business configuration.
- Preserve existing LinkSkills logic-engine tests and exports.

## Proof Required

- Tests for catalog listing, capability lookup, mode validation, and invalid manifest rejection.
- Run relevant LinkSkills package tests/typecheck where possible.
- Update `.ai-swarm/AGENT_REPORTS/linkskills-agent.md` with files changed, commands run, proof, blockers, branch, and commit SHA.

## Finish

1. Commit only this packet's files.
2. Commit message: `feat: add LinkSkills capability catalog API`
3. Push branch to origin.
4. Report branch, commit SHA, commands run, proof, and blockers.
