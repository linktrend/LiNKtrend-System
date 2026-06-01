# Agent Report: Architect

## Assigned Work Packet

`WP-040-plugin-architecture-contract-v2.md` (completed 2026-05-15). Previous: `WP-005-linklogic-sdk-types.md` (completed 2026-05-14), `WP-004-mvo-contracts.md` (completed 2026-05-14), `WP-002-day-1-decision-freeze.md` (completed 2026-05-14).

## WP-040 — Plugin architecture v2 contract (2026-05-15)

**Status:** Complete. The shared plugin architecture contract is now first-class in the repo source of truth. Vertical plugins, capability plugins, LiNKbot role attachments, LinkSkills permissions/skills, LiNKautowork hooks, LiNKbrain audit/memory events, mode model, and stop-and-ask are pinned in both the prose contract and the SDK schema.

### Files Changed (WP-040)

- `LiNKdev/product/grounding/CONTRACTS_MVO.md`
  - Title and §0 rewritten: contract now binds the LiNKaios kernel + plugin architecture v2; WebsiteFactory framed as the first concrete vertical instance.
  - Added §1.0.1 plugin kinds (vertical vs capability), §1.0.2 mode model (`development` / `shadow` / `live`), §1.0.3 LiNKbot role attachment model, §1.0.4 stop-and-ask rule.
  - Extended §1.2 `PluginManifest` TypeScript shape with `plugin_kind`, `modes_supported`, `required_linkbot_roles[]`, and a `capability` block (`CapabilityPluginSurface`). Legacy-compat rules retained for v1 manifests.
  - Extended §1.3 manifest validation rules: empty stages on verticals, missing capability block on capability plugins, invalid callers, unknown modes, role attachments referencing undeclared capabilities/audit events, capability `not_configured[]` empty.
  - §1.4 reframed as "LinkSites / WebsiteFactory manifest declaration (concrete vertical instance)" with v1↔v2 mapping.
  - §12.4 LinkSkills role-bleed rewritten to make permissions + skills first-class and forbid leases in undeclared modes.
  - Added §12.7 stop-and-ask review-gate.
- `LiNKdev/product/grounding/LINKAIOS_KERNEL_MANIFEST.md`
  - §0 framing updated for vertical vs capability plugin kinds.
  - §3 split into shared / vertical-only / capability-only required fields.
  - §4 YAML annotated with `plugin_kind`, `modes_supported`, and v1↔v2 carry-over note.
- `packages/linklogic-sdk/src/contracts-mvo.ts`
  - Added `PluginKindSchema`, `PluginModeSchema`, `LiNKbotRoleAttachmentSchema`, `CapabilityPluginCallerSchema`, `CapabilityPluginSurfaceSchema`.
  - Extended `PluginManifestSchema` with optional `plugin_kind`, `modes_supported`, `required_linkbot_roles`, and `capability`. Used `.superRefine` to enforce v2 cross-field rules without breaking v1 manifests.
- `packages/linklogic-sdk/src/contracts-mvo.test.ts`
  - Added 7 v2 manifest tests: v2 vertical accepts, role attachment must reference declared capability, capability manifest accepts, capability with stages rejected, capability without `capability` block rejected, capability with empty `not_configured` rejected. All test cases land in the existing `PluginManifestSchema` describe block.
- `packages/linklogic-sdk/src/index.ts`
  - Re-exported new v2 schemas and inferred types (`PluginKind`, `PluginMode`, `LiNKbotRoleAttachment`, `CapabilityPluginCaller`, `CapabilityPluginSurface`).
- `LiNKdev/product/grounding/DECISIONS.md`
  - Added decision row D-09 ("Plugin architecture v2").
- `LiNKdev/product/grounding/AGENT_COORDINATION.md`
  - Latest Updates entry for WP-040.

No application implementation behavior was changed. No Payload/Odoo/Zulip/Plane/VPS internals were touched. No target-app business schemas were introduced.

### Commands Run

- `git fetch origin && git switch development && git pull --ff-only origin development`
- `git switch -c dev/codex/WP-040-plugin-architecture-contract-v2`
- `pnpm --filter @linktrend/linklogic-sdk typecheck` → clean (no errors).
- `pnpm --filter @linktrend/linklogic-sdk test -- contracts-mvo` → 11 files / 80 tests passed; `src/contracts-mvo.test.ts (38 tests)` includes the 7 new v2 manifest cases.

