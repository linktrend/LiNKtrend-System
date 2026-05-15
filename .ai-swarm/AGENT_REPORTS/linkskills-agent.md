## Assigned Work Packet

**WP-055 — Postiz distribution capability scaffold**
**Status:** COMPLETE
**Date:** 2026-05-15

## Objective

Scaffold a LinkSkills-governed Postiz distribution capability surface with mock/shadow-safe operations only, explicitly blocking live publishing until a Linktrend Media vertical workflow is defined.

## Search Evidence

Repository evidence gathered before edits:

- `.ai-swarm/PLUGIN_ARCHITECTURE_V2.md` — capability plugin governance model includes Postiz as a connector class.
- `.ai-swarm/CONTRACTS_MVO.md` — canonical capability contract pack section for modes, leases, idempotency, and failure mapping.
- `.ai-swarm/INTEGRATION_QUEUE.md` — canonical v2 integration tracking surface.
- `LiNKskills/services/logic-engine/src/capability-handlers.ts` — existing mock/shadow scaffold patterns for other capabilities.
- `.ai-swarm/REPO_GIT_POLICY_ROLLOUT.md` — existing external repo reference `link-postiz-app` noted for future upstream alignment.

## Files Changed

- `LiNKskills/services/logic-engine/src/capability-handlers.ts`
  - Added `handleCapPostizDistribution` scaffold for:
    - `connectivity.probe`
    - `draft.create_mock`
    - `schedule.mock`
    - `status.read`
  - Enforced hard boundary:
    - `mode=live` always denied (`LEASE_DENIED`)
    - `draft.create_mock` and `schedule.mock` are mock-only (shadow denied)
  - Registered `cap.postiz.distribution` in `getCapabilityHandler`.

- `LiNKskills/services/logic-engine/src/capability-handlers.postiz.test.ts` (new)
  - Added focused tests for:
    - shadow connectivity probe success
    - mock draft creation success
    - live-mode rejection
    - shadow scheduling rejection

- `LiNKskills/services/logic-engine/src/audit-events.ts`
  - Added output action mapping:
    - `cap.postiz.distribution` -> `postiz.distribution.mocked`

- `LiNKskills/services/logic-engine/src/capability-catalog.ts`
  - Added `cap.postiz.distribution` to `getMvoCapabilityIds()` for governance-plane discovery.

- `LiNKskills/services/logic-engine/src/index.ts`
  - Exported `handleCapPostizDistribution`.

- `.env.example`
  - Added non-secret placeholders:
    - `POSTIZ_DISTRIBUTION_MODE=mock`
    - `POSTIZ_WORKSPACE_REF=`
    - `POSTIZ_DRAFT_CHANNEL_SET=`

- `.ai-swarm/CONTRACTS_MVO.md`
  - Added `cap.postiz.distribution` row to §0.A.5.1 with operations, mode boundaries, auth/config surface, idempotency, lease requirements, audit events, allowed callers, canonical failure mapping, and explicit non-ownership.
  - Added enforcement rule that Postiz must remain mock/shadow-safe until Linktrend Media vertical publish governance is defined.

- `.ai-swarm/INTEGRATION_QUEUE.md`
  - Added `INT-051` for Postiz distribution scaffold in development-mode posture.

## Commands Run

```bash
pwd && ls -la
rg --files | rg -n 'README|AGENTS\\.md|AGENT_PROMPTS|WP-055|CURSOR|CODEX|WORK_PACKET|docs'
ls -la .ai-swarm/AGENT_PROMPTS
sed -n '1,220p' README.md
sed -n '1,260p' .ai-swarm/AGENT_PROMPTS/README.md
sed -n '1,260p' .ai-swarm/AGENT_PROMPTS/WP-055-postiz-distribution-capability-scaffold.prompt.md
sed -n '1,260p' .cursor/rules/05-security-cost-and-side-effects.mdc
sed -n '1,260p' .ai-swarm/PLUGIN_ARCHITECTURE_V2.md
sed -n '1,260p' .ai-swarm/CONTRACTS_MVO.md
sed -n '1,260p' .ai-swarm/WORK_PACKETS/WP-055-postiz-distribution-capability-scaffold.md
sed -n '1,260p' .ai-swarm/INTEGRATION_QUEUE.md
rg -n "postiz|Postiz|distribution capability|capability scaffold|agent report|WP-054|WP-053" .ai-swarm LiNKskills apps/linkaios-web/src .env.example
git fetch origin && git switch development && git pull --ff-only origin development && git switch -c dev/codex/WP-055-postiz-distribution-capability-scaffold
pnpm --filter @linktrend/linkskills-logic-engine test -- src/capability-handlers.postiz.test.ts src/capability-handlers.zulip.test.ts
pnpm --filter @linktrend/linkskills-logic-engine test
```

