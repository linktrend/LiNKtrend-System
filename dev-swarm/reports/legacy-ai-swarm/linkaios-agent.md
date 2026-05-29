# Agent Report: LiNKaios Agent

## WP-049 — LinkSites kernel v2 stage wiring (2026-05-15)

**Status:** COMPLETE (kernel/plugin stage wiring + tests).

### Scope

Wire the LinkSites v2 stage plan into LiNKaios WebsiteFactory plugin manifest/helpers, keep kernel as coordinator, and prove canonical v2 capability/workflow mappings with focused tests.

### Files changed

- `LiNKaios/linkaios-web/src/lib/plugins/websitefactory/manifest.ts`
  - Replaced v1 stage plan with LinkSites v2 stage plan (`research_enrichment`, `website_package_generation`, `artifact_write_local`, `supabase_mirror_upsert`, `payload_sync_local`, `preview_readiness_check`, `crm_ready_to_contact_mark`, `plane_execution_tracking`, `zulip_run_notify`, `record_run`).
  - Updated required v2 capability plugin IDs and LiNKautowork workflow handles.
  - Updated stage-type helpers and stage→capability/workflow/reasoning mappings to canonical v2 IDs.
- `LiNKaios/linkaios-web/src/lib/plugins/websitefactory/stage-handlers.ts`
  - Updated stage comments and capability/workflow argument builders to match v2 stage IDs.
- `LiNKaios/linkaios-web/src/lib/kernel/dispatch.ts`
  - Added reasoning-output support for v2 reasoning kinds (`research_enrichment`, `website_package_generation`) in mock dispatch.
- `LiNKaios/linkaios-web/src/lib/kernel/manifest-loader.ts`
  - Switched loader to source manifest from plugin module (`getWebsiteFactoryManifest`) so kernel and plugin stay aligned.
- `LiNKaios/linkaios-web/src/lib/plugins/websitefactory/plugin.test.ts`
  - Updated manifest/mapping assertions to LinkSites v2 stage IDs, capability IDs, workflow handles, and output expectations.
- `LiNKaios/linkaios-web/src/lib/kernel/kernel.test.ts`
  - Updated kernel manifest/mapping assertions to LinkSites v2 stage plan and helper mappings.
- `dev-swarm/reports/legacy-ai-swarm/linkaios-agent.md`
  - Added this WP-049 report.

### Commands run

```bash
git fetch origin
git switch development
git pull --ff-only origin development
git switch -c dev/codex/WP-049-linksites-kernel-v2-stage-wiring

pnpm --filter @linktrend/linkaios-web test -- --run \
  LiNKaios/linkaios-web/src/lib/plugins/websitefactory/plugin.test.ts \
  LiNKaios/linkaios-web/src/lib/kernel/kernel.test.ts
```

### Validation / proof

- Test result: `5 passed` test files, `85 passed` tests.
- Targeted proof includes:
  - v2 stage ordering and plane assignments.
  - v2 stage→capability mappings (`cap.crm.odoo_shadow`, `cap.payload.local_sync`, `cap.supabase.mirror_content`, `cap.zulip.run_messaging`, `cap.research.public_web`, `cap.asset.generation`, `cap.plane.execution_tracking`).
  - v2 stage→workflow mappings (`autowork.linksites.artifact_write_local`, `autowork.linksites.supabase_mirror_upsert`, `autowork.linksites.payload_sync_local`, `autowork.linksites.preview_readiness_check`, `autowork.linksites.crm_ready_to_contact_mark`).
  - role-boundary checks remain intact (kernel coordinator, plugin declarative glue only).

### Hard-boundary compliance

- No edits in `/Users/linktrend/Projects/LiNKsites`.
- No live external writes added.
- No target software schema invention.
- No LinkSkills/LiNKautowork responsibility redefinition in kernel.

### Blockers / risks

- `LiNKaios/linkaios-web/src/lib/kernel/manifest-loader.ts` still contains an older in-file manifest constant; runtime now uses plugin manifest directly, so behavior is correct. Residual cleanup risk is low but this duplicate constant should be removed in a follow-up hygiene pass.

### Final branch + commit SHA

