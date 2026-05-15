# LinkBot Adapter Plan (WP-062)

Date: 2026-05-15
Depends on: `.ai-swarm/LINKBOT_CORE_SYNC_READINESS.md` (WP-061)

## 1. Purpose

Define the adapter boundaries that connect LinkBot runtime to LiNKaios dispatch, LinkSkills governed skill/capability execution, LiNKbrain audit envelope, LiNKautowork deterministic workflows, and Zulip communication without violating ownership boundaries.

## 2. Non-negotiable boundaries

- LinkBot remains a thin worker/runtime shell.
- LinkBot MUST NOT own canonical memory, skill definitions, secrets lifecycle, deterministic workflow state, or final audit ledger.
- Side effects must be gated by LinkSkills leases and traced in LiNKbrain envelope.
- Default execution mode is `mock`/`shadow`; no live message sends in this packet.

## 3. Adapter surfaces

### 3.1 LiNKaios -> LinkBot dispatch adapter

Input contract from LiNKaios dispatch to LinkBot ingress:

- `tenant_id`, `run_id`, `stage_id`, `session_key`
- `linktrendGovernance` (required fail-closed in LiNKtrend mode)
- role envelope: `role_id`, `reasoning_kind`, `inputs_ref`
- capability hints (advisory only): `requested_capability_ops[]`

Output contract from LinkBot back to LiNKaios:

- `role_outputs_ref` (no direct cross-plane writes)
- `tool_trace[]` (what was invoked)
- `governance_events[]` (`linktrend.gov` lifecycle refs)
- `failure_report?` (canonical error mapping)

### 3.2 LinkBot -> LinkSkills execution adapter

LinkBot never executes side effects directly. It requests operations through LinkSkills adapter calls:

- `lease.request` (policy + idempotency gate)
- `skill.execute` (skill-bound logic)
- `capability.execute` (connector ops such as Zulip notify, CRM status update, mirror upsert)
- `lease.release` / `lease.kill_switch_check`

Required context on each call:

- `tenant_id`, `run_id`, `stage_id`, `role_id`
- `lease_id` (for side effects)
- `idempotency_key = ${run_id}:${stage_id}:${operation_id}`

### 3.3 LiNKbrain audit/memory adapter

Event sources are normalized to LiNKbrain envelope by LiNKaios/observer layer, not by LinkBot as canonical owner.

Required event families:

- dispatch lifecycle: `run.dispatched`, `role.started`, `role.completed`, `role.failed`
- governance lifecycle: mapped from `linktrend.gov.*`
- capability lifecycle: `capability.requested`, `capability.executed`, `capability.failed`
- workflow lifecycle: `workflow.invoked`, `workflow.completed`, `workflow.failed`

LinkBot may emit transient runtime events, but canonical persistence and memory ownership stays outside LinkBot.

### 3.4 LiNKautowork deterministic handoff adapter

When a role output requires deterministic side effects, LiNKaios orchestrator hands off to LiNKautowork handles:

- `autowork.linksites.artifact_write_local`
- `autowork.linksites.supabase_mirror_upsert` (lease-gated)
- `autowork.linksites.payload_sync_local` (lease-gated)
- `autowork.linksites.preview_readiness_check`
- `autowork.linksites.crm_ready_to_contact_mark` (lease-gated)

Handoff payload includes `run_id`, `stage_id`, `site_id`, `site_generation_run_id`, `lease_id?`, and idempotency key. Workflow state remains LiNKautowork-owned.

### 3.5 Zulip communication adapter

Zulip messages must route through `cap.zulip.run_messaging` via LinkSkills lease-governed operations.

Operations in scope:

- `run.notify` (default)
- `channel.message.mock_send` (mock-only)
- `connectivity.probe` (shadow)

Policy:

- Default mode `mock`/`shadow`
- Stream/topic template resolved from LiNKaios plugin config
- No direct send path from LinkBot runtime

## 4. Ownership map (what lives where)

### 4.1 LiNKbot-core (fork)

Owns:

- ingress schema support for `linktrendGovernance`
- runtime governance bootstrap checks and approved tool narrowing
- agent execution shell and lifecycle emission

Does not own:

- lease adjudication
- canonical LiNKbrain audit persistence
- deterministic workflows
- tenant/business integration policy

### 4.2 `apps/bot-runtime`

Owns:

- LiNKtrend wrapper adapter from LiNKaios dispatch to LinkBot ingress
- projection of allowed operations into runtime call surface
- collection/forwarding of runtime evidence back to LiNKaios

Does not own:

- capability business logic
- memory persistence
- final status/state transitions requiring deterministic checks

### 4.3 LiNKaios + plugin config

Owns:

- run/stage orchestration and dispatch policy
- mission/role/capability policy and mode config
- adapter routing rules for LinkSkills, LiNKbrain, LiNKautowork, Zulip
- canonical trace and operator-facing status surface

### 4.4 LinkSkills

Owns:

- lease issue/validate/revoke lifecycle
- governed skill and capability execution
- policy deny/approval/kill-switch semantics

### 4.5 LiNKbrain

Owns:

- canonical audit/event envelope
- memory and provenance persistence
- cross-plane query surfaces

### 4.6 LiNKautowork

Owns:

- deterministic side-effect workflow orchestration
- workflow retries/compensation status
- readiness gate before CRM promotion

## 5. Sequence (implementation target)

1. LiNKaios dispatches stage with required governance envelope.
2. bot-runtime calls LinkBot ingress and collects role output + gov events.
3. For each required skill/capability action, bot-runtime requests LinkSkills lease-gated execution.
4. LiNKaios maps all events to LiNKbrain canonical envelope.
5. If deterministic side effects are required, LiNKaios triggers LiNKautowork handles with lease refs.
6. Zulip status updates go through LinkSkills `cap.zulip.run_messaging` in `mock`/`shadow`.
7. LiNKaios finalizes stage/run status from deterministic workflow + audit evidence.

## 6. Follow-up implementation packets

- `WP-063`: LiNKaios ingress fail-closed governance adapter wiring.
- `WP-064`: LinkSkills lease projection + capability execution adapter in `apps/bot-runtime`.
- `WP-065`: LiNKbrain event mapping from LinkBot/LinkSkills/LiNKautowork lifecycle.
- `WP-066`: LiNKautowork deterministic handoff pipeline and idempotent orchestration.
- `WP-067`: Zulip governance adapter for run messaging (mock/shadow default).

## 7. Proof anchors

- WP-061 confirms governance ingress and tool narrowing exist in LiNKbot-core, while lease, audit mapping, deterministic handoff, and Zulip governance remain gaps.
- `CONTRACTS_MVO.md` §0.A.7 and §0.A.10.1 define lease-gated side effects and deterministic workflow handles as mandatory for v2.
