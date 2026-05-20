# LEXOS LiNKautowork Workflow Hooks

**Work Packet:** WP-105
**Status:** Implementation Complete
**Date:** 2026-05-17

---

## Overview

This document defines the deterministic LiNKautowork workflow hook contracts for the LEXOS (LiNKtrend Legal Operating System) litigation vertical plugin. These workflows provide deterministic, development-mode execution of litigation-specific operations.

Per `LEXOS_VERTICAL_PLUGIN_CONVERSION_PLAN.md` §4, these workflows map to W0–W11 workflow stages:

| Workflow Handle | Stage | Purpose | Deterministic Outputs |
|-----------------|-------|---------|----------------------|
| `autowork.lexos.evidence_ingest` | W4 | Ingest evidence files, trigger extraction | `evidence_id[]`, `extraction[]`, `processing_status` |
| `autowork.lexos.extraction_run` | W4 | Run extraction pipeline (OCR, parser, QA) | `extraction_id`, `markdown_output`, `json_output` |
| `autowork.lexos.assertion_sync` | W5 | Sync assertion support states | `sync_id`, `assertion_updates[]`, `support_matrix_version` |
| `autowork.lexos.artifact_generate` | W10/W11 | Generate output artifacts | `artifact_id`, `artifact_ref`, `file_format` |
| `autowork.lexos.crm_sync` | W0 | Sync client/matter to mock CRM | `crm_record_id`, `sync_status` |

---

## Architecture

### File Location

```
LiNKautowork/gateway/src/workflows/lexos.ts          # Workflow handlers
LiNKautowork/gateway/src/workflows/lexos.test.ts     # Test suite
LiNKautowork/gateway/src/workflows/index.ts          # Registration
```

### Handler Pattern

All LEXOS workflow handlers follow the pattern from `CONTRACTS_MVO.md` §6.4:

```typescript
export interface WorkflowHandler {
  (request: WorkflowInvokeRequest, context: WorkflowContext): Promise<
    | { outputs: Record<string, unknown>; audit_event_ids: string[] }
    | { failure: { code: string; message: string; retryable: boolean }; audit_event_ids: string[] }
  >;
}
```

### Lease Requirements

Per `.cursor/rules/05-security-cost-and-side-effects.mdc`, all side-effecting workflows **fail closed** when `lease_id` is missing:

| Workflow | Requires Lease | Side Effects |
|----------|-----------------|--------------|
| `evidence_ingest` | Yes | Evidence storage writes |
| `extraction_run` | Yes | Extraction processing, result storage |
| `assertion_sync` | Yes | Database updates (assertion support) |
| `artifact_generate` | Yes | Artifact generation, file storage |
| `crm_sync` | Yes | CRM record writes |

### Development-Only Mode

All LEXOS workflows reject execution in `NODE_ENV=production`. They are development-mode stubs only, per `LEXOS_VERTICAL_PLUGIN_CONVERSION_PLAN.md` §8.1.

---

## Workflow Specifications

### autowork.lexos.evidence_ingest

**Inputs:**
```typescript
{
  tenant_id: string;           // Required
  matter_id: string;           // Required
  client_id: string;           // Required
  files: Array<{
    file_name: string;         // Required
    file_type: string;         // Required
    file_uri: string;          // Required
    file_hash?: string;        // Optional
  }>;
  evidence_labels?: string[];  // Optional
  extraction_required?: boolean; // Default: true
  legal_hold?: boolean;        // Default: false
}
```

**Outputs:**
```typescript
{
  evidence_ids: string[];      // UUID array
  extractions: Array<{
    evidence_id: string;
    extraction_id: string;
    extraction_type: string;
    extraction_quality_status: "accepted" | "qa_flagged" | "failed" | "human_review_required";
    human_review_required: boolean;
  }>;
  processing_status: "uploaded" | "queued" | "processing" | "processed" | "qa_flagged" | "failed" | "requires_human_review";
  ingested_count: number;
  lease_id: string;
}
```

**Failure Modes:**
- `LEASE_REQUEST_INVALID`: Missing lease_id
- `WORKFLOW_STEP_FAILED`: Missing required inputs, empty files array
- `WORKFLOW_STEP_FAILED`: Production mode rejection

**Audit Events:** `workflow.invoked`, `workflow.completed` or `workflow.failed`

---

### autowork.lexos.extraction_run

**Inputs:**
```typescript
{
  evidence_id: string;         // Required
  extraction_types?: string[]; // Default: ["text_document"]
}
```

**Outputs:**
```typescript
{
  extraction_id: string;
  evidence_id: string;
  extraction_complete: boolean;
  quality_flags: string[];
  markdown_output: string;
  json_output: object;
  lease_id: string;
}
```

**Failure Modes:**
- `LEASE_REQUEST_INVALID`: Missing lease_id
- `WORKFLOW_STEP_FAILED`: Evidence not found in store
- `WORKFLOW_STEP_FAILED`: Production mode rejection

**Audit Events:** `workflow.invoked`, `workflow.completed` or `workflow.failed`

---

### autowork.lexos.assertion_sync

**Inputs:**
```typescript
{
  tenant_id: string;           // Required
  matter_id: string;           // Required
  assertion_ids?: string[];    // Optional (creates mock if empty)
  evidence_ids?: string[];     // Optional
}
```

**Outputs:**
```typescript
{
  sync_id: string;
  assertion_updates: Array<{
    assertion_id: string;
    support_state: "supported" | "partially_supported" | "unsupported" | "contradicted";
    supporting_evidence: string[];
    confidence: number;
  }>;
  support_matrix_version: string;
  updated_count: number;
  lease_id: string;
}
```

