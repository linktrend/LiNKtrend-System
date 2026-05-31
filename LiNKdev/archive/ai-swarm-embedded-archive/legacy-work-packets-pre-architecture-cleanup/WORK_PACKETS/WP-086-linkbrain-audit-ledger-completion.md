# WP-086 - LiNKbrain Audit Ledger Completion

## Objective

Complete the audit ledger coverage to ensure 100% traceability for LinkSites v2 and the broader platform.

## Repo / branch

- Repo: `/Users/linktrend/Projects/LiNKtrend-System`
- Branch: `dev/codex/WP-086-linkbrain-audit-ledger-completion`
- Base: `development`

## Allowed files

- `packages/linklogic-sdk/src/contracts-mvo.ts`
- `LiNKbot/runtime-adapters/openclaw/bot-runtime/src/**`
- `LiNKautowork/gateway/src/**`
- `.ai-swarm/AGENT_REPORTS/linkbrain-agent.md`

## Mission

1.  **Expand `AUDIT_ACTIONS`:** Add missing v2 capability actions (`supabase.mirror.content.upserted`, `payload.content.upserted`, `asset.generated`, etc.) to the canonical enum in `linklogic-sdk`.
2.  **LiNKbot Role Audit:** Implement `role.started`, `role.completed`, `role.failed`, `research.performed`, `provenance.recorded`, `template.guidance.selected`, and `website.package.generated` emitters in the `bot-runtime` adapter.
3.  **Readiness Audit:** Implement `preview.readiness.checked` and `preview.readiness.failed` emitters in the LiNKautowork gateway.
4.  **Governance Audit:** Ensure `approval.requested`, `approval.granted`, and `approval.rejected` carry the full `subject` context (lease_id, run_id).

## Acceptance criteria

- All LinkSites v2 stages emit the role-specific events defined in §0.A.4.1.
- Every capability execution emits a typed output event.
- Every deterministic check emits a readiness event.
- No PII in audit payloads.

## Proof required

- Test suite showing all new event types are successfully mapped and written to the audit mock.
- Trace log from a mock run showing the full event chain.
