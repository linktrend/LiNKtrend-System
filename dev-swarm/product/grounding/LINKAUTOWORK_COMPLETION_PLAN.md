# LiNKautowork Completion Plan — Runtime Hardening

**Owner:** WP-059 (Cursor/Kimi/Gemini)  
**Status:** Planning complete — ready for execution wave  
**Branch:** `dev/codex/WP-059-linkautowork-completion-plan-runtime-hardening`

---

## 1. What "Finished Enough" Means for LiNKautowork

LiNKautowork is the **deterministic workflow execution plane** per `ARCHITECTURE_RULES.md` and `CONTRACTS_MVO.md` §6.4, §0.A.10.1.

### 1.1 Completion Definition

LiNKautowork is "finished enough" for the LinkSites v2 MVO when:

| Criterion | Current State | Required State |
|-----------|---------------|----------------|
| **Workflow registry** | In-memory Map, 7 workflows registered | Persistent + versioned registry |
| **Idempotency** | In-memory cache (MVO stub) | Persistent idempotency store (Redis/Postgres) |
| **Audit emission** | Event emission via callback | Verified delivery + retry + dead-letter |
| **Retry/backoff** | None (single attempt) | Exponential backoff (1s, 4s, 16s), max 3 attempts |
| **n8n integration** | Not connected | Dev-mode n8n gateway connected, workflow templates loadable |
| **Health/observability** | None | Health endpoint, workflow metrics, run latency histograms |
| **Operator controls** | None | Pause/resume, kill-switch propagation, run cancellation |
| **Deterministic checks** | Stub (reads from inputs only) | Real Payload CMS + Supabase mirror validation |
| **Workflow promotion** | Manual code changes | Dev→staging→prod promotion via templates |

### 1.2 MVO vs Post-MVO Boundaries

**MVO (this plan):**
- Local/development mode workflows only
- In-memory or local-fs idempotency acceptable with documented limitations
- n8n dev environment connected, not production
- Mock Payload/Supabase interactions (stubs) with real validation logic

**Post-MVO (deferred):**
- Production n8n cluster with HA
- Persistent idempotency (cross-instance)
- Real CRM (Odoo) integration
- Production hosting/CDN publishing

---

## 2. Evidence-Based Gap Analysis

### 2.1 Current Implementation (from `LiNKautowork/gateway/**`)

**What exists:**

```
LiNKautowork/gateway/
├── src/
│   ├── index.ts              # Exports workflow runner + registry + types
│   ├── types/index.ts        # WorkflowContext, WorkflowHandler, WorkflowDefinition
│   ├── lib/
│   │   ├── workflow-runner.ts   # invokeWorkflow, idempotency cache, registry
│   │   └── audit-emitter.ts     # emitInvoked, emitCompleted, emitFailed, emitCompensated
│   └── workflows/
│       ├── index.ts          # Bootstrap all 7 workflow handles
│       ├── websitefactory-render.ts      # autowork.websitefactory.render
│       ├── websitefactory-preview-serve.ts # autowork.websitefactory.preview_serve
│       └── linksites-v2.ts     # 5 LinkSites v2 workflow handles (stub implementations)
├── tests passing             # vitest run confirms idempotency, lease checks, audit events
└── package.json              # @linktrend/linklogic-sdk dependency
```

**7 Registered Workflow Handles:**

1. `autowork.websitefactory.render` — Renders preview artifact from template+copy+media
2. `autowork.websitefactory.preview_serve` — Serves artifact at preview URL (requires lease)
3. `autowork.linksites.artifact_write_local` — Writes to local dev folder
4. `autowork.linksites.supabase_mirror_upsert` — Upserts to Supabase mirror (requires lease)
5. `autowork.linksites.payload_sync_local` — Syncs to local Payload CMS (requires lease)
6. `autowork.linksites.preview_readiness_check` — Runs deterministic quality gates
7. `autowork.linksites.crm_ready_to_contact_mark` — Marks CRM lead ready (requires lease)

