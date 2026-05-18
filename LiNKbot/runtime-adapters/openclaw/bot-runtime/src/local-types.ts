/**
 * Local Type Definitions (Mirror of linklogic-sdk types)
 *
 * These types mirror the SDK contracts to allow the package to be
 * self-contained for development. In production, these would be
 * imported from @linktrend/linklogic-sdk.
 */

import { z } from "zod";

/* -------------------------------------------------------------------------- */
/* Plane + failure mode primitives                                            */
/* -------------------------------------------------------------------------- */

export const PlaneSchema = z.enum([
  "linkaios",
  "linkbot",
  "linkskills",
  "linkautowork",
  "linkbrain",
]);
export type Plane = z.infer<typeof PlaneSchema>;

export const FailureModeSchema = z.enum(["retryable", "abort_run", "require_approval"]);
export type FailureMode = z.infer<typeof FailureModeSchema>;

/* -------------------------------------------------------------------------- */
/* LinkBot role attachments                                                   */
/* -------------------------------------------------------------------------- */

export const LinkBotRoleAttachmentSchema = z.object({
  role_id: z.string().min(1),
  purpose: z.string().min(1),
  inputs: z.array(z.string()),
  outputs: z.array(z.string()),
  allowed_capabilities: z.array(z.string()),
  allowed_skills: z.array(z.string()),
  model_policy: z.object({
    model_routing_profile: z.string().min(1),
    tools: z.array(z.string()).optional(),
  }),
  audit_events: z.array(z.string()),
  development_restrictions: z.array(z.string()).optional(),
});
export type LinkBotRoleAttachment = z.infer<typeof LinkBotRoleAttachmentSchema>;

/* -------------------------------------------------------------------------- */
/* Failure taxonomy                                                           */
/* -------------------------------------------------------------------------- */

export const FailureCodeSchema = z.enum([
  "LEAD_INPUT_INVALID",
  "LEAD_INPUT_TOO_LONG",
  "LEAD_TENANT_INACTIVE",
  "LEAD_DUPLICATE_WITHIN_WINDOW",
  "MANIFEST_INVALID",
  "MANIFEST_CAPABILITY_UNKNOWN",
  "MANIFEST_WORKFLOW_UNKNOWN",
  "MANIFEST_AUDIT_EVENT_UNKNOWN",
  "LEASE_REQUEST_INVALID",
  "LEASE_DENIED",
  "LEASE_EXPIRED",
  "LEASE_KILL_SWITCH",
  "LEASE_IDEMPOTENCY_CONFLICT",
  "WORKFLOW_NOT_FOUND",
  "WORKFLOW_TIMEOUT",
  "WORKFLOW_STEP_FAILED",
  "WORKFLOW_COMPENSATED",
  "MODEL_PROVIDER_ERROR",
  "MODEL_TIMEOUT",
  "MODEL_OUTPUT_INVALID",
  "MODEL_QUOTA_EXCEEDED",
  "INTEGRATION_UNAVAILABLE",
  "INTEGRATION_AUTH_FAILED",
  "INTEGRATION_TIMEOUT",
  "POLICY_REQUIRES_APPROVAL",
  "APPROVAL_REJECTED",
  "APPROVAL_TIMEOUT",
  "STAGE_SKIPPED_BY_POLICY",
  "KERNEL_DISPATCH_FAILED",
  "KERNEL_PERSISTENCE_FAILED",
]);
export type FailureCode = z.infer<typeof FailureCodeSchema>;

export const FailureReportSchema = z.object({
  code: z.string().min(1),
  plane: PlaneSchema,
  message: z.string().min(1),
  retryable: z.boolean(),
  approval_required: z.boolean().optional(),
  details: z.record(z.string(), z.unknown()).optional(),
  caused_by: z
    .object({
      ref_kind: z.enum(["lease", "workflow_run", "audit_event", "model_run"]),
      ref_id: z.string().min(1),
    })
    .optional(),
  occurred_at: z.string().datetime(),
});
export type FailureReport = z.infer<typeof FailureReportSchema>;

/* -------------------------------------------------------------------------- */
/* Bot reasoning                                                              */
/* -------------------------------------------------------------------------- */

export const ReasoningKindSchema = z.enum([
  "lead_evaluation",
  "template_selection",
  "copy_generation",
  "media_placement",
]);
export type ReasoningKind = z.infer<typeof ReasoningKindSchema>;

export const BotReasonRequestSchema = z.object({
  tenant_id: z.string().min(1),
  run_id: z.string().uuid(),
  stage_id: z.string().min(1),
  reasoning_kind: ReasoningKindSchema,
  inputs: z.record(z.string(), z.unknown()),
  model_routing_profile: z.string().min(1),
  pii_policy: z.literal("strip_contact"),
});
export type BotReasonRequest = z.infer<typeof BotReasonRequestSchema>;

export const BotReasonResultSchema = z.object({
  outputs: z.record(z.string(), z.unknown()),
  model_run_id: z.string().min(1),
  tokens_in: z.number().int().min(0),
  tokens_out: z.number().int().min(0),
  failure: FailureReportSchema.optional(),
});
export type BotReasonResult = z.infer<typeof BotReasonResultSchema>;

/* -------------------------------------------------------------------------- */
/* LinkSkills lease                                                           */
/* -------------------------------------------------------------------------- */

export const LeaseActorKindSchema = z.enum(["plugin", "bot", "user"]);
export type LeaseActorKind = z.infer<typeof LeaseActorKindSchema>;