**Failure Modes:**
- `LEASE_REQUEST_INVALID`: Missing lease_id
- `WORKFLOW_STEP_FAILED`: Missing required inputs
- `WORKFLOW_STEP_FAILED`: Production mode rejection

**Audit Events:** `workflow.invoked`, `workflow.completed` or `workflow.failed`

---

### autowork.lexos.artifact_generate

**Inputs:**
```typescript
{
  tenant_id: string;           // Required
  matter_id: string;           // Required
  artifact_type: string;       // Required (e.g., "legal_brief")
  output_format?: "pdf" | "docx" | "markdown" | "html"; // Default: "pdf"
}
```

**Outputs:**
```typescript
{
  artifact_id: string;
  artifact_ref: string;        // Format: lexos_artifact:{tenant}:{matter}:{type}:{id}
  artifact_type: string;
  artifact_version: string;
  file_format: "pdf" | "docx" | "markdown" | "html";
  file_size_bytes: number;
  caveat_preservation_check: {
    caveats_preserved: boolean;
    missing_caveats: string[];
  };
  lease_id: string;
}
```

**File Sizes (Development Stub):**
| Format | Size |
|--------|------|
| pdf | 245760 bytes (240KB) |
| docx | 131072 bytes (128KB) |
| html | 65536 bytes (64KB) |
| markdown | 32768 bytes (32KB) |

**Failure Modes:**
- `LEASE_REQUEST_INVALID`: Missing lease_id
- `WORKFLOW_STEP_FAILED`: Missing required inputs
- `WORKFLOW_STEP_FAILED`: Invalid output_format
- `WORKFLOW_STEP_FAILED`: Production mode rejection

**Audit Events:** `workflow.invoked`, `workflow.completed` or `workflow.failed`

---

### autowork.lexos.crm_sync

**Inputs:**
```typescript
{
  tenant_id: string;           // Required
  client_id: string;           // Required
  matter_id?: string;          // Optional
  sync_type?: "client_only" | "client_matter" | "matter_only"; // Default: "client_matter"
}
```

**Outputs:**
```typescript
{
  crm_record_id: string;       // Format: lexos_crm:{tenant}:{client}
  client_id: string;
  matter_id: string | null;
  sync_status: "synced" | "pending" | "failed";
  sync_type: string;
  synced_at: string;
  lease_id: string;
}
```

**Failure Modes:**
- `LEASE_REQUEST_INVALID`: Missing lease_id
- `WORKFLOW_STEP_FAILED`: Missing required inputs
- `WORKFLOW_STEP_FAILED`: Production mode rejection

**Audit Events:** `workflow.invoked`, `workflow.completed` or `workflow.failed`

---

## Registration

Workflows are registered via `bootstrapLexosWorkflows()` in `LiNKautowork/gateway/src/workflows/index.ts`:

```typescript
import { bootstrapLexosWorkflows } from "./workflows/index.js";

// In your bootstrap code:
bootstrapLexosWorkflows({
  writeAuditEvent: async (event) => {
    // Write to LiNKbrain
    return { event_id: event.event_id };
  },
});
```

Or use `bootstrapAllWorkflows()` to register both LinkSites and LEXOS workflows:

```typescript
import { bootstrapAllWorkflows } from "./workflows/index.js";

bootstrapAllWorkflows({
  writeAuditEvent: async (event) => { /* ... */ },
  preview_route_prefix: "/preview",
});
```

---

## Testing

Run the test suite:

```bash
cd LiNKautowork/gateway
npm test -- src/workflows/lexos.test.ts
```

### Test Coverage

| Test Category | Description |
|---------------|-------------|
| Success Paths | All 5 workflows with valid inputs and lease_id |
| Lease Failures | Missing lease_id rejection (fail-closed) |
| Input Validation | Missing required fields rejection |
| Production Mode | NODE_ENV=production rejection |
| Edge Cases | Empty arrays, optional fields, format variations |
| Store Verification | State persistence and retrieval |

---

## Handoff Expectations

### To LinkBot Roles

LEXOS workflow outputs feed into LinkBot role inputs per `LEXOS_VERTICAL_PLUGIN_CONVERSION_PLAN.md` §2:

| Workflow Output | Consumer Role |
|-----------------|---------------|
| `evidence_ids`, `extractions` | `lexos_evidence_archivist` |
| `assertion_updates` | `lexos_analyst` |
| `artifact_ref` | `lexos_rhetorician` |
| `crm_record_id` | `lexos_intake_agent` |

### To LiNKbrain

All workflows emit audit events via the `AuditEmitter` interface:
- `workflow.invoked` — At start
- `workflow.completed` — On success
- `workflow.failed` — On failure

Event references are returned in `audit_event_ids` array.

### To LinkSkills

All side-effecting workflows require a `lease_id` from LinkSkills. The lease is validated but not consumed (idempotency is handled by `workflow-runner.ts`).

---

## Non-Goals (Explicit)

Per `LEXOS_VERTICAL_PLUGIN_CONVERSION_PLAN.md` §9:

1. No real legal research API calls (shadow mode only)
2. No court filing or production document submission
3. No real CRM writes (mock only)
4. No real Plane project/task creation (mock only)
5. No live external provider calls

---

## References

- `LEXOS_VERTICAL_PLUGIN_CONVERSION_PLAN.md` — Overall LEXOS plugin architecture
- `packages/linklogic-sdk/src/lexos-contracts.ts` — Type definitions
- `CONTRACTS_MVO.md` §6.4 — LiNKautowork workflow contract
- `.cursor/rules/05-security-cost-and-side-effects.mdc` — Side-effect governance

---

*Document version: 1.0.0-mvo*
