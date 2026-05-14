# Agent Report: LiNKbrain Agent

## Assigned Work Packet

**WP-006 — LiNKbrain audit envelope and writer.** Implements
`CONTRACTS_MVO.md` §6.3 (envelope) + §3.4 (PII guard) + `DECISIONS.md`
D-08 (standardized audit ledger; per-service ad hoc logging rejected).

## Current Status

Complete. Ready for downstream packets (WP-007, WP-008, WP-009, WP-010,
WP-013) to import `writeBrainAuditEvent` from `@linktrend/linklogic-sdk`
and to emit canonical §6.3.1 actions.

## Files Changed

- `services/migrations/023_linkbrain_audit_envelope.sql` *(new)* —
  creates `linkbrain` schema, `linkbrain.audit_events` append-only table,
  indexes for tenant/plane/action/ts and subject id lookups, RLS that
  blocks UPDATE/DELETE, and `linkbrain.write_audit_event(...)`
  `SECURITY DEFINER` writer with envelope + PII validation, idempotent on
  `event_id`.
- `packages/linklogic-sdk/src/brain-audit.ts` *(new)* — `validateAuditEnvelope`
  (parses via WP-005 `AuditEventSchema`, then enforces §6.3.1 canonical
  action set and §3.4 PII payload-key denylist) and `writeBrainAuditEvent`
  RPC writer returning the canonical `AuditWriteResult` envelope.
- `packages/linklogic-sdk/src/brain-audit.test.ts` *(new)* — 15 focused
  tests for the validator, including PII guard, canonical action coverage,
  uuid/ISO format checks, and full subject id coverage.
- `packages/linklogic-sdk/src/index.ts` — re-exports `validateAuditEnvelope`,
  `writeBrainAuditEvent`, `CANONICAL_AUDIT_ACTIONS`, and
  `AuditEnvelopeRejection`. Envelope/result *types* (`AuditEvent`,
  `AuditWriteResult`, `Plane`, `AuditActorKind`, etc.) remain owned by
  WP-005 (`contracts-mvo.ts`); not redefined here per the packet's allowed-files rule.

## Commands Run

```
pnpm --filter @linktrend/linklogic-sdk test       # 11 files, 73 tests, all pass (incl. 15 new audit envelope tests)
pnpm --filter @linktrend/linklogic-sdk typecheck  # tsc --noEmit clean
```

Migration was not applied to a live database in this packet (out of scope:
deployment / secrets). Schema validation is enforced via the SDK validator
test suite + Postgres CHECK / RLS constraints in the migration. The
migration follows the established pattern in `services/migrations/*.sql`
and will be applied by the `pnpm db:migrate` runner alongside the other
numbered files.

## Tests / Proof

- 15 new tests in `src/brain-audit.test.ts` covering: minimal accept,
  required-field rejection, unknown plane, wrong `schema_version`,
  non-canonical action (`AUDIT_ACTION_UNKNOWN`), bad uuid, non-ISO `ts`,
  PII payload keys (`email`, `phone`, `contact_email`, `contact_phone`,
  `contact`), empty `actor_id`, full §6.3.1 action coverage, and a
  full-subject-id envelope referencing `run_id`, `stage_id`, `lease_id`,
  `workflow_run_id`, `capability`, `plugin_id`, `lead_id`, `preview_url`,
  `preview_artifact_ref`, `crm_record_id`, `project_id`, `task_id`.
- Database-level guard: `audit_events_payload_no_pii` CHECK rejects direct
  inserts that bypass the writer; `audit_events_plane_check`,
  `audit_events_actor_kind_check`, `audit_events_schema_version_check`
  enforce the envelope unions; `RLS` denies UPDATE/DELETE so the ledger is
  append-only.
- `linkbrain.write_audit_event` is idempotent on `event_id` via
  `ON CONFLICT DO NOTHING` + read-back, so a retry from a queued emitter
  produces the original `persisted_at` without a second row.

### Example accepted envelope

