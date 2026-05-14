# Agent Report: LiNKaios Agent

## Assigned Work Packet

**WP-011 — WebsiteFactory plugin declaration and stage glue** (completed 2026-05-14).

Implements the WebsiteFactory plugin declaration and stage-handler glue that lets LiNKaios orchestrate the lead-to-preview flow without putting WebsiteFactory business logic into the kernel.

## Follow-Up Fix (Completed)

**Issue:** Kernel had hardcoded WebsiteFactory stage mappings in `orchestrator.ts`, bypassing the plugin extension point.

**Fix:** Refactored kernel to use plugin's `executeStage` handler for all plugin-declared stages.

### Architecture Change

| Before | After |
|--------|-------|
| Kernel had hardcoded `mapStageToReasoningKind()`, `mapStageToWorkflowHandle()`, `mapStageToCapability()` in `orchestrator.ts` | Plugin exports these mappings; kernel imports from plugin |
| Kernel switch statement dispatched directly to LinkBot/LinkSkills/LiNKautowork | Kernel calls `executeWebsiteFactoryStage()` which then delegates to correct plane |
| Kernel `executeLinkSkillsStage()` handled capability leases | Plugin `executeCapabilityStage()` handles capability leases |
| Hardcoded manifest loading | Generic `loadPluginManifest(pluginId)` with plugin registry pattern |

## Current Status

Complete. WebsiteFactory plugin fully wired to kernel extension points:

1. **Plugin manifest declaration** — `src/lib/plugins/websitefactory/manifest.ts`
2. **Stage-handler glue** — `src/lib/plugins/websitefactory/stage-handlers.ts` 
3. **Preview panel wiring** — `src/lib/plugins/websitefactory/preview-panel.ts`
4. **Plugin index/module exports** — `src/lib/plugins/websitefactory/index.ts`
5. **Kernel orchestration** — `src/lib/kernel/orchestrator.ts` (refactored to use plugin)
6. **Test coverage** — 55 tests passing (31 plugin + 24 kernel)

## Files Changed

### WebsiteFactory Plugin (new)

- `apps/linkaios-web/src/lib/plugins/websitefactory/manifest.ts` *(new)* — Plugin manifest declaration:
  - Canonical `WEBSITE_FACTORY_MANIFEST` per CONTRACTS_MVO.md §1.4
  - All 10 stages declared with correct `responsible_plane` per §7, §10
  - Stage mapping helpers: `mapStageToCapability()`, `mapStageToWorkflowHandle()`, `mapStageToReasoningKind()`
  - Required capabilities, workflow hooks, audit events
  - Preview output shape per §9
  - Non-goals per D-03

- `apps/linkaios-web/src/lib/plugins/websitefactory/stage-handlers.ts` *(new)* — Stage handler glue:
  - `executeWebsiteFactoryStage()` — Main dispatch router (called by kernel)
  - `executeReasoningStage()` → LinkBot (§6.1)
  - `executeCapabilityStage()` → LinkSkills lease lifecycle (§6.2, §7)
  - `executeWorkflowStage()` → LiNKautowork (§6.4)
  - `executeRecordRunStage()` → LiNKbrain closure
  - PII sanitization per §3.4

- `apps/linkaios-web/src/lib/plugins/websitefactory/preview-panel.ts` *(new)* — Preview panel wiring
- `apps/linkaios-web/src/lib/plugins/websitefactory/index.ts` *(new)* — Module exports
- `apps/linkaios-web/src/lib/plugins/websitefactory/plugin.test.ts` *(new)* — 31 plugin tests

### Kernel Orchestration (refactored)

- `apps/linkaios-web/src/lib/kernel/orchestrator.ts` *(refactored)*:
  - Removed hardcoded `mapStageToReasoningKind()`, `mapStageToWorkflowHandle()`, `mapStageToCapability()`
  - Removed hardcoded `executeLinkSkillsStage()` (now in plugin)
  - Added `executePluginStage()` wrapper that calls plugin's `executeWebsiteFactoryStage()`
  - Added generic `loadPluginManifest(pluginId: string)` function
  - Kernel now only handles:
    - `linkaios` plane stages (lead_intake) directly
    - All other planes delegate to plugin's executeStage handler
  - Imports stage mappings from plugin module
  - Re-exports plugin functions for consumers