### Proof

```
Test Files  11 passed (11)
     Tests  80 passed (80)
  Duration  1.02s
```

Acceptance verification against WP-040:

- [x] Contract docs distinguish vertical plugins, capability plugins, core platform services, and LiNKbot (`CONTRACTS_MVO.md` §1.0.1; `LINKAIOS_KERNEL_MANIFEST.md` §0).
- [x] No document implies capability plugins own target-app business setup (`CONTRACTS_MVO.md` §1.0.1, §1.0.4, §12.7; manifest §3.3 `not_configured[]` required-non-empty).
- [x] Existing WebsiteFactory-specific language reframed as the concrete vertical instance (`CONTRACTS_MVO.md` §0, §1.4; manifest §4 header + YAML annotations); v1 manifests remain valid (legacy-compat rules in §1.2).
- [x] Mode semantics `development` / `shadow` / `live` declared at the contract layer (§1.0.2) and enforced via `PluginModeSchema` + capability `mode_flags`.
- [x] Stop-and-ask language present (§1.0.4 + §12.7 review-gate) and enforced via `CapabilityPluginSurfaceSchema.not_configured.min(1)`.
- [x] LinkSkills described as granting permissions **and** skills (§12.4; manifest §3.2/§3.3).
- [x] Shared TypeScript/Zod contracts updated to represent v2 manifest shape; contract tests pass.

### Proof that no implementation code or target-app business schema was changed

- `git status --short` shows changes only under `LiNKdev/product/grounding/`, `packages/linklogic-sdk/src/`, and `LiNKdev/product/reports/archive/legacy-ai-swarm/architect.md`. No edits to `apps/`, `services/`, `LiNKsites/`, `LiNKautowork/`, `LiNKbot-core/`, `LiNKskills/`, or any Payload/Odoo/Zulip/Plane configuration.
- SDK changes are schema-only additions (new optional fields + new schemas + cross-field refinements). No runtime behavior was introduced. Typecheck and tests confirm zero behavior regressions in dependent packages compiled by this SDK.

### Blockers / Questions

None. The v2 contract is additive over v1 and downstream packets WP-041..WP-045 can bind to the new schemas directly.

### Final branch + commit

- Branch: `dev/codex/WP-040-plugin-architecture-contract-v2`
- Commit SHA: see git log post-commit (recorded in `AGENT_COORDINATION.md` Latest Updates after push).

---

## Prior status (pre-WP-040) — WP-004 / WP-005

## Current Status

**WP-004 complete.** `CONTRACTS_MVO.md` rewritten end-to-end with concrete, typed cross-service contracts for the lead-to-preview-site MVO. All `TBD` placeholders removed; remaining stubs (CRM, Plane, preview publish) are captured as explicit STUB blocks with behavior, limitation, owner, acceptance criteria, and decision/integration links. Contracts bind to the WP-003 kernel/plugin manifest and to frozen Day-1 decisions D-01..D-08.

## Files Changed (WP-004)

- `LiNKdev/product/grounding/CONTRACTS_MVO.md`: Replaced placeholder shell with thirteen sections covering:
  - §1 LiNKaios kernel ↔ plugin contract (`PluginManifest`, manifest validation rules).
  - §2 Canonical data dictionary (typed names for all cross-stage I/O).
  - §3 Lead intake contract (`LeadInput`, validation, idempotency keyed on `(tenant_id, idempotency_key)` with 24h window, PII handling rules).
  - §4 Work / Run lifecycle (`WorkRequest`, `Run`, `Stage`, status state machine, retry policy).
  - §5 Failure taxonomy (`FailureReport`, code → status mapping, canonical error code enum).
  - §6 Cross-plane contracts (LiNKbot reasoning dispatch, LinkSkills lease lifecycle, LiNKbrain audit envelope per D-08, LiNKautowork workflow run lifecycle).
  - §7 LinkSkills capability checks for `crm.upsert`, `plane.project.create`, `plane.task.create`, `preview.publish`.
  - §8 Minimum audit events for succeeded / failed / awaiting_approval runs.
  - §9 `PreviewOutput` contract (preview_url, preview_artifact_ref, run_id, lease_ids, workflow_run_ids, audit_event_ids).
  - §10 End-to-end stage trace for `websitefactory.lead_to_preview`.
  - §11 STUB blocks for CRM (INT-020), Plane (INT-021), preview publishing (INT-022).
  - §12 Role-bleed rules per plane + per plugin (review-gate).
  - §13 Implementation handoff: recommended parallel work packets WP-005..WP-013.
