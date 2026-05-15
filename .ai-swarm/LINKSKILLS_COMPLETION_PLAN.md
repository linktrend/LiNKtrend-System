# LinkSkills Completion Plan and Governance Service Hardening

**Work Packet:** WP-060  
**Status:** Planning Complete  
**Date:** 2026-05-15  
**Branch:** `dev/codex/WP-060-linkskills-completion-plan-governance-service-hardening`

---

## 1. Executive Summary

LinkSkills serves **dual responsibilities** in the LiNKtrend ecosystem:

1. **Permission/Control Plane**: Capability leases, side-effect governance, kill switches, idempotency, run ledger
2. **Governed Skills Service**: Golden Template preservation, skill catalog, progressive disclosure/discovery, certification

This completion plan defines the path to fulfill both responsibilities while preserving contracts from the old LiNKskills repo and aligning with the current ecosystem architecture.

---

## 2. Dual Responsibility Framework

### 2.1 Permission/Control Plane Responsibilities (LiNKtrend-System)

| Component | Status | Evidence Path | Target |
|-----------|--------|---------------|--------|
| Capability catalog registry | MISSING | N/A - new component | `linkskills.capabilities` table + API |
| Lease lifecycle engine | PARTIAL | `LiNKskills/services/logic-engine` exists | Adapt to LiNKaios contract (§6.2) |
| Run ledger | PARTIAL | `LiNKskills/services/logic-engine` disclosure/receipt | Align with LiNKbrain audit envelope |
| Idempotency service | MISSING | N/A | 24h dedupe window per CONTRACTS_MVO §6.2 |
| Kill switch mechanism | MISSING | N/A - needs new implementation | Per capability + global levels |
| Side-effect gating | MISSING | N/A - contract defined | All capabilities gated by lease |
| Approval routing surface | MISSING | N/A - belongs to LiNKaios kernel | LinkSkills grants/denies only |

### 2.2 Governed Skills Service Responsibilities

| Component | Status | Evidence Path | Target |
|-----------|--------|---------------|--------|
| Golden Template | PRESERVED | `LiNKskills/skills/skill-template/SKILL.md` | Copy/adapt to new repo |
| Skill catalog API | MISSING | N/A | Discovery endpoint for LinkBots |
| Progressive disclosure | MISSING | PRD_LINKSKILLS_LOGIC_ENGINE §12 | Run-scoped fragment delivery |
| Skill certification | PARTIAL | `LiNKskills/validator.py` | Adapt validation logic |
| Package orchestration | MISSING | N/A - new | Department bundles (future) |
| Tool registry | PARTIAL | `LiNKskills/tools/` structure | Governed tool catalog |

---

## 3. Evidence Inventory from Old Repo

### 3.1 Reusable Components (Copy/Adapt)

| Source Path | Target Use | Notes |
|-------------|------------|-------|
| `LiNKskills/skills/skill-template/SKILL.md` | Golden Template master | Copy with version update |
| `LiNKskills/skills/skill-architect/SKILL.md` | Meta-skill reference | Reference for LinkBot skill usage |
| `LiNKskills/validator.py` | Validation framework base | Adapt for `packages/linklogic-sdk` |
| `LiNKskills/services/logic-engine/` | Runtime patterns | Service structure reference only |
| `LiNKskills/configs/service_ownership.json` | Ownership pattern | Adapt for capability ownership |
| `LiNKskills/scripts/` | CLI-first patterns | Tooling conventions |

### 3.2 Source-Only Evidence (Do Not Copy)

| Source Path | Why Source-Only | Relevant Contracts |
|-------------|-----------------|-------------------|
| `LiNKskills/services/logic-engine/src/capability-catalog.ts` | Old architecture different | CONTRACTS_MVO §6.2, §7.5 |
| `LiNKskills/services/logic-engine/src/disclosure/` | Old disclosure model | Progressive disclosure §12.3 |
| `LiNKskills/services/logic-engine/src/billing/` | LiNKbrain owns ledger | Financial ledger in LiNKbrain |
| `LiNKskills/SOP_MVO_CLASS_A.md` | Operating procedure for old repo | Reference for kill switch thresholds |
| `LiNKskills/SOP_MACHINE_MVO_CLASS_A.md` | Machine protocol for old repo | Idempotency contract reference |

