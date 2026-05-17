# WP-058 LiNKbrain V2 Audit/Memory Coverage Review - Agent Report

**Agent:** Cursor/Kimi  
**Work Packet:** WP-058-linkbrain-v2-audit-memory-coverage-review  
**Branch:** `dev/codex/WP-058-linkbrain-v2-audit-memory-coverage-review`  
**Date:** 2026-05-15  
**Status:** Complete

---

## Summary

Executed a comprehensive review of LiNKbrain v2 audit and memory coverage against CONTRACTS_MVO.md §0.A (LinkSites v2) requirements. The review maps every LinkSites v2 step to required audit events, identifies gaps, and provides actionable follow-up assignments.

---

## Evidence Paths (Files Read)

| File | Purpose |
|------|---------|
| `.ai-swarm/CONTRACTS_MVO.md` §0.A | LinkSites v2 canonical contract |
| `.cursor/rules/04-mvo-scope-and-stubbing.mdc` | MVO acceptance criteria |
| `services/migrations/023_linkbrain_audit_envelope.sql` | Audit events table schema |
| `services/migrations/026_linkbrain_rpc_wrapper.sql` | RPC wrapper for audit writes |
| `packages/linklogic-sdk/src/brain-audit.ts` | SDK audit writer implementation |
| `packages/linklogic-sdk/src/contracts-mvo.ts` | Canonical audit actions enum |
| `apps/linkaios-web/src/lib/kernel/orchestrator.ts` | Run/stage orchestration + audit emits |
| `apps/linkaios-web/src/lib/kernel/dispatch.ts` | Cross-plane dispatch + audit emits |
| `apps/linkaios-web/src/lib/plugins/websitefactory/manifest.ts` | LinkSites v2 plugin manifest |
| `LiNKskills/services/logic-engine/src/audit-events.ts` | LinkSkills lease audit events |
| `LiNKskills/services/logic-engine/src/lease-lifecycle.ts` | Lease lifecycle + audit integration |

---

## LinkSites V2 Flow → Audit/Memory Coverage Matrix

### 1. Lead Intake (linkaios)

| Step | Required Action | Status | Evidence | Gap |
|------|-----------------|--------|----------|-----|
| Work request created | `run.started` | ✅ Implemented | `orchestrator.ts:287-294` | None |
| Stage dispatched | `stage.started` | ✅ Implemented | `orchestrator.ts:430` | None |
| Stage complete | `stage.completed` | ✅ Implemented | `orchestrator.ts:512-514` | None |
| Lead registered | Memory write to `lead_registry` | ✅ Implemented | Migration 017 + orchestrator | None |

### 2. Research/Enrichment Bot (linkbot)

| Step | Required Action | Status | Evidence | Gap |
|------|-----------------|--------|----------|-----|
| Role declared | `role.declared` | ❌ Missing | - | No role declaration audit |
| Role started | `role.started` | ❌ Missing | - | No LinkBot role lifecycle audit |
| Research performed | `research.performed` | ❌ Missing | - | WP-044 follow-up needed |
| Provenance recorded | `provenance.recorded` | ❌ Missing | - | WP-044 follow-up needed |
| Role completed | `role.completed` | ❌ Missing | - | No LinkBot role lifecycle audit |
| Reasoning output | `stage.completed` | ✅ Implemented | `orchestrator.ts:512` | Kernel emits stage event only |

**Gap Analysis:** LinkBot reasoning stages currently emit only `stage.started`/`stage.completed` from the kernel. Per §0.A.4.1, the Research/Enrichment Bot role MUST emit: `role.started`, `role.completed`, `research.performed`, `provenance.recorded`, `role.failed`.

### 3. Website Builder Bot (linkbot)

| Step | Required Action | Status | Evidence | Gap |
|------|-----------------|--------|----------|-----|
| Role declared | `role.declared` | ❌ Missing | - | No role declaration audit |
| Role started | `role.started` | ❌ Missing | - | WP-044 follow-up needed |
| Template guidance selected | `template.guidance.selected` | ❌ Missing | - | WP-044 follow-up needed |
| Website package generated | `website.package.generated` | ❌ Missing | - | WP-044 follow-up needed |
| Provenance recorded | `provenance.recorded` | ❌ Missing | - | WP-044 follow-up needed |
| Role completed | `role.completed` | ❌ Missing | - | WP-044 follow-up needed |