- `LiNKdev/product/reports/archive/legacy-ai-swarm/architect.md`: this report.
- `LiNKdev/product/grounding/AGENT_COORDINATION.md`: Latest Updates entry for WP-004 completion.

No application code modified. No new dependencies. No secrets generated. `INTEGRATION_QUEUE.md` and `DECISIONS.md` left unchanged — the contract work did not reveal a new integration gap (INT-020..INT-022 cover all stubbed surfaces) or a new decision fork (D-01..D-08 remain sufficient).

## Decisions Made

No new platform decisions. WP-004 binds field names that were introduced as conventions in WP-003 (`PluginManifest`, `LeadInput`, `AuditEvent`, `LeaseRequest/Decision/Execute`, `WorkflowInvokeRequest/Result`, `PreviewOutput`); these are contract pins, not new platform choices, and do not require a `DECISIONS.md` row.

## Commands Run

- Read: `LiNKdev/product/grounding/HANDOVER_FROM_CHATGPT.md`, `ARCHITECTURE_RULES.md`, `MASTER_PLAN.md`, `AGENT_COORDINATION.md`, `REPO_INVENTORY.md`, `DECISIONS.md`, `INTEGRATION_QUEUE.md`, `LINKAIOS_KERNEL_MANIFEST.md`, `CONTRACTS_MVO.md`, `AGENT_REPORTS/repo-archaeologist.md`, `AGENT_REPORTS/linkaios-agent.md`, prior architect report, `WORK_PACKETS/WP-004-mvo-contracts.md`.
- Wrote `LiNKdev/product/grounding/CONTRACTS_MVO.md` (full replacement).
- Updated `LiNKdev/product/grounding/AGENT_COORDINATION.md` (Latest Updates).
- Updated this report.
- No shell side effects beyond file IO.

## Tests / Proof

Final `CONTRACTS_MVO.md` section headings (ready for implementation planning):

1. Scope and reading order
2. LiNKaios kernel ↔ plugin contract surface (1.1 owned responsibilities, 1.2 typed `PluginManifest`, 1.3 validation, 1.4 WebsiteFactory instance)
3. Data dictionary (canonical typed names)
4. Lead intake contract (3.1 `LeadInput`, 3.2 validation, 3.3 idempotency/dedupe, 3.4 PII handling)
5. Work / Run lifecycle (4.1 `WorkRequest`, 4.2 `Run`, 4.3 `Stage`, 4.4 status transitions, 4.5 finalization, 4.6 retry policy)
6. Failure taxonomy (5.1 `FailureReport`, 5.2 code → status, 5.3 visibility via audit, 5.4 canonical error enum)
7. Cross-plane contracts (6.1 LiNKaios↔LiNKbot, 6.2 LiNKaios↔LinkSkills lease lifecycle, 6.3 all planes→LiNKbrain audit envelope, 6.4 LiNKaios↔LiNKautowork workflow lifecycle)
8. LinkSkills capability checks (`crm.upsert`, `plane.project.create`, `plane.task.create`, `preview.publish`, common rules)
9. Minimum audit events per run outcome (succeeded / failed / awaiting_approval)
10. Preview output contract (`PreviewOutput`)
11. End-to-end stage trace (per-stage leases / workflows / audit events)
12. Stub behaviors (STUB CRM local, STUB Plane local, STUB static/local preview publishing)
13. Role-bleed rules (per plane + per plugin)
14. Implementation handoff (WP-005..WP-013)

Acceptance verification against `WP-004-mvo-contracts.md`:

