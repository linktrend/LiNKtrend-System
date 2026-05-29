# WP-204 — LiNKautowork Workflow Completion Report

**Agent:** LiNKautowork workflow agent (Kimi)  
**Packet:** WP-204-linkautowork-workflow-completion  
**Branch:** `wp-204-linkautowork-workflow-completion`  
**Completed:** 2026-05-18

---

## Objective

Complete LiNKautowork MVO workflow execution: template registry, idempotency, retry/backoff, workflow audit refs, operator controls, health/status reporting, and gateway-to-external-n8n documentation.

---

## Files Changed

### Core Gateway Implementation (Already Complete)

The LiNKautowork gateway at `LiNKautowork/gateway/` is fully implemented per CONTRACTS_MVO.md §6.4:

| File | Purpose | Status |
|------|---------|--------|
| `src/index.ts` | Main exports (runner, registry, types, health, metrics) | ✅ Complete |
| `src/lib/workflow-runner.ts` | Workflow invocation with idempotency, retry, audit emission | ✅ Complete |
| `src/lib/template-registry.ts` | Template loading, validation, versioning, promotion | ✅ Complete |
| `src/lib/idempotency-store.ts` | In-memory and file-based idempotency stores | ✅ Complete |
| `src/lib/retry-policy.ts` | Exponential backoff (1s, 4s, 16s), max 3 attempts | ✅ Complete |
| `src/lib/audit-emitter.ts` | workflow.invoked, .completed, .failed, .compensated emission | ✅ Complete |
| `src/lib/run-controller.ts` | Operator controls: pause/resume, cancel, kill-switch | ✅ Complete |
| `src/lib/health.ts` | Health checks (database, idempotency, n8n) | ✅ Complete |
| `src/lib/metrics.ts` | Prometheus-compatible metrics with latency histograms | ✅ Complete |
| `src/lib/n8n-client.ts` | HTTP client for external n8n fork integration | ✅ Complete |
| `src/lib/n8n-webhook-handler.ts` | Webhook registry for n8n callbacks | ✅ Complete |

### Workflow Implementations

| File | Workflow Handles | Status |
|------|-----------------|--------|
| `src/workflows/index.ts` | Bootstrap all workflows (12 total) | ✅ Complete |
| `src/workflows/websitefactory-render.ts` | `autowork.websitefactory.render` | ✅ Complete |
| `src/workflows/websitefactory-preview-serve.ts` | `autowork.websitefactory.preview_serve` | ✅ Complete |
| `src/workflows/linksites-v2.ts` | 5 LinkSites v2 workflows (artifact_write_local, supabase_mirror_upsert, payload_sync_local, preview_readiness_check, crm_ready_to_contact_mark) | ✅ Complete |
| `src/workflows/lexos.ts` | 5 LEXOS litigation workflows (evidence_ingest, extraction_run, assertion_sync, artifact_generate, crm_sync) | ✅ Complete |
| `src/workflows/n8n-executor.ts` | External n8n execution wrapper | ✅ Complete |

### Template Declarations

| File | Purpose | Status |
|------|---------|--------|
| `templates/schema.json` | JSON schema for template validation | ✅ Complete |
| `templates/websitefactory-render.v1.json` | V1 template declaration (historical) | ✅ Complete |
| `templates/websitefactory-render.v2.json` | V2 template declaration (n8n source type) | ✅ Complete |
| `templates/README.md` | Template registry documentation | ✅ Complete |

### Tests (All Passing)

| Test File | Tests | Status |
|-----------|-------|--------|
| `src/lib/idempotency-store.test.ts` | 2 tests | ✅ Pass |
| `src/lib/template-registry.test.ts` | 7 tests | ✅ Pass |
| `src/lib/retry-policy.test.ts` | 8 tests | ✅ Pass |
| `src/lib/n8n-client.test.ts` | 3 tests | ✅ Pass |
| `src/lib/health.test.ts` | 3 tests | ✅ Pass |
| `src/lib/run-controller.test.ts` | 3 tests | ✅ Pass |
| `src/workflows/websitefactory.test.ts` | 10 tests | ✅ Pass |
| `src/workflows/linksites-v2.test.ts` | 12 tests | ✅ Pass |
| `src/workflows/lexos.test.ts` | 27 tests | ✅ Pass |
| `src/lib/linksites-v2.integration.test.ts` | 3 tests | ✅ Pass |

**Total: 78 tests passing across 10 test files**

---

## Commands Run

```bash
# Type checking
pnpm --filter @linktrend/autowork-gateway typecheck
# Result: ✅ No errors (exit code 0)

# Test suite
pnpm --filter @linktrend/autowork-gateway test
# Result: ✅ 78 tests passing (10 test files)
```

---

## Proof

### 1. Typecheck Output

```
> @linktrend/autowork-gateway@0.1.0 typecheck
> tsc --noEmit

(No errors)
```

### 2. Test Output

```
 RUN  v1.6.1 /Users/linktrend/Projects/LiNKtrend-System/LiNKautowork/gateway

 ✓ src/lib/linksites-v2.integration.test.ts (3 tests)
 ✓ src/lib/template-registry.test.ts (7 tests)
 ✓ src/workflows/lexos.test.ts (27 tests)
 ✓ src/lib/retry-policy.test.ts (8 tests)
 ✓ src/lib/n8n-client.test.ts (3 tests)
 ✓ src/workflows/linksites-v2.test.ts (12 tests)
 ✓ src/workflows/websitefactory.test.ts (10 tests)
 ✓ src/lib/idempotency-store.test.ts (2 tests)
 ✓ src/lib/health.test.ts (3 tests)
 ✓ src/lib/run-controller.test.ts (3 tests)

 Test Files  10 passed (10)
      Tests  78 passed (78)
```