## Validation Results

- `pnpm --filter @linktrend/linkskills-logic-engine test -- src/capability-handlers.postiz.test.ts src/capability-handlers.zulip.test.ts`
  - PASS
- `pnpm --filter @linktrend/linkskills-logic-engine test`
  - PASS

## Hard-Boundary Compliance

- No live social post publishing path added.
- No real Postiz account/channel/campaign configuration added.
- No secrets committed; only non-secret env placeholders were added.
- Capability remains lease-governed and fail-closed for live mode.

## Risks / Blockers

- Postiz behavior is connector-surface scaffold only; real transport/provider adapter work remains future and must follow Linktrend Media vertical workflow contracts.
- `cap.postiz.distribution` output action currently uses one generalized mocked action; operation-specific audit action expansion may be desirable later.

## Final Branch and Commit

- Branch: `dev/codex/WP-055-postiz-distribution-capability-scaffold`
- Commit SHA: `PENDING`

## Assigned Work Packet

**WP-053 — Zulip communication capability scaffold**
**Status:** COMPLETE
**Date:** 2026-05-15

## Objective

Scaffold the LinkSkills-governed Zulip communication capability surface for LinkBot/operator and bot-to-bot messaging in development mode, with no live outbound sends and explicit mock/shadow behavior.

## Search Evidence (existing bridge reuse)

Repository evidence discovered before implementation:

- `apps/zulip-gateway/src/gateway-dispatch.ts` — existing inbound webhook bridge and `gateway.zulip_message_links` upsert path.
- `apps/zulip-gateway/src/resolve-mission-id.ts` — mission routing from Zulip stream IDs.
- `apps/zulip-gateway/src/zulip-payload.ts` and tests — existing Zulip payload extraction utilities.
- `services/migrations/ALL_IN_ONE.sql` — existing `gateway.zulip_message_links` and stream routing persistence.
- `LiNKskills/services/logic-engine/src/capability-catalog.ts` — `cap.zulip.run_messaging` already listed in LinkSites v2 capability IDs.

This WP reuses those findings and adds only the missing capability-execution scaffold in the existing LinkSkills logic engine.

## Files Changed

- `LiNKskills/services/logic-engine/src/capability-handlers.ts`
  - Added `handleZulipRunMessaging` scaffold for `cap.zulip.run_messaging` operations:
    - `run.notify` (mock-only queued result)
    - `channel.message.mock_send` (mock-only queued result)
    - `connectivity.probe` (mock or shadow readiness placeholder)
  - Enforced hard boundary: `mode=live` throws; no real send path implemented.
  - Registered `cap.zulip.run_messaging` in `getCapabilityHandler`.

- `LiNKskills/services/logic-engine/src/capability-handlers.zulip.test.ts`
  - Added focused tests covering:
    - mock queued run notification
    - shadow connectivity probe
    - live-mode rejection
    - shadow outbound-operation rejection

- `LiNKskills/services/logic-engine/src/index.ts`
  - Exported `handleZulipRunMessaging`.

- `LiNKskills/services/logic-engine/src/audit-events.ts`
  - Added capability output action mapping for `cap.zulip.run_messaging` → `zulip.notification.queued`.

- `.env.example`
  - Added non-secret placeholder config for scaffold mode/topic surface:
    - `ZULIP_RUN_MESSAGING_MODE=mock`
    - `ZULIP_RUN_STREAM=`
    - `ZULIP_RUN_TOPIC_TEMPLATE=run:{run_id}`