- Branch: `dev/codex/WP-049-linksites-kernel-v2-stage-wiring`
- Commit SHA: `2b82d37` (Integrator recovery branch)

## WP-041 — LinkSites vertical contract v2 (2026-05-15)

**Status:** COMPLETE (docs-only, no implementation code).

### Scope

Make the revised LinkSites development-mode MVO the canonical contract target in source-of-truth docs and reaffirm kernel non-ownership under v2.

### Files changed

- `dev-swarm/command-center/CONTRACTS_MVO.md` — added §0.A LinkSites v2 canonical section (flow, hard boundaries, production artifact direction, canonical LiNKbot roles, required v1 capability plugins, site identity, side-effect routing, schema-related deferrals, mode model, acceptance posture, and v1 §§1–13 historical-relationship statement). Marked top-of-file status and v1 §§1–13 as historical reference.
- `dev-swarm/command-center/LINKAIOS_KERNEL_MANIFEST.md` — added §0.A v2 addendum (v2 work-request and stages, disabled LiNKbot roles for Lead Scout and Outreach, required capabilities, deferred concrete manifest pending WP-042, kernel non-ownership reaffirmed under v2, trace/status surface obligations). Marked §4 WebsiteFactory manifest as historical v1 reference.
- `dev-swarm/command-center/INTEGRATION_QUEUE.md` — added "LinkSites v2 capability integrations" section (INT-040..INT-049) plus explicit "out of scope for v2" list. Marked v1 stubbed-integrations section as historical.
- `dev-swarm/command-center/AGENT_COORDINATION.md` — appended WP-041 entry to Latest Updates.
- `dev-swarm/reports/legacy-ai-swarm/linkaios-agent.md` — this entry.
- `dev-swarm/reports/legacy-ai-swarm/integration-agent.md` — WP-041 cross-reference entry for v2 integration rows.

### Commands run

```bash
git fetch origin
git switch development
git pull --ff-only origin development
git switch -c dev/codex/WP-041-linksites-vertical-contract-v2
```

No SDK/TypeScript/Zod files were modified; therefore no package tests were run. SDK contract files (`packages/linklogic-sdk/src/contracts-mvo.ts` and `contracts-mvo.test.ts`) were intentionally left unchanged: the v2 design explicitly defers Payload/Supabase schema details to WP-042 discovery, and v2 hard boundaries forbid inventing schemas. Adding v2-shaped TypeScript types ahead of discovery would violate `dev-swarm/command-center/LINKSITES_VERTICAL_MVO_V2.md` "Discovery Requirements" and the WP-041 prompt's hard boundary against inventing Payload or Supabase schemas. A follow-up packet will pin v2 wire-format types after WP-042 returns.

### Proof of compliance with hard boundaries

- No real lead acquisition path added. Lead Scout role declared as disabled in v2 docs only.
- No real client outreach path added. Outreach Bot role declared as disabled in v2 docs only.
- No real VPS deployment, customer domain, DNS, TLS, or production hosting touched. Cloud cold storage (Google Drive or equivalent) is documented as forward-looking production artifact direction with no MVO implementation row.
- No Payload CMS schema invented. INT-041 explicitly defers schema discovery to WP-042.
- No Supabase mirror schema invented. INT-042 explicitly defers schema discovery to WP-042.
- No implementation code authored under `apps/`, `packages/`, `services/`, or `LiNKsites/`. No target-app business configuration added.
- No outreach send path added in code or config.

### Tests / proof

Docs-only change set. No code, schemas, or migrations introduced; no package tests required. Verification is by inspection of the five docs above and the diff on this branch.

### Blockers / questions

None for this packet. v2 implementation cannot proceed until WP-042 returns concrete answers about: existing master/industry template location in `/Users/linktrend/Projects/LiNKsites`, existing Payload CMS schema, existence/location of Supabase mirror schema, local Payload boot sequence, and the existing frontend that reads from Payload for preview display.

### Final branch + commit SHA

- Branch: `dev/codex/WP-041-linksites-vertical-contract-v2`
- Commit SHA: `04e77e90d856c6e045614fa081070fc83274712d`

---

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
| Kernel switch statement dispatched directly to LiNKbot/LinkSkills/LiNKautowork | Kernel calls `executeWebsiteFactoryStage()` which then delegates to correct plane |
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

