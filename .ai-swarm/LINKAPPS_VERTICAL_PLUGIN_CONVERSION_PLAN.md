# LiNKapps Vertical Plugin Conversion Plan

**Document:** LINKAPPS_VERTICAL_PLUGIN_CONVERSION_PLAN.md  
**Work Packet:** WP-085  
**Date:** 2026-05-17  
**Status:** Planning Complete — Ready for Implementation Packets  

---

## Executive Summary

This document defines the conversion path for LiNKapps from a standalone App Factory starter kit into a governed **LiNKaios vertical plugin** called `linkapps.app_factory`. The plan maps the existing 7-phase venture lifecycle and autonomous squad structure into the LiNKtrend ecosystem architecture (LiNKaios, LiNKbrain, LinkSkills, LiNKautowork, LinkBot) without moving code yet.

**Key Design Decision:** LiNKapps becomes the "App Factory" vertical plugin that transforms Phase 3 blueprints (PRD + Business Plan) into working software through Phase 5, ultimately producing spinoff-ready ventures at Phase 7.

---

## 1. LiNKapps as Vertical Plugin Definition

### 1.1 Plugin Identity

| Field | Value |
|-------|-------|
| `plugin_id` | `linkapps.app_factory` |
| `plugin_kind` | `vertical` |
| `plugin_name` | LiNKapps App Factory |
| `version` | `1.0.0-mvo` |
| `purpose` | Transform venture blueprints into working software through autonomous squad execution |
| `modes_supported` | `["development"]` (MVO), `["shadow", "live"]` (future) |

### 1.2 Work Request Types

| Work Request Type | Input | Output | Purpose |
|-------------------|-------|--------|---------|
| `linkapps.app_factory.blueprint_to_app` | `blueprint_ref` | `app_repo_ref`, `deployment_refs` | Full Phase 5 implementation from blueprint |
| `linkapps.app_factory.prd_to_repo` | `prd_ref`, `app_slug` | `app_repo_ref` | Create app repo from PRD only |
| `linkapps.app_factory.squad_execution` | `squad_config`, `task_queue` | `execution_report` | Run autonomous squad on existing repo |
| `linkapps.app_factory.spinoff_prep` | `app_repo_ref` | `spinoff_package` | Prepare Phase 7 handoff materials |

### 1.3 Vertical vs Capability Plugin Boundary

**LiNKapps (Vertical Plugin) declares:**
- What work needs to happen (PRD → repo → deployed app)
- Which LinkBot roles execute each phase
- Which capability plugins are required (GitHub, Supabase, Stripe, Vercel, etc.)
- Workflow stages and their sequencing

**LiNKapps does NOT implement:**
- Git repository operations (delegated to `cap.github.repo_management`)
- Database provisioning (delegated to `cap.supabase.provisioning`)
- Payment configuration (delegated to `cap.stripe.product_management`)
- Deployment mechanics (delegated to `cap.vercel.deployment`)

---

## 2. 7-Phase Venture Workflow Mapping

### 2.1 Phase Mapping to Ecosystem Planes

| Phase | Name | Department | LiNKtrend Plane | LinkBot Role | LiNKautowork | LinkSkills |
|-------|------|------------|-----------------|--------------|--------------|------------|
| 1 | Discovery & Research | BD/Market Research | LinkBot (judgment) | `market_research_bot` | — | `research.public_web` |
| 2 | Feasibility & Stress-Testing | BD/Venture Architect | LinkBot (judgment) | `feasibility_bot` | — | `research.public_web`, `analytics.read` |
| 3 | Blueprinting | Cross-departmental | LinkBot + LiNKaios | `product_owner_bot` | `blueprint.compile` | `plane.project.write` |
| 4 | The Final Gate | Strategic Leadership | LiNKaios (approval) | — | `approval.gate_check` | `approval.request` |
| 5 | **Technical Implementation** | **Development** | **All Planes** | **Squad Roles** | **CI/CD workflows** | **Capability leases** |
| 6 | Launch & Traction | Growth/Media & Sales | LinkBot + LinkSkills | `growth_bot` | — | `postiz.distribution` |
| 7 | Spinout | All Departments | LiNKaios + LiNKbrain | — | `spinoff.package` | `audit.export` |

