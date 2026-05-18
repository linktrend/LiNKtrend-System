# LiNKapps Module

LiNKapps is the app factory module for venture software creation.

The external source repo remains `/Users/linktrend/Projects/LiNKapps`. This folder contains the LiNKaios module declaration, role references, required connectors, workflow surfaces, and compatibility exports for the control repo.

## Module Status

**MVO Phase**: Operational declaration complete (WP-208)  
**Plugin ID**: `linkapps.app_factory`  
**Version**: `1.0.0-mvo`

## Structure

- `manifest.yaml` — Module declaration per WP-106
- `README.md` — This file

## Cross-Plane Integration

### LiNKaios (Control Plane)

UI panels:
- `linkapps.factory_dashboard` — Overview of active app builds
- `linkapps.blueprint_intake` — Submit new venture blueprints
- `linkapps.squad_monitor` — Real-time squad execution view
- `linkapps.build_logs` — Build iteration history
- `linkapps.validation_results` — Quality gate reports
- `linkapps.deployment_history` — Deploy tracking
- `linkapps.spinoff_queue` — Ventures awaiting Phase 7

See `LiNKaios/linkaios-web/src/app/(shell)/modules/linkapps/`

### LiNKbot (Role-Bound Workers)

Role definitions under `LiNKbot/roles/modules/linkapps/`:
- `technical-lead.md` — Cross-cutting architecture and squad coordination
- `product-owner.md` — PRD ownership and scope discipline
- `frontend-specialist.md` — Web UI implementation
- `backend-specialist.md` — API and business logic
- `database-architect.md` — Schema design (discovery-gated)
- `qa-automation-engineer.md` — Automated checks and CI
- `devops-engineer.md` — Deployment and pipelines
- `security-auditor.md` — Security review checkpoints

### LinkSkills (Capability Governance)

Capability connector manifests under `LiNKskills/capability-connectors/`:
- `cap.github.repo_management.yaml`
- `cap.supabase.provisioning.yaml`
- `cap.stripe.product_management.yaml`
- `cap.vercel.deployment.yaml`
- `cap.eas.build.yaml`
- `cap.plane.execution_tracking.yaml`
- `cap.zulip.run_messaging.yaml`

### LiNKautowork (Deterministic Workflows)

Workflow hooks under `LiNKautowork/gateway/src/workflows/`:
- `linkapps.ts` — App factory workflow pack
  - `autowork.linkapps.create_repo` — Stage 5.2
  - `autowork.linkapps.provision_services` — Stage 5.3
  - `autowork.linkapps.build_iteration` — Stage 5.4
  - `autowork.linkapps.release_readiness` — Stage 5.5
  - `autowork.linkapps.deploy` — Stage 5.6
  - `autowork.linkapps.compile_handoff` — Stage 5.7

### LiNKbrain (Memory & Audit)

Event schema under `LiNKbrain/events/`:
- `linkapps-event-schema.yaml` — Domain events and memory objects

Key memory types:
- `AppBlueprint` — PRD and business context (7 year retention)
- `SquadExecution` — Role assignments and timeline (3 year retention)
- `AppRepo` — Repository metadata (venture lifetime + 1 year)
- `DeploymentHistory` — Deploy refs and URLs (2 year retention)
- `ValidationReport` — Test and scan results (3 year retention)

## Phase 5 Stages

Per `LINKAPPS_VERTICAL_PLUGIN_CONVERSION_PLAN.md` §2.2:

1. **5.1 Squad Formation** — Assemble implementation squad
2. **5.2 Repository Generation** — Create app repo from starter kit
3. **5.3 Service Provisioning** — Provision Supabase, Stripe, etc.
4. **5.4 AI Implementation** — Autonomous squad execution iterations
5. **5.5 Quality Validation** — Run quality gates
6. **5.6 Deployment** — Deploy to preview environment
7. **5.7 Handoff Pack** — Prepare Phase 7 spinoff materials

## Development Mode Boundaries

Per `LINKAPPS_CAPABILITY_REQUIREMENTS.md` §1:

- All operations default to `mock` mode
- No real GitHub repos created in MVO
- No real Supabase/Stripe/Vercel provisioning in MVO
- No live EAS builds (mobile track off by default)
- No live Zulip messages (queued locally)
- Local artifact storage only

## References

- `LINKAPPS_VERTICAL_PLUGIN_CONVERSION_PLAN.md` (WP-085)
- `LINKAPPS_SQUAD_ORCHESTRATION_SPEC.md` (WP-107)
- `LINKAPPS_CAPABILITY_REQUIREMENTS.md` (WP-108)
- `CONTRACTS_MVO.md` §0.A.5.1 (Capability contract shape)
