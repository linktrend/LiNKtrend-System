# LiNKapps Squad Orchestration Specification

**Document:** `LINKAPPS_SQUAD_ORCHESTRATION_SPEC.md`  
**Work packet:** WP-107  
**Date:** 2026-05-17  
**Status:** Specification (no runtime implementation)

---

## Purpose

Define how **LiNKaios** coordinates multiple **LinkBot** roles as a governed implementation squad for the `linkapps.app_factory` vertical plugin during Phase 5 (Technical Implementation). This document is authoritative for orchestration behavior in **development mode** (`modes_supported` includes `"development"` per `LINKAPPS_VERTICAL_PLUGIN_CONVERSION_PLAN.md` §1.1).

---

## Contract anchor: LiNKaios ↔ LinkBot

All per-role reasoning work is dispatched through the **`bot.reason` / `bot.reason.result`** contract described in **`CONTRACTS_MVO.md` §6.1**.

LiNKapps extends WebsiteFactory’s pinned `reasoning_kind` vocabulary **only through the vertical plugin manifest** (WP-106): each squad-capable `reasoning_kind` MUST be declared there with typed inputs/outputs. Regardless of vocabulary extension, LinkBot remains a **delegating shell** per §6.1:

- MUST NOT write LiNKbrain memory directly (audit via envelope only).
- MUST NOT issue LinkSkills leases (kernel requests leases; bot consumes granted leases only as narrowed tooling policy allows).
- MUST NOT execute deterministic workflow steps (LiNKautowork owns those).

Cross-plane identifiers (`tenant_id`, `run_id`, `stage_id`, `trace_id`) apply to every dispatch per **`CONTRACTS_MVO.md` §6** introduction.

---

## 1. Orchestrator dispatch model

### 1.1 Roles

| Concept | Owner | Responsibility |
|--------|-------|------------------|
| **Squad orchestrator** | LiNKaios kernel + vertical plugin stage graph | Chooses next squad task, binds `role_id` → runnable dispatch, enforces concurrency and gates |
| **Technical lead / orchestrator persona** | LinkBot role (`technical_lead`, sourced from LiNKapps `orchestrator.md` semantics) | Plans sequencing **within** an orchestration slice (sub-task breakdown, specialist recommendations); outputs structured plans consumed by kernel |
| **Specialists** | LinkBot roles (`frontend_specialist`, `backend_specialist`, …) | Execute bounded reasoning slices; produce artifact refs and structured outputs |

Native LiNKapps `.agent/agents/orchestrator.md` describes **tool-local** multi-agent patterns (e.g. Claude Code Agent tool). Under LiNKtrend governance, **LiNKaios is the sole authoritative orchestrator**: it replaces ad hoc agent invocation with **manifest-driven stages**, **`stage`/`run` lifecycle** (`CONTRACTS_MVO.md` §4), and **`FailureReport`** handling (`CONTRACTS_MVO.md` §5).

### 1.2 Dispatch algorithm (kernel)

For each Phase 5 substage that requires judgment:

1. **Resolve context:** Load run input + LiNKbrain memory handles (`AppBlueprint`, `SquadExecution`, `AppRepo` per `LINKAPPS_VERTICAL_PLUGIN_CONVERSION_PLAN.md` §6.2).
2. **Select role:** Apply **role assignment rules** (§4); produce `role_id`, `reasoning_kind`, and `inputs`.
3. **Pre-authorize side effects:** For operations that imply capability use, kernel obtains leases **before** or **around** dispatch per §3 (LinkSkills touchpoints).
4. **Emit audit:** `linkapps.role.started` (see §8) before invoking `bot.reason`.
5. **Dispatch:** Call LinkBot with `BotReasonRequest` (§6.1); attach `model_routing_profile` from tenant/policy (D-06); enforce `pii_policy: "strip_contact"` unless a future policy explicitly documents otherwise.
6. **Persist outputs:** Store **`outputs`** as stage artifacts (refs + typed summaries); emit `linkapps.role.completed` or failure path events.
7. **Hand off deterministic work:** If substage requires builds/tests/deploy, enqueue LiNKautowork per **`CONTRACTS_MVO.md` §6.4** — LinkBot never runs those workflows directly.