## Commands Run

```bash
pwd && ls -la
rg --files -g 'README*' -g 'AGENTS.md' -g '**/*codex*' -g '**/*cursor*' -g 'docs/**'
ls -la .ai-swarm/AGENT_PROMPTS && ls -la .ai-swarm
sed -n '1,220p' README.md
sed -n '1,220p' .ai-swarm/ARCHITECTURE_RULES.md
sed -n '1,260p' .ai-swarm/AGENT_PROMPTS/WP-053-zulip-communication-capability-scaffold.prompt.md
sed -n '1,220p' .cursor/rules/01-ecosystem-boundaries.mdc
sed -n '1,260p' .cursor/rules/05-security-cost-and-side-effects.mdc
sed -n '1,260p' .ai-swarm/WORK_PACKETS/WP-053-zulip-communication-capability-scaffold.md
sed -n '1,240p' .ai-swarm/INTEGRATION_QUEUE.md
sed -n '1,260p' .ai-swarm/CONTRACTS_MVO.md
git fetch origin && git switch development && git pull --ff-only origin development && git switch -c dev/codex/WP-053-zulip-communication-capability-scaffold
rg -n "zulip|Zulip|openclaw|OpenClaw|run.notify|channel\.message|connectivity\.probe" -S
sed -n '1,320p' LiNKskills/services/logic-engine/src/capability-handlers.ts
sed -n '1,240p' .env.example
pnpm --filter @linktrend/linkskills-logic-engine test
```

## Validation Results

- `pnpm --filter @linktrend/linkskills-logic-engine test`
  - PASS: 3 files, 49 tests total.
  - New suite `capability-handlers.zulip.test.ts`: 4 passing tests.

## Hard-Boundary Compliance

- No live outbound Zulip sends implemented.
- No credentials/tokens/domains hardcoded.
- No final stream taxonomy introduced beyond run/topic placeholder surface.
- Existing bridge artifacts were referenced and reused as baseline context.

## Risks / Blockers

- The scaffold currently returns mock/shadow placeholders only; real transport wiring to a Zulip provider adapter remains future integration work and must stay lease-governed.
- Capability-output action is currently generalized (`zulip.notification.queued`); if operation-specific audit action granularity is required later, audit mapping should key by operation as well as capability.

## Final Branch and Commit

- Branch: `dev/codex/WP-053-zulip-communication-capability-scaffold`
- Commit SHA: `dbfa4a9` (Integrator recovery branch)

# Agent Report: LinkSkills Agent (WP-007)

## Assigned Work Packet

**WP-047 — LinkSkills LinkSites capability catalog**  
**Status:** COMPLETE  
**Date:** 2026-05-15

## Objective

Extend LinkSkills capability catalog and lease request behavior for LinkSites v2 capability plugins with safe-mode defaults, while keeping live external writes disabled by default.

## Files Changed

- `LiNKskills/services/logic-engine/src/capability-catalog.ts`
  - Extended MVO capability list to include:
    - `cap.crm.odoo_shadow`
    - `cap.payload.local_sync`
    - `cap.supabase.mirror_content`
    - `cap.zulip.run_messaging`
    - `cap.research.public_web`
    - `cap.asset.generation`
    - `cap.plane.execution_tracking`
  - Added LinkSites v2 helpers:
    - `getLinksitesV2CapabilityIds()`
    - `isLinksitesV2Capability()`
    - `isWriteCapableLinksitesV2Capability()`

- `LiNKskills/services/logic-engine/src/lease-lifecycle.ts`
  - Added live-mode refusal guard in `requestLease()`:
    - If `arguments.mode === "live"` and capability is side-effecting LinkSites v2 capability, deny with `LEASE_DENIED`.
    - Keeps write-capable capabilities mock/shadow-safe by default.

- `LiNKskills/services/logic-engine/src/lease-lifecycle.linksites-v2.test.ts` (new)
  - Added executable tests for:
    - lease request in safe mode
    - kill-switch denial (`LEASE_KILL_SWITCH`)
    - idempotent replay (`is_existing: true`)
    - live-mode refusal (`LEASE_DENIED`) for write capabilities

