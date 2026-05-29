# LiNKbot Adapter Plan (WP-062)

Date: 2026-05-15
Depends on: `.ai-swarm/LINKBOT_CORE_SYNC_READINESS.md` (WP-061)

## Purpose

Define adapter boundaries connecting LiNKbot runtime with LiNKaios dispatch, LinkSkills governance, LiNKbrain audit envelope, LiNKautowork deterministic workflows, and Zulip messaging without ownership bleed.

## Boundaries

- LiNKbot stays a thin runtime shell.
- LiNKbot does not own canonical memory, skills, secrets lifecycle, deterministic workflow state, or final audit.
- Side effects must be lease-gated by LinkSkills.
- Default mode remains `mock`/`shadow`; no live messaging.

## Adapter map

### LiNKaios -> LiNKbot dispatch

Input: `tenant_id`, `run_id`, `stage_id`, `session_key`, `linktrendGovernance`, `role_id`, `reasoning_kind`, `inputs_ref`.

Output: `role_outputs_ref`, `tool_trace[]`, `governance_events[]`, `failure_report?`.

### LiNKbot -> LinkSkills

All side effects route through lease-governed operations:

- `lease.request`
- `skill.execute`
- `capability.execute`
- `lease.release` / kill-switch checks

Each side-effect call requires `lease_id` and `idempotency_key=${run_id}:${stage_id}:${operation_id}`.

### LiNKbrain envelope mapping

Canonical persistence is LiNKaios/observer-owned, not LiNKbot-owned.
Required mapped events:

- `run.dispatched`, `role.started`, `role.completed`, `role.failed`
- `capability.requested`, `capability.executed`, `capability.failed`
- `workflow.invoked`, `workflow.completed`, `workflow.failed`
- `linktrend.gov.*` mapped lifecycle events

### LiNKautowork deterministic handoff

Required handles:

- `autowork.linksites.artifact_write_local`
- `autowork.linksites.supabase_mirror_upsert`
- `autowork.linksites.payload_sync_local`
- `autowork.linksites.preview_readiness_check`
- `autowork.linksites.crm_ready_to_contact_mark`

### Zulip messaging adapter

Route via `cap.zulip.run_messaging` only:

- `run.notify`
- `channel.message.mock_send`
- `connectivity.probe`

No direct LiNKbot send path.

## Ownership split

- `LiNKbot-core`: ingress schema + governance bootstrap + tool narrowing.
- `LiNKbot/runtime-adapters/openclaw/bot-runtime`: adapter wrapper + evidence forwarding.
- `LiNKaios`: orchestration, policy, canonical status/trace.
- `LinkSkills`: lease lifecycle + governed execution.
- `LiNKbrain`: canonical audit/memory/provenance store.
- `LiNKautowork`: deterministic workflow state and retries.

## Follow-up packets

- WP-063 LiNKaios ingress fail-closed governance adapter
- WP-064 LinkSkills lease projection and bot-runtime adapter
- WP-065 LiNKbrain audit-envelope mapping
- WP-066 LiNKautowork deterministic handoff orchestration
- WP-067 Zulip governance adapter (`mock`/`shadow` default)