- [x] No remaining `TBD` placeholders in `CONTRACTS_MVO.md` (verified by absence in the rewritten file; remaining stubs are STUB blocks with behavior + limitation + owner + acceptance criteria + decision/integration links per §11).
- [x] Contracts reference plane boundaries verbatim where helpful (short quote from `ARCHITECTURE_RULES.md` in §0; role-bleed rules in §12 bind to `01-ecosystem-boundaries.mdc`).
- [x] `INTEGRATION_QUEUE.md` review: no new integration uncovered (INT-020..INT-022 fully cover §11 stubs; INT-010..INT-016 cover §6 real planes).
- [x] `DECISIONS.md` review: no new fork uncovered (D-01..D-08 cover every stub and real-plane choice referenced in contracts).
- [x] Audit envelope schema for LiNKbrain finalized (§6.3 fulfilling D-08).
- [x] LinkSkills capability checks defined for all MVO side effects (§7).
- [x] LiNKautowork workflow boundaries (request, run state machine, compensation) defined (§6.4).
- [x] LiNKbot involvement defined as delegating only with forbidden ownership listed (§6.1 + §12.3).
- [x] Kernel vs plugin contract surface split made explicit (§1 + §12.1 + §12.2).

## Blockers

None. All inputs available from WP-001..WP-003 outputs.

## Decisions Needed

None at the contract layer. Downstream packets (WP-005..WP-013) will surface schema-level questions inside their own work packets; those bind to types pinned in WP-005 and need not reopen WP-004.

## Next Recommended Work Packets (parallel implementation)

Per `CONTRACTS_MVO.md` §13:

1. **WP-005** — `packages/linklogic-sdk` type pinning. Architect. **Land first.**
2. **WP-006** — LiNKbrain audit envelope migration + writer (D-08, §6.3). linkbrain-agent + database-architect. **Land first (parallel with WP-005).**
3. **WP-007** — LinkSkills lease lifecycle on `LiNKskills/services/logic-engine`. linkskills-agent. Parallel after WP-005.
4. **WP-008** — LiNKautowork workflow handles `autowork.websitefactory.render` and `autowork.websitefactory.preview_serve` on `LiNKautowork/gateway`. linkautowork-agent. Parallel after WP-005.
5. **WP-009** — LiNKbot reasoning dispatch on `LiNKbot/runtime-adapters/openclaw/bot-runtime`. linkbot-agent. Parallel after WP-005.
6. **WP-010** — LiNKaios kernel: tenant + plugin registry, work_request/run/stage orchestration, manifest loader, approvals surface. linkaios-agent. After WP-006 + WP-007.
7. **WP-011** — WebsiteFactory plugin manifest declaration + stage handler glue. linkaios-agent + linkbot-agent. After WP-010.
8. **WP-012** — Stub backends INT-020/INT-021/INT-022. integration-agent + database-architect. Parallel with WP-010.
9. **WP-013** — End-to-end demo + audit-event assertion harness against §8 and §10. qa-automation-engineer. Last.

Model guidance per `HANDOVER_FROM_CHATGPT.md` §10: Cursor Architect / Opus 4.7 for WP-005 and integration reviews; Codex App for WP-006..WP-012 implementation; Gemini 3 Flash / Kimi K2.5 for draft scaffolding; Antigravity for WP-013 browser/E2E coverage.

## Next Step

Author `WORK_PACKETS/WP-005-linklogic-sdk-types.md` and `WORK_PACKETS/WP-006-linkbrain-audit-envelope.md` before unblocking the parallel wave. Until those work packets exist, no implementation agent should begin coding against §6 contracts.

## WP-005 — LinkLogic SDK contract types (2026-05-14)

**Status:** Complete. Shared MVO contract Zod schemas + inferred types pinned in `packages/linklogic-sdk` and exported from the public entrypoint. Downstream packets WP-007..WP-013 can now import from `@linktrend/linklogic-sdk` instead of redefining cross-plane shapes.

### Files Changed (WP-005)

