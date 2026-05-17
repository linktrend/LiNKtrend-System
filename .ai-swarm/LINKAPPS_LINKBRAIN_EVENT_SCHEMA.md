# LiNKapps LiNKbrain Event Schema

**Work packet:** WP-111  
**Date:** 2026-05-17  
**Status:** SDK schemas (`@linktrend/linklogic-sdk`)

---

## Purpose

Typed payloads for **`linkapps.app_factory`** runs when emitting LiNKbrain-facing **audit payload slices** and **handoff memory records**. They complement — they do not replace — the canonical `AuditEvent` envelope in `CONTRACTS_MVO.md` §6.3.

---

## Placement rules

| Payload | Typical carrier |
|--------|------------------|
| Run checkpoint | `AuditEvent.payload` with squad/orchestration actions (`linkapps.blueprint.received`, stage checkpoints, etc.) |
| Squad decision | `AuditEvent.payload` after kernel/plane gates (`gate_hold`, `replan`, …) |
| Capability lease summary | Nested inside squad-decision payloads **or** standalone audit payload rows referencing LinkSkills outcomes |
| Handoff artifact memory | LiNKbrain memory write payloads (refs + digests only); align with `LINKAPPS_SQUAD_ORCHESTRATION_SPEC.md` §3 |

**Always:** `tenant_id`, `run_id`, `stage_id`, and actor IDs stay on the **`AuditEvent` envelope / subject**, not duplicated inside these payloads unless a future packet explicitly extends them.

---

## Privacy and redaction

- No emails, phone numbers, OAuth tokens, PATs, webhook secrets, or raw capability **arguments** in these structs.
- Use **`blueprint_ref`**, **`app_repo_ref`**, **`storage_ref`**, **`lease_ref`**, and similar opaque handles.
- `redaction_flags` on run events records what stripping/normalization was applied upstream.
- `pii_redaction_verified` on handoff memory asserts producer reviewed artifact metadata before persistence.

---

## `schema_version` literals (discriminator)

| Value | Schema export |
|-------|----------------|
| `linkapps.brain.run_event.v1` | `LinkappsRunEventPayloadSchema` |
| `linkapps.brain.lease_summary.v1` | `LinkappsCapabilityLeaseSummarySchema` |
| `linkapps.brain.squad_decision.v1` | `LinkappsSquadDecisionEventPayloadSchema` |
| `linkapps.brain.handoff_memory.v1` | `LinkappsHandoffArtifactMemoryPayloadSchema` |

Union parser: `parseLinkappsBrainEventPayload`.

---

## Squad orchestration alignment

Minimum audit vocabulary from `LINKAPPS_SQUAD_ORCHESTRATION_SPEC.md` §8 (`linkapps.squad.forming`, `linkapps.role.started`, …) maps to **`AuditEvent.action`** strings; **these payloads** carry structured refs for checkpoints and decisions without embedding chat transcripts or Zulip bodies.

---

## Memory integration note

`MemoryObjectTypeSchema` in `brain-memory.ts` is unchanged in WP-111. Handoff rows may be persisted via a future memory type or embedded as provenance-linked JSON under an Integrator-approved envelope — **no DB migration** in this packet.

---

## Source files

- Implementation: `packages/linklogic-sdk/src/linkapps-brain-events.ts`
- Tests: `packages/linklogic-sdk/src/linkapps-brain-events.test.ts`