### 3.3 Key Contract Mappings

| Old Repo Concept | New Ecosystem Mapping | Contract Reference |
|------------------|----------------------|-------------------|
| `POST /v1/runs` | LiNKaios `WorkRequest` → LinkSkills lease request | CONTRACTS_MVO §4.1, §6.2 |
| `POST /v1/disclosures/issue` | LinkSkills progressive disclosure | PRD §12.3, CONTRACTS_MVO §6.2 |
| `capability_id` | `capability` in lease request | CONTRACTS_MVO §6.2 |
| `disclosure claim` | `LeaseDecision` + `LeaseExecute` | CONTRACTS_MVO §6.2 |
| Class A/B/C | Capability modes (development/shadow/live) | PLUGIN_ARCHITECTURE_V2 §1.0.2 |
| DPR | LinkSkills lease validation | Old: D-07, New: LinkSkills lease |
| Kill switch Level 2 | Kill switch per capability | SOP_MVO_CLASS_A §10 |

---

## 4. Completion Targets by Work Area

### 4.1 Target A: Capability Catalog + Registry

**Definition:** Machine-readable capability registry with full contract definitions.

**Requirements:**
- Store capability metadata: id, operations, modes, auth requirements, lease requirements
- Schema validation for capability args/results
- Version management
- Link to skill definitions for governed capabilities

**Contract Alignment:**
- `CapabilityPluginSurface` from CONTRACTS_MVO §1.2
- `cap.*` plugin IDs from §0.A.5

**Evidence Sources:**
- `LiNKskills/services/logic-engine/generated/catalog.json` (structure reference)
- `LiNKskills/config/packages.json` (package structure)

**Completion Criteria:**
- [ ] Capability catalog table in LiNKbrain schema
- [ ] API endpoints for capability discovery
- [ ] Validation that all `cap.*` ids in CONTRACTS_MVO §0.A.5 are registered

---

### 4.2 Target B: Lease Lifecycle Engine

**Definition:** Complete lease request → grant → execute → record flow.

**Requirements:**
- `skills.lease.request` endpoint (CONTRACTS_MVO §6.2)
- `skills.lease.decision` response with `granted|denied|requires_approval`
- `skills.lease.execute` with idempotency
- `LeaseExecuteResult` with `ledger_entry_id` + `audit_event_id`
- TTL management (default 5 min expiry)

**Contract Alignment:**
- CONTRACTS_MVO §6.2 complete
- Idempotency: 24h window per SOP_MACHINE_MVO_CLASS_A §7

**Evidence Sources:**
- `LiNKskills/services/logic-engine/src/` disclosure/lease patterns
- `LiNKskills/SOP_MVO_CLASS_A.md` §4, §5

**Completion Criteria:**
- [ ] Lease request → decision flow
- [ ] Lease execute with idempotency key handling
- [ ] Run ledger persistence
- [ ] Audit event emission to LiNKbrain
- [ ] Expiry management

---

### 4.3 Target C: Idempotency Service

**Definition:** Cross-lease idempotency with 24h dedupe window.

**Requirements:**
- Idempotency key: `${run_id}:${stage_id}:${capability}`
- 24h TTL per CONTRACTS_MVO §6.2 + SOP_MACHINE_MVO_CLASS_A §7
- Same key + same payload → return original result
- Same key + different payload → 409 conflict
- Scope: endpoint + tenant + principal + key + payload hash

**Contract Alignment:**
- CONTRACTS_MVO §6.2: "idempotency_key MUST equal..."
- SOP_MACHINE_MVO_CLASS_A §7

**Evidence Sources:**
- `LiNKskills/SOP_MACHINE_MVO_CLASS_A.md` §7
- `LiNKskills/SOP_MVO_CLASS_A.md` §5

**Completion Criteria:**
- [ ] Idempotency key validation
- [ ] Result caching with 24h TTL
- [ ] Conflict detection for mismatched payloads
- [ ] Cleanup/retention sweep

---