- `packages/linklogic-sdk/src/contracts-mvo.ts` — NEW. All MVO contract schemas:
  - §1.2 `PlaneSchema`, `FailureModeSchema`, `PluginManifestSchema`, `PluginManifestStageSchema`.
  - §2 `LeadRecordRefSchema`, `RenderSpecSchema` (with `CopyBundleSchema`, `MediaPlanSchema`, `ThemeOverridesSchema`).
  - §3.1 `LeadInputSchema` (RFC5322-lite email, E.164 phone, length caps, `external_ids` key shape).
  - §4 `WorkRequestSchema`, `RunSchema`, `StageSchema`, `RunStatusSchema`, `StageStatusSchema`, `ActorKindSchema`.
  - §5 `FailureReportSchema`, `FailureCodeSchema` (canonical initial code enum).
  - §6.1 `BotReasonRequestSchema` (with `pii_policy: "strip_contact"` literal), `BotReasonResultSchema`, `ReasoningKindSchema`.
  - §6.2 `LeaseRequestSchema`, `LeaseDecisionSchema`, `LeaseExecuteRequestSchema`, `LeaseExecuteResultSchema`, `LeaseDecisionStatusSchema`, `KillSwitchStateSchema`, `LeaseActorKindSchema`.
  - §6.3 `AuditEventSchema`, `AuditEventSubjectSchema` (includes `preview_artifact_ref` per post-WP-004 patch), `AuditWriteResultSchema`, `AuditActorKindSchema`, `AUDIT_ACTIONS` canonical action vocabulary, `schema_version` literal `"1"`.
  - §6.4 `WorkflowInvokeRequestSchema`, `WorkflowInvokeResultSchema`, `WorkflowRunStatusSchema`.
  - §7 `CrmUpsertArgsSchema`/`CrmUpsertResultSchema`, `PlaneProjectCreateArgsSchema`/`PlaneProjectCreateResultSchema`, `PlaneTaskCreateArgsSchema`/`PlaneTaskCreateResultSchema`, `PreviewPublishArgsSchema`/`PreviewPublishResultSchema`.
  - §9 `PreviewOutputSchema`, `PreviewOutputStatusSchema`.
- `packages/linklogic-sdk/src/contracts-mvo.test.ts` — NEW. 31 focused validation tests covering plane/status enums, lead intake field rules, manifest stage shape, failure envelope, audit envelope basics (missing tenant/action/plane rejected; unknown plane rejected; `schema_version` pinned), bot pii_policy literal, lease idempotency requirement, capability arg validation, preview output `plugin_id` literal and nullable refs.
- `packages/linklogic-sdk/src/index.ts` — Added re-exports for all contract schemas and inferred TypeScript types.
- `packages/linklogic-sdk/package.json` — Added `zod ^3.24.4` runtime dependency (already resolved in workspace lockfile via `@linktrend/shared-config`).
- `LiNKdev/product/reports/archive/legacy-ai-swarm/architect.md` — this report.

### Exported Symbols

Schemas: `PlaneSchema`, `FailureModeSchema`, `FailureCodeSchema`, `FailureReportSchema`, `PluginManifestSchema`, `PluginManifestStageSchema`, `LeadInputSchema`, `LeadRecordRefSchema`, `WorkRequestSchema`, `RunSchema`, `StageSchema`, `RunStatusSchema`, `StageStatusSchema`, `ActorKindSchema`, `BotReasonRequestSchema`, `BotReasonResultSchema`, `ReasoningKindSchema`, `LeaseRequestSchema`, `LeaseDecisionSchema`, `LeaseExecuteRequestSchema`, `LeaseExecuteResultSchema`, `LeaseDecisionStatusSchema`, `LeaseActorKindSchema`, `KillSwitchStateSchema`, `AuditEventSchema`, `AuditEventSubjectSchema`, `AuditWriteResultSchema`, `AuditActorKindSchema`, `WorkflowInvokeRequestSchema`, `WorkflowInvokeResultSchema`, `WorkflowRunStatusSchema`, `CopyBundleSchema`, `MediaPlanSchema`, `ThemeOverridesSchema`, `RenderSpecSchema`, `CrmUpsertArgsSchema`, `CrmUpsertResultSchema`, `PlaneProjectCreateArgsSchema`, `PlaneProjectCreateResultSchema`, `PlaneTaskCreateArgsSchema`, `PlaneTaskCreateResultSchema`, `PreviewPublishArgsSchema`, `PreviewPublishResultSchema`, `PreviewOutputSchema`, `PreviewOutputStatusSchema`.

Constants: `AUDIT_ACTIONS`.