Parallel specialists within one substage (e.g. FE + BE)**:** kernel may issue **multiple `bot.reason` dispatches** with distinct `stage_id` slices (or child stage IDs) only when **file boundaries / role domains** do not overlap; otherwise serialize or split stages to avoid **`INTEGRATION_UNAVAILABLE`**-class contention (same principle as LiNKapps orchestrator domain boundaries).

---

## 2. Squad communication protocol

Communication is **structured and audit-first**, not informal chat.

### 2.1 Channels

| Layer | Mechanism | Content |
|-------|-----------|---------|
| **Canonical** | LiNKaios run/stage records + artifact refs | Status, inputs, outputs, failure reports |
| **Durable narrative** | LiNKbrain memory objects (`SquadExecution`) | Role timeline, decisions, artifact index |
| **Human-readable ops feed** | Optional capability `cap.zulip.run_messaging` (mock/shadow/live per plan §5.1) | Non-authoritative notifications; MUST NOT replace audit |

Authoritative decisions and dependencies live in **kernel state + LiNKbrain**. Zulip (if enabled) is **informational**.

### 2.2 Message shape (logical)

Every squad-visible message SHOULD be representable as:

- `tenant_id`, `run_id`, `stage_id`, `trace_id`
- `from_role_id` | `from_plane` (`kernel` | `bot`)
- `message_kind`: `plan` | `handoff` | `question` | `result` | `failure`
- `payload_ref`: pointer to artifact bundle (never raw secrets)
- `blocking`: boolean (whether downstream roles must wait)

This aligns with **`CONTRACTS_MVO.md` §6.3** audit subjects (ids only in envelopes; payloads via refs).

### 2.3 Ordering guarantees

- **Total order per run:** Kernel defines stage DAG order.
- **Within-stage:** Specialists observe dependencies declared in stage inputs (e.g. backend schema ref before frontend binding).

---

## 3. Intermediate artifact sharing

### 3.1 Principles

1. **Share by reference:** Binary/large outputs live in tenant-scoped storage (implementation detail); LiNKbrain holds **refs + metadata + hashes**.
2. **No secret duplication:** Credentials land only in vault-capable refs (`service_credentials_ref` pattern per conversion plan §4); squad prompts receive **handles**, not plaintext secrets.
3. **Role-scoped visibility:** Each artifact bears `producer_role_id` and `consumers[]` / `visibility: squad_internal` enforced by kernel policy.

### 3.2 Typical artifact types (Phase 5)

| Artifact | Typical producer | Consumers |
|----------|------------------|-----------|
| `prd_slice_ref` | `product_owner` | All implementation roles |
| `architecture_notes_ref` | `technical_lead`, `backend_specialist` | FE/BE/mobile |
| `schema_design_ref` | `database_architect` | BE, QA |
| `implementation_bundle_ref` | FE/BE/mobile | QA, security |
| `validation_report_ref` | LiNKautowork + QA roles | DevOps |

Failures attaching corrupt or oversized payloads surface as **`MODEL_OUTPUT_INVALID`** or **`KERNEL_PERSISTENCE_FAILED`** per **`CONTRACTS_MVO.md` §§5–6**.

---

## 4. Failures, reassignment, and escalation

Mapped to **`CONTRACTS_MVO.md` §5 (`FailureReport`)**, **`§4.6` retry policy**, and visibility **`§5.4`**.

### 4.1 Failure classes

| Class | Examples | Default handling |
|-------|----------|------------------|
| **Transient model/tool** | timeout, rate limit (`MODEL_*`) | Bounded retries per §4.6; same role |
| **Policy / lease** | lease denied, kill switch (`LEASE_*`) | Stage → `failed` or `awaiting_approval` per capability |
| **Orchestration** | illegal parallel edits, violated boundaries | Kernel aborts slice; may respawn with narrower scope |
| **Quality gate** | tests fail in autowork | Return to implementation slice OR escalate |

### 4.2 Reassignment

1. **Retry-first:** Same `role_id` retry if failure is transient and role remains eligible.
2. **Substitute role:** If tenant maps multiple pools (e.g. backup FE bot), kernel selects next eligible **`worker_identity`** preserving `stage_id` lineage.
3. **Split task:** Orchestrator reduces scope (smaller `inputs`) to isolate fault.
4. **Blocked:** After exhaustion → stage `failed` with **`FailureReport`**; run may stop or await human intervention.