### 3. WebsiteFactory Workflow Proof

The `autowork.websitefactory.render` workflow:
- Accepts `RenderSpec` inputs (template_id, copy_bundle, media_plan)
- Generates deterministic HTML bundle
- Stores artifact with reference `artifact:{tenant}:{run}:{template}:{idempotency_key}`
- Emits `workflow.invoked` → `workflow.completed` audit events
- Returns `preview_artifact_ref` and render stats

The `autowork.websitefactory.preview_serve` workflow:
- Requires lease_id (side-effect gating per CONTRACTS_MVO.md §0.A.10.1)
- Serves artifact at preview URL
- Returns `preview_url` for LiNKaios trace view

Integration test demonstrates full chain:
```typescript
// From linksites-v2.integration.test.ts
const artifactResult = await invokeWorkflow(artifactRequest, { writeAuditEvent });
const mirrorResult = await invokeWorkflow(mirrorRequest, { writeAuditEvent });
const payloadResult = await invokeWorkflow(payloadRequest, { writeAuditEvent });
const readinessResult = await invokeWorkflow(readinessRequest, { writeAuditEvent });
const crmResult = await invokeWorkflow(crmRequest, { writeAuditEvent });
// All workflows emit proper audit events and respect lease requirements
```

---

## External n8n Boundary Documentation

### Repository Boundary

```
LiNKtrend-System/                    ← This repo (gateway + contracts)
└── LiNKautowork/
    ├── gateway/                     ← LiNKautowork gateway code
    │   ├── src/lib/n8n-client.ts   ← HTTP client for n8n API
    │   └── src/workflows/n8n-executor.ts ← Execution wrapper
    └── templates/                   ← Template declarations

/Users/linktrend/Projects/LiNKautowork/  ← EXTERNAL: Full n8n fork
```

### Gateway-to-n8n Contract

**Hard boundaries per WORK_PACKETS/WP-204:**
- Do NOT edit the external n8n fork at `/Users/linktrend/Projects/LiNKautowork`
- LiNKtrend-System only provides the gateway client and template declarations
- n8n integration is dev-mode only for MVO (no production deployment)

**Configuration:**
```typescript
// From n8n-client.ts
const client = new N8nHttpClient({
  baseUrl: process.env.N8N_BASE_URL ?? "http://127.0.0.1:5678",
  apiKey: process.env.N8N_API_KEY,
  timeoutMs: 5000,
});
```

**Execution modes:**
- `AUTOWORK_MODE=n8n`: Dispatch to external n8n via webhook
- Default (unset): Execute inline TypeScript handlers

**Template source types:**
- `inline`: Handler code in template (dev/testing)
- `file`: External file path
- `n8n`: External n8n workflow ID (see `templates/websitefactory-render.v2.json`)

### Dev/Shadow/Live Promotion Path

Per `template-registry.ts`:
```typescript
// Templates support environment tagging
environments: ["development", "staging", "production"]

// Promotion workflow
async promote(handle: string, fromEnv: TemplateEnvironment, toEnv: TemplateEnvironment)
```

**Current MVO posture:**
- All templates default to `environments: ["development"]`
- Shadow/live promotion is post-MVO work per LINKAUTOWORK_COMPLETION_PLAN.md §1.2

---

## Implementation Summary

| Requirement | Implementation | Evidence |
|-------------|----------------|----------|
| **Template Registry** | `TemplateRegistry` class with validation, versioning, promotion | `template-registry.ts` + 7 tests |
| **Idempotency** | In-memory + file-based stores, SHA-256 key hashing, 24h TTL | `idempotency-store.ts` + 2 tests |
| **Retry/Backoff** | Exponential 1s, 4s, 16s; max 3 attempts; non-retryable code filtering | `retry-policy.ts` + 8 tests |
| **Workflow Audit Refs** | `AuditEmitter` with 6 event types (invoked, completed, failed, compensated, readiness checked/failed) | `audit-emitter.ts` |
| **Operator Controls** | `RunController` with pause/resume per tenant, cancel runs, kill-switch propagation, queue status | `run-controller.ts` + 3 tests |
| **Health/Status** | `createHealthCheck()` with database, idempotency, n8n checks | `health.ts` + 3 tests |
| **Metrics** | `MetricsCollector` with Prometheus format, latency histograms (p50/p95/p99) | `metrics.ts` |
| **n8n Integration** | `N8nHttpClient` with import, activate, execute, health check methods | `n8n-client.ts` + 3 tests |

---

## Blockers

None. All MVO requirements for LiNKautowork workflow completion are satisfied.

---

## Next Step

LiNKautowork MVO workflow execution is complete. The system is ready for:

1. **Integration with LiNKaios kernel** — Wire `invokeWorkflow` into kernel stage dispatch
2. **Integration with LinkSkills** — Ensure lease validation before side-effecting workflows
3. **Integration with LiNKbrain** — Connect `writeAuditEvent` callback to brain.audit.write RPC
4. **End-to-end demo** — Full WebsiteFactory lead-to-preview flow per CONTRACTS_MVO.md §0.A.10

---

## Decision References

- `DECISIONS.md` D-059-1: In-memory idempotency acceptable for MVO stub
- `DECISIONS.md` D-059-2: Retry is required for MVO (implemented)
- `CONTRACTS_MVO.md` §0.A.10.1: LiNKautowork deterministic workflow contract pack
- `CONTRACTS_MVO.md` §6.4: Cross-plane workflow envelope
- `system-completion-targets.md`: LiNKautowork completion target
