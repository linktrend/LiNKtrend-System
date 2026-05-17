# WP-088 Agent Prompt - LiNKbrain Context Assembler

Recommended model/tool: Cursor Kimi K2.5 or Gemini 3.1 Pro. Do not use Codex.

Execute `.ai-swarm/WORK_PACKETS/WP-088-linkbrain-context-assembler.md`.

## Clean Worktree Requirement

Use a separate clean worktree/checkout for this packet. Do not run this packet in a shared dirty repo folder.

```bash
cd /Users/linktrend/Projects/LiNKtrend-System
git fetch origin --prune
git worktree add ../LiNKtrend-System-WP-088 -b dev/cursor/WP-088-linkbrain-context-assembler origin/development
cd ../LiNKtrend-System-WP-088
git status --short --branch
```

If unrelated dirty files exist, stop before editing and report the blocker.

## Dependency Gate

This packet depends conceptually on WP-087 memory object schemas. Because agents may run in parallel, implement this as an SDK/service interface with in-memory tests if WP-087 tables are not yet present on `development`. Do not create a second conflicting memory object migration.

## Required Reading

- `.ai-swarm/LINKBRAIN_COMPLETION_PLAN.md`
- `.ai-swarm/WORK_PACKETS/WP-088-linkbrain-context-assembler.md`
- `packages/linklogic-sdk/src/brain-audit.ts`
- Existing kernel dispatch/context patterns under `apps/linkaios-web/src/lib/kernel/`

## Mission

Create a scoped context assembly foundation for LinkBots: typed request/response contracts plus a retrieval service that can be tested with an in-memory store. Add pgvector migration only if WP-087 memory schema is already present in your checkout and the migration can cleanly extend it.

## Scope

Allowed:

- Add `packages/linklogic-sdk/src/brain-retrieval.ts` or equivalent.
- Add `apps/linkaios-web/src/lib/kernel/context-assembler.ts` with in-memory/store-injected implementation.
- Add tenant/plugin/role scope-lattice tests.
- Add clear TODO-free follow-up if pgvector must wait for WP-087 merge.
- Update `.ai-swarm/AGENT_REPORTS/linkbrain-agent.md`.

Hard boundaries:

- Fail closed on cross-tenant access.
- Do not add external vector DB dependencies.
- Do not create a duplicate memory table migration if WP-087 is not present.

## Proof Required

- Focused tests for scoped context assembly.
- Typecheck for affected package/app if practical.
- Report branch, commit SHA, proof, and blockers.

## Finish

Commit message: `feat: add LiNKbrain context assembler foundation`
Push branch to GitHub.