- `apps/linkaios-web/src/lib/kernel/kernel.test.ts` *(updated)*:
  - Added 5 new tests for plugin extension point wiring
  - Tests verify kernel loads manifest from plugin module
  - Tests verify kernel delegates to plugin's executeStage
  - Tests verify no duplicate stage mappings in kernel

### Dev Config (updated)

- `apps/linkaios-web/vitest.config.ts` *(updated)* — Path alias resolution for `@/` imports

## Role-Bleed Self-Check

Per CONTRACTS_MVO.md §12.1, §12.2:

| Responsibility | Kernel | Plugin | Status |
|----------------|--------|--------|--------|
| Orchestration, persistence, approvals, trace, status | Owns | — | Kernel owns |
| Stage declarations, mappings | Reads from plugin | Declares | Plugin declares |
| Stage execution for non-kernel planes | Calls plugin | Implements | Plugin implements |
| Reasoning (LinkBot) | Delegates | Delegates | Correct |
| Capability leases (LinkSkills) | Delegates | Delegates | Correct |
| Deterministic workflows (LiNKautowork) | Delegates | Delegates | Correct |
| Audit/memory (LiNKbrain) | Delegates | Delegates | Correct |

**Role boundaries intact:**
- Kernel does NOT duplicate plugin stage mappings
- Kernel does NOT absorb LinkBot/LinkSkills/LiNKautowork/LiNKbrain responsibilities
- Plugin does NOT implement kernel routing/approvals/trace

## Commands Run

```bash
# Typecheck (passes)
pnpm --filter @linktrend/linkaios-web typecheck

# Run all tests (55 passing)
pnpm --filter @linktrend/linkaios-web test -- --run

# Output:
# ✓ src/lib/plugins/websitefactory/plugin.test.ts (31 tests)
# ✓ src/lib/kernel/kernel.test.ts (24 tests)
# Test Files  2 passed (2)
# Tests  55 passed (55)
```

## Tests / Proof

### Plugin Tests: 31 passing

```
✓ WebsiteFactory Plugin Manifest > returns a valid manifest object
✓ WebsiteFactory Plugin Manifest > has all required manifest fields per CONTRACTS_MVO.md §1.2
✓ WebsiteFactory Plugin Manifest > declares the 10 WebsiteFactory stages per §10 stage trace
✓ WebsiteFactory Plugin Manifest > maps stages to correct responsible planes per §7
✓ WebsiteFactory Plugin Manifest > declares require_approval for capability-gated stages
✓ Stage Type Helpers > correctly identifies reasoning stages
✓ Stage Type Helpers > correctly identifies capability stages
✓ Stage Type Helpers > correctly maps stages to capabilities
✓ Stage Type Helpers > correctly maps stages to workflow handles
✓ Stage Type Helpers > correctly maps stages to reasoning kinds
✓ Stage Execution Config > identifies require_approval stages correctly
✓ Stage Execution Config > returns correct retry config per failure_mode
✓ Preview Panel > builds preview panel view from run
✓ Preview Panel > marks not ready when preview_url missing
✓ Preview Panel > marks awaiting_approval status correctly
✓ Preview Panel > generates correct preview route
✓ Preview Panel > validates preview output correctly
✓ Preview Panel > returns correct preview panel config
✓ Role-Bleed Self-Check (CONTRACTS_MVO.md §12.2) > plugin does NOT implement kernel routing/approvals
✓ Role-Bleed Self-Check (CONTRACTS_MVO.md §12.2) > plugin does NOT hold tenant secrets
✓ Role-Bleed Self-Check (CONTRACTS_MVO.md §12.2) > plugin does NOT mutate Run/Stage state directly
✓ Role-Bleed Self-Check (CONTRACTS_MVO.md §12.2) > plugin does NOT add undeclared capabilities/workflows/audit events
✓ Role-Bleed Self-Check (CONTRACTS_MVO.md §12.2) > plugin does NOT maintain its own audit sink
✓ Contract Compliance > stage names match CONTRACTS_MVO.md §10
✓ Contract Compliance > output names match CONTRACTS_MVO.md §2 data dictionary
✓ Contract Compliance > preview output shape matches CONTRACTS_MVO.md §9
✓ Contract Compliance > D-03: uses static/local preview (not Vercel/Payload)
✓ Plugin Registration > exports correct plugin constants
✓ Plugin Registration > can be initialized with manifest and handlers
```