- `services/migrations/029_linkskills_linksites_capability_catalog.sql` (new; Integrator renumbered from `025_*` to avoid migration index collision)
  - Added/updated `linkskills.capability_catalog` seed entries for all seven LinkSites v2 capability IDs (connector-only catalog surface; no target-app business setup).

- `.ai-swarm/AGENT_REPORTS/linkskills-agent.md`
  - Added this WP-047 completion section.

## Commands Run

```bash
git fetch origin
git switch development
git pull --ff-only origin development
git switch -c dev/codex/WP-047-linkskills-linksites-capability-catalog

pnpm --filter @linktrend/linkskills-logic-engine test
pnpm --filter @linktrend/linkskills-logic-engine typecheck
```

## Validation Results

- `pnpm --filter @linktrend/linkskills-logic-engine test`
  - Result: PASS
  - `Test Files 2 passed`
  - `Tests 45 passed (45)`
  - Includes new `src/lease-lifecycle.linksites-v2.test.ts` (4 tests).

- `pnpm --filter @linktrend/linkskills-logic-engine typecheck`
  - Result: PASS
  - `tsc -p tsconfig.json --noEmit` completed without errors.
- Integrator post-merge verification on `development`:
  - `pnpm --filter @linktrend/linklogic-sdk test -- contracts-mvo` => PASS (11 files, 86 tests)
  - `pnpm --filter @linktrend/linkskills-logic-engine test` => PASS (2 files, 45 tests)
  - `pnpm --filter @linktrend/linkskills-logic-engine typecheck` => PASS

## Risks / Notes

- `args_schema` remains metadata-only in current logic-engine flow (no JSON schema runtime enforcement yet). Live-mode write refusal is enforced in `requestLease()` for write-capable LinkSites v2 capabilities.
- No real external writes were added or enabled.

## Blockers

None.

## Final Branch and Commit

- Branch: `dev/codex/WP-047-linkskills-linksites-capability-catalog`
- Commit SHA: `2e95b63` (plus Integrator follow-up commits on `development`)

## Assigned Work Packet

**WP-043 — Capability plugin contract pack v1**  
**Status:** COMPLETE  
**Date:** 2026-05-15

## Objective

Define connector-only capability plugin contracts for LinkSites v1 capabilities: Odoo/CRM shadow-readiness, Payload CMS, Supabase mirror/content, Zulip, public web research, asset generation, and Plane, including modes, auth/config surface, idempotency, LinkSkills lease requirements, audit events, allowed callers, failure mapping, and explicit non-ownership.

## Files Changed

- `.ai-swarm/CONTRACTS_MVO.md`
  - Added `§0.A.5.1 Capability plugin contract pack v1 (connector-only)`.
  - Added generic contract shape and seven per-capability contract rows:
    - `cap.crm.odoo_shadow`
    - `cap.payload.local_sync`
    - `cap.supabase.mirror_content`
    - `cap.zulip.run_messaging`
    - `cap.research.public_web`
    - `cap.asset.generation`
    - `cap.plane.execution_tracking`
  - Added enforcement rules: `mock/shadow` defaults, lease/idempotency requirements, and connector-only non-ownership boundary.

- `.ai-swarm/INTEGRATION_QUEUE.md`
  - Updated INT-040..INT-046 notes to point to `CONTRACTS_MVO.md` `§0.A.5.1` canonical contract IDs.
  - Kept all rows in development-mode mock/shadow posture; no live writes by default.

- `.ai-swarm/AGENT_REPORTS/linkskills-agent.md`
  - Added this WP-043 completion report section.

## Commands Run