Inferred types: same names with the `Schema` suffix dropped (`Plane`, `FailureMode`, `FailureCode`, `FailureReport`, `PluginManifest`, `PluginManifestStage`, `LeadInput`, `LeadRecordRef`, `WorkRequest`, `Run`, `Stage`, `RunStatus`, `StageStatus`, `ActorKind`, `BotReasonRequest`, `BotReasonResult`, `ReasoningKind`, `LeaseRequest`, `LeaseDecision`, `LeaseExecuteRequest`, `LeaseExecuteResult`, `LeaseDecisionStatus`, `LeaseActorKind`, `KillSwitchState`, `AuditEvent`, `AuditEventSubject`, `AuditWriteResult`, `AuditActorKind`, `AuditAction`, `WorkflowInvokeRequest`, `WorkflowInvokeResult`, `WorkflowRunStatus`, `CopyBundle`, `MediaPlan`, `ThemeOverrides`, `RenderSpec`, `CrmUpsertArgs`, `CrmUpsertResult`, `PlaneProjectCreateArgs`, `PlaneProjectCreateResult`, `PlaneTaskCreateArgs`, `PlaneTaskCreateResult`, `PreviewPublishArgs`, `PreviewPublishResult`, `PreviewOutput`, `PreviewOutputStatus`).

### Commands Run

- `pnpm install --filter @linktrend/linklogic-sdk` → resolved 527, 0 added (zod already cached via workspace).
- `pnpm --filter @linktrend/linklogic-sdk typecheck` → clean.
- `pnpm --filter @linktrend/linklogic-sdk test -- contracts-mvo` → 10 files / 58 tests passed; `src/contracts-mvo.test.ts (31 tests) 7ms`.

### Proof

```
Test Files  10 passed (10)
     Tests  58 passed (58)
  Duration  717ms
```

Acceptance criteria verification:

- [x] Names match canonical `CONTRACTS_MVO.md` (e.g. `PluginManifest.stages[].failure_mode`, `LeaseDecision.kill_switch_state`, `AuditEvent.schema_version: "1"`, `PreviewOutput.plugin_id: "websitefactory"`).
- [x] Validation rejects unknown planes (`PlaneSchema` test), unknown run/stage statuses (`RunStatusSchema`/`StageStatusSchema` tests), audit envelope missing `tenant_id`/`action`/`plane` (3 dedicated tests), and missing required fields across `FailureReport`, `Run`, `LeaseRequest`, `WorkflowInvokeRequest`, `PreviewPublishArgs`.
- [x] No service-specific implementation logic introduced — only schemas + inferred types.
- [x] Downstream packets can `import { LeaseRequestSchema, AuditEventSchema, … } from "@linktrend/linklogic-sdk"`.

### Blockers

None.

### Next Step

Hand off to the parallel implementation wave:

- WP-006 (LiNKbrain audit envelope migration + writer) — bind to `AuditEventSchema` / `AuditWriteResultSchema`.
- WP-007 (LinkSkills lease lifecycle) — bind to `LeaseRequestSchema` / `LeaseDecisionSchema` / `LeaseExecuteRequestSchema` / `LeaseExecuteResultSchema` and the four capability arg/result schemas.
- WP-008 (LiNKautowork workflow handles) — bind to `WorkflowInvokeRequestSchema` / `WorkflowInvokeResultSchema` and `RenderSpecSchema`.
- WP-009 (LiNKbot reasoning dispatch) — bind to `BotReasonRequestSchema` / `BotReasonResultSchema`.

No new platform decision was uncovered. `DECISIONS.md` and `INTEGRATION_QUEUE.md` unchanged.

## Post-WP-004 Integrator Update

2026-05-14:

- Patched `LiNKdev/product/grounding/CONTRACTS_MVO.md` to clarify terminal run-event ownership: LiNKaios emits `run.completed` / `run.failed` / `run.cancelled`; LiNKbrain `record_run` persists closure refs and final `audit_event_ids`.
- Added `preview_artifact_ref` to the `AuditEvent.subject` shape because §11.3 requires `preview.published` to reference it.
- Authored implementation work packets:
  - `WP-005-linklogic-sdk-types.md`
  - `WP-006-linkbrain-audit-envelope.md`
  - `WP-007-linkskills-lease-lifecycle.md`
  - `WP-008-linkautowork-websitefactory-workflows.md`
  - `WP-009-linkbot-reasoning-dispatch.md`
  - `WP-010-linkaios-kernel-orchestration.md`
  - `WP-011-websitefactory-plugin-glue.md`
  - `WP-012-mvo-stub-backends.md`
  - `WP-013-e2e-demo-and-audit-harness.md`
- Updated `LiNKdev/product/grounding/AGENT_COORDINATION.md` with the launch waves. First wave is `WP-005` and `WP-006`.