### 4.4 Target D: Kill Switch Mechanism

**Definition:** Multi-level kill switch for capabilities and global operations.

**Requirements:**
- Per-capability kill switch (open/tripped)
- Global Level 2 halt (blocks new runs)
- Automated triggers per SOP_MVO_CLASS_A §10:
  - Runaway cost: 15-min spend > $75, OR burn-rate > 3x 24h avg
  - Security: >= 3 critical exceptions in 10 min
- Manual override capability

**Contract Alignment:**
- CONTRACTS_MVO §6.2: `kill_switch_state: "open" | "tripped"`
- SOP_MVO_CLASS_A §10

**Evidence Sources:**
- `LiNKskills/SOP_MVO_CLASS_A.md` §10
- `LiNKskills/SOP_MACHINE_MVO_CLASS_A.md` §9

**Completion Criteria:**
- [ ] Kill switch state per capability
- [ ] Level 2 halt mechanism
- [ ] Automated trigger detection
- [ ] Admin override surface
- [ ] Kill switch check in lease request path

---

### 4.5 Target E: Run Ledger

**Definition:** Immutable record of all capability executions.

**Requirements:**
- Record: `ledger_entry_id`, `lease_id`, `capability`, `arguments`, `result`, `executed_at`
- Query by tenant, run_id, capability, time range
- Tamper-evident (hash chain or similar)
- Retention: metadata 180d per SOP_MVO_CLASS_A §12

**Contract Alignment:**
- CONTRACTS_MVO §6.2: `ledger_entry_id` in `LeaseExecuteResult`
- SOP_MVO_CLASS_A §8

**Evidence Sources:**
- `LiNKskills/services/logic-engine/` disclosure/receipt patterns

**Completion Criteria:**
- [ ] Ledger table schema
- [ ] Write on every lease execution
- [ ] Query API
- [ ] Retention sweep integration

---

### 4.6 Target F: Golden Template Preservation

**Definition:** Standardized skill structure for LinkBot skill usage.

**Requirements:**
- YAML frontmatter with: name, description, version, engine, tooling, permissions
- Decision Tree for fail-fast execution
- 5-phase workflow (Ingestion, Logic, Drafting, Finalization, Audit)
- Persistence: `.workdir/tasks/{task_id}/state.jsonl`
- Contracts: input/output/state schemas
- Progressive disclosure references

**Contract Alignment:**
- `skill-template/SKILL.md` from old repo
- PRD_LINKSKILLS_LOGIC_ENGINE §11.1

**Evidence Sources:**
- `LiNKskills/skills/skill-template/SKILL.md`
- `LiNKskills/skills/skill-architect/SKILL.md`

**Completion Criteria:**
- [ ] Golden Template copied to `packages/linklogic-sdk/templates/skill-golden.md`
- [ ] Template validation in SDK
- [ ] Documentation for LinkBot skill usage

---

### 4.7 Target G: Progressive Discovery/Disclosure

**Definition:** Run-scoped skill fragment delivery.

**Requirements:**
- Public contract layer (discovery)
- Runtime disclosure layer (execution)
- Signed, time-limited disclosure tokens
- Scope: tenant + capability + run + step
- No full source disclosure by default

**Contract Alignment:**
- PRD_LINKSKILLS_LOGIC_ENGINE §12
- Old repo disclosure patterns

**Evidence Sources:**
- `LiNKskills/PRD_LINKSKILLS_LOGIC_ENGINE.md` §12
- `LiNKskills/services/logic-engine/src/disclosure/`

**Completion Criteria:**
- [ ] Public contract schema
- [ ] Disclosure token issuance
- [ ] Run-scoped manifest generation
- [ ] Client execution mode support (managed/hybrid/client-side)

---

### 4.8 Target H: Skill Catalog API

**Definition:** Discovery endpoint for LinkBots to find available skills.

**Requirements:**
- List skills by department/bundle
- Get skill public contract
- Skill versioning and lifecycle
- Entitlement filtering by tenant

**Contract Alignment:**
- PRD_LINKSKILLS_LOGIC_ENGINE §15.1
- Skill manifest structure

