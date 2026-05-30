/**
 * LiNKapps ↔ LiNKbrain event and handoff memory payloads (`linkapps.app_factory`).
 *
 * Spec context: `dev-swarm/product/grounding/LINKAPPS_SQUAD_ORCHESTRATION_SPEC.md`,
 * `dev-swarm/product/grounding/LINKAPPS_VERTICAL_PLUGIN_CONVERSION_PLAN.md`,
 * `dev-swarm/product/grounding/CONTRACTS_MVO.md` §6.3.
 *
 * These payloads are meant to sit inside `AuditEvent.payload` or LiNKbrain memory
 * writers — never as a substitute for the canonical audit envelope. Keep tenant
 * identifiers and contact fields out of these structured payloads; callers MUST
 * attach `tenant_id`, `run_id`, and related subject ids via `AuditEventSubject`.
 */

import { z } from "zod";

import { LeaseDecisionStatusSchema } from "./contracts-mvo.js";

/** Canonical vertical plugin id for LiNKapps App Factory. */
export const LINKAPPS_PLUGIN_ID = "linkapps.app_factory" as const;

export const LinkappsWorkRequestTypeSchema = z.enum([
  "linkapps.app_factory.blueprint_to_app",
  "linkapps.app_factory.prd_to_repo",
  "linkapps.app_factory.squad_execution",
  "linkapps.app_factory.spinoff_prep",
]);
export type LinkappsWorkRequestType = z.infer<typeof LinkappsWorkRequestTypeSchema>;

/** Run-level checkpoints — refs only, aligned with conversion plan Phase 5 gates. */
export const LinkappsRunCheckpointKindSchema = z.enum([
  "blueprint.received",
  "squad.compilation.started",
  "repo.scaffold.requested",
  "services.provisioning.started",
  "implementation.iteration.started",
  "validation.started",
  "deployment.started",
  "handoff.package.started",
]);
export type LinkappsRunCheckpointKind = z.infer<typeof LinkappsRunCheckpointKindSchema>;

export const LinkappsRunEventPayloadSchema = z
  .object({
    schema_version: z.literal("linkapps.brain.run_event.v1"),
    plugin_id: z.literal(LINKAPPS_PLUGIN_ID),
    work_request_type: LinkappsWorkRequestTypeSchema,
    checkpoint_kind: LinkappsRunCheckpointKindSchema,
    blueprint_ref: z.string().min(1).max(512).optional(),
    app_repo_ref: z.string().min(1).max(512).optional(),
    deployment_bundle_ref: z.string().min(1).max(512).optional(),
    squad_configuration_ref: z.string().min(1).max(512).optional(),
    trace_correlation_ref: z.string().min(1).max(256).optional(),
    redaction_flags: z.array(z.string().min(1).max(120)).max(32).optional(),
  })
  .strict();

export type LinkappsRunEventPayload = z.infer<typeof LinkappsRunEventPayloadSchema>;

/** Privacy-focused lease snapshot for audit/memory cross-links — no capability arguments or secrets. */
export const LinkappsCapabilityLeaseSummarySchema = z
  .object({
    schema_version: z.literal("linkapps.brain.lease_summary.v1"),
    lease_ref: z.string().min(1).max(256),
    capability_plugin_id: z.string().min(1).max(160),
    operation_id: z.string().min(1).max(160),
    decision_status: LeaseDecisionStatusSchema,
    kill_switch_tripped: z.boolean().optional(),
    ledger_entry_ref: z.string().min(1).max(256).optional(),
    audit_event_ref: z.string().min(1).max(256).optional(),
  })
  .strict();

export type LinkappsCapabilityLeaseSummary = z.infer<typeof LinkappsCapabilityLeaseSummarySchema>;

export const LinkappsArtifactRefSchema = z
  .object({
    artifact_kind: z.string().min(1).max(120),
    artifact_ref: z.string().min(1).max(512),
  })
  .strict();

export type LinkappsArtifactRef = z.infer<typeof LinkappsArtifactRefSchema>;

export const LinkappsSquadDecisionKindSchema = z.enum([
  "gate_pass",
  "gate_hold",
  "replan",
  "scope_split",
  "worker_substitution",
  "escalate_operator",
]);
export type LinkappsSquadDecisionKind = z.infer<typeof LinkappsSquadDecisionKindSchema>;

