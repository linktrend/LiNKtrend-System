# WP-111 Agent Prompt - LiNKapps LiNKbrain Event Schema

Recommended model/tool: Cursor Kimi or Gemini 3.1 Pro for SDK schema/test work. Composer is acceptable if keeping the output mostly spec-only. Do not use Codex or Antigravity.

Execute `.ai-swarm/WORK_PACKETS/WP-111-linkapps-linkbrain-event-schema.md`.

## Clean Worktree Requirement

Use a separate clean worktree/checkout for this packet. Do not run this packet in a shared dirty repo folder.

```bash
cd /Users/linktrend/Projects/LiNKtrend-System
git fetch origin --prune
git worktree add ../LiNKtrend-System-WP-111 -b dev/cursor/WP-111-linkapps-linkbrain-event-schema origin/development
cd ../LiNKtrend-System-WP-111
git status --short --branch
```

If unrelated dirty files exist, stop before editing and report the blocker.

## Required Reading

- `.cursor/rules/00-linktrend-master-rule.mdc`
- `.cursor/rules/01-ecosystem-boundaries.mdc`
- `.cursor/rules/03-agent-swarm-coordination.mdc`
- `.ai-swarm/LINKAPPS_SQUAD_ORCHESTRATION_SPEC.md`
- `.ai-swarm/LINKAPPS_CAPABILITY_REQUIREMENTS.md`
- `.ai-swarm/LINKAPPS_VERTICAL_PLUGIN_CONVERSION_PLAN.md`
- `packages/linklogic-sdk/src/brain-memory.ts`
- `packages/linklogic-sdk/src/brain-benchmarks.ts`
- `packages/linklogic-sdk/src/contracts-mvo.ts`
- `.ai-swarm/WORK_PACKETS/WP-111-linkapps-linkbrain-event-schema.md`

## Mission

Define LiNKbrain audit and memory event schemas for LiNKapps app-factory runs and squad handoffs.

## Hard Boundaries

- No LiNKautowork workflow implementation.
- No provider/provisioning implementation.
- No DB migration unless strictly necessary and separately documented as deferred.
- Keep PII/customer data out of event payloads; use refs and redaction flags.

## Proof Required

- Focused `@linktrend/linklogic-sdk` test output.
- `@linktrend/linklogic-sdk` build output.
- Confirmation schema names do not collide with existing SDK exports.
- Update `.ai-swarm/AGENT_REPORTS/WP-111-linkapps-linkbrain-event-schema.md`.

## Finish

Commit message: `feat: add LiNKapps brain event schemas`
Push branch to GitHub.
