# WP-087 Agent Prompt - LiNKbrain Memory Object Schemas

Recommended model/tool: Cursor Gemini 3.1 Pro or Kimi K2.5. Use this because the task touches SQL/schema design and TypeScript.

Execute `.ai-swarm/WORK_PACKETS/WP-087-linkbrain-memory-object-schemas.md`.

## Clean Worktree Requirement

Use a separate clean worktree/checkout for this packet. Do not run this packet in a shared dirty repo folder.

```bash
cd /Users/linktrend/Projects/LiNKtrend-System
git fetch origin --prune
git worktree add ../LiNKtrend-System-WP-087 -b dev/cursor/WP-087-linkbrain-memory-object-schemas origin/development
cd ../LiNKtrend-System-WP-087
git status --short --branch
```

If unrelated dirty files exist, stop before editing and report the blocker.

## Required Reading

- `.cursor/rules/00-linktrend-master-rule.mdc`
- `.cursor/rules/08-database-and-api-standards.mdc`
- `.ai-swarm/CONTRACTS_MVO.md`
- `.ai-swarm/LINKBRAIN_COMPLETION_PLAN.md`
- `.ai-swarm/WORK_PACKETS/WP-087-linkbrain-memory-object-schemas.md`
- `services/migrations/023_linkbrain_audit_envelope.sql`
- `services/migrations/026_linkbrain_rpc_wrapper.sql`
- `packages/linklogic-sdk/src/brain-audit.ts`

## Mission

Implement the first LiNKbrain memory object persistence foundation: migration plus SDK schemas. Keep runtime extraction worker minimal or documented if current kernel event surfaces are not ready.

## Scope

Allowed:

- Add a migration for `linkbrain.memory_objects` or existing-schema-compatible equivalent.
- Add Zod/TypeScript schemas for memory object state, LeadMemory, ResearchBundle, and EpisodeSummary.
- Add tests for SDK schemas.
- If a memory worker can be added safely with existing code patterns, do it with tests; otherwise create a precise follow-up blocker in the report.
- Update `.ai-swarm/AGENT_REPORTS/linkbrain-agent.md`.

Hard boundaries:

- Enable RLS and tenant isolation.
- Do not use user-editable JWT metadata for authorization.
- Do not store raw PII in benchmark-like tables.
- Do not apply migrations to a remote database from this agent unless explicitly configured and approved.

## Proof Required

- SDK tests for memory schemas.
- Static SQL review evidence: table has `tenant_id`, state constraint, provenance refs, and RLS.
- Any focused test if a worker is implemented.

## Finish

Commit message: `feat: add LiNKbrain memory object schemas`
Push branch to GitHub.