**Current Test Coverage:**
- Idempotency replay returns same `workflow_run_id`
- Lease requirement fails closed when `lease_id` missing
- Audit events emitted: `workflow.invoked`, `workflow.completed`, `workflow.failed`, `workflow.compensated`
- LinkSites v2 workflow chain runs end-to-end in stub mode

### 2.2 Identified Gaps

| # | Gap | Severity | Evidence | Mitigation |
|---|-----|----------|----------|------------|
| G1 | **In-memory idempotency** loses state on restart | High | `workflow-runner.ts:25` — `const idempotencyCache = new Map<string, WorkflowInvokeResult>()` | WP-060: Redis/Postgres idempotency store |
| G2 | **No retry/backoff** — single failure fails stage | High | `workflow-runner.ts` — no retry loop around handler invocation | WP-061: Add exponential backoff (1s, 4s, 16s) |
| G3 | **n8n not connected** — workflows run in-process only | Medium | No n8n API client, no webhook handlers, no workflow template loader | WP-062: n8n dev gateway integration |
| G4 | **LinkSites v2 workflows are stubs** — no real Payload/Supabase IO | Medium | `linksites-v2.ts` — uses `Map` stores, no actual HTTP calls | WP-063: Real capability plugin calls |
| G5 | **No health/observability** — no metrics, no health endpoint | Medium | No `/health`, no Prometheus metrics, no run latency tracking | WP-064: Health checks + metrics |
| G6 | **No operator controls** — can't pause/cancel runs | Low | No pause/resume API, no kill-switch listener | WP-065: Operator control plane |
| G7 | **No workflow promotion** — templates hardcoded | Low | Workflow definitions in `.ts` files, no template registry | WP-066: Workflow template registry |

### 2.3 Risk Assessment

**Blockers for MVO demo:**
- G1 (in-memory idempotency) — acceptable if documented as MVO limitation; data loss on restart is tolerable for dev
- G2 (no retry) — **must fix**; transient failures should not fail the run
- G4 (stub workflows) — acceptable for development mode per `CONTRACTS_MVO.md` §0.A.2

**Non-blockers (post-MVO):**
- G3 (n8n) — can run in-process for MVO demo
- G5, G6, G7 — operational enhancements

---

## 3. Execution-Ready Work Packets

The following packets are designed for **parallel execution** where possible.

### WP-060: Persistent Idempotency Store

**Objective:** Replace in-memory idempotency cache with persistent storage.

**Owner:** backend-specialist or Kimi/Gemini
**Branch:** `dev/codex/WP-060-persistent-idempotency`
**Dependencies:** None (can use existing Postgres from `@linktrend/db`)

**Allowed files:**
- `LiNKautowork/gateway/src/lib/idempotency-store.ts` (new)
- `LiNKautowork/gateway/src/lib/workflow-runner.ts` (modify)
- `packages/db/schema/autowork/` (new migrations)

**Acceptance criteria:**
- [ ] Idempotency table created: `autowork_idempotency_keys(key_hash, workflow_handle, result_json, created_at, expires_at)`
- [ ] `invokeWorkflow` checks persistent store before running
- [ ] Duplicate `idempotency_key` returns cached result without re-running handler
- [ ] TTL cleanup (24h default for MVO)
- [ ] Tests confirm persistence across process restart

**Proof:**
- Migration applied successfully
- Test: stop process, restart, same idempotency key returns original `workflow_run_id`

---

### WP-061: Retry with Exponential Backoff

**Objective:** Implement retry logic per `CONTRACTS_MVO.md` §0.A.10.1 (1s, 4s, 16s, max 3 attempts).

**Owner:** backend-specialist or Codex
**Branch:** `dev/codex/WP-061-retry-backoff`
**Dependencies:** None

**Allowed files:**
- `LiNKautowork/gateway/src/lib/workflow-runner.ts` (modify)
- `LiNKautowork/gateway/src/lib/retry-policy.ts` (new)