### Kernel Extension Point Tests: 5 new tests

```
✓ plugin extension point wiring > kernel loads manifest from plugin module
✓ plugin extension point wiring > kernel delegates stage execution to plugin's executeStage
✓ plugin extension point wiring > plugin's stage mappings match CONTRACTS_MVO.md
✓ plugin extension point wiring > kernel does not duplicate plugin stage mappings
✓ plugin extension point wiring > websitefactory.lead_to_preview work request routes through plugin
```

### Combined Tests: 55 passing

- 31 WebsiteFactory plugin tests
- 24 kernel orchestration tests (including 5 new extension point tests)

## Code References

### Kernel uses plugin extension point:

```23:40:apps/linkaios-web/src/lib/kernel/orchestrator.ts
// WebsiteFactory plugin extension point
import {
  executeWebsiteFactoryStage,
  getWebsiteFactoryManifest,
  mapStageToCapability as pluginMapStageToCapability,
} from "@/lib/plugins/websitefactory";
```

### Kernel delegates to plugin for stage execution:

```387:402:apps/linkaios-web/src/lib/kernel/orchestrator.ts
case "linkbot":
case "linkskills":
case "linkautowork":
case "linkbrain":
  // Plugin-declared stages: delegate to plugin's executeStage handler
  // Plugin then delegates to the correct plane (LinkBot, LinkSkills, etc.)
  result = await executePluginStage(env, run, stage, manifestStage, accumulatedOutputs);
  break;
```

### Plugin executes stage and delegates to planes:

```64:95:apps/linkaios-web/src/lib/plugins/websitefactory/stage-handlers.ts
export async function executeWebsiteFactoryStage(
  ctx: StageContext,
): Promise<DispatchResult> {
  // ...
  switch (stage.responsible_plane) {
    case "linkbot":
      return await executeReasoningStage(ctx);
    case "linkautowork":
      return await executeWorkflowStage(ctx);
    case "linkskills":
      return await executeCapabilityStage(ctx);
    case "linkbrain":
      return await executeRecordRunStage(ctx);
  }
}
```

## Blockers

None.

## WP-013 Unblocked

**WP-013 (E2E demo harness) is now fully unblocked.**

The kernel now:
1. Loads WebsiteFactory manifest from plugin module
2. Executes stages through plugin's `executeWebsiteFactoryStage()` handler
3. Plugin delegates to correct planes (LinkBot, LinkSkills, LiNKautowork, LiNKbrain)
4. Kernel maintains orchestration, persistence, approvals, trace, status

WP-013 can now test:
- `POST /api/kernel/work-request` → creates work_request with plugin_id
- `POST /api/kernel/run/[runId]/execute` → executes through plugin extension point
- `GET /api/kernel/run/[runId]/trace` → returns trace with plugin-declared stages

## Next Step

Hand off to **WP-013 (E2E demo harness)**:

1. Create E2E test that exercises full flow:
   - `intakeLeadWorkRequest()` → work_request for `websitefactory.lead_to_preview`
   - `createRun()` → run with stages from plugin manifest
   - `executeRun()` → executes stages through plugin extension point
   - `getRunTrace()` → returns trace with plugin stage outputs

2. Verify audit event chain per CONTRACTS_MVO.md §8:
   - `run.started`
   - All `stage.completed` events
   - All `lease.executed` events
   - `preview.published`
   - `run.completed`

3. Verify role boundaries:
   - Kernel does not duplicate plugin logic
   - Plugin does not duplicate kernel logic
   - Each plane owns its responsibilities