- `LiNKaios/linkaios-web/src/lib/plugins/websitefactory/manifest.ts` *(new)* — Plugin manifest declaration:
  - Canonical `WEBSITE_FACTORY_MANIFEST` per CONTRACTS_MVO.md §1.4
  - All 10 stages declared with correct `responsible_plane` per §7, §10
  - Stage mapping helpers: `mapStageToCapability()`, `mapStageToWorkflowHandle()`, `mapStageToReasoningKind()`
  - Required capabilities, workflow hooks, audit events
  - Preview output shape per §9
  - Non-goals per D-03

- `LiNKaios/linkaios-web/src/lib/plugins/websitefactory/stage-handlers.ts` *(new)* — Stage handler glue:
  - `executeWebsiteFactoryStage()` — Main dispatch router (called by kernel)
  - `executeReasoningStage()` → LiNKbot (§6.1)
  - `executeCapabilityStage()` → LinkSkills lease lifecycle (§6.2, §7)
  - `executeWorkflowStage()` → LiNKautowork (§6.4)
  - `executeRecordRunStage()` → LiNKbrain closure
  - PII sanitization per §3.4

- `LiNKaios/linkaios-web/src/lib/plugins/websitefactory/preview-panel.ts` *(new)* — Preview panel wiring
- `LiNKaios/linkaios-web/src/lib/plugins/websitefactory/index.ts` *(new)* — Module exports
- `LiNKaios/linkaios-web/src/lib/plugins/websitefactory/plugin.test.ts` *(new)* — 31 plugin tests

### Kernel Orchestration (refactored)

- `LiNKaios/linkaios-web/src/lib/kernel/orchestrator.ts` *(refactored)*:
  - Removed hardcoded `mapStageToReasoningKind()`, `mapStageToWorkflowHandle()`, `mapStageToCapability()`
  - Removed hardcoded `executeLinkSkillsStage()` (now in plugin)
  - Added `executePluginStage()` wrapper that calls plugin's `executeWebsiteFactoryStage()`
  - Added generic `loadPluginManifest(pluginId: string)` function
  - Kernel now only handles:
    - `linkaios` plane stages (lead_intake) directly
    - All other planes delegate to plugin's executeStage handler
  - Imports stage mappings from plugin module
  - Re-exports plugin functions for consumers

- `LiNKaios/linkaios-web/src/lib/kernel/kernel.test.ts` *(updated)*:
  - Added 5 new tests for plugin extension point wiring
  - Tests verify kernel loads manifest from plugin module
  - Tests verify kernel delegates to plugin's executeStage
  - Tests verify no duplicate stage mappings in kernel

### Dev Config (updated)

- `LiNKaios/linkaios-web/vitest.config.ts` *(updated)* — Path alias resolution for `@/` imports

## Role-Bleed Self-Check

Per CONTRACTS_MVO.md §12.1, §12.2:

| Responsibility | Kernel | Plugin | Status |
|----------------|--------|--------|--------|
| Orchestration, persistence, approvals, trace, status | Owns | — | Kernel owns |
| Stage declarations, mappings | Reads from plugin | Declares | Plugin declares |
| Stage execution for non-kernel planes | Calls plugin | Implements | Plugin implements |
| Reasoning (LiNKbot) | Delegates | Delegates | Correct |
| Capability leases (LinkSkills) | Delegates | Delegates | Correct |
| Deterministic workflows (LiNKautowork) | Delegates | Delegates | Correct |
| Audit/memory (LiNKbrain) | Delegates | Delegates | Correct |

**Role boundaries intact:**
- Kernel does NOT duplicate plugin stage mappings
- Kernel does NOT absorb LiNKbot/LinkSkills/LiNKautowork/LiNKbrain responsibilities
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
✓ Contract Compliance > D-03: uses static/local preview (not DigitalOcean/Payload)
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

```23:40:LiNKaios/linkaios-web/src/lib/kernel/orchestrator.ts
// WebsiteFactory plugin extension point
import {
  executeWebsiteFactoryStage,
  getWebsiteFactoryManifest,
  mapStageToCapability as pluginMapStageToCapability,
} from "@/lib/plugins/websitefactory";
```

