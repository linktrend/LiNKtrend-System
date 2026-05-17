# WP-086 Agent Prompt - LiNKbrain Audit Ledger Completion

Recommended model/tool: Codex 5.3. This is the only Codex agent in this wave.

Execute `.ai-swarm/WORK_PACKETS/WP-086-linkbrain-audit-ledger-completion.md`.

## Clean Worktree Requirement

Use a separate clean worktree/checkout for this packet. Do not run this packet in a shared dirty repo folder.

```bash
cd /Users/linktrend/Projects/LiNKtrend-System
git fetch origin --prune
git worktree add ../LiNKtrend-System-WP-086 -b dev/codex/WP-086-linkbrain-audit-ledger-completion origin/development
cd ../LiNKtrend-System-WP-086
git status --short --branch
```

If unrelated dirty files exist, stop before editing and report the blocker.

## Required Reading

- `.cursor/rules/00-linktrend-master-rule.mdc`
- `.cursor/rules/01-ecosystem-boundaries.mdc`
- `.cursor/rules/03-agent-swarm-coordination.mdc`
- `.ai-swarm/CONTRACTS_MVO.md`
- `.ai-swarm/LINKBRAIN_COMPLETION_PLAN.md`
- `.ai-swarm/WORK_PACKETS/WP-086-linkbrain-audit-ledger-completion.md`
- `packages/linklogic-sdk/src/contracts-mvo.ts`
- `packages/linklogic-sdk/src/brain-audit.ts`
- `LiNKautowork/gateway/src/lib/audit-emitter.ts`
- `LiNKautowork/gateway/src/workflows/linksites-v2.ts`
- `apps/bot-runtime/src/reasoning-dispatch.ts`

## Mission

Complete canonical audit action coverage for LinkSites v2. Prefer a narrow, testable patch over a broad rewrite.

## Important Current-State Reconciliation

Before editing, inspect current `development` because WP-071 already implemented LinkSites v2 LiNKautowork handlers and adapter tests. Do not duplicate workflow handler work. Add only missing audit action types, typed mapping, and tests.

## Scope

Allowed:

- Add canonical audit actions to `AUDIT_ACTIONS` for LinkSites v2 role, provenance, generated package, mirror, Payload, asset, readiness, and approval context events.
- Add or update tests proving the canonical action set accepts these events.
- Add lightweight audit helper/mapping updates in LiNKautowork and bot-runtime only if needed to emit the new actions.
- Update `.ai-swarm/AGENT_REPORTS/linkbrain-agent.md`.

Avoid unless clearly necessary:

- New migrations.
- Broad run orchestration changes.
- Full E2E harness changes.

## Hard Boundaries

- No PII in audit payloads.
- Do not rename existing canonical actions.
- Do not change plane ownership.
- Do not implement live external provider calls.

## Proof Required

- `pnpm --filter @linktrend/linklogic-sdk test -- brain-audit contracts-mvo`
- Focused LiNKautowork or bot-runtime tests if files there are touched.
- Report branch, commit SHA, files changed, proof, and blockers.

## Finish

Commit message: `feat: complete LinkSites audit action coverage`
Push branch to GitHub.