### 2.2 Phase 5 Technical Implementation — Detailed Breakdown

Phase 5 is LiNKapps' core responsibility. It executes within the vertical plugin as a multi-stage workflow:

```
Stage 5.1: squad_formation
├─ LinkBot: orchestrator (squad assembly)
├─ LinkSkills: lease squad_creation capability
└─ Output: squad_config with role assignments

Stage 5.2: repo_generation
├─ LinkBot: product_owner (PRD refinement)
├─ LiNKautowork: autowork.linkapps.create_repo
├─ LinkSkills: lease cap.github.repo_creation
└─ Output: app_repo_ref

Stage 5.3: service_provisioning
├─ LinkBot: backend-specialist (architecture review)
├─ LiNKautowork: autowork.linkapps.provision_services
├─ LinkSkills: leases for supabase, stripe, vercel
└─ Output: service_credentials_ref

Stage 5.4: ai_implementation
├─ LinkBots: frontend-specialist, backend-specialist, mobile-developer
├─ LiNKautowork: autowork.linkapps.build_iteration (deterministic checks)
├─ LinkSkills: leases for code_generation (if any external services)
└─ Output: built_app_bundle

Stage 5.5: quality_validation
├─ LinkBots: test-engineer, qa-automation-engineer, security-auditor
├─ LiNKautowork: autowork.linkapps.release_readiness
├─ LinkSkills: leases for test_execution
└─ Output: validation_report

Stage 5.6: deployment
├─ LinkBot: devops-engineer (deploy verification)
├─ LiNKautowork: autowork.linkapps.deploy
├─ LinkSkills: lease cap.vercel.deployment
└─ Output: deployment_refs

Stage 5.7: handoff_pack
├─ LinkBot: documentation-writer
├─ LiNKautowork: autowork.linkapps.compile_handoff
└─ Output: handoff_package
```

---

## 3. LinkBot Role Definitions for LiNKapps

### 3.1 Core Squad Roles (from LiNKapps `.agent/agents/`)

| Role ID | Source File | Purpose | Allowed Capabilities |
|---------|-------------|---------|---------------------|
| `product_owner` | `product-owner.md` | PRD ownership, scope control | `plane.project.write`, `zulip.notify` |
| `technical_lead` | `orchestrator.md` + `backend-specialist.md` | Architecture, coordination | All squad capabilities (gated) |
| `frontend_specialist` | `frontend-specialist.md` | Web UI implementation | `asset.generation`, `github.read` |
| `backend_specialist` | `backend-specialist.md` | API, business logic | `supabase.read`, `stripe.read` |
| `mobile_developer` | `mobile-developer.md` | React Native/Expo | `eas.deployment` (future) |
| `database_architect` | `database-architect.md` | Schema design | `supabase.schema.read` |
| `test_engineer` | `test-engineer.md` | Testing strategies | `testing.environment` |
| `qa_automation_engineer` | `qa-automation-engineer.md` | E2E, CI pipelines | `playwright.execution` |
| `devops_engineer` | `devops-engineer.md` | CI/CD, Docker | `vercel.deployment`, `github.actions` |
| `security_auditor` | `security-auditor.md` | Security compliance | `vulnerability.scan` |

### 3.2 Additional Roles for Full Venture Lifecycle

| Role ID | Purpose | Inputs | Outputs | Restrictions |
|---------|---------|--------|---------|--------------|
| `market_research_bot` | Discovery & Research | `market_segment`, `competitor_list` | `research_bundle` | `research_read_only` |
| `feasibility_bot` | Stress-testing | `blueprint_draft` | `feasibility_report` | `provenance_required` |
| `growth_bot` | Launch & Traction | `app_metrics`, `gtm_strategy` | `growth_plan` | `no_direct_publish` |

### 3.3 Role Contract Shape (per CONTRACTS_MVO.md)