**Gap Analysis:** Website Builder Bot role lacks all role-specific audit events. The v2 contract requires these events for traceability of copy generation and template selection.

### 4. Artifact Write Local (linkautowork)

| Step | Required Action | Status | Evidence | Gap |
|------|-----------------|--------|----------|-----|
| Workflow invoked | `workflow.invoked` | ✅ Implemented | `dispatch.ts:715-718` | None |
| Workflow completed | `workflow.completed` | ✅ Implemented | `dispatch.ts:788-791` | None |
| Artifact written | `artifact.written` | ❌ Missing | - | No artifact output audit |
| Local artifact stored | Memory write | ⚠️ Stub | `dispatch.ts:751-759` | Mock only - real FS write in WP-045 |

### 5. Supabase Mirror Upsert (linkautowork + linkskills)

| Step | Required Action | Status | Evidence | Gap |
|------|-----------------|--------|----------|-----|
| Lease requested | `lease.requested` | ✅ Implemented | `lease-lifecycle.ts:148`, `dispatch.ts:387-390` | None |
| Lease granted | `lease.granted` | ✅ Implemented | `lease-lifecycle.ts:197`, `dispatch.ts:426-430` | None |
| Lease executed | `lease.executed` | ✅ Implemented | `lease-lifecycle.ts:566`, `dispatch.ts:516-519` | None |
| Capability output | `supabase.mirror.content.upserted` | ⚠️ Partial | `audit-events.ts:201-229` | Action exists but not in AUDIT_ACTIONS |
| Workflow invoked | `workflow.invoked` | ✅ Implemented | `dispatch.ts:715-718` | None |
| Workflow completed | `workflow.completed` | ✅ Implemented | `dispatch.ts:788-791` | None |

### 6. Payload Sync Local (linkautowork + linkskills)

| Step | Required Action | Status | Evidence | Gap |
|------|-----------------|--------|----------|-----|
| Lease lifecycle | `lease.requested/granted/executed` | ✅ Implemented | Same as above | None |
| Capability output | `payload.content.upserted` | ⚠️ Partial | `audit-events.ts:201-229` | Action exists but not in AUDIT_ACTIONS |
| Workflow invoked/completed | `workflow.invoked/completed` | ✅ Implemented | `dispatch.ts` | None |

### 7. Preview Readiness Check (linkautowork)

| Step | Required Action | Status | Evidence | Gap |
|------|-----------------|--------|----------|-----|
| Workflow invoked | `workflow.invoked` | ✅ Implemented | `dispatch.ts:715-718` | None |
| Workflow completed | `workflow.completed` | ✅ Implemented | `dispatch.ts:788-791` | None |
| Checks passed | `preview.readiness.checked` | ❌ Missing | - | No readiness-specific audit |
| Checks failed | `preview.readiness.failed` | ❌ Missing | - | No readiness-specific audit |

### 8. CRM Ready-to-Contact Mark (linkautowork + linkskills)

| Step | Required Action | Status | Evidence | Gap |
|------|-----------------|--------|----------|-----|
| Lease lifecycle | `lease.requested/granted/executed` | ✅ Implemented | Same pattern | None |
| CRM status updated | `crm.lead.status.updated` | ⚠️ Partial | `audit-events.ts:221` | Subject has crm_record_id but needs verification |
| Capability output | `crm.ready_to_contact.marked` | ❌ Missing | - | Contract says `crm.lead.status.updated` |

**Note:** The contract (§0.A.5) specifies `crm.lead.status.updated` as the audit event for CRM capability. Current implementation in `audit-events.ts` has a generic mapping that may not cover the v2 `ready_to_contact` status change specifically.

### 9. Plane Execution Tracking (linkskills)