**Evidence Sources:**
- `LiNKskills/SKILLS_CATALOGUE.md`
- `LiNKskills/manifest.json`

**Completion Criteria:**
- [ ] Catalog endpoint: `GET /v1/catalog/skills`
- [ ] Skill detail endpoint
- [ ] Department bundle listing
- [ ] Version and lifecycle metadata

---

## 5. Follow-Up Work Packets

### WP-061: LinkSkills Database Schema + Migrations
**Objective:** Create LiNKbrain tables for capability catalog, lease ledger, idempotency, kill switches.
**Depends on:** WP-042 (discovery for schema alignment), WP-006 (LiNKbrain base tables)
**Scope:**
- `linkskills.capabilities` table
- `linkskills.lease_ledger` table
- `linkskills.idempotency_cache` table
- `linkskills.kill_switches` table
- RLS policies for tenant isolation

### WP-062: LinkSkills Capability Catalog API
**Objective:** Implement capability registry CRUD and discovery endpoints.
**Depends on:** WP-061
**Scope:**
- `GET /v1/capabilities` - list with filtering
- `GET /v1/capabilities/{capability_id}` - detail
- Internal registration API for capability plugins
- Validation against `CapabilityPluginSurface` contract

### WP-063: LinkSkills Lease Lifecycle Implementation
**Objective:** Full lease request/decision/execute flow.
**Depends on:** WP-061, WP-062
**Scope:**
- `skills.lease.request` endpoint
- `skills.lease.decision` response
- `skills.lease.execute` endpoint
- Idempotency integration
- Kill switch checks
- Audit event emission

### WP-064: LinkSkills Kill Switch + Safety Controls
**Objective:** Kill switch state management and automated triggers.
**Depends on:** WP-061
**Scope:**
- Kill switch state API
- Level 2 halt mechanism
- Cost threshold monitoring
- Security exception counting
- Admin override surface

### WP-065: LinkSkills Golden Template + Skill SDK
**Objective:** Copy Golden Template and create skill validation SDK.
**Depends on:** None (can parallel with WP-061)
**Scope:**
- Copy `skill-template/SKILL.md` to SDK
- YAML frontmatter parser
- Template validation
- Skill scaffolding helper

### WP-066: LinkSkills Progressive Disclosure Service
**Objective:** Run-scoped disclosure token generation.
**Depends on:** WP-063 (leases), WP-065 (templates)
**Scope:**
- Disclosure token structure (JWT or similar)
- Token signing and validation
- Run-scoped manifest generation
- Fragment selection logic

### WP-067: LinkSkills Integration Test Harness
**Objective:** End-to-end test for capability lease flows.
**Depends on:** WP-063
**Scope:**
- Mock capability backend
- Full lease lifecycle test
- Idempotency verification
- Kill switch verification
- Audit event assertion

---

## 6. Cross-Service Integration Points

### 6.1 LiNKaios Kernel Integration
| LinkSkills Surface | LiNKaios Usage |
|-------------------|----------------|
| `skills.lease.request` | Kernel calls for capability side effects |
| `skills.lease.decision` | Kernel receives lease_id for stage.refs |
| `skills.lease.execute` | Kernel or delegated plane executes |
| Capability catalog | Kernel validates `required_capabilities` at boot |

### 6.2 LiNKbrain Integration
| LinkSkills Surface | LiNKbrain Usage |
|-------------------|-----------------|
| `brain.audit.write` | LinkSkills emits `lease.*` events |
| Ledger storage | LiNKbrain tables for lease records |
| Retention sweep | LiNKbrain retention worker includes lease ledger |

### 6.3 LinkBot Integration
| LinkSkills Surface | LinkBot Usage |
|-------------------|-----------------|
| Skill catalog | LinkBot discovers available skills |
| Golden Template | LinkBot skill structure reference |
| Disclosure tokens | LinkBot receives run-scoped skill fragments |
| Capability leases | LinkBot NEVER issues directly (kernel only) |

### 6.4 LiNKautowork Integration
| LinkSkills Surface | LiNKautowork Usage |
|-------------------|-------------------|
| `skills.lease.request` | Workflow calls for side-effecting steps |
| `lease_id` | Workflows reference lease in audit |
| Capability backends | LiNKautowork may implement capability execution |