```bash
pwd; ls -la
rg --files -g 'README*' -g 'AGENTS.md' -g '*AGENT*' -g '*CODEx*' -g '*Cursor*' -g '*.md' . | head -n 200
sed -n '1,220p' README.md
sed -n '1,220p' docs/README.md
sed -n '1,260p' .ai-swarm/AGENT_PROMPTS/WP-043-capability-plugin-contract-pack-v1.prompt.md
sed -n '1,260p' .cursor/rules/00-linktrend-master-rule.mdc
sed -n '1,260p' .cursor/rules/01-ecosystem-boundaries.mdc
sed -n '1,260p' .cursor/rules/03-agent-swarm-coordination.mdc
sed -n '1,320p' .ai-swarm/PLUGIN_ARCHITECTURE_V2.md
sed -n '1,320p' .ai-swarm/LINKSITES_VERTICAL_MVO_V2.md
sed -n '1,320p' .ai-swarm/WORK_PACKETS/WP-043-capability-plugin-contract-pack-v1.md
sed -n '1,320p' .ai-swarm/CONTRACTS_MVO.md
sed -n '1,320p' .ai-swarm/INTEGRATION_QUEUE.md
sed -n '1,260p' .ai-swarm/AGENT_REPORTS/linkskills-agent.md
git fetch origin && git switch development && git pull --ff-only origin development && git switch -c dev/codex/WP-043-capability-plugin-contract-pack-v1
rg -n "capability plugin|Capability plugin|INT-04|Odoo|Payload|Supabase mirror|Zulip|asset generation|public web research|Plane" .ai-swarm/CONTRACTS_MVO.md .ai-swarm/INTEGRATION_QUEUE.md
nl -ba .ai-swarm/CONTRACTS_MVO.md | sed -n '48,170p'
git status --short
git diff -- .ai-swarm/CONTRACTS_MVO.md .ai-swarm/INTEGRATION_QUEUE.md .ai-swarm/AGENT_REPORTS/linkskills-agent.md
```

## Tests Run

No package code or schema/runtime TypeScript/Zod contracts were changed in `packages/linklogic-sdk`; only documentation/contracts in `.ai-swarm/` were updated. Therefore no package test run was required for this packet.

## Proof of Boundary Compliance

- No Odoo chart of accounts, accounting rules, CRM stage/taxonomy, or business data setup were defined.
- No Payload schema was created.
- No Supabase mirror schema was invented before WP-042 discovery.
- No Zulip stream taxonomy beyond run-message connector surface was introduced.
- No live external writes were enabled by default; all capability contracts default to `mock` or `shadow`.
- Contract scope remains connector/governance-only: operation IDs, auth/config surfaces, lease requirements, idempotency, audit events, caller boundaries, and failure mappings.

## Blockers / Open Questions

- WP-042 discovery must confirm existing Payload and Supabase mirror schema sources before any implementation packet wires concrete field mappings.
- Integrator review normalized WP-043 failure mappings to existing `CONTRACTS_MVO.md` §5.4 canonical codes before merge to `development`.

## Final Branch and Commit

- Branch: `dev/codex/WP-043-capability-plugin-contract-pack-v1`
- Commit SHA: `88ce4bb` plus Integrator follow-up on `development`

## Assigned Work Packet

**WP-007 — LinkSkills lease lifecycle**  
**Status:** COMPLETE  
**Date:** 2026-05-14

## Objective

Wire the MVO LinkSkills capability lease lifecycle for `crm.upsert`, `plane.project.create`, `plane.task.create`, and `preview.publish` using `LiNKskills/services/logic-engine` reuse-first patterns.

## Files Changed

### Database Migration
- `services/migrations/024_linkskills_capability_lease.sql`
  - LinkSkills schema creation
  - `capability_catalog` table with MVO capabilities seeded
  - `capability_kill_switches` table for circuit breakers
  - `lease_ledger` table for lease lifecycle tracking
  - `lease_execution_results` table for idempotent execution results
  - Stub backend tables: `mvo_crm_contacts`, `mvo_crm_records`, `mvo_projects`, `mvo_tasks`
  - SECURITY DEFINER RPCs: `request_lease`, `grant_lease`, `deny_lease`, `record_execution`, `trip_kill_switch`, `reset_kill_switch`, `expire_stale_leases`
  - Stub backend RPCs: `upsert_crm_contact`, `upsert_crm_record`, `create_plane_project`, `create_plane_task`