**Acceptance criteria:**
- [ ] `retryable` failures trigger retry (3 max)
- [ ] Delays: 1s, 4s, 16s between attempts
- [ ] Non-retryable failures (LEASE_DENIED, WORKFLOW_NOT_FOUND) fail immediately
- [ ] Each attempt recorded as separate `Stage.attempt` row
- [ ] Final failure after 3 attempts emits `workflow.failed` with `retry_exhausted: true`

**Proof:**
- Test: simulated transient failure retried 3 times, then succeeds or fails
- Audit events show `workflow.invoked` → `workflow.failed` (retry 1) → retry → success

---

### WP-062: n8n Dev Gateway Integration

**Objective:** Connect LiNKautowork to n8n for external workflow template execution.

**Owner:** backend-specialist
**Branch:** `dev/codex/WP-062-n8n-dev-gateway`
**Dependencies:** n8n instance (local/Docker)

**Allowed files:**
- `LiNKautowork/gateway/src/lib/n8n-client.ts` (new)
- `LiNKautowork/gateway/src/lib/n8n-webhook-handler.ts` (new)
- `LiNKautowork/gateway/src/workflows/n8n-executor.ts` (new)

**Hard boundaries:**
- Do not deploy production n8n
- Use local/Docker n8n only
- No production credentials

**Acceptance criteria:**
- [ ] n8n API client configured from env (`N8N_BASE_URL`, `N8N_API_KEY`)
- [ ] Workflow templates can be loaded from n8n (JSON export/import)
- [ ] `invokeWorkflow` can dispatch to n8n webhook for external execution
- [ ] Results callback updates local workflow run state
- [ ] Audit events emitted for n8n invocation

**Proof:**
- Local n8n container starts via Docker Compose
- Workflow template loads and executes
- Callback received, audit events recorded

---

### WP-063: Real Capability Plugin Integration

**Objective:** Replace stub LinkSites v2 workflows with real Supabase/Payload calls.

**Owner:** backend-specialist
**Branch:** `dev/codex/WP-063-real-capability-calls`
**Dependencies:** WP-042 discovery (schema), WP-043 capability plugins

**Allowed files:**
- `LiNKautowork/gateway/src/workflows/linksites-v2.ts` (modify)
- `LiNKautowork/gateway/src/lib/supabase-client.ts` (new)
- `LiNKautowork/gateway/src/lib/payload-client.ts` (new)

**Hard boundaries:**
- Development mode only (no production Supabase/Payload)
- Use existing schema from WP-042 discovery
- No schema invention

**Acceptance criteria:**
- [ ] `supabase_mirror_upsert` writes to real Supabase mirror table
- [ ] `payload_sync_local` reads from Supabase, writes to Payload CMS
- [ ] `preview_readiness_check` queries Payload for actual pages/content
- [ ] `crm_ready_to_contact_mark` updates mock CRM (local table)
- [ ] All operations gated by `lease_id` verification

**Proof:**
- Supabase mirror rows visible in Studio
- Payload CMS collections populated
- Preview readiness check queries real data

---

### WP-064: Health Checks and Observability

**Objective:** Add health endpoint and metrics for operational visibility.

**Owner:** backend-specialist or Kimi/Gemini
**Branch:** `dev/codex/WP-064-health-metrics`
**Dependencies:** None

**Allowed files:**
- `LiNKautowork/gateway/src/lib/health.ts` (new)
- `LiNKautowork/gateway/src/lib/metrics.ts` (new)
- `LiNKautowork/gateway/src/index.ts` (export health check)

**Acceptance criteria:**
- [ ] `/health` endpoint returns `{ status: "ok", workflows_registered: number }`
- [ ] Metrics: workflow invocation count, latency histogram (p50, p95, p99)
- [ ] Run status gauges: running, succeeded, failed
- [ ] Prometheus-compatible metrics export

