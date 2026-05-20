/**
 * Privacy-safe benchmarking + memory feedback contracts for LiNKbrain (WP-089).
 * Specification: `.ai-swarm/LINKBRAIN_BENCHMARKING_SPEC.md`
 *
 * Aggregation SQL / workers MUST NOT ship until WP-087 `brain_memory_objects` merges.
 */

import { z } from "zod";

/**
 * Normalized key: strip underscores, lowercase. Used only for blocklist matching.
 * Keep this list aligned with `.ai-swarm/LINKBRAIN_BENCHMARKING_SPEC.md` §5.
 */
const FORBIDDEN_KEY_COMPACT = new Set([
  "tenantid",
  "orgid",
  "organizationid",
  "workspaceid",
  "accountid",
  "customerid",
  "teamid",
  "userid",
  "useremail",
  "email",
  "phone",
  "phonenumber",
  "mobilenumber",
  "ipaddress",
  "correlationid",
  "traceid",
  "spanid",
  "runid",
  "domain",
  "subjectid",
  "actorid",
  "leadid",
  "crmrecordid",
  "customercrmid",
]);

function isForbiddenKey(key: string): boolean {
  const compact = key.replace(/_/g, "").toLowerCase();
  if (FORBIDDEN_KEY_COMPACT.has(compact)) return true;
  if (compact.startsWith("tenant")) return true;
  if (compact.startsWith("crm") && compact.endsWith("id")) return true;
  return false;
}

/**
 * Removes tenant- and identity-identifying keys recursively from plain JSON objects.
 * Intended for sanitizing event payloads *before* cross-tenant benchmark rollups.
 */
export function stripTenantIdentifyingFields(value: unknown): unknown {
  if (value === null || value === undefined) return value;
  if (Array.isArray(value)) {
    return value.map((entry) => stripTenantIdentifyingFields(entry));
  }
  if (typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [rawKey, v] of Object.entries(value as Record<string, unknown>)) {
      if (isForbiddenKey(rawKey)) continue;
      out[rawKey] = stripTenantIdentifyingFields(v);
    }
    return out;
  }
  return value;
}

export const BrainBenchmarkAggregateRowSchema = z
  .object({
    bucket_start: z.string().datetime(),
    bucket_end: z.string().datetime(),
    plugin_vertical_key: z.string().min(1).max(256),
    dimension_key: z.string().min(1).max(256),
    sample_size: z.number().int().nonnegative(),
    avg_duration_ms: z.number().nonnegative().nullable(),
    failure_rate: z.number().min(0).max(1).nullable(),
    avg_cost_normalized: z.number().nonnegative().nullable(),
    schema_version: z.number().int().positive().max(32767),
    aggregation_job_id: z.string().uuid().optional(),
  })
  .strict();

export type BrainBenchmarkAggregateRow = z.infer<typeof BrainBenchmarkAggregateRowSchema>;

export const BrainFeedbackVerdictSchema = z.enum(["approved", "invalidated"]);
export type BrainFeedbackVerdict = z.infer<typeof BrainFeedbackVerdictSchema>;

export const BrainFeedbackActorSubjectSchema = z.enum(["operator", "linkbot"]);
export type BrainFeedbackActorSubject = z.infer<typeof BrainFeedbackActorSubjectSchema>;

/**
 * Capability `feedback.record` input — persists to `brain_memory_objects` after WP-087.
 */
export const BrainFeedbackRecordPayloadSchema = z
  .object({
    memory_object_id: z.string().uuid(),
    verdict: BrainFeedbackVerdictSchema,
    actor_subject_type: BrainFeedbackActorSubjectSchema,
    idempotency_key: z.string().min(8).max(512),
  })
  .strict();

export type BrainFeedbackRecordPayload = z.infer<typeof BrainFeedbackRecordPayloadSchema>;

export function parseBrainBenchmarkAggregateRow(raw: unknown): BrainBenchmarkAggregateRow {
  return BrainBenchmarkAggregateRowSchema.parse(raw);
}

export function parseBrainFeedbackRecordPayload(raw: unknown): BrainFeedbackRecordPayload {
  return BrainFeedbackRecordPayloadSchema.parse(raw);
}