| Step | Required Action | Status | Evidence | Gap |
|------|-----------------|--------|----------|-----|
| Lease lifecycle | `lease.requested/granted/executed` | ✅ Implemented | Same pattern | None |
| Capability output | `plane.project.upserted`, `plane.task.upserted` | ✅ Implemented | `audit-events.ts:203-204` | Maps from v1 contract |
| Plane readiness checked | `plane.readiness.checked` | ⚠️ Missing | - | Only if shadow mode implemented |

### 10. Zulip Run Notify (linkskills)

| Step | Required Action | Status | Evidence | Gap |
|------|-----------------|--------|----------|-----|
| Lease lifecycle | `lease.requested/granted/executed` | ✅ Implemented | Same pattern | None |
| Notification queued | `zulip.notification.queued` | ✅ Implemented | `audit-events.ts:206` | In actionMap |
| Connectivity checked | `zulip.connectivity.checked` | ⚠️ Missing | - | Only if shadow mode implemented |

### 11. Record Run (linkbrain)

| Step | Required Action | Status | Evidence | Gap |
|------|-----------------|--------|----------|-----|
| Run closure | `run.completed` | ✅ Implemented | `orchestrator.ts:831-838` | None |
| Run failed | `run.failed` | ✅ Implemented | `orchestrator.ts:772-780`, `798-805` | None |
| Memory persist | Run stored in LiNKbrain | ⚠️ Stub | `dispatch.ts:867-892` | Comment: "MVO: LiNKbrain memory persistence is stubbed" |

---

## Gap Matrix Summary

| Category | Gap | Severity | Owner Packet | Notes |
|----------|-----|----------|--------------|-------|
| **LinkBot Role Audit** | Missing `role.started`, `role.completed`, `research.performed`, `provenance.recorded`, `template.guidance.selected`, `website.package.generated` | High | WP-044 | LinkBot role contract pack incomplete |
| **Readiness Checks** | Missing `preview.readiness.checked/failed` | Medium | WP-045 | LiNKautowork workflow specifics |
| **Shadow Mode Audits** | Missing `crm.odoo.readiness.checked`, `plane.readiness.checked`, `zulip.connectivity.checked` | Low | WP-043 | Shadow mode only, not blocking MVO |
| **Memory Persistence** | LiNKbrain memory writes stubbed | Medium | WP-046 | Run closure persistence not implemented |
| **Audit Action Registry** | `supabase.mirror.content.upserted`, `payload.content.upserted`, `asset.generated`, `asset.provenance.recorded` not in AUDIT_ACTIONS | Medium | WP-005 | SDK contract types incomplete |
| **Lease Events** | `lease.expired`, `lease.revoked` audit events not emitted | Low | WP-007 | Lease lifecycle corner cases |
| **Research Provenance** | No provenance citation recording audit | High | WP-044 | Required for research bot accountability |

---

## Acceptance Criteria Verification

Per `.cursor/rules/04-mvo-scope-and-stubbing.mdc`:

| Requirement | Status | Evidence |
|-------------|--------|----------|
| No audit event | ❌ NOT ACCEPTABLE | Gaps identified above |
| No capability lease | ✅ Acceptable stubs exist | Lease lifecycle implemented |
| No memory/event write | ⚠️ Partial - memory stub | `dispatch.ts:885-891` comments |
| No trace/status visibility | ✅ Implemented | `orchestrator.ts:853-916` getRunTrace |
| Fake success without proof | ❌ NOT ACCEPTABLE | All stubs documented |

---

## Hard Boundaries Check

| Boundary | Compliant | Evidence |
|----------|-----------|----------|
| Do not weaken audit requirements | ✅ Yes | All gaps documented, none dropped |
| Do not invent new memory schema | ✅ Yes | No new schema invented in this packet |

---

## Recommended Follow-Up Work Packets

1. **WP-044-follow-up** (LinkBot Agent): Add role-specific audit events
   - Add `role.started`, `role.completed`, `role.failed` event emitters
   - Add `research.performed`, `provenance.recorded` for Research Bot
   - Add `template.guidance.selected`, `website.package.generated` for Builder Bot

2. **WP-005-follow-up** (SDK Types): Expand AUDIT_ACTIONS
   - Add v2 capability output actions to `AUDIT_ACTIONS` array
   - Verify all §0.A.5 capability audit events are in canonical set