```typescript
interface LinkappsRoleAttachment {
  role_id: string;                    // e.g. "frontend_specialist"
  purpose: string;
  inputs: ["app_repo_ref", "prd_ref", "design_tokens"];
  outputs: ["frontend_implementation_bundle", "ui_test_report"];
  allowed_capabilities: ["cap.asset.generation", "cap.github.read"];
  allowed_skills: ["react-best-practices", "tailwind-patterns", "frontend-design"];
  model_policy: {
    model_routing_profile: "coding-heavy";  // High-token tasks
    tools: ["Read", "StrReplace", "Shell"];
  };
  audit_events: ["role.started", "role.completed", "frontend.implemented"];
  development_restrictions: ["local_artifact_only", "no_production_deploy"];
}
```

---

## 4. LiNKautowork Workflow Hooks

### 4.1 Required Workflow Handles

| Workflow Handle | Purpose | Inputs | Outputs |
|-----------------|---------|--------|---------|
| `autowork.linkapps.create_repo` | Execute `create-app-repo.sh` logic | `app_slug`, `app_name`, `prd_ref` | `app_repo_ref`, `git_commit_sha` |
| `autowork.linkapps.provision_services` | Provision Supabase, Stripe | `app_slug`, `tenant_id` | `supabase_project_ref`, `stripe_product_ids` |
| `autowork.linkapps.build_iteration` | Deterministic build + check | `app_repo_ref`, `build_config` | `build_output`, `check_results` |
| `autowork.linkapps.release_readiness` | Run quality gates | `app_repo_ref`, `test_matrix` | `validation_report` |
| `autowork.linkapps.deploy` | Deploy to hosting | `app_repo_ref`, `deployment_target` | `deployment_refs` |
| `autowork.linkapps.compile_handoff` | Create spinoff package | `app_repo_ref`, `service_refs` | `handoff_package_ref` |

### 4.2 Workflow Input/Output Schemas

```typescript
// autowork.linkapps.create_repo
interface CreateRepoWorkflowInput {
  tenant_id: string;
  run_id: string;
  stage_id: string;
  app_slug: string;                    // kebab-case, validated
  app_name: string;
  prd_ref: string;                     // Reference to PRD in storage
  template_ref?: string;              // Default: "linkdev-starter-kit"
  idempotency_key: string;
}

interface CreateRepoWorkflowOutput {
  workflow_run_id: string;
  app_repo_ref: {
    repo_url: string;
    clone_url: string;
    default_branch: string;
    initial_commit_sha: string;
  };
  created_at: string;
  audit_event_ids: string[];
}
```

---

## 5. LinkSkills Capability Requirements

### 5.1 Required Capability Plugins

| Capability ID | Target Software | Operations | Mode | Lease Requirements |
|---------------|-----------------|------------|------|-------------------|
| `cap.github.repo_management` | GitHub/Git | `repo.create`, `repo.clone`, `commit.push` | `mock` (local git), `live` (GitHub API) | `github.repo.write` |
| `cap.supabase.provisioning` | Supabase | `project.create`, `migration.apply`, `rls.configure` | `mock` (local), `shadow` (readiness), `live` (project create) | `supabase.project.create` |
| `cap.stripe.product_management` | Stripe | `product.create`, `price.create`, `webhook.configure` | `mock` (fixtures), `shadow` (readiness), `live` (API) | `stripe.product.write` |
| `cap.vercel.deployment` | Vercel | `project.create`, `deploy.trigger`, `domain.configure` | `mock` (local build), `live` (deploy) | `vercel.deploy` |
| `cap.eas.build` | EAS (Expo) | `build.trigger`, `submit.app_store` | `mock` (skip), `live` (build) | `eas.build` |
| `cap.plane.execution_tracking` | Plane | `project.ensure`, `task.create`, `sprint.track` | `mock` (local), `shadow`, `live` | `plane.project.write` |
| `cap.zulip.run_messaging` | Zulip | `run.notify`, `channel.message` | `mock`, `shadow`, `live` | `zulip.message.send` |

### 5.2 Capability Lease Patterns

```typescript
// Example: Repo creation lease
interface RepoCreationLeaseRequest {
  tenant_id: string;
  run_id: string;
  stage_id: string;
  capability: "cap.github.repo_management";
  arguments: {
    operation: "repo.create";
    app_slug: string;
    template_ref: string;
  };
  idempotency_key: "${run_id}:stage_5.2:repo.create:${app_slug}";
}
```

