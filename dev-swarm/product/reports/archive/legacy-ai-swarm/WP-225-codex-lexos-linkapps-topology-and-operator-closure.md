# WP-225 — Codex LEXOS LiNKapps Topology And Operator Closure

## Status
COMPLETE

## Worktree / Branch
- Worktree: `/Users/linktrend/Projects/LiNKtrend-System/.worktrees/WP-225-codex-lexos-linkapps-topology-and-operator-closure`
- Branch: `wp-225-codex-lexos-linkapps-topology-and-operator-closure`
- Base: `wp-223-codex-linkaios-typecheck-build-closure`

## Topology Gate And Corrective Import
WP-223-based snapshot still lacked packet-required topology artifacts. Imported existing (non-invented) topology from active workspace/WP-211 per prompt:
- `modules/lexos/litigation/`
- `modules/linkapps/`
- `docs/architecture/repo-architecture-target.md`
- `modules/lexos/litigation/workflow.md` (from WP-211)
- `modules/linkapps/workflow.md` (from WP-211)
- Required context reports `WP-220` and `WP-221` copied into `dev-swarm/product/reports/archive/legacy-ai-swarm/` for packet context read surface.

## Regression Gate Before Feature Edits
Ran required pre-edit gate and fixed WP-223-known type regressions before implementing WP-225 feature surfaces:
- Reconciled WP-223 fixed files (kernel/linklogic typing fixes) into this branch.
- Rebuilt `@linktrend/linklogic-sdk` and reran typecheck until green.

## Implementation Summary
Implemented both operator flows as focused typed server helpers (no live provider side effects):

1. LEXOS Litigation helper
- File: `apps/linkaios-web/src/lib/plugins/lexos-litigation/operator-flow.ts`
- Covers:
  - matter intake
  - evidence/research status
  - operator tasks
  - trace proof (`lease_ids`, `workflow_run_ids`, `audit_event_ids`)
  - governed stub/shadow refs for LinkSkills, LiNKautowork, LiNKbrain, LiNKbot, Plane

2. LiNKapps App Factory helper
- File: `apps/linkaios-web/src/lib/plugins/linkapps-app-factory/operator-flow.ts`
- Covers:
  - app brief
  - squad status
  - provider readiness
  - operator tasks
  - handoff package
  - trace proof and governed refs for LinkSkills, LiNKautowork, LiNKbrain, LiNKbot, Plane

3. Focused tests
- `apps/linkaios-web/src/lib/plugins/lexos-litigation/operator-flow.test.ts`
- `apps/linkaios-web/src/lib/plugins/linkapps-app-factory/operator-flow.test.ts`

## Files Changed
- `modules/lexos/litigation/README.md`
- `modules/lexos/litigation/legacy-vertical-readme.md`
- `modules/lexos/litigation/manifest.yaml`
- `modules/lexos/litigation/workflow.md`
- `modules/linkapps/README.md`
- `modules/linkapps/manifest.yaml`
- `modules/linkapps/workflow.md`
- `docs/architecture/repo-architecture-target.md`
- `dev-swarm/product/reports/archive/legacy-ai-swarm/WP-220-lexos-litigation-operator-flow.md`
- `dev-swarm/product/reports/archive/legacy-ai-swarm/WP-221-linkapps-app-factory-operator-flow.md`
- `dev-swarm/product/reports/archive/legacy-ai-swarm/WP-225-codex-lexos-linkapps-topology-and-operator-closure.md`
- `apps/linkaios-web/src/lib/plugins/lexos-litigation/operator-flow.ts`
- `apps/linkaios-web/src/lib/plugins/lexos-litigation/operator-flow.test.ts`
- `apps/linkaios-web/src/lib/plugins/linkapps-app-factory/operator-flow.ts`
- `apps/linkaios-web/src/lib/plugins/linkapps-app-factory/operator-flow.test.ts`
- `apps/linkaios-web/src/lib/kernel/api-auth.test.ts`
- `apps/linkaios-web/src/lib/kernel/context-assembler.test.ts`
- `apps/linkaios-web/src/lib/kernel/context-assembler.ts`
- `apps/linkaios-web/src/lib/kernel/orchestrator.ts`
- `apps/linkaios-web/src/lib/kernel/plane-adapter.test.ts`
- `apps/linkaios-web/src/lib/kernel/plane-adapter.ts`
- `apps/linkaios-web/src/lib/plugins/websitefactory/template-registry-discovery.ts`
- `packages/linklogic-sdk/src/contracts-mvo.ts`
- `packages/linklogic-sdk/src/index.ts`