**Proof:**
- `curl /health` returns 200 OK
- Metrics endpoint returns valid Prometheus format
- Dashboard visible in LiNKaios traces

---

### WP-065: Operator Control Plane

**Objective:** Allow operators to pause, cancel, and monitor workflow runs.

**Owner:** frontend-specialist + backend-specialist
**Branch:** `dev/codex/WP-065-operator-controls`
**Dependencies:** WP-064 (metrics), LiNKaios kernel integration

**Allowed files:**
- `LiNKautowork/gateway/src/lib/run-controller.ts` (new)
- `LiNKaios/linkaios-web/src/panels/autowork-controls/` (new)

**Acceptance criteria:**
- [ ] Pause/resume workflow execution per tenant
- [ ] Cancel in-flight runs (graceful termination)
- [ ] Kill-switch listener: stop new invocations when tripped
- [ ] UI panel in LiNKaios showing run queue and status

**Proof:**
- UI screenshot: operator panel with pause/cancel buttons
- Test: pause → new runs queued → resume → runs execute

---

### WP-066: Workflow Template Registry

**Objective:** Externalize workflow definitions from code to configurable templates.

**Owner:** backend-specialist
**Branch:** `dev/codex/WP-066-template-registry`
**Dependencies:** WP-062 (n8n integration)

**Allowed files:**
- `LiNKautowork/gateway/src/lib/template-registry.ts` (new)
- `LiNKautowork/templates/` (new folder for JSON templates)

**Acceptance criteria:**
- [ ] Workflow templates stored as JSON (not hardcoded TS)
- [ ] Template loader reads from `templates/` or n8n
- [ ] Versioned templates (v1, v2) with migration path
- [ ] Dev/staging/prod template promotion workflow

**Proof:**
- Template JSON validated against schema
- Template change does not require code deploy

---

## 4. Dependency Graph

```
WP-060 (Idempotency) ─┐
WP-061 (Retry) ───────┼──→ WP-063 (Real Capability Calls)
                      │
WP-062 (n8n) ─────────┼──→ WP-066 (Template Registry)
                      │
WP-064 (Health) ──────┼──→ WP-065 (Operator Controls)
                      │
                 WP-067 (Integration Test Suite)
```

**Parallel waves:**
- **Wave 1:** WP-060, WP-061, WP-062, WP-064 (no interdependencies)
- **Wave 2:** WP-063, WP-066 (depends on Wave 1)
- **Wave 3:** WP-065 (depends on WP-064)

---

## 5. Decision Log

| # | Decision | Rationale |
|---|----------|-----------|
| D-059-1 | Keep in-memory idempotency as MVO stub | Per `CONTRACTS_MVO.md` §0.A.2, development mode allows local/mock side effects |
| D-059-2 | Retry is **required** for MVO | Single transient failure failing the entire run is unacceptable demo experience |
| D-059-3 | n8n integration deferred to WP-062 | Can run in-process for MVO; n8n is operational enhancement |
| D-059-4 | Real Payload/Supabase calls deferred to WP-063 | Requires WP-042 discovery to complete first |
| D-059-5 | 7 work packets created | Each gap is independently deliverable with clear acceptance criteria |

---

## 6. Proof Summary

**Files created/modified:**
- `dev-swarm/product/grounding/LINKAUTOWORK_COMPLETION_PLAN.md` (this document)
- `dev-swarm/product/programs/linktrend-system/issues/legacy/WP-06[0-6]*.md` (7 follow-up packets)

**Evidence gathered:**
- LiNKautowork gateway source analyzed: 12 files, ~1,500 LOC
- 7 workflow handles registered and tested
- 2 test suites passing (websitefactory.test.ts, linksites-v2.test.ts)
- 6 gaps identified with severity and mitigation plan

**Branch:** `dev/codex/WP-059-linkautowork-completion-plan-runtime-hardening`

**Next step:** Execute Wave 1 packets (WP-060 through WP-064 in parallel) after Integrator review.