3. **WP-046-follow-up** (LinkBrain Agent): Memory persistence
   - Implement actual LiNKbrain memory writes for run closure
   - Connect `record_run` stage to real memory persistence

4. **WP-045-follow-up** (LiNKautowork Agent): Workflow specifics
   - Add `preview.readiness.checked/failed` audit events
   - Implement deterministic check result recording

---

## Files Changed

| File | Change |
|------|--------|
| `.ai-swarm/AGENT_REPORTS/linkbrain-agent.md` | Created this report |

---

## Commands Run

```bash
git fetch origin
git switch development
git pull --ff-only origin development
git switch -c dev/codex/WP-058-linkbrain-v2-audit-memory-coverage-review
```

---

## Proof

This review provides:
- ✅ Coverage matrix mapping every LinkSites v2 step to audit expectations
- ✅ Comparison of contract expectations vs. current implementation
- ✅ Specific gap identification with file references
- ✅ Actionable follow-up owner assignments
- ✅ No audit/memory requirements dropped (all gaps documented with owners)

---

## Blockers

None. This review packet is complete and ready for Integrator review.

---

## Commit SHA

`8971d1e6d6857c1516714df4e15b3f1b846baedc`

---

# WP-065 LiNKbrain Audit Envelope Mapping for LinkBot Flow - Agent Report

**Agent:** Codex  
**Work Packet:** WP-065-linkbrain-audit-envelope-mapping-for-linkbot-flow  
**Branch:** `dev/codex/WP-065-linkbrain-audit-envelope-mapping-for-linkbot-flow`  
**Date:** 2026-05-17  
**Status:** Complete

## Summary

Implemented canonical LiNKbrain envelope mapping helpers for LinkBot lifecycle signals, LinkSkills capability signals, LiNKautowork workflow signals, and Linktrend governance authorization lifecycle signals. Added focused tests proving mapping normalization and run/stage subject queryability.

## Files Changed

- `apps/linkaios-web/src/lib/kernel/audit-envelope-mapper.ts`
- `apps/linkaios-web/src/lib/kernel/audit-envelope-mapper.test.ts`
- `.ai-swarm/AGENT_REPORTS/linkbrain-agent.md`

## Mapping Table (Source -> Canonical)

- `run.dispatched` -> `run.started`
- `role.started` -> `stage.started`
- `role.completed` -> `stage.completed`
- `role.failed` -> `stage.failed`
- `capability.requested` -> `lease.requested`
- `capability.executed` -> `lease.executed`
- `capability.failed` -> `stage.failed`
- `workflow.invoked` -> `workflow.invoked`
- `workflow.completed` -> `workflow.completed`
- `workflow.failed` -> `workflow.failed`
- `linktrend.gov.authorization.granted` -> `approval.granted`
- `linktrend.gov.authorization.denied` -> `approval.rejected`
- `linktrend.gov.authorization.pending` -> `stage.awaiting_approval`

## Commands Run

```bash
git status --short --branch
git fetch origin --prune
git worktree add ../LiNKtrend-System-WP-065 -b dev/codex/WP-065-linkbrain-audit-envelope-mapping-for-linkbot-flow origin/development
pnpm install
pnpm build
pnpm --filter @linktrend/linkaios-web test -- src/lib/kernel/audit-envelope-mapper.test.ts
```

## Proof

- Mapping helper tests pass and verify normalization for LinkBot, LinkSkills, LiNKautowork, and governance signals.
- Integration-style mapper write test verifies canonical envelope subject includes both `run_id` and `stage_id` for trace queryability.
- Focused test command result: all kernel/plugin suites executed by Vitest in this workspace passed, including the new mapper suite.

## Validation Results

- `pnpm --filter @linktrend/linkaios-web test -- src/lib/kernel/audit-envelope-mapper.test.ts` ✅ pass
- `pnpm build` ⚠️ fails in `@linktrend/linkaios-web` with pre-existing Next.js webpack `node:*` URI handling issue (unrelated to WP-065 mapper changes).

## Blockers

None for WP-065 scope.

## Commit SHA

`PENDING_COMMIT_SHA`