## Commands Run
```bash
git worktree add .worktrees/WP-225-codex-lexos-linkapps-topology-and-operator-closure \
  -b wp-225-codex-lexos-linkapps-topology-and-operator-closure \
  wp-223-codex-linkaios-typecheck-build-closure

# topology import and context recovery
rsync/cp for modules and docs from active workspace + WP-211 workflow files

pnpm install
pnpm --filter @linktrend/shared-config build
pnpm --filter @linktrend/db build
pnpm --filter @linktrend/ui build
pnpm --filter @linktrend/shared-types build
pnpm --filter @linktrend/observability build
pnpm --filter @linktrend/linklogic-sdk build
pnpm --filter @linktrend/linkaios-web typecheck

pnpm --filter @linktrend/linkaios-web test -- src/lib/plugins/lexos-litigation/operator-flow.test.ts
pnpm --filter @linktrend/linkaios-web test -- src/lib/plugins/linkapps-app-factory/operator-flow.test.ts
```

## Proof Results
- `pnpm install`: PASS
- `pnpm --filter @linktrend/linkaios-web typecheck`: PASS
- Focused LEXOS helper proof test: PASS
- Focused LiNKapps helper proof test: PASS

## Route/Status Proof Payload Summary
1. LEXOS (`buildLexosOperatorFlowProof`)
- `module`: `lexos_litigation`
- `matter_intake`: includes `matter_id`, `client_id`, `jurisdiction`, `intake_status=accepted`
- `evidence_research`: `evidence_status=ready`, `research_status=ready`
- `trace`: `lease_ids`, `workflow_run_ids`, `audit_event_ids`
- governed refs include:
  - LinkSkills: `cap.storage.evidence`, `cap.research.legal`, `cap.plane.mock`
  - LiNKautowork: `autowork.lexos.evidence_ingest`, `autowork.lexos.extraction_run`, `autowork.lexos.assertion_sync`
  - LiNKbrain: `evidence.ingested`, `research.performed`, `support.mapped`
  - LiNKbot: `lexos_intake_agent`, `lexos_analyst`, `lexos_strategist`
  - Plane: plane-scoped task refs

2. LiNKapps (`buildLinkappsOperatorFlowProof`)
- `module`: `linkapps.app_factory`
- `app_brief`: includes `venture_id`, `app_slug`, `prd_ref`, `blueprint_ref`
- `squad_status`: `status=executing`
- `provider_readiness`: mock/shadow readiness only (`github/supabase/stripe/vercel/eas/plane`)
- `handoff_package`: includes `handoff_package_ref`, preview URL, workflow ids
- governed refs include:
  - LinkSkills: `cap.github.repo_management`, `cap.supabase.provisioning`, `cap.plane.execution_tracking`
  - LiNKautowork: `autowork.linkapps.create_repo`, `autowork.linkapps.release_readiness`, `autowork.linkapps.compile_handoff`
  - LiNKbrain: `linkapps.squad.formed`, `linkapps.validation.passed`, `linkapps.handoff.ready`
  - LiNKbot: core squad roles
  - Plane: phase task refs

## Security / Side-Effects Check
- No `.env` edits
- No real credentials introduced
- No live provider calls or production side effects
- Stub/shadow posture preserved for external integrations

## Blockers
- None remaining for WP-225 acceptance.

## Next Step
- Integrator review and merge `wp-225-codex-lexos-linkapps-topology-and-operator-closure`; optionally expose these server-helper proofs through explicit API routes/UI panels in a follow-up packet if route-level operator screens are required.
