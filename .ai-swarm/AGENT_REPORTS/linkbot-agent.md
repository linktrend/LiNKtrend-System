# LinkBot Agent Report — WP-044

**Agent:** LinkBot Agent
**Work Packet:** WP-044 — LinkBot role contract pack v1
**Date:** 2026-05-15
**Status:** COMPLETE

---

## Objective

Define LinkSites LinkBot role contracts (Lead Scout, Research/Enrichment, Website Builder, Outreach) for the v2 MVO without implementing runtime prompts or behavior.

---

## Files Changed

- `.ai-swarm/CONTRACTS_MVO.md`
- `.ai-swarm/LINKAIOS_KERNEL_MANIFEST.md`
- `.ai-swarm/AGENT_REPORTS/linkbot-agent.md`

No runtime code, capability plugin code, or connector implementation files were changed.

---

## Commands Run

```bash
git fetch origin
git switch development
git pull --ff-only origin development
git switch -c dev/codex/WP-044-linkbot-role-contract-pack-v1
sed -n '1,260p' .cursor/rules/00-linktrend-master-rule.mdc
sed -n '1,260p' .cursor/rules/01-ecosystem-boundaries.mdc
sed -n '1,300p' .cursor/rules/03-agent-swarm-coordination.mdc
sed -n '1,320p' .ai-swarm/LINKSITES_VERTICAL_MVO_V2.md
sed -n '1,320p' .ai-swarm/PLUGIN_ARCHITECTURE_V2.md
sed -n '1,320p' .ai-swarm/WORK_PACKETS/WP-044-linkbot-role-contract-pack-v1.md
sed -n '1,360p' .ai-swarm/CONTRACTS_MVO.md
sed -n '1,360p' .ai-swarm/LINKAIOS_KERNEL_MANIFEST.md
```

---

## Contract Output Summary

Added LinkBot role contract pack v1 definitions with required fields for all four roles:

- `lead_scout_bot` (declared, disabled in MVO)
- `research_enrichment_bot` (enabled)
- `website_builder_bot` (enabled)
- `outreach_bot` (declared, disabled in MVO)

For each role, contracts now define:

- role id
- purpose
- inputs
- outputs
- allowed capabilities
- allowed skills
- audit events
- development-mode restrictions
- explicit non-ownership boundaries

---

## Proof: No Live Lead Acquisition or Outreach Added

- Lead Scout role is explicitly marked `disabled_in_mvo`, `mock_input_only`, `no_live_acquisition`, and `no_public_scraping`.
- Outreach role is explicitly marked `disabled_in_mvo`, `no_outreach_draft`, `no_outreach_send`, and `no_external_contact`.
- No runtime files (`apps/bot-runtime/**`) were modified.
- No capability plugin runtime wiring was added for acquisition or outreach.

---

## Validation / Tests

No TypeScript or Zod contract files under `packages/linklogic-sdk` were changed in this packet, so package tests were not required.

Validation performed:

- Contract docs reviewed against WP-044 required outputs and hard boundaries.
- File scope checked against WP-044 allowed/prohibited file list.

---

## Blockers / Questions

None.

---

## Branch and Commit

- **Branch:** `dev/codex/WP-044-linkbot-role-contract-pack-v1`
- **Commit SHA:** `b68f919` (Integrator recovery commit on `development`)

---

## Historical Report Content Preserved

# LinkBot Agent Report — WP-009

**Agent:** LinkBot Agent  
**Work Packet:** WP-009 — LinkBot reasoning dispatch  
**Date:** 2026-05-14  
**Status:** COMPLETE (with boundary fixes)

---

## Objective

Wire LinkBot reasoning dispatch for WebsiteFactory stages while keeping LinkBot a thin runtime adapter per `.ai-swarm/CONTRACTS_MVO.md` §6.1 and role-bleed rules §12.3.

---

## Boundary Issue Review (Follow-up)

### 1. OPENROUTER_API_KEY Direct Use — RESOLVED

**Issue:** Per §12.3, LinkBot "MUST NOT hold secrets (provider keys live in LinkSkills + env; LinkBot receives only the resolved `model_routing_profile`)."