---

## 6. LiNKbrain Memory & Audit Requirements

### 6.1 Required Audit Event Types

| Event Type | Description | Payload Fields |
|------------|-------------|----------------|
| `linkapps.blueprint.received` | Phase 3 handoff to Phase 5 | `blueprint_ref`, `venture_id` |
| `linkapps.squad.formed` | Squad creation complete | `squad_config`, `role_assignments` |
| `linkapps.repo.created` | App repo generated | `app_repo_ref`, `template_used` |
| `linkapps.services.provisioned` | Infrastructure ready | `service_refs`, `provision_time_ms` |
| `linkapps.build.iteration` | AI implementation cycle | `iteration_num`, `files_changed`, `check_results` |
| `linkapps.validation.passed` | Quality gates passed | `validation_report_ref` |
| `linkapps.deployed` | App live | `deployment_refs`, `urls` |
| `linkapps.handoff.ready` | Phase 7 handoff prepared | `handoff_package_ref` |
| `linkapps.spunoff` | Venture independence | `spinoff_entity_ref` |

### 6.2 Memory Objects

| Memory Type | Schema | Retention |
|-------------|--------|-----------|
| `AppBlueprint` | PRD, business plan, GTM strategy | 7 years (venture lifecycle) |
| `SquadExecution` | Role assignments, iterations, outputs | 3 years |
| `AppRepo` | Repo URL, commits, branches | Duration of venture + 1 year |
| `DeploymentHistory` | Deploy refs, URLs, timestamps | 2 years |
| `ValidationReport` | Test results, security scans | 3 years |

---

## 7. LiNKaios UI Panels

### 7.1 Required UI Panels

| Panel ID | Purpose | Data Sources |
|----------|---------|--------------|
| `linkapps.factory_dashboard` | Overview of active app builds | Runs, stages, squad status |
| `linkapps.blueprint_intake` | Submit new venture blueprints | Work request form |
| `linkapps.squad_monitor` | Real-time squad execution view | Stage refs, LinkBot outputs |
| `linkapps.build_logs` | Build iteration history | LiNKautowork workflow runs |
| `linkapps.validation_results` | Quality gate reports | Validation workflow outputs |
| `linkapps.deployment_history` | Deploy tracking | Vercel/EAS capability events |
| `linkapps.spinoff_queue` | Ventures awaiting Phase 7 | Handoff package status |

### 7.2 Read Views

| View ID | Purpose | Filters |
|---------|---------|---------|
| `linkapps.ventures.list` | All ventures | phase, status, tenant |
| `linkapps.squads.list` | Active squads | role composition, run_id |
| `linkapps.templates.catalog` | Available starter kits | technology, maturity |

---

## 8. Architecture Boundaries

### 8.1 LiNKapps Vertical Plugin — MUST NOT

Per `ARCHITECTURE_RULES.md` and `PLUGIN_ARCHITECTURE_V2.md`:

| Responsibility | Delegated To | Rationale |
|---------------|--------------|-----------|
| Git operations | `cap.github.repo_management` | Capability plugins own connectors |
| Database hosting | `cap.supabase.provisioning` | Don't invent infrastructure |
| Payment processing | `cap.stripe.product_management` | Side effects through LinkSkills |
| CDN/deployment | `cap.vercel.deployment` | External service boundary |
| Squad memory | LiNKbrain | Institutional memory plane |
| Lease issuance | LinkSkills | Permission governance plane |
| Workflow execution | LiNKautowork | Deterministic execution plane |
| Tenant routing | LiNKaios kernel | Coordination plane |

### 8.2 Linktrend Development Pod vs LiNKapps Vertical

**Linktrend Development Pod** (internal operations):
- Maintains the LiNKapps starter kit itself
- Updates templates, packages, skills
- Operates as a "meta-squad" improving the factory

**LiNKapps Vertical Plugin** (external service):
- Uses the starter kit to build client ventures
- Orchestrates squads for venture implementations
- Records audit trails for venture lifecycle

**Separation Rule:** The pod maintains the factory machinery; the vertical plugin runs the factory floor.

