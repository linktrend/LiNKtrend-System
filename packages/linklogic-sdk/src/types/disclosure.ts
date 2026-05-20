/**
 * Progressive disclosure types for LinkSkills.
 *
 * Implements run-scoped disclosure token generation and fragment delivery
 * per CONTRACTS_MVO.md §6.2 and PRD_LINKSKILLS_LOGIC_ENGINE §12.
 *
 * Goals:
 * - IP protection: No full skill source disclosed by default
 * - Run-scoped: Token bound to tenant + capability + run + step
 * - Time-limited: Short-lived tokens (5-30 min expiry)
 * - Auditable: All disclosures logged with scope (not content)
 */

import { z } from "zod";

/* -------------------------------------------------------------------------- */
/* Execution Modes for Client-Side Skill Execution                            */
/* -------------------------------------------------------------------------- */

export const ExecutionModeSchema = z.enum([
  "managed",       // Full server-side execution (no disclosure needed)
  "hybrid",        // Orchestration central, limited client execution
  "client_side",   // Minimal disclosure for local execution
]);
export type ExecutionMode = z.infer<typeof ExecutionModeSchema>;

/* -------------------------------------------------------------------------- */
/* Disclosure Scope Levels                                                    */
/* -------------------------------------------------------------------------- */

export const DisclosureScopeSchema = z.enum([
  "tenant",        // Tenant-wide skill catalog visibility
  "capability",    // Capability-scoped disclosure
  "run",           // Run-scoped disclosure (default)
  "step",          // Step-scoped disclosure (most granular)
]);
export type DisclosureScope = z.infer<typeof DisclosureScopeSchema>;

/* -------------------------------------------------------------------------- */
/* Disclosure Token (JWT-like structure)                                      */
/* -------------------------------------------------------------------------- */

export const DisclosureTokenPayloadSchema = z.object({
  // Standard JWT-like fields
  iss: z.literal("linkskills"),           // Issuer: linkskills
  sub: z.string().min(1),                // Subject: run_id + step_id
  jti: z.string().uuid(),                // Unique token ID
  iat: z.number().int(),                  // Issued at (Unix timestamp)
  exp: z.number().int(),                  // Expiry (Unix timestamp)

  // LinkSkills-specific claims
  tenant_id: z.string().min(1),
  capability_id: z.string().min(1),
  run_id: z.string().uuid(),
  stage_id: z.string().min(1),
  step_scope: DisclosureScopeSchema,
  mode: ExecutionModeSchema,
  allowed_tools: z.array(z.string()),      // Constrained tool list
  allowed_skills: z.array(z.string()).optional(),
  lease_id: z.string().optional(),        // Associated lease (if any)
});
export type DisclosureTokenPayload = z.infer<typeof DisclosureTokenPayloadSchema>;

export interface DisclosureToken {
  /** Token ID (matches jti in payload) */
  token_id: string;

  /** Base64-encoded JWT-like header (algorithm, type) */
  header: string;

  /** Base64-encoded payload (DisclosureTokenPayload) */
  payload: string;

  /** Base64-encoded signature */
  signature: string;

  /** Full token string (header.payload.signature) */
  token_string: string;
}

/* -------------------------------------------------------------------------- */
/* Skill Fragment Types                                                       */
/* -------------------------------------------------------------------------- */

export const SkillFragmentTypeSchema = z.enum([
  "decision_tree",      // Fail-fast execution rules
  "phase_instructions", // Current phase guidance only
  "contracts",          // Input/output/state schemas
  "tool_specs",         // Allowed tools specifications
  "examples",           // Minimal examples (excluded by default)
  "old_patterns",       // Known-bad patterns (excluded by default)
  "full_source",        // Full SKILL.md (NEVER disclosed by default)
]);
export type SkillFragmentType = z.infer<typeof SkillFragmentTypeSchema>;

export interface SkillFragment {
  fragment_type: SkillFragmentType;
  fragment_id: string;
  skill_id: string;
  skill_version: string;
  content_hash: string;       // SHA-256 of content for integrity
  content_preview: string;    // First 200 chars (for logging, not full content)
  ttl_seconds: number;
}

/* -------------------------------------------------------------------------- */
/* Disclosure Manifest                                                        */
/* -------------------------------------------------------------------------- */

export interface DisclosureManifest {
  /** Manifest ID (matches token jti) */
  manifest_id: string;

  /** Token that authorized this manifest */
  token_id: string;