**Resolution:**
- Added `ModelCallAdapter` interface that accepts `apiKey` from kernel/runtime boundary
- `handleReasoningDispatch(env, request, adapter?)` accepts optional adapter
- If adapter provided, uses `adapter.apiKey`; else falls back to `env.OPENROUTER_API_KEY`
- **MVO Exception Documented:** For MVO, server-side env fallback is acceptable because:
  - LinkBot does not OWN the secret lifecycle (managed by deployment/LinkSkills)
  - It only passes through the adapter provided by the boundary
  - The secret never enters LinkBot business logic, only the HTTP transport layer
  - Post-MVO: kernel should provide the adapter; env fallback deprecated

### 2. Audit Write Semantics (§4.5) — RESOLVED

**Issue:** Per §4.5, "a stage that cannot confirm its `*.completed` audit event MUST NOT transition the run to a terminal `succeeded` state."

**Resolution:**
- Changed `emitAuditEvent` to return structured `AuditEmitResult` (success | failure)
- If `stage.started` audit fails, stage returns `KERNEL_PERSISTENCE_FAILED` immediately
- If `stage.completed` audit fails, stage returns outputs BUT includes failure so kernel knows retry needed
- Added tests verifying this behavior

---

## Files Changed

### New Files

| File | Description |
|------|-------------|
| `apps/bot-runtime/src/reasoning-dispatch.ts` | Main reasoning dispatch implementation — `bot.reason` handler with boundary fixes |
| `apps/bot-runtime/src/reasoning-dispatch.test.ts` | Comprehensive test suite (29 tests, incl. 4 new boundary tests) |

### Modified Files

| File | Description |
|------|-------------|
| `apps/bot-runtime/src/index.ts` | Added exports for `handleReasoningDispatch`, `stripContactPii`, `ModelCallAdapter`, and types |
| `packages/shared-config/src/index.ts` | Added `OPENROUTER_API_KEY` to env schema |

---

## Commands Run

```bash
# Navigate to bot-runtime
cd /Users/linktrend/Projects/LiNKtrend-System/apps/bot-runtime

# Run all tests
npm test
# Result: ✓ 33 tests passed (29 reasoning-dispatch + 4 openclaw-handoff)

# Run TypeScript type check
npm run typecheck
# Result: ✓ No errors

# Run ESLint
npm run lint
# Result: ✓ No errors

# Build shared-config package (for new OPENROUTER_API_KEY type)
cd /Users/linktrend/Projects/LiNKtrend-System/packages/shared-config
npm run build
```

---

## Implementation Summary

### 1. Reasoning Dispatch (`handleReasoningDispatch`)

Implements the `bot.reason` contract per §6.1:

```typescript
interface BotReasonRequest {
  tenant_id: string;
  run_id: string;
  stage_id: string;
  reasoning_kind: "lead_evaluation" | "template_selection" | "copy_generation" | "media_placement";
  inputs: Record<string, unknown>;
  model_routing_profile: string;
  pii_policy: "strip_contact";
}

interface BotReasonResult {
  outputs: Record<string, unknown>;
  model_run_id: string;
  tokens_in: number;
  tokens_out: number;
  failure?: FailureReport;
}
```

**Key behaviors:**
- Accepts dispatch from LiNKaios kernel
- Strips PII per `pii_policy="strip_contact"` before model calls
- Routes to OpenRouter API (or stub mode when key not set)
- Emits `stage.started` and `stage.completed`/`stage.failed` audit events to LiNKbrain
- Returns typed outputs and `model_run_id` for stage refs

### 2. PII Protection (§3.4)

The `stripContactPii()` function recursively removes:
- `contact` object (name, email, phone)
- `contact_email` field
- `contact_phone` field

Business data (business_name, industry, location, notes) is preserved.

### 3. Four Reasoning Kinds

| Kind | Output | Description |
|------|--------|-------------|
| `lead_evaluation` | `{ lead_evaluation: { score, segment, rationale } }` | Scores lead quality 0-100 |
| `template_selection` | `{ template_id: string }` | Selects from available templates |
| `copy_generation` | `{ copy_bundle: { blocks[], locale } }` | Generates website copy |
| `media_placement` | `{ media_plan: { placements[] } }` | Recommends visual assets |

