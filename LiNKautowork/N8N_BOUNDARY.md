# LiNKautowork / n8n Boundary Documentation

> **Status:** WP-217 - MVO Development Mode Boundary Definition

## Overview

LiNKautowork is the deterministic workflow execution plane. The external n8n fork lives at `/Users/linktrend/Projects/LiNKautowork` and provides workflow template execution capabilities.

This document defines the boundary, current posture, and MVO limitations.

## Architecture Boundary

```
┌─────────────────────────────────────────────────────────────────┐
│                    LiNKtrend-System                              │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │              LiNKautowork Gateway                          │ │
│  │  - Workflow registry (in-memory + file idempotency)      │ │
│  │  - Retry/backoff policy (exponential: 1s, 4s, 16s)         │ │
│  │  - Idempotency store (memory/file based)                   │ │
│  │  - Audit emitter (LiNKbrain integration)                   │ │
│  │  - Run controller (operator controls)                      │ │
│  │  - Health/metrics                                          │ │
│  │  - Workflow status read model (WP-217)                    │ │
│  └───────────────────────────────────────────────────────────┘ │
│                         │                                       │
│                         │ HTTP / Webhook                        │
│                         ▼                                       │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │              External n8n Fork                             │ │
│  │  (at /Users/linktrend/Projects/LiNKautowork)              │ │
│  │  - Workflow template definitions                         │ │
│  │  - Deterministic step execution                          │ │
│  │  - Template registry (JSON)                              │ │
│  │  - Webhook callbacks to gateway                          │ │
│  └───────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## Current Dev/Shadow/Live Posture (MVO)

### Development Mode (Default)

- **Workflow execution:** In-process TypeScript handlers (no external n8n required)
- **Idempotency:** File-based or in-memory store
- **Retry:** Exponential backoff (1s, 4s, 16s), max 3 attempts
- **Audit:** All events emitted to LiNKbrain
- **Health:** Basic health check endpoint

### Configuration

| Environment Variable | Default | Description |
|---------------------|---------|-------------|
| `AUTOWORK_MODE` | `local` | `local` = in-process, `n8n` = external n8n |
| `AUTOWORK_IDEMPOTENCY_STORE` | `file` | `memory` = in-memory, `file` = JSON file |
| `AUTOWORK_IDEMPOTENCY_FILE_PATH` | `${tmpdir()}/linkautowork-idempotency-store.json` | File store path |
| `N8N_BASE_URL` | `http://127.0.0.1:5678` | n8n API base URL (n8n mode only) |
| `N8N_API_KEY` | - | n8n API key (n8n mode only) |
| `LINKAUTOWORK_SUPABASE_URL` | - | Supabase URL (real capability calls) |
| `LINKAUTOWORK_SUPABASE_SERVICE_ROLE_KEY` | - | Supabase service key |
| `LINKAUTOWORK_PAYLOAD_BASE_URL` | - | Payload CMS base URL |
| `LINKAUTOWORK_PAYLOAD_API_KEY` | - | Payload CMS API key |

### Shadow Mode

Shadow mode validates connectivity and idempotency without production writes:
- Dry-run capability checks (Supabase/Payload connectivity probes)
- Audit events emitted with `payload.mode: "shadow"`
- No actual data written to external systems

### Live Mode

**NOT IMPLEMENTED IN MVO** - Deferred to post-MVO.

Live mode requirements:
- Persistent idempotency store (Redis/Postgres)
- Production n8n cluster with HA
- Real Supabase/Payload/Odoo integration
- Production secret management
- Full audit trail verification

## Idempotency Contract

Per `CONTRACTS_MVO.md` §0.A.10.1:

- Idempotency key format: `${run_id}:${stage_id}:${workflow_handle}`
- Repeat invocation returns original `workflow_run_id` and outputs
- No duplicate side effects
- TTL: 24 hours default (configurable via `ttlHours` parameter)

### Idempotency Store Types

1. **InMemoryIdempotencyStore** - Development/testing only
   - Clears on process restart
   - Thread-safe within single process

2. **FileIdempotencyStore** - MVO default
   - Persists to JSON file
   - Survives process restart
   - Single-process only (no concurrent access)

## Workflow Status Visibility (WP-217)

LiNKaios cockpit can query workflow status via:

```typescript
interface WorkflowStatusQuery {
  byWorkflowRunId(workflowRunId: string): WorkflowRunView | undefined;
  byTenantAndRun(tenantId: string, runId: string): WorkflowRunView[];
  byIdempotencyKey(idempotencyKey: string): WorkflowRunView | undefined;
  listActive(tenantId?: string): WorkflowRunView[];
  listRecent(limit?: number): WorkflowRunView[];
}
```

Status includes:
- `workflow_run_id`, `tenant_id`, `run_id`, `stage_id`
- `status`: pending | running | succeeded | failed | compensated
- `attempt`: retry attempt number
- `idempotency_key`
- `lease_id`: LinkSkills lease reference
- `audit_event_ids`: LiNKbrain event refs
- `retry_exhausted`: boolean flag

## Retry/Backoff Policy

Per `CONTRACTS_MVO.md` §0.A.10.1:

- Max 3 attempts
- Delays: 1s, 4s, 16s (exponential)
- Non-retryable failures fail immediately:
  - `LEASE_DENIED`
  - `WORKFLOW_NOT_FOUND`
  - `LEASE_REQUEST_INVALID` (lease required but missing)
- Each attempt recorded as separate audit event
- Final failure emits `workflow.failed` with `retry_exhausted: true`

## Registered Workflow Handles (MVO)

### WebsiteFactory (v1)
- `autowork.websitefactory.render` - Render preview artifact
- `autowork.websitefactory.preview_serve` - Serve preview at URL

### LinkSites v2
- `autowork.linksites.artifact_write_local` - Write to dev folder
- `autowork.linksites.supabase_mirror_upsert` - Upsert to Supabase (lease required)
- `autowork.linksites.payload_sync_local` - Sync to Payload CMS (lease required)
- `autowork.linksites.preview_readiness_check` - Run quality gates
- `autowork.linksites.crm_ready_to_contact_mark` - Mark CRM ready (lease required)

## Testing

```bash
# Run all tests
pnpm --filter @linktrend/autowork-gateway test

# Specific test suites
pnpm --filter @linktrend/autowork-gateway test -- src/lib/workflow-status.test.ts
pnpm --filter @linktrend/autowork-gateway test -- src/lib/idempotency-store.test.ts
pnpm --filter @linktrend/autowork-gateway test -- src/lib/retry-policy.test.ts
```

## MVO Limitations

1. **In-process execution** - No external n8n required in dev mode
2. **File-based idempotency** - Single process only, no distributed locking
3. **Local-only workflows** - No production hosting/CDN
4. **Mock/shadow integrations** - Real Supabase/Payload optional
5. **No persistent run history** - In-memory status store (resets on restart)

## Post-MVO Roadmap

1. **Persistent idempotency** - Redis/Postgres store
2. **n8n integration** - External workflow execution
3. **Distributed locking** - Multi-instance safe
4. **Persistent status store** - Query historical runs
5. **Live mode** - Production Supabase/Payload/Odoo
6. **Metrics dashboard** - Prometheus/Grafana integration