---

## 9. Migration/Adaptation Strategy

### 9.1 Reuse-First Mapping

| LiNKapps Asset | Reuse Action | Target Location |
|----------------|--------------|-----------------|
| `scripts/create-app-repo.sh` | Copy/adapt | `LiNKautowork/workflows/linkapps/create_repo/` |
| `scripts/release-readiness.sh` | Copy/adapt | `LiNKautowork/workflows/linkapps/release_readiness/` |
| `.agent/agents/*.md` | Reference/copy | `LinkBot/roles/linkapps/` |
| `.agent/skills/*.md` | Reference | LinkSkills skills catalog |
| `.agent/workflows/*.md` | Adapt | LiNKaios slash commands |
| `apps/web/` template | Reference | `LiNKsites` template catalog |
| `packages/ui/` | Integrate | `LiNKsites/packages/ui/` |
| `docs/00_OPERATOR_LIBRARY/` | Reference | Training materials |

### 9.2 Proposed File Structure (Future Implementation)

```
LiNKtrend-System/
├── plugins/vertical/linkapps/
│   ├── manifest.json                    # Plugin declaration
│   ├── stages/
│   │   ├── 5.1_squad_formation.ts
│   │   ├── 5.2_repo_generation.ts
│   │   ├── 5.3_service_provisioning.ts
│   │   ├── 5.4_ai_implementation.ts
│   │   ├── 5.5_quality_validation.ts
│   │   ├── 5.6_deployment.ts
│   │   └── 5.7_handoff_pack.ts
│   ├── roles/
│   │   ├── product_owner.ts
│   │   ├── technical_lead.ts
│   │   ├── frontend_specialist.ts
│   │   ├── backend_specialist.ts
│   │   ├── mobile_developer.ts
│   │   ├── database_architect.ts
│   │   ├── test_engineer.ts
│   │   ├── qa_automation_engineer.ts
│   │   ├── devops_engineer.ts
│   │   └── security_auditor.ts
│   └── ui/
│       ├── factory_dashboard.tsx
│       ├── squad_monitor.tsx
│       └── blueprint_intake.tsx
└── plugins/capability/                   # Referenced, not created here
    ├── github/
    ├── supabase/
    ├── stripe/
    └── vercel/
```

---

## 10. Follow-Up Work Packets

### 10.1 Recommended Packet Sequence

| Packet | Title | Dependencies | Owner |
|--------|-------|--------------|-------|
| **WP-106** | LiNKapps Plugin Manifest Definition | WP-085 | linkaios-agent |
| **WP-107** | LiNKapps Squad Orchestration Design | WP-106 | linkbot-agent |
| **WP-108** | LiNKapps Capability Requirements Spec | WP-106 | linkskills-agent |
| **WP-109** | LiNKapps LiNKautowork Workflow Pack | WP-106, WP-108 | linkautowork-agent |
| **WP-110** | LiNKapps UI Panel Design | WP-106 | frontend-agent |
| **WP-111** | LiNKapps LiNKbrain Event Schema | WP-106 | linkbrain-agent |
| **WP-112** | LiNKapps Capability Plugin Contracts | WP-108 | integration-agent |

### 10.2 Packet WP-106: LiNKapps Plugin Manifest Definition

**Objective:** Create the concrete plugin manifest for `linkapps.app_factory`.

**Acceptance Criteria:**
- [ ] Complete `manifest.json` per `PLUGIN_ARCHITECTURE_V2.md`
- [ ] All 7 Phase 5 stages declared
- [ ] All 10+ LinkBot roles attached
- [ ] All required capabilities listed
- [ ] All required workflow hooks mapped
- [ ] All required audit events enumerated

**Allowed Files:**
- `plugins/vertical/linkapps/manifest.json`
- `.ai-swarm/WORK_PACKETS/WP-106*.md`

### 10.3 Packet WP-107: LiNKapps Squad Orchestration Design

**Objective:** Define how LiNKaios coordinates multiple LinkBot agents as a squad.

**Hard Questions to Answer:**
1. How does the orchestrator agent dispatch to specialist agents?
2. What is the squad communication protocol?
3. How are intermediate artifacts shared between squad members?
4. What is the escalation path when a squad member fails?