```json
{
  "event_id": "11111111-1111-4111-8111-111111111111",
  "ts": "2026-05-14T12:00:00Z",
  "tenant_id": "22222222-2222-4222-8222-222222222222",
  "plane": "linkaios",
  "actor": { "actor_kind": "kernel", "actor_id": "linkaios.kernel" },
  "action": "stage.completed",
  "subject": {
    "run_id": "33333333-3333-4333-8333-333333333333",
    "stage_id": "render_preview",
    "lease_id": "lease_4f2",
    "workflow_run_id": "wf_run_71",
    "preview_url": "https://preview.tenant.linktrend.dev/abc",
    "preview_artifact_ref": "supabase://previews/abc.zip",
    "lead_id": "lead_9c1"
  },
  "refs": { "caused_by_event_id": "00000000-0000-4000-8000-000000000abc" },
  "payload": { "duration_ms": 1843, "template": "agency_v2" },
  "schema_version": "1"
}
```

### Example rejected envelope (PII guard)

```json
{
  "event_id": "...", "ts": "...", "tenant_id": "...",
  "plane": "linkbot", "actor": { "actor_kind": "bot", "actor_id": "websitefactory.copy" },
  "action": "stage.completed",
  "subject": { "run_id": "...", "lead_id": "lead_9c1" },
  "payload": { "contact_email": "ceo@acme.com" },   // ← rejected: AUDIT_ENVELOPE_PII_FORBIDDEN
  "schema_version": "1"
}
```

## Archive reuse note

Adapted (not copied) `Archive/LiNKaios/packages/linkbrain/migrations/0001_init.sql`:

- **Reused patterns:** dedicated LiNKbrain schema, `tenant_id` on every
  row, `SECURITY DEFINER` writer for envelope-validated inserts, RLS to
  block direct mutation, `service_role`-only grants.
- **Did not reuse `lb_shared.audit_runs`:** that table modeled
  *run-level* DPR audit only with positional columns (`run_id`,
  `task_id`, `dpr_id`). The MVO envelope is wider (stage / lease /
  workflow / output / approval) and standardized across planes, so a
  jsonb-based `subject` / `refs` / `payload` shape is required to match
  §6.3 without renaming. Recorded here in lieu of a DECISIONS row
  because no architectural debt is being preserved — the archived table
  predates the cross-plane envelope contract.

## Blockers

None.

## Decisions Needed

None at this packet boundary. Future canonical `action` additions beyond
§6.3.1 MUST land via a `DECISIONS.md` row and an SDK release that updates
`AUDIT_ACTIONS` (`contracts-mvo.ts`); the writer will reject unknown
actions until then with `AUDIT_ACTION_UNKNOWN`.

## Next Step

Hand off to:

- **WP-007 (LinkSkills lease lifecycle):** emit `lease.requested` /
  `lease.granted` / `lease.denied` / `lease.executed` via
  `writeBrainAuditEvent` from inside the lease state machine.
- **WP-008 (LiNKautowork workflows):** emit `workflow.invoked` and the
  terminal `workflow.completed` / `workflow.failed` / `workflow.compensated`
  per §6.4.
- **WP-010 (LiNKaios kernel orchestration):** emit `run.*` and `stage.*`
  transitions; refuse to mark a run `succeeded` without a confirmed
  `*.completed` audit event per §6.3 write semantics.
- **WP-013 (E2E demo harness):** verify the full MVO trace by querying
  `linkbrain.audit_events` for one run end-to-end.

## WP-010 RPC Preflight Note

Per WP-010 Task 6, LiNKaios kernel now implements both RPC paths to LiNKbrain:

1. **Direct path**: `client.schema("linkbrain").rpc("write_audit_event", ...)` — Used by SDK `writeBrainAuditEvent()`
2. **Wrapper path**: `client.rpc("write_brain_audit_event", ...)` in `linkaios_kernel` schema — Safe wrapper that delegates to private `linkbrain.write_audit_event`

The wrapper migration (`026_linkbrain_rpc_wrapper.sql`) provides a runtime-safe fallback if PostgREST does not expose the private `linkbrain` schema directly. The wrapper maintains SECURITY DEFINER delegation and does not expose `linkbrain.audit_events` to clients.

**Verification**: After migrations applied, call `linkaios_kernel.test_brain_rpc_path()` to verify which path is callable at runtime.

**Security preserved**: Both paths use the same SECURITY DEFINER function; the wrapper is a schema-level delegation only, not a privilege escalation.