const shortTextNoContact = z
  .string()
  .max(320)
  .refine((v) => !/@/.test(v), {
    message: "must not contain email-like patterns",
  })
  .refine((v) => !/^\+?\d[\d\s\-().]{7,}\d$/.test(v.trim()), {
    message: "must not be phone-number-shaped text",
  })
  .refine((v) => !/\(\d{3}\)\s*\d{3}[\s.-]\d{4}/.test(v), {
    message: "must not contain NANP-style phone patterns",
  });

export const LinkappsSquadDecisionEventPayloadSchema = z
  .object({
    schema_version: z.literal("linkapps.brain.squad_decision.v1"),
    plugin_id: z.literal(LINKAPPS_PLUGIN_ID),
    decision_id: z.string().uuid(),
    decision_kind: LinkappsSquadDecisionKindSchema,
    from_role_id: z.string().min(1).max(120).optional(),
    to_role_id: z.string().min(1).max(120).optional(),
    blocking: z.boolean(),
    rationale_summary: shortTextNoContact.optional(),
    artifact_refs: z.array(LinkappsArtifactRefSchema).max(64).default([]),
    related_audit_event_ids: z.array(z.string().uuid()).max(32).optional(),
    lease_summaries: z.array(LinkappsCapabilityLeaseSummarySchema).max(16).optional(),
  })
  .strict();

export type LinkappsSquadDecisionEventPayload = z.infer<
  typeof LinkappsSquadDecisionEventPayloadSchema
>;

export const LinkappsHandoffArtifactRecordSchema = z
  .object({
    artifact_kind: z.string().min(1).max(120),
    storage_ref: z.string().min(1).max(512),
    content_digest_sha256: z.string().regex(/^[a-f0-9]{64}$/).optional(),
  })
  .strict();

export type LinkappsHandoffArtifactRecord = z.infer<typeof LinkappsHandoffArtifactRecordSchema>;

/** Durable handoff index — refs + digests only (LiNKbrain memory-friendly). */
export const LinkappsHandoffArtifactMemoryPayloadSchema = z
  .object({
    schema_version: z.literal("linkapps.brain.handoff_memory.v1"),
    plugin_id: z.literal(LINKAPPS_PLUGIN_ID),
    handoff_id: z.string().uuid(),
    from_stage_ref: z.string().min(1).max(256),
    to_stage_ref: z.string().min(1).max(256),
    producer_role_id: z.string().min(1).max(120),
    consumer_role_allowlist: z.array(z.string().min(1).max(120)).max(32).optional(),
    artifact_index: z.array(LinkappsHandoffArtifactRecordSchema).min(1).max(128),
    visibility: z.literal("squad_internal"),
    pii_redaction_verified: z.boolean(),
    notes_redacted: z.boolean().optional(),
  })
  .strict();

export type LinkappsHandoffArtifactMemoryPayload = z.infer<
  typeof LinkappsHandoffArtifactMemoryPayloadSchema
>;

export const LinkappsBrainEventPayloadSchema = z.discriminatedUnion("schema_version", [
  LinkappsRunEventPayloadSchema,
  LinkappsCapabilityLeaseSummarySchema,
  LinkappsSquadDecisionEventPayloadSchema,
  LinkappsHandoffArtifactMemoryPayloadSchema,
]);

export type LinkappsBrainEventPayload = z.infer<typeof LinkappsBrainEventPayloadSchema>;

export function parseLinkappsRunEventPayload(raw: unknown): LinkappsRunEventPayload {
  return LinkappsRunEventPayloadSchema.parse(raw);
}

export function parseLinkappsCapabilityLeaseSummary(raw: unknown): LinkappsCapabilityLeaseSummary {
  return LinkappsCapabilityLeaseSummarySchema.parse(raw);
}

export function parseLinkappsSquadDecisionEventPayload(
  raw: unknown,
): LinkappsSquadDecisionEventPayload {
  return LinkappsSquadDecisionEventPayloadSchema.parse(raw);
}

export function parseLinkappsHandoffArtifactMemoryPayload(
  raw: unknown,
): LinkappsHandoffArtifactMemoryPayload {
  return LinkappsHandoffArtifactMemoryPayloadSchema.parse(raw);
}

export function parseLinkappsBrainEventPayload(raw: unknown): LinkappsBrainEventPayload {
  return LinkappsBrainEventPayloadSchema.parse(raw);
}