---

## 7. Mode Model for Capabilities

Per CONTRACTS_MVO §1.0.2 and §0.A.5, all LinkSkills-governed capabilities support:

| Mode | Behavior | Default for v2 MVO |
|------|----------|-------------------|
| `development` | Mock/local side effects | Yes |
| `shadow` | Read-only external validation | Optional |
| `live` | Real external side effects | Disabled (explicit opt-in) |

Capability implementations:
- Must declare supported modes in catalog
- Must validate mode at lease execution
- Must emit `payload.mode` in audit events
- Cannot execute `live` when kill switch tripped

---

## 8. Evidence Path Summary

| Required Contract | Old Repo Evidence | New Implementation |
|-------------------|-------------------|-------------------|
| Golden Template | `skill-template/SKILL.md` | WP-065 |
| Lease lifecycle §6.2 | `services/logic-engine/` patterns | WP-063 |
| Idempotency | `SOP_MACHINE_MVO_CLASS_A.md` §7 | WP-061 (schema) |
| Kill switches | `SOP_MVO_CLASS_A.md` §10 | WP-064 |
| Capability catalog | `generated/catalog.json` structure | WP-062 |
| Progressive disclosure | `PRD_LINKSKILLS_LOGIC_ENGINE.md` §12 | WP-066 |
| Run ledger | `services/logic-engine/` receipt patterns | WP-061 |
| Audit events | `SOP.md` audit patterns | CONTRACTS_MVO §6.3 |

---

## 9. Decision Log

### D-060-A: Old Repo Role
The old LiNKskills repo (`/Users/linktrend/Projects/LiNKskills`) is **source evidence only** for contracts and patterns. Do not copy implementation files blindly. The `services/logic-engine/` architecture is different from the ecosystem plane model.

### D-060-B: Dual Responsibility Acknowledged
LinkSkills in LiNKtrend-System has **both** permission plane AND skills service responsibilities. These are not separate systems—they are unified through the capability catalog where each capability declares its lease requirements and skill bindings.

### D-060-C: Progressive Disclosure Deferred
Full progressive disclosure service (WP-066) is deferred until after core lease lifecycle (WP-063) is complete. Public contract layer can be simpler in first implementation.

### D-060-D: Kill Switch Thresholds Reused
Cost and security thresholds from `SOP_MVO_CLASS_A.md` §10 are reused as starting points. Actual thresholds may be adjusted based on LiNKaios operational data.

### D-060-E: Class A/B/C → Modes
The old repo's Class A/B/C classification maps to the mode model:
- Class A (internal managed) → `development` + `shadow`
- Class B (proprietary) → `shadow` + opt-in `live`
- Class C (external) → Future, requires full disclosure policy

---

## 10. Acceptance Criteria Summary

- [ ] LinkSkills completion plan preserves both governance/control AND skills-service responsibilities
- [ ] Golden Template/progressive disclosure are first-class requirements
- [ ] Follow-up packets WP-061 through WP-067 are concrete and scoped
- [ ] All `cap.*` capabilities from CONTRACTS_MVO §0.A.5 can be registered
- [ ] Lease lifecycle matches CONTRACTS_MVO §6.2 exactly
- [ ] Kill switch and idempotency contracts are implementable
- [ ] Evidence paths from old repo are documented
- [ ] Cross-service integration points are defined

---

## 11. Related Documents

- `.ai-swarm/CONTRACTS_MVO.md` - Canonical contracts
- `.ai-swarm/PLUGIN_ARCHITECTURE_V2.md` - Plugin model
- `.cursor/rules/01-ecosystem-boundaries.mdc` - Plane responsibilities
- `/Users/linktrend/Projects/LiNKskills/README.md` - Old repo structure
- `/Users/linktrend/Projects/LiNKskills/SOP_MVO_CLASS_A.md` - Operating patterns
- `/Users/linktrend/Projects/LiNKskills/skills/skill-template/SKILL.md` - Golden Template

---

*Plan authored per WP-060. Implementation via WP-061..WP-067.*