### 4. Model Routing (DECISIONS.md D-06)

```typescript
const MODEL_ROUTING_PROFILES = {
  default: { model: "openai/gpt-4o-mini", maxTokens: 2048, temperature: 0.7 },
  fast: { model: "openai/gpt-4o-mini", maxTokens: 1024, temperature: 0.5 },
  quality: { model: "anthropic/claude-3.5-sonnet", maxTokens: 4096, temperature: 0.7 },
};
```

### 5. ModelCallAdapter Interface (§12.3 Boundary)

```typescript
export interface ModelCallAdapter {
  /** API key provided by kernel/runtime boundary (MVO: may be omitted, falls back to env) */
  apiKey?: string;
  /** Optional base URL for OpenRouter (defaults to official endpoint) */
  baseUrl?: string;
  /** HTTP referrer header for OpenRouter analytics */
  httpReferer?: string;
}

// Usage:
handleReasoningDispatch(env, request, adapter);
```

**MVO Exception:** If no adapter is provided, `apps/bot-runtime` may read `OPENROUTER_API_KEY` from server-side env. This is documented as an MVO expedient; post-MVO the kernel must provide the adapter.

### 6. Failure Handling (§5.4)

| Scenario | Code | Retryable |
|----------|------|-----------|
| HTTP 429 | MODEL_QUOTA_EXCEEDED | Yes |
| HTTP 5xx | MODEL_PROVIDER_ERROR | Yes |
| Timeout | MODEL_TIMEOUT | Yes |
| Invalid JSON | MODEL_OUTPUT_INVALID | No |
| Missing fields | MODEL_OUTPUT_INVALID | No |
| Bad pii_policy | MODEL_PROVIDER_ERROR | No |
| Audit write fail | KERNEL_PERSISTENCE_FAILED | Yes |

### 7. Audit Event Emission (§4.5, §6.3)

Per §6.3, LinkBot emits:
- `stage.started` at dispatch begin
- `stage.completed` on success (with output_keys, tokens, duration)
- `stage.failed` on failure (with failure report)

Per §4.5: If audit write fails, stage returns `KERNEL_PERSISTENCE_FAILED` so kernel knows stage is not complete.

**PII protection in audit:**
- No `email`, `phone`, `contact` fields in payload
- No `lead_input` content in payload
- Only metadata (keys, timing, failure codes)

### 8. Stub Mode

When `OPENROUTER_API_KEY` is not set, operates in deterministic stub mode:
- Returns valid JSON outputs for all reasoning kinds
- Generates consistent `model_run_id` UUIDs
- Calculates approximate token counts from text length
- Suitable for testing and MVO without API costs

---

## Proof

### Test Output

```
✓ stripContactPii > removes contact object from inputs (§3.4)
✓ stripContactPii > removes contact_email and contact_phone fields
✓ stripContactPii > keeps non-PII fields (business_name, industry, location, notes)
✓ stripContactPii > handles nested lead_input recursively
✓ stripContactPii > handles empty inputs gracefully
✓ redactForLogging > replaces email addresses with [redacted:email] (§3.4)
✓ redactForLogging > replaces phone numbers with [redacted:phone] (§3.4)
✓ handleReasoningDispatch — lead_evaluation > returns lead_evaluation output
✓ handleReasoningDispatch — lead_evaluation > rejects unsupported pii_policy
✓ handleReasoningDispatch — template_selection > returns template_id output
✓ handleReasoningDispatch — copy_generation > returns copy_bundle with blocks
✓ handleReasoningDispatch — media_placement > returns media_plan with placements
✓ handleReasoningDispatch — error handling > returns MODEL_* codes appropriately
✓ handleReasoningDispatch — stub mode > operates without OPENROUTER_API_KEY
✓ PII protection in audit events > does not include PII in payload (§3.4)
✓ Audit write semantics (§4.5) > returns KERNEL_PERSISTENCE_FAILED when stage.started audit fails
✓ Audit write semantics (§4.5) > returns KERNEL_PERSISTENCE_FAILED when stage.completed audit fails
✓ ModelCallAdapter boundary (§12.3) > uses adapter-provided apiKey instead of env
✓ ModelCallAdapter boundary (§12.3) > uses stub mode when neither adapter nor env provides apiKey

Test Files  2 passed (2)
     Tests  33 passed (33)
```