### Kernel delegates to plugin for stage execution:

```387:402:LiNKaios/linkaios-web/src/lib/kernel/orchestrator.ts
case "linkbot":
case "linkskills":
case "linkautowork":
case "linkbrain":
  // Plugin-declared stages: delegate to plugin's executeStage handler
  // Plugin then delegates to the correct plane (LiNKbot, LinkSkills, etc.)
  result = await executePluginStage(env, run, stage, manifestStage, accumulatedOutputs);
  break;
```

### Plugin executes stage and delegates to planes:

```64:95:LiNKaios/linkaios-web/src/lib/plugins/websitefactory/stage-handlers.ts
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
3. Plugin delegates to correct planes (LiNKbot, LinkSkills, LiNKautowork, LiNKbrain)
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
## WP-042 — LinkSites template and Payload discovery (2026-05-15)

### Scope
Executed WP-042 discovery-only packet against `/Users/linktrend/Projects/LiNKsites` to de-risk v2 contract follow-ups that were explicitly blocked on locating existing template/CMS/schema surfaces.

### Discovery outcome (for LinkAIOS follow-up packets)

- Canonical master template path confirmed:
  - `/Users/linktrend/Projects/LiNKsites/apps/web-master`
  - template module registry: `src/templates/registry.ts`
  - current registered module: `src/templates/marketing-smb-v1.ts`
- Payload CMS model exists and should be reused, not reinvented:
  - `/Users/linktrend/Projects/LiNKsites/apps/cms/src/payload.config.ts`
  - `/Users/linktrend/Projects/LiNKsites/apps/cms/src/collections/*`
  - `/Users/linktrend/Projects/LiNKsites/apps/cms/src/blocks/*`
- Supabase mirror/schema clues are already present:
  - `/Users/linktrend/Projects/LiNKsites/supabase/migrations/20260331_000001_lsites_init.sql`
  - `/Users/linktrend/Projects/LiNKsites/supabase/schemas/lsites_core.schema.json`
  - `/Users/linktrend/Projects/LiNKsites/supabase/schemas/cms-mapping.json`
  - sync scripts in `/Users/linktrend/Projects/LiNKsites/apps/cms/scripts/`
- Preview frontend reading from Payload is implemented in:
  - `/Users/linktrend/Projects/LiNKsites/apps/web-master/src/lib/payload-client.ts`
  - `/Users/linktrend/Projects/LiNKsites/apps/web-master/src/app/[lang]/[[...slug]]/page.tsx`

### Packet artifact

- Added `dev-swarm/command-center/LINKSITES_TEMPLATE_PAYLOAD_DISCOVERY.md` with facts, assumptions, blockers, and command-level proof.

### Commands run

```bash
git fetch origin
git switch development
git pull --ff-only origin development
git switch -c dev/codex/WP-042-linksites-template-payload-discovery
rg --files /Users/linktrend/Projects/LiNKsites
rg -n "payload|collection|supabase|template|preview|web-master" /Users/linktrend/Projects/LiNKsites -g '!**/node_modules/**'
sed -n '1,260p' /Users/linktrend/Projects/LiNKsites/apps/cms/src/payload.config.ts
sed -n '1,220p' /Users/linktrend/Projects/LiNKsites/apps/web-master/src/templates/registry.ts
sed -n '1,260p' /Users/linktrend/Projects/LiNKsites/apps/web-master/src/app/'[lang]'/'[[...slug]]'/page.tsx
sed -n '1,220p' /Users/linktrend/Projects/LiNKsites/supabase/schemas/cms-mapping.json
git -C /Users/linktrend/Projects/LiNKsites status --short
```

### Blockers / questions

- No blocker for discovery completion.
- Remaining design question for follow-up packet: whether industry variants stay seed-driven under one registered template module or need separate registered template modules now.

### Final branch / commit

- Branch: `dev/codex/WP-042-linksites-template-payload-discovery`
- Commit: `36ab2c7`

## WP-046 — LinkSites v2 SDK contracts (2026-05-15)

### Files changed

- `packages/linklogic-sdk/src/contracts-mvo.ts`
- `packages/linklogic-sdk/src/contracts-mvo.test.ts`
- `packages/linklogic-sdk/src/index.ts`
- `dev-swarm/command-center/CONTRACTS_MVO.md`
- `dev-swarm/reports/legacy-ai-swarm/linkaios-agent.md`

### What was added

- Added LinkSites v2-focused SDK schemas/types for:
  - canonical discovered template id
  - canonical LiNKbot role ids
  - canonical LinkSites capability plugin ids
  - canonical LiNKautowork workflow handles
  - pinned WP-042 discovered source refs
  - site/generation refs
  - preview readiness summary with development/local-only guardrails and consistency checks
- Exported all new schemas/types via `packages/linklogic-sdk/src/index.ts`.
- Added focused tests proving valid v2 payloads pass and invented refs/ids or non-development (`live`) cases fail.
- Updated `CONTRACTS_MVO.md` §0.A.11 with WP-046 SDK pinning note.

### Commands run

```bash
git fetch origin
git switch development
git pull --ff-only origin development
git switch -c dev/codex/WP-046-linksites-v2-sdk-contracts
pnpm --filter @linktrend/linklogic-sdk test
```

### Proof / validation results

- `pnpm --filter @linktrend/linklogic-sdk test` passed.
- Output summary:
  - `Test Files 11 passed (11)`
  - `Tests 86 passed (86)`
  - includes `src/contracts-mvo.test.ts (44 tests)` passing with new WP-046 cases.

### Blockers

- None.

### Branch / commit

- Branch: `dev/codex/WP-046-linksites-v2-sdk-contracts`
- Commit: `faf9dd8`

## WP-063 — LiNKaios ingress fail-closed governance adapter (2026-05-17)

**Status:** COMPLETE (fail-closed governance validation at LiNKbot dispatch + tests).

### Files changed

- `LiNKaios/linkaios-web/src/lib/kernel/dispatch.ts`
  - Added strict `linktrendGovernance` ingress validation in `dispatchToLiNKbot`.
  - Enforced fail-closed rejection when governance payload is missing/invalid.
  - Mapped rejection to canonical failure code `MANIFEST_INVALID`.
  - Emitted denied dispatch audit event (`stage.failed`) with `governance_ingress_rejected` metadata.
- `LiNKaios/linkaios-web/src/lib/kernel/dispatch.test.ts`
  - Added coverage for valid governance dispatch success.
  - Added coverage for missing governance payload fail-closed behavior.
  - Added coverage for invalid governance payload shape fail-closed behavior.
- `dev-swarm/reports/legacy-ai-swarm/linkaios-agent.md`
  - Added this WP-063 entry.

### Commands run

```bash
git fetch origin --prune
git worktree add ../LiNKtrend-System-WP-063 -b dev/codex/WP-063-linkaios-ingress-fail-closed-governance-adapter origin/development
git -C ../LiNKtrend-System-WP-063 status --short --branch

pnpm install
pnpm --filter @linktrend/linkaios-web test -- src/lib/kernel/dispatch.test.ts
pnpm --filter @linktrend/linkaios-web typecheck
pnpm -r build
pnpm --filter @linktrend/linkaios-web test -- src/lib/kernel/dispatch.test.ts
```

### Validation / proof

- `pnpm --filter @linktrend/linkaios-web test -- src/lib/kernel/dispatch.test.ts` passes.
- `dispatchToLiNKbot governance ingress` tests prove:
  - valid governance dispatch still succeeds,
  - missing governance payload is rejected fail-closed,
  - invalid governance payload shape is rejected fail-closed,
  - rejection uses canonical code `MANIFEST_INVALID`,
  - denied dispatch audit behavior emits `stage.failed` with governance rejection metadata.

### Blockers / risks

- `pnpm --filter @linktrend/linkaios-web typecheck` fails in this repo baseline with broad pre-existing workspace TypeScript issues unrelated to WP-063.
- `pnpm -r build` also hits an unrelated existing lint error in `LiNKaios/linkaios-web/src/lib/kernel/orchestrator.ts` (`prefer-const`).

### Branch + commit SHA

- Branch: `dev/codex/WP-063-linkaios-ingress-fail-closed-governance-adapter`
- Commit SHA: fca20ed