export const LeaseRequestSchema = z.object({
  tenant_id: z.string().min(1),
  run_id: z.string().uuid(),
  stage_id: z.string().min(1),
  capability: z.string().min(1),
  arguments: z.record(z.string(), z.unknown()),
  idempotency_key: z.string().min(1),
  actor: z.object({
    actor_kind: LeaseActorKindSchema,
    actor_id: z.string().min(1),
  }),
});
export type LeaseRequest = z.infer<typeof LeaseRequestSchema>;

export const LeaseDecisionStatusSchema = z.enum(["granted", "denied", "requires_approval"]);
export type LeaseDecisionStatus = z.infer<typeof LeaseDecisionStatusSchema>;

export const KillSwitchStateSchema = z.enum(["open", "tripped"]);
export type KillSwitchState = z.infer<typeof KillSwitchStateSchema>;

export const LeaseDecisionSchema = z.object({
  lease_id: z.string().min(1),
  status: LeaseDecisionStatusSchema,
  reason: z.string().optional(),
  expires_at: z.string().datetime().optional(),
  kill_switch_state: KillSwitchStateSchema,
  failure: FailureReportSchema.optional(),
});
export type LeaseDecision = z.infer<typeof LeaseDecisionSchema>;

export const LeaseExecuteRequestSchema = z.object({
  lease_id: z.string().min(1),
  idempotency_key: z.string().min(1),
});
export type LeaseExecuteRequest = z.infer<typeof LeaseExecuteRequestSchema>;

export const LeaseExecuteResultSchema = z.object({
  lease_id: z.string().min(1),
  capability: z.string().min(1),
  result: z.record(z.string(), z.unknown()),
  ledger_entry_id: z.string().min(1),
  audit_event_id: z.string().min(1),
  failure: FailureReportSchema.optional(),
});
export type LeaseExecuteResult = z.infer<typeof LeaseExecuteResultSchema>;

/* -------------------------------------------------------------------------- */
/* Audit                                                                      */
/* -------------------------------------------------------------------------- */

export const AuditActorKindSchema = z.enum(["kernel", "plugin", "bot", "user", "system"]);
export type AuditActorKind = z.infer<typeof AuditActorKindSchema>;

export const AuditEventSubjectSchema = z.object({
  run_id: z.string().optional(),
  stage_id: z.string().optional(),
  lease_id: z.string().optional(),
  workflow_run_id: z.string().optional(),
  capability: z.string().optional(),
  plugin_id: z.string().optional(),
  lead_id: z.string().optional(),
  preview_url: z.string().optional(),
  preview_artifact_ref: z.string().optional(),
  crm_record_id: z.string().optional(),
  project_id: z.string().optional(),
  task_id: z.string().optional(),
});
export type AuditEventSubject = z.infer<typeof AuditEventSubjectSchema>;

export const AuditEventSchema = z.object({
  event_id: z.string().uuid(),
  ts: z.string().datetime(),
  tenant_id: z.string().min(1),
  plane: PlaneSchema,
  actor: z.object({
    actor_kind: AuditActorKindSchema,
    actor_id: z.string().min(1),
  }),
  action: z.string().min(1),
  subject: AuditEventSubjectSchema,
  refs: z
    .object({
      caused_by_event_id: z.string().optional(),
      parent_event_id: z.string().optional(),
    })
    .optional(),
  payload: z.record(z.string(), z.unknown()),
  schema_version: z.literal("1"),
});
export type AuditEvent = z.infer<typeof AuditEventSchema>;

export const AuditWriteResultSchema = z.object({
  event_id: z.string().uuid(),
  persisted_at: z.string().datetime(),
  failure: FailureReportSchema.optional(),
});
export type AuditWriteResult = z.infer<typeof AuditWriteResultSchema>;

/* -------------------------------------------------------------------------- */
/* Context assembly                                                           */
/* -------------------------------------------------------------------------- */

export const ContextRequestSchema = z.object({
  tenant_id: z.string().min(1),
  query_scope: z.object({
    module: z.string().optional(),
    memory_types: z.array(z.enum(["memory", "audit", "provenance"])),
    subject: z
      .object({
        lead_id: z.string().optional(),
      })
      .optional(),
    time_range: z
      .object({
        from: z.string().datetime(),
        to: z.string().datetime(),
      })
      .optional(),
  }),
  role_context: z.object({
    role_id: z.string().min(1),
    run_id: z.string().min(1),
    stage_id: z.string().min(1),
  }),
});
export type ContextRequest = z.infer<typeof ContextRequestSchema>;

export const ContextAssemblyResultSchema = z.object({
  bundle: z.object({
    memories: z.array(z.record(z.string(), z.unknown())),
    episodes: z.array(z.record(z.string(), z.unknown())),
    procedures: z.array(z.record(z.string(), z.unknown())),
  }),
  scope: z.object({
    tenant_id: z.string().min(1),
    module: z.string().min(1),
  }),
  assembly_time_ms: z.number().int().min(0),
  retrieved_at: z.string().datetime(),
  error: z
    .object({
      code: z.string(),
      message: z.string(),
    })
    .optional(),
});
export type ContextAssemblyResult = z.infer<typeof ContextAssemblyResultSchema>;

/* -------------------------------------------------------------------------- */
/* LinkSites v2 specific                                                      */
/* -------------------------------------------------------------------------- */

export const LinkSitesV2RoleIdSchema = z.enum([
  "lead_scout_bot",
  "research_enrichment_bot",
  "website_builder_bot",
  "outreach_bot",
]);
export type LinkSitesV2RoleId = z.infer<typeof LinkSitesV2RoleIdSchema>;