### 4.3 Escalation ladder (development mode)

1. **Kernel retry / replan** (technical_lead reasoning slice proposes new ordering).
2. **Tenant operator** via LiNKaios UI (`linkapps.squad_monitor` per conversion plan §7.1).
3. **Governance hold:** Policy requires approval (`POLICY_REQUIRES_APPROVAL`) — analogous to Phase 4 gate, applied inside Phase 5 if manifest declares sensitive capability upgrades.

---

## 5. Concurrency limits (development mode)

### 5.1 Squad vs app cardinality

| Scope | Default | Configurable upper bound |
|-------|---------|---------------------------|
| **Active Phase 5 implementation targets per squad** | **1** app/repo focus | Tenant policy **N ≥ 1** (conversion plan §11.1 recommends default 1) |
| **Concurrent `bot.reason` dispatches per run** | **1** unless manifest declares parallel-safe slices | Bounded by tenant `max_parallel_bot_dispatches` |
| **Concurrent Phase 5 runs per tenant** | **2** (UI responsiveness vs cost) | Administrator knob |

### 5.2 Linktrend Development Pod vs LiNKapps vertical

Per **`LINKAPPS_VERTICAL_PLUGIN_CONVERSION_PLAN.md` §8.2**, the internal **Development Pod** meta-squad maintaining starter kits **does not** consume the same concurrency budget as client venture squads unless explicitly configured — avoids starvation.

### 5.3 Cost / fairness

Kernel SHOULD apply token/time budgets per tenant and downgrade model tiers via **`model_routing_profile`** before rejecting work outright.

---

## 6. Squad formation protocol

Triggered after Phase 4 approval → **`linkapps.app_factory`** work request (`blueprint_to_app` or `squad_execution` per conversion plan §1.2).

1. **Validate blueprint refs:** Emit `linkapps.blueprint.received` (plan §6.1).
2. **Compile squad manifest:** Resolve required roles from plugin manifest + blueprint tags (web/mobile/backend intensity).
3. **Lease squad scaffolding:** Request leases needed for coordination aids (`plane.project.write`, messaging mocks, etc.) per §7.
4. **Persist `squad_config`:** Roles, bindings, concurrency caps; emit **`linkapps.squad.formed`**.
5. **Initialize `SquadExecution` memory** (LiNKbrain §6.2 of conversion plan): empty timeline, artifact index root.

---

## 7. Role assignment rules

Deterministic precedence (tenant overrides via manifest):

1. **Mandatory core:** `product_owner` for scope, `technical_lead` for orchestration slices, `test_engineer` before merge-ready declarations.
2. **Stack-derived:** Web → `frontend_specialist` + `backend_specialist`; schema-heavy → `database_architect`; mobile blueprint → `mobile_developer`.
3. **Quality path:** Before deploy slice → `qa_automation_engineer`, `security_auditor` (can be conditional on risk tier).
4. **Skill matching:** Prefer workers certified for declared **`allowed_skills`** (`LINKAPPS_VERTICAL_PLUGIN_CONVERSION_PLAN.md` §3.3).
5. **Conflict avoidance:** Enforce orchestrator **file/domain ownership** adapted from LiNKapps native orchestrator tables ( §3 of `orchestrator.md`) at kernel policy layer.

---

## 8. Audit events (squad-oriented)

Emit via **`brain.audit.write`** (`CONTRACTS_MVO.md` §6.3). Minimum additions beyond conversion plan §6.1:

| Event | When |
|-------|------|
| `linkapps.squad.forming` | Squad compilation started |
| `linkapps.squad.formed` | `squad_config` persisted |
| `linkapps.role.started` | Before each `bot.reason` |
| `linkapps.role.completed` | Successful bot dispatch |
| `linkapps.role.failed` | Dispatch failed with `FailureReport` |
| `linkapps.role.reassigned` | Worker substitution |
| `linkapps.handoff.stage.ready` | Artifact bundle ready for next stage |

Stage-level **`stage.started` / `stage.completed` / `stage.failed`** still apply per run lifecycle (**`CONTRACTS_MVO.md` §4–8**).