**Acceptance Criteria:**
- [ ] Squad formation protocol defined
- [ ] Inter-agent communication contract specified
- [ ] Artifact sharing mechanism designed
- [ ] Failure/reassignment policy documented

### 10.4 Packet WP-108: LiNKapps Capability Requirements Spec

**Objective:** Define precise capability lease requirements for all LiNKapps operations.

**Deliverables:**
- Capability matrix (operation × mode × lease)
- Idempotency key patterns
- Failure mapping to canonical error codes
- Kill switch requirements

---

## 11. Open Questions & User Decisions Required

### 11.1 Hard Unknowns

| Question | Context | Recommendation |
|----------|---------|--------------|
| **Squad Formation Trigger** | How does Phase 4 approval trigger squad formation? | LiNKaios approval hook → work request |
| **Role Assignment Algorithm** | How are specific agents assigned to squad roles? | Tenant config + availability + skill matching |
| **Phase 3→5 Context Handoff** | How does blueprint data transfer to squad? | LiNKbrain memory object + run input |
| **Multi-App Concurrency** | How many apps can one squad build simultaneously? | Default: 1, Configurable: N |
| **Spinoff Mechanics** | What is the technical process for venture independence? | Export package + transfer credentials |

### 11.2 Scope Decisions Needed

| Decision | Options | Default |
|----------|---------|---------|
| Mobile app generation | Include in MVO? | No (web-only MVO) |
| Custom templates | Allow non-starter-kit templates? | No (v2 feature) |
| E-commerce focus | Stripe billing required in MVO? | Yes (core feature) |
| Multi-tenant apps | Generate SaaS vs single-tenant? | Single-tenant only |
| AI model diversity | Multiple models per squad? | No (inherit routing profile) |

---

## 12. Evidence & Source References

### 12.1 Files Inspected

| Path | Purpose | Relevance |
|------|---------|-----------|
| `LiNKapps/scripts/create-app-repo.sh` | App generation entry point | Core workflow step |
| `LiNKapps/scripts/release-readiness.sh` | Quality gates | Stage 5.5 validation |
| `LiNKapps/.agent/ARCHITECTURE.md` | Agent ecosystem design | Role mapping source |
| `LiNKapps/.agent/agents/*.md` | 20 agent definitions | LinkBot role contracts |
| `LiNKapps/.agent/workflows/*.md` | 11 slash commands | Workflow templates |
| `LiNKapps/docs/00_OPERATOR_LIBRARY/` | Governance docs | Process patterns |

### 12.2 Contract References

| Document | Section | Binding Rule |
|----------|---------|--------------|
| `CONTRACTS_MVO.md` | §0.A (LinkSites v2) | Mode model, role attachments |
| `CONTRACTS_MVO.md` | §1.0.1 (Plugin kinds) | Vertical vs capability boundary |
| `CONTRACTS_MVO.md` | §1.0.3 (LinkBot roles) | Role contract shape |
| `PLUGIN_ARCHITECTURE_V2.md` | All | Plugin declaration rules |
| `ARCHITECTURE_RULES.md` | Planes | Responsibility boundaries |

---

## 13. Summary

This conversion plan establishes LiNKapps as a first-class LiNKaios vertical plugin (`linkapps.app_factory`) while preserving all existing starter kit value. The plan:

1. **Maps** the 7-phase venture lifecycle to ecosystem planes
2. **Defines** 10+ LinkBot roles with contracts
3. **Specifies** 6+ LiNKautowork workflow hooks
4. **Enumerates** 7+ capability plugin requirements
5. **Declares** 9+ audit event types for LiNKbrain
6. **Lists** 7+ UI panels for LiNKaios
7. **Separates** Linktrend Development pod concerns from LiNKapps vertical concerns
8. **Proposes** 7 follow-up work packets for implementation

**Next Step:** WP-106 (Plugin Manifest Definition) when the user approves this plan and prioritizes the LiNKapps vertical for implementation.

---

*Document created per WP-085. Clean worktree verified. No code moved. No LiNKapps modifications.*