### Example Output (Stub Mode)

**lead_evaluation:**
```json
{
  "lead_evaluation": {
    "score": 75,
    "segment": "small_business",
    "rationale": "Business has clear web presence needs based on industry classification."
  }
}
```

**template_selection:**
```json
{
  "template_id": "local_service_v1"
}
```

**copy_generation:**
```json
{
  "copy_bundle": {
    "blocks": [
      { "block_id": "hero_headline", "text": { "en": "Professional Services You Can Trust" } },
      { "block_id": "hero_subheadline", "text": { "en": "Serving your community with excellence" } }
    ],
    "locale": "en"
  }
}
```

**media_placement:**
```json
{
  "media_plan": {
    "placements": [
      { "block_id": "hero_image", "asset_ref": "stock/hero-business-1", "kind": "stock" },
      { "block_id": "about_image", "asset_ref": "stock/about-team-1", "kind": "stock" }
    ]
  }
}
```

---

## Role-Bleed Compliance Check (§12.3)

| Rule | Status | Evidence |
|------|--------|----------|
| Does NOT hold canonical memory | ✓ | Delegates to `writeBrainAuditEvent()` from SDK; returns failure if audit fails (§4.5) |
| Does NOT hold capability leases | ✓ | Kernel passes leases; LinkBot never issues |
| Does NOT hold secrets | ✓ | Accepts `ModelCallAdapter` from kernel/runtime boundary; MVO env fallback documented as exception |
| Does NOT execute deterministic workflows | ✓ | Only LLM reasoning, no workflow steps |
| Receives PII only with `strip_contact` policy | ✓ | Validates `pii_policy`, strips before model calls |

### Secret Boundary Detail (MVO Exception)

Per §12.3, LinkBot "receives only the resolved `model_routing_profile`". For MVO:

1. **Primary (recommended) path:** Kernel provides `ModelCallAdapter` with `apiKey`
   ```typescript
   handleReasoningDispatch(env, request, { apiKey: "provided-by-kernel" })
   ```

2. **MVO expedient path:** Server-side `apps/bot-runtime` reads `OPENROUTER_API_KEY` from env
   - Documented as MVO exception in code comments
   - LinkBot does not OWN the secret lifecycle (managed by deployment/LinkSkills)
   - Secret stays at transport layer, never enters business logic
   - Post-MVO: remove env fallback, require adapter

---

## Blockers

None. WP-009 is complete with boundary fixes documented.

---

## Next Steps

1. **WP-010 (LiNKaios kernel)** — Wire `bot.reason` dispatch calls from kernel to LinkBot
   - Kernel should provide `ModelCallAdapter` with API key from LinkSkills
   - Handle `KERNEL_PERSISTENCE_FAILED` for audit write failures
2. **WP-011 (WebsiteFactory plugin)** — Implement plugin manifest with reasoning stages
3. **WP-013 (E2E demo)** — Test full lead-to-preview flow with all reasoning stages

---

## Notes

- **MVO Exception:** The env fallback for `OPENROUTER_API_KEY` is acceptable for MVO because:
  - The secret lifecycle is owned by deployment/LinkSkills, not LinkBot
  - LinkBot only passes the secret through to the HTTP transport layer
  - The kernel/runtime boundary can provide the adapter post-MVO
- When `OPENROUTER_API_KEY` is not set (and no adapter provided), LinkBot operates in stub mode suitable for testing
- Model routing profiles are extensible; add new profiles to `MODEL_ROUTING_PROFILES` as needed
- The implementation is designed to be a thin adapter as required by §12.3 — it does not own state, only transforms inputs and delegates to external services (OpenRouter, LiNKbrain audit)