  /** Scope of disclosure */
  scope: {
    tenant_id: string;
    capability_id: string;
    run_id: string;
    stage_id: string;
    step_scope: DisclosureScope;
  };

  /** Execution mode for this disclosure */
  mode: ExecutionMode;

  /** Skills disclosed (metadata only, fragments reference by ID) */
  disclosed_skills: Array<{
    skill_id: string;
    skill_version: string;
    fragment_ids: string[];
    allowed_tools: string[];
  }>;

  /** Fragments available (content served separately) */
  fragments: SkillFragment[];

  /** TTL for this manifest */
  ttl_seconds: number;

  /** Expiry timestamp */
  expires_at: string;

  /** Issued at */
  issued_at: string;
}

/* -------------------------------------------------------------------------- */
/* Disclosure Request/Response                                                */
/* -------------------------------------------------------------------------- */

export const DisclosureIssueRequestSchema = z.object({
  tenant_id: z.string().min(1),
  run_id: z.string().uuid(),
  stage_id: z.string().min(1),
  capability_id: z.string().min(1),

  /** Lease ID proving authorization (required for step/run scope) */
  lease_id: z.string().optional(),

  /** Requested execution mode */
  mode: ExecutionModeSchema.default("managed"),

  /** Requested scope (default: run) */
  scope: DisclosureScopeSchema.default("run"),

  /** Skills being requested */
  requested_skills: z.array(z.string()).optional(),

  /** Actor requesting disclosure */
  actor: z.object({
    actor_kind: z.enum(["kernel", "plugin", "bot", "user", "system"]),
    actor_id: z.string().min(1),
  }),
});
export type DisclosureIssueRequest = z.infer<typeof DisclosureIssueRequestSchema>;

export interface DisclosureIssueResult {
  success: boolean;

  /** Issued token (when success=true) */
  token?: DisclosureToken;

  /** Disclosure manifest (when success=true) */
  manifest?: DisclosureManifest;

  /** Error details (when success=false) */
  failure?: {
    code: DisclosureErrorCode;
    message: string;
    retryable: boolean;
  };
}

export type DisclosureErrorCode =
  | "DISCLOSURE_REQUEST_INVALID"
  | "DISCLOSURE_LEASE_REQUIRED"
  | "DISCLOSURE_LEASE_EXPIRED"
  | "DISCLOSURE_SCOPE_DENIED"
  | "DISCLOSURE_CAPABILITY_UNKNOWN"
  | "DISCLOSURE_TOKEN_SIGNING_FAILED"
  | "DISCLOSURE_TOO_MANY_REQUESTS";

/* -------------------------------------------------------------------------- */
/* Token Validation                                                           */
/* -------------------------------------------------------------------------- */

export interface DisclosureValidationRequest {
  token_string: string;
  expected_tenant_id?: string;
  expected_run_id?: string;
  expected_stage_id?: string;
}

export interface DisclosureValidationResult {
  valid: boolean;
  payload?: DisclosureTokenPayload;
  error?: {
    code: DisclosureErrorCode | "TOKEN_EXPIRED" | "TOKEN_INVALID_SIGNATURE" | "TOKEN_MALFORMED";
    message: string;
  };
}

/* -------------------------------------------------------------------------- */
/* Disclosure Audit Event                                                     */
/* -------------------------------------------------------------------------- */

export interface DisclosureAuditRecord {
  record_id: string;
  event_type: "disclosure.issued" | "disclosure.validated" | "disclosure.revoked";
  ts: string;
  tenant_id: string;
  run_id: string;
  stage_id: string;
  capability_id: string;
  token_id: string;
  manifest_id: string;

  /** Fragment scope disclosed (not content) */
  fragment_scope: {
    fragment_types: SkillFragmentType[];
    skill_count: number;
    fragment_count: number;
  };

  /** Actor who received the disclosure */
  recipient: {
    actor_kind: string;
    actor_id: string;
  };

  /** Lease that authorized this disclosure (if applicable) */
  lease_id?: string;
}

/* -------------------------------------------------------------------------- */
/* Disclosure Store (for revocation lookups)                                */
/* -------------------------------------------------------------------------- */

export interface DisclosureStoreEntry {
  token_id: string;
  tenant_id: string;
  run_id: string;
  stage_id: string;
  capability_id: string;
  issued_at: string;
  expires_at: string;
  revoked_at?: string;
  revoked_reason?: string;
  manifest_id: string;
  fragment_summary: {
    fragment_types: SkillFragmentType[];
    skill_count: number;
    fragment_count: number;
  };
}