### TypeScript Implementation (LiNKskills/services/logic-engine)
- `src/types.ts` - TypeScript types for lease lifecycle
- `src/kill-switch.ts` - Kill switch management module
- `src/capability-catalog.ts` - Capability catalog management
- `src/lease-lifecycle.ts` - Core lease request/grant/execute implementation
- `src/capability-handlers.ts` - MVO capability handlers (crm.upsert, plane.*, preview.publish)
- `src/audit-events.ts` - LiNKbrain audit event builders and emitters
- `src/index.ts` - Export barrel
- `package.json` - Package configuration
- `tsconfig.json` - TypeScript configuration

### Tests
- `src/lease-lifecycle.test.ts` - 41 passing tests validating §6.2 and §7 contracts

### Workspace Configuration
- `pnpm-workspace.yaml` - Added LiNKskills/*/* pattern

## Commands Run

```bash
# Install dependencies
pnpm install --no-frozen-lockfile

# Type check
pnpm typecheck
# Result: PASS (linkskills-logic-engine only - autowork-gateway has unrelated errors in WP-008 scope)

# Run tests
cd LiNKskills/services/logic-engine && pnpm test
# Result: ✓ 41 tests passed (4ms)
```

## Proof

### Lease Lifecycle States (§6.2)
✓ Implemented all 7 states: `requested`, `granted`, `denied`, `requires_approval`, `executed`, `expired`, `revoked`

### Kill Switch (§6.2)
✓ `isKillSwitchTripped()` - Checks both tenant-specific and global kill switches
✓ `tripKillSwitch()` - Trip switch with reason and actor tracking
✓ `resetKillSwitch()` - Reset switch with actor tracking
✓ Returns `LEASE_KILL_SWITCH` without state mutation when tripped

### Idempotency (§6.2)
✓ `request_lease` RPC enforces unique (tenant_id, idempotency_key)
✓ Re-request with same key returns existing lease (is_existing: true)
✓ `record_execution` RPC enforces unique execution per idempotency_key
✓ Re-execute returns original result without second side effect

### Capability Catalog (§7)
✓ 4 MVO capabilities seeded in migration:
  - `crm.upsert` - require_approval policy
  - `plane.project.create` - require_approval policy
  - `plane.task.create` - require_approval policy
  - `preview.publish` - require_approval policy

### Policy Modes
✓ `require_approval` - Transitions to requires_approval state
✓ `auto_grant` - Auto-grants with 5-minute TTL
✓ `deny_all` - Auto-denies with reason

### Audit Event Integration (§6.3)
✓ `emitLeaseRequested()` - Emits `lease.requested`
✓ `emitLeaseGranted()` - Emits `lease.granted`
✓ `emitLeaseDenied()` - Emits `lease.denied`
✓ `emitLeaseExecuted()` - Emits `lease.executed`
✓ `emitCapabilityOutput()` - Emits output-level events:
  - `crm.upserted`
  - `plane.project.created`
  - `plane.task.created`
  - `preview.published`

### Stub Backends (INT-020, INT-021)
✓ `mvo_crm_contacts` - Hashed email/phone (no plaintext PII)
✓ `mvo_crm_records` - Idempotent per (tenant_id, lead_id)
✓ `mvo_projects` - Idempotent per (tenant_id, lead_id)
✓ `mvo_tasks` - Idempotent per (project_id, title_normalized)

### Test Results
```
✓ src/lease-lifecycle.test.ts (41 tests)
  - §6.2 Lease Request
  - §6.2 Kill Switch
  - §7 Capability Catalog
  - §6.2 Lease States
  - §6.2 Lease Execution
  - §6.3 Audit Events
  - §7.1-7.4 Capability Contracts
  - INT-020/INT-021 Stub Backends
```

## Blockers

None. WP-007 is complete.

## Decisions Made

1. **Lease TTL:** Default 5 minutes (300 seconds) for granted leases, matching §6.2 spec.

2. **Kill Switch Scope:** Both global (null tenant) and tenant-specific supported. Fail-closed: if check fails, assume tripped.

3. **PII Handling:** CRM stub uses SHA256-hashed email/phone with tenant-scoped salt. No plaintext PII at rest.

4. **Idempotency Keys:** Uses (tenant_id, idempotency_key) unique constraint in database.

5. **Audit Event Ordering:** lease.executed emitted before capability output event (e.g., crm.upserted). Output event refs caused_by_event_id pointing to lease.executed.

6. **Policy Determination:** Policy mode resolved from capability_catalog table. Future: tenant-specific policy overrides can be added without schema change.

## Integration Points

- **LiNKaios kernel** calls `requestLease()` and `executeLease()` via SDK
- **LiNKbrain** receives audit events via `writeBrainAuditEvent()` from linklogic-sdk
- **LiNKautowork** workflows call capability handlers through lease execute
- **WP-012 (Stub Backends)** - CRM/Plane stub RPCs implemented and ready

## Next Step

WP-007 is complete. The lease lifecycle is ready for integration with:
- WP-010 (LiNKaios kernel) - kernel calls `requestLease()` and `executeLease()`
- WP-013 (E2E Demo) - integration tests can now exercise full lease lifecycle

The capability catalog, kill switches, and stub backends are in place. WP-012 (integration-agent) may extend the stub RPCs if additional fields are needed for the demo.

## Assigned Work Packet

**WP-050 — LinkSkills v2 capability execution handlers**
**Status:** COMPLETE
**Date:** 2026-05-15

## Objective

Implement mock/shadow-safe execution handlers for the seven LinkSites v2 capabilities, preserve lease/idempotency/kill-switch behavior, and return canonical failure codes for policy and input failures.

## Files Changed

- `LiNKskills/services/logic-engine/src/capability-handlers.ts`
  - Added handler coverage for all LinkSites v2 capability IDs:
    - `cap.crm.odoo_shadow`
    - `cap.payload.local_sync`
    - `cap.supabase.mirror_content`
    - `cap.zulip.run_messaging`
    - `cap.research.public_web`
    - `cap.asset.generation`
    - `cap.plane.execution_tracking`
  - Added mock/shadow-safe stub results with deterministic refs.
  - Enforced write-capable live-mode refusal (`LEASE_DENIED`) by default.
  - Added `CapabilityExecutionError` + argument validation helper for canonical failure mapping.

- `LiNKskills/services/logic-engine/src/lease-lifecycle.ts`
  - Updated `executeLease()` catch handling to preserve capability-handler canonical failure codes (e.g., `LEASE_DENIED`, `LEASE_REQUEST_INVALID`) instead of collapsing to `WORKFLOW_STEP_FAILED`.

- `LiNKskills/services/logic-engine/src/index.ts`
  - Exported new LinkSites v2 capability handlers and `CapabilityExecutionError`.

- `LiNKskills/services/logic-engine/src/lease-execute.linksites-v2.test.ts` (new)
  - Added tests for:
    - idempotent replay on executed lease
    - live-mode refusal mapping to `LEASE_DENIED`
    - missing required arguments mapping to `LEASE_REQUEST_INVALID`

## Commands Run

```bash
pnpm --filter @linktrend/linkskills-logic-engine test
pnpm --filter @linktrend/linkskills-logic-engine typecheck
```

## Validation Results

- `pnpm --filter @linktrend/linkskills-logic-engine test`
  - PASS: `Test Files 4 passed`, `Tests 52 passed (52)`
  - Includes new suite: `src/lease-execute.linksites-v2.test.ts` (3 tests).

- `pnpm --filter @linktrend/linkskills-logic-engine typecheck`
  - PASS: `tsc -p tsconfig.json --noEmit` completed without errors.

## Risks / Blockers

- Current handlers intentionally return governed mock/shadow placeholder refs only; no provider transport is wired.
- Output payload shape for these v2 capabilities remains minimal by design and may need tightening once downstream packets pin concrete result schemas.

## Branch and Commit

- Branch: `dev/codex/recover-WP050-WP053-WP054-linkskills-capabilities` (Integrator recovery branch)
- Commit SHA: `dbfa4a9` (Integrator recovery branch)