---

## 9. LinkSkills lease touchpoints

Leases are **kernel-initiated** before side effects (**`CONTRACTS_MVO.md` §6.2**). Squad-relevant patterns:

| Phase | Typical lease families |
|-------|-------------------------|
| Squad formation | `plane.project.write`, messaging mocks |
| Repo generation | `cap.github.repo_management` |
| Service provisioning | `cap.supabase.provisioning`, `cap.stripe.product_management`, … |
| Implementation | Narrow leases per specialist operation (git read, asset generation, etc.) |
| Validation | `playwright.execution`, test runners |
| Deploy | `cap.vercel.deployment` |

Idempotency keys follow **`${run_id}:${stage_id}:${capability}:${operation}`** convention (conversion plan §5.2).

Bots receive **lease-scoped tooling projections** only (WP-064 adapter pattern); orchestrator MUST NOT ask bots to widen scope mid-flight without new lease decision.

---

## 10. LiNKbrain memory and context handoff

| Transition | Memory action |
|------------|----------------|
| Phase 3 → 5 | Publish **`AppBlueprint`** object; kernel attaches refs to run input |
| Squad formation | Create/update **`SquadExecution`** timeline |
| Each role completion | Append summary + artifact refs (hashes, counts — **no PII**) |
| Autowork boundaries | Record `workflow_run_id` cross refs (**`CONTRACTS_MVO.md` §6.4**) |
| Failure | Persist `FailureReport` linkage for replay diagnostics |

Retrieval policy: prompts to specialists include **only slices** approved for that role (`inputs` in **`LinkappsRoleAttachment`** shape — conversion plan §3.3).

---

## 11. Answers to WP-107 hard questions

1. **Orchestrator → specialists:** LiNKaios kernel executes the stage DAG; each specialist slice is a **`bot.reason`** dispatch per **`CONTRACTS_MVO.md` §6.1** with manifest-defined `reasoning_kind`; LiNKapps `orchestrator` persona produces plans **as bounded reasoning outputs**, not as autonomous dispatchers.
2. **Communication protocol:** Structured kernel messages + LiNKbrain **`SquadExecution`** narrative + optional non-authoritative Zulip notifications (**§2**).
3. **Artifact sharing:** Tenant artifact storage by ref; LiNKbrain indexes metadata; secrets via credential refs only (**§3**).
4. **Failures / escalation:** Classify with **`FailureReport`**; retry/reassign/split/human escalation (**§4**).
5. **Concurrent apps in development:** Default **one** active implementation focus per squad; tenant-configurable **N** with documented fairness (**§5**).

---

## 12. Unresolved decisions (need user / integrator input)

Aligned with **`LINKAPPS_VERTICAL_PLUGIN_CONVERSION_PLAN.md` §11**:

| Topic | Question |
|-------|----------|
| Squad formation trigger | Exact Phase 4 approval hook shape and idempotency |
| Tenant knobs | Concrete keys for `max_parallel_bot_dispatches`, `max_phase5_runs`, override of default **N=1** |
| Worker pools | How tenant registers multiple substitute identities per `role_id` |
| Risk-tier rules | When `security_auditor` / `qa_automation_engineer` are mandatory vs optional |
| Zulip | Whether development mode requires mock-only messaging |

---

## 13. References

- **`CONTRACTS_MVO.md` §6.1** — LiNKaios ↔ LinkBot reasoning dispatch (canonical envelope).
- **`CONTRACTS_MVO.md` §§4–6** — Run/stage lifecycle, failures, cross-plane audit.
- **`LINKAPPS_VERTICAL_PLUGIN_CONVERSION_PLAN.md` §§2.2, 3, 6, 8.2** — Phase 5 stages, roles, audit/memory, pod separation.
- **`/Users/linktrend/Projects/LiNKapps/.agent/ARCHITECTURE.md`** — Source catalog of agents/skills/workflows.
- **`/Users/linktrend/Projects/LiNKapps/.agent/agents/orchestrator.md`** — Domain routing tables (adapted by kernel policy, not bypassed).

---

*Specification only. No LinkBot runtime, LiNKapps repo moves, or production side effects.*
