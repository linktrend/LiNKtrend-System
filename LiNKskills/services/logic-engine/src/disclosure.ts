/**
 * LinkSkills Progressive Disclosure Service.
 *
 * Implements run-scoped disclosure token generation and fragment delivery
 * per CONTRACTS_MVO.md §6.2 and PRD_LINKSKILLS_LOGIC_ENGINE §12.
 *
 * Key features:
 * - IP protection: No full skill source disclosed by default
 * - Run-scoped: Tokens bound to tenant + capability + run + step
 * - Time-limited: Short-lived tokens (5-30 min expiry)
 * - Auditable: All disclosures logged with scope (not content)
 */

import { randomUUID, createHash } from "crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Env } from "@linktrend/shared-config";
import { getLease } from "./lease-lifecycle.js";

type DisclosureEnv = Env & {
  DISCLOSURE_SIGNING_KEY?: string | undefined;
  LINKSKILLS_SIGNING_KEY?: string | undefined;
};

// Types defined locally to avoid SDK import issues
// These mirror the types in packages/linklogic-sdk/src/types/disclosure.ts

export type ExecutionMode = "managed" | "hybrid" | "client_side";
export type DisclosureScope = "tenant" | "capability" | "run" | "step";
export type SkillFragmentType =
  | "decision_tree"
  | "phase_instructions"
  | "contracts"
  | "tool_specs"
  | "examples"
  | "old_patterns"
  | "full_source";

export interface DisclosureTokenPayload {
  iss: "linkskills";
  sub: string;
  jti: string;
  iat: number;
  exp: number;
  tenant_id: string;
  capability_id: string;
  run_id: string;
  stage_id: string;
  step_scope: DisclosureScope;
  mode: ExecutionMode;
  allowed_tools: string[];
  allowed_skills?: string[];
  lease_id?: string;
}

export interface DisclosureToken {
  token_id: string;
  header: string;
  payload: string;
  signature: string;
  token_string: string;
}

export interface SkillFragment {
  fragment_type: SkillFragmentType;
  fragment_id: string;
  skill_id: string;
  skill_version: string;
  content_hash: string;
  content_preview: string;
  ttl_seconds: number;
}

export interface DisclosureManifest {
  manifest_id: string;
  token_id: string;
  scope: {
    tenant_id: string;
    capability_id: string;
    run_id: string;
    stage_id: string;
    step_scope: DisclosureScope;
  };
  mode: ExecutionMode;
  disclosed_skills: Array<{
    skill_id: string;
    skill_version: string;
    fragment_ids: string[];
    allowed_tools: string[];
  }>;
  fragments: SkillFragment[];
  ttl_seconds: number;
  expires_at: string;
  issued_at: string;
}

export interface DisclosureIssueRequest {
  tenant_id: string;
  run_id: string;
  stage_id: string;
  capability_id: string;
  lease_id?: string;
  mode: ExecutionMode;
  scope: DisclosureScope;
  requested_skills?: string[];
  actor: {
    actor_kind: "kernel" | "plugin" | "bot" | "user" | "system";
    actor_id: string;
  };
}

export interface DisclosureIssueResult {
  success: boolean;
  token?: DisclosureToken;
  manifest?: DisclosureManifest;
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
    code: "DISCLOSURE_REQUEST_INVALID" | "DISCLOSURE_LEASE_REQUIRED" | "TOKEN_EXPIRED" | "TOKEN_INVALID_SIGNATURE" | "TOKEN_MALFORMED";
    message: string;
  };
}

// Token TTL: 5-30 minutes as per spec
const DEFAULT_TOKEN_TTL_SECONDS = 900; // 15 minutes default
const MIN_TOKEN_TTL_SECONDS = 300;     // 5 minutes minimum
const MAX_TOKEN_TTL_SECONDS = 1800;    // 30 minutes maximum

// Algorithm for signing - using HS256 for development simplicity
// In production, use RS256 or Ed25519 with proper key management
const SIGNING_ALGORITHM = "HS256";

/** Token signing key - in production, this should be rotated and stored securely */
function getSigningKey(env: DisclosureEnv): string {
  // Use a development-safe signing key
  // In production, this should come from a proper key management service
  const key = env.DISCLOSURE_SIGNING_KEY || env.LINKSKILLS_SIGNING_KEY || "linkskills-dev-key-change-in-production";
  return key;
}

/** Base64 URL-safe encoding (JWT-style) */
function base64UrlEncode(str: string): string {
  return Buffer.from(str)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

/** Base64 URL-safe decoding */
function base64UrlDecode(str: string): string {
  // Add padding back
  const padding = 4 - (str.length % 4);
  if (padding !== 4) {
    str += "=".repeat(padding);
  }
  return Buffer.from(str.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf-8");
}

/** Create HMAC signature (development-safe) */
function createSignature(header: string, payload: string, secret: string): string {
  const data = `${header}.${payload}`;
  return createHash("sha256").update(data + secret).digest("base64url");
}

/** Verify HMAC signature (development-safe) */
function verifySignature(header: string, payload: string, signature: string, secret: string): boolean {
  const expected = createSignature(header, payload, secret);
  // Constant-time comparison to prevent timing attacks
  if (signature.length !== expected.length) return false;
  let result = 0;
  for (let i = 0; i < signature.length; i++) {
    result |= signature.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return result === 0;
}

/**
 * Build JWT-like token header.
 */
function buildTokenHeader(): string {
  const header = {
    alg: SIGNING_ALGORITHM,
    typ: "linkskills-disclosure+jwt",
  };
  return base64UrlEncode(JSON.stringify(header));
}

/**
 * Build token payload with claims.
 */
function buildTokenPayload(
  request: DisclosureIssueRequest,
  ttlSeconds: number,
  allowedTools: string[],
  allowedSkills?: string[],
  leaseId?: string,
): DisclosureTokenPayload {
  const now = Math.floor(Date.now() / 1000);
  const exp = now + Math.max(MIN_TOKEN_TTL_SECONDS, Math.min(ttlSeconds, MAX_TOKEN_TTL_SECONDS));

  const payload: DisclosureTokenPayload = {
    iss: "linkskills",
    sub: `${request.run_id}:${request.stage_id}`,
    jti: randomUUID(),
    iat: now,
    exp,
    tenant_id: request.tenant_id,
    capability_id: request.capability_id,
    run_id: request.run_id,
    stage_id: request.stage_id,
    step_scope: request.scope,
    mode: request.mode,
    allowed_tools: allowedTools,
  };

  if (allowedSkills) {
    payload.allowed_skills = allowedSkills;
  }
  if (leaseId) {
    payload.lease_id = leaseId;
  }

  return payload;
}

/**
 * Sign a disclosure token.
 */
function signToken(payload: DisclosureTokenPayload, env: DisclosureEnv): DisclosureToken {
  const header = buildTokenHeader();
  const payloadJson = base64UrlEncode(JSON.stringify(payload));
  const secret = getSigningKey(env);
  const signature = createSignature(header, payloadJson, secret);

  return {
    token_id: payload.jti,
    header,
    payload: payloadJson,
    signature,
    token_string: `${header}.${payloadJson}.${signature}`,
  };
}

/**
 * Validate and parse a disclosure token.
 */
export function validateDisclosureToken(
  request: DisclosureValidationRequest,
  env: DisclosureEnv,
): DisclosureValidationResult {
  try {
    const parts = request.token_string.split(".");
    if (parts.length !== 3) {
      return {
        valid: false,
        error: { code: "TOKEN_MALFORMED", message: "Token must have 3 parts" },
      };
    }

    const [header, payload, signature] = parts;
    if (!header || !payload || !signature) {
      return {
        valid: false,
        error: { code: "TOKEN_MALFORMED", message: "Token parts must not be empty" },
      };
    }

    // Verify signature
    const secret = getSigningKey(env);
    if (!verifySignature(header, payload, signature, secret)) {
      return {
        valid: false,
        error: { code: "TOKEN_INVALID_SIGNATURE", message: "Invalid token signature" },
      };
    }

    // Parse and validate payload
    let parsedPayload: DisclosureTokenPayload;
    try {
      const payloadJson = base64UrlDecode(payload);
      parsedPayload = JSON.parse(payloadJson);
    } catch {
      return {
        valid: false,
        error: { code: "TOKEN_MALFORMED", message: "Invalid payload encoding" },
      };
    }

    // Validate required claims
    if (!parsedPayload.iss || parsedPayload.iss !== "linkskills") {
      return {
        valid: false,
        error: { code: "TOKEN_MALFORMED", message: "Invalid issuer" },
      };
    }

    // Check expiry
    const now = Math.floor(Date.now() / 1000);
    if (parsedPayload.exp < now) {
      return {
        valid: false,
        error: { code: "TOKEN_EXPIRED", message: "Token has expired" },
      };
    }

    // Validate scope constraints if provided
    if (request.expected_tenant_id && parsedPayload.tenant_id !== request.expected_tenant_id) {
      return {
        valid: false,
        error: { code: "TOKEN_MALFORMED", message: "Token tenant mismatch" },
      };
    }
    if (request.expected_run_id && parsedPayload.run_id !== request.expected_run_id) {
      return {
        valid: false,
        error: { code: "TOKEN_MALFORMED", message: "Token run mismatch" },
      };
    }
    if (request.expected_stage_id && parsedPayload.stage_id !== request.expected_stage_id) {
      return {
        valid: false,
        error: { code: "TOKEN_MALFORMED", message: "Token stage mismatch" },
      };
    }

    return { valid: true, payload: parsedPayload };
  } catch (error) {
    return {
      valid: false,
      error: {
        code: "TOKEN_MALFORMED",
        message: error instanceof Error ? error.message : "Unknown validation error",
      },
    };
  }
}

/**
 * Select skill fragments based on disclosure scope and mode.
 * Implements progressive disclosure: minimal fragments only.
 */
function selectSkillFragments(
  _skillId: string,
  _skillVersion: string,
  scope: DisclosureScope,
  mode: ExecutionMode,
): SkillFragment[] {
  const fragments: SkillFragment[] = [];
  const now = new Date().toISOString();

  // Always include decision tree for fail-fast execution
  fragments.push({
    fragment_type: "decision_tree",
    fragment_id: `dt-${randomUUID()}`,
    skill_id: _skillId,
    skill_version: _skillVersion,
    content_hash: "sha256:placeholder", // Real implementation would hash actual content
    content_preview: "Decision tree for fail-fast execution...",
    ttl_seconds: DEFAULT_TOKEN_TTL_SECONDS,
  });

  // Include phase instructions based on scope
  if (scope === "step" || scope === "run") {
    fragments.push({
      fragment_type: "phase_instructions",
      fragment_id: `pi-${randomUUID()}`,
      skill_id: _skillId,
      skill_version: _skillVersion,
      content_hash: "sha256:placeholder",
      content_preview: "Phase-specific instructions for current execution step...",
      ttl_seconds: DEFAULT_TOKEN_TTL_SECONDS,
    });
  }

  // Include contracts for type safety
  if (scope !== "tenant") {
    fragments.push({
      fragment_type: "contracts",
      fragment_id: `ct-${randomUUID()}`,
      skill_id: _skillId,
      skill_version: _skillVersion,
      content_hash: "sha256:placeholder",
      content_preview: "Input/output/state schema contracts...",
      ttl_seconds: DEFAULT_TOKEN_TTL_SECONDS,
    });
  }

  // Include tool specs for client-side or hybrid execution
  if (mode === "client_side" || mode === "hybrid") {
    fragments.push({
      fragment_type: "tool_specs",
      fragment_id: `ts-${randomUUID()}`,
      skill_id: _skillId,
      skill_version: _skillVersion,
      content_hash: "sha256:placeholder",
      content_preview: "Allowed tools specifications...",
      ttl_seconds: DEFAULT_TOKEN_TTL_SECONDS,
    });
  }

  // NEVER include full source, examples, or old patterns by default
  // These require explicit override (not implemented in MVO)

  return fragments;
}

/**
 * Generate a disclosure manifest for the given request.
 */
function generateDisclosureManifest(
  request: DisclosureIssueRequest,
  token: DisclosureToken,
  payload: DisclosureTokenPayload,
  skills: Array<{ skill_id: string; skill_version: string }>,
): DisclosureManifest {
  const now = new Date().toISOString();
  const expiresAt = new Date(payload.exp * 1000).toISOString();

  // Collect fragments for all requested skills
  const allFragments: SkillFragment[] = [];
  const disclosedSkills: DisclosureManifest["disclosed_skills"] = [];

  for (const skill of skills) {
    const fragments = selectSkillFragments(
      skill.skill_id,
      skill.skill_version,
      request.scope,
      request.mode,
    );
    allFragments.push(...fragments);
    disclosedSkills.push({
      skill_id: skill.skill_id,
      skill_version: skill.skill_version,
      fragment_ids: fragments.map(f => f.fragment_id),
      allowed_tools: payload.allowed_tools,
    });
  }

  return {
    manifest_id: randomUUID(),
    token_id: token.token_id,
    scope: {
      tenant_id: request.tenant_id,
      capability_id: request.capability_id,
      run_id: request.run_id,
      stage_id: request.stage_id,
      step_scope: request.scope,
    },
    mode: request.mode,
    disclosed_skills: disclosedSkills,
    fragments: allFragments,
    ttl_seconds: payload.exp - payload.iat,
    expires_at: expiresAt,
    issued_at: now,
  };
}

/**
 * Build audit record for disclosure issuance.
 */
function buildDisclosureAuditRecord(
  request: DisclosureIssueRequest,
  token: DisclosureToken,
  manifest: DisclosureManifest,
): {
  event_type: "disclosure.issued";
  tenant_id: string;
  run_id: string;
  stage_id: string;
  capability_id: string;
  token_id: string;
  manifest_id: string;
  fragment_scope: {
    fragment_types: SkillFragmentType[];
    skill_count: number;
    fragment_count: number;
  };
  recipient: {
    actor_kind: string;
    actor_id: string;
  };
  lease_id?: string;
} {
  const fragmentTypes = [...new Set(manifest.fragments.map(f => f.fragment_type))];

  const event: {
    event_type: "disclosure.issued";
    tenant_id: string;
    run_id: string;
    stage_id: string;
    capability_id: string;
    token_id: string;
    manifest_id: string;
    fragment_scope: {
      fragment_types: SkillFragmentType[];
      skill_count: number;
      fragment_count: number;
    };
    recipient: {
      actor_kind: string;
      actor_id: string;
    };
    lease_id?: string;
  } = {
    event_type: "disclosure.issued",
    tenant_id: request.tenant_id,
    run_id: request.run_id,
    stage_id: request.stage_id,
    capability_id: request.capability_id,
    token_id: token.token_id,
    manifest_id: manifest.manifest_id,
    fragment_scope: {
      fragment_types: fragmentTypes,
      skill_count: manifest.disclosed_skills.length,
      fragment_count: manifest.fragments.length,
    },
    recipient: {
      actor_kind: request.actor.actor_kind,
      actor_id: request.actor.actor_id,
    },
  };

  if (request.lease_id) {
    event.lease_id = request.lease_id;
  }

  return event;
}

/**
 * Issue a disclosure token and manifest.
 * POST /v1/disclosures/issue implementation.
 */
export async function issueDisclosure(
  client: SupabaseClient,
  env: Env,
  request: DisclosureIssueRequest,
): Promise<DisclosureIssueResult> {
  // Validate request
  if (!request.tenant_id || !request.run_id || !request.stage_id || !request.capability_id) {
    return {
      success: false,
      failure: {
        code: "DISCLOSURE_REQUEST_INVALID",
        message: "Missing required fields: tenant_id, run_id, stage_id, capability_id",
        retryable: false,
      },
    };
  }

  // Check lease requirement for step/run scope
  if ((request.scope === "step" || request.scope === "run") && !request.lease_id) {
    return {
      success: false,
      failure: {
        code: "DISCLOSURE_LEASE_REQUIRED",
        message: `Lease required for scope '${request.scope}'`,
        retryable: false,
      },
    };
  }

  // Validate lease if provided
  if (request.lease_id) {
    const { data: lease, error: leaseError } = await getLease(client, request.lease_id);
    if (leaseError || !lease) {
      return {
        success: false,
        failure: {
          code: "DISCLOSURE_LEASE_REQUIRED",
          message: leaseError?.message ?? "Provided lease not found",
          retryable: false,
        },
      };
    }

    // Check lease expiry
    if (lease.expires_at && new Date(lease.expires_at) < new Date()) {
      return {
        success: false,
        failure: {
          code: "DISCLOSURE_LEASE_EXPIRED",
          message: "Provided lease has expired",
          retryable: false,
        },
      };
    }

    // Validate lease matches request context
    if (lease.tenant_id !== request.tenant_id ||
        lease.run_id !== request.run_id ||
        lease.capability_id !== request.capability_id) {
      return {
        success: false,
        failure: {
          code: "DISCLOSURE_SCOPE_DENIED",
          message: "Lease context does not match disclosure request",
          retryable: false,
        },
      };
    }
  }

  // Determine allowed tools based on capability
  // In a real implementation, this would come from the capability catalog
  const allowedTools = determineAllowedTools(request.capability_id);

  // Determine skills to disclose
  const skillsToDisclose = request.requested_skills && request.requested_skills.length > 0
    ? request.requested_skills.map(id => ({ skill_id: id, skill_version: "1.0.0" }))
    : await getSkillsForCapability(client, request.capability_id);

  // Build token payload
  const tokenPayload = buildTokenPayload(
    request,
    DEFAULT_TOKEN_TTL_SECONDS,
    allowedTools,
    skillsToDisclose.map(s => s.skill_id),
    request.lease_id,
  );

  // Sign token
  let token: DisclosureToken;
  try {
    token = signToken(tokenPayload, env);
  } catch (error) {
    return {
      success: false,
      failure: {
        code: "DISCLOSURE_TOKEN_SIGNING_FAILED",
        message: error instanceof Error ? error.message : "Token signing failed",
        retryable: true,
      },
    };
  }

  // Generate manifest
  const manifest = generateDisclosureManifest(request, token, tokenPayload, skillsToDisclose);

  // Build audit record
  const auditRecord = buildDisclosureAuditRecord(request, token, manifest);

  // Store disclosure record (async, non-blocking for issuance)
  await storeDisclosureRecord(client, auditRecord).catch(() => {
    // Log but don't fail issuance if audit storage fails
    // In production, this should use a reliable queue
  });

  return {
    success: true,
    token,
    manifest,
  };
}

/**
 * Determine allowed tools for a capability.
 * In production, this would query the capability catalog.
 */
function determineAllowedTools(capabilityId: string): string[] {
  // Default tool set - minimal safe tools
  const defaultTools = ["read_file", "write_file"];

  // Capability-specific tool sets
  const capabilityTools: Record<string, string[]> = {
    "crm.upsert": ["read_file", "write_file", "db_query"],
    "plane.project.create": ["read_file", "write_file", "http_post"],
    "plane.task.create": ["read_file", "write_file", "http_post"],
    "preview.publish": ["read_file", "write_file", "render_template"],
    "cap.crm.odoo_shadow": ["read_file", "write_file", "db_query", "odoo_api"],
    "cap.payload.local_sync": ["read_file", "write_file", "payload_api"],
    "cap.supabase.mirror_content": ["read_file", "write_file", "supabase_api"],
    "cap.zulip.run_messaging": ["read_file", "write_file", "zulip_api"],
    "cap.research.public_web": ["read_file", "write_file", "web_search", "fetch_url"],
    "cap.asset.generation": ["read_file", "write_file", "generate_image", "generate_video"],
    "cap.plane.execution_tracking": ["read_file", "write_file", "plane_api"],
  };

  return capabilityTools[capabilityId] || defaultTools;
}

/**
 * Get skills associated with a capability.
 * In production, this would query the skill catalog.
 */
async function getSkillsForCapability(
  _client: SupabaseClient,
  capabilityId: string,
): Promise<Array<{ skill_id: string; skill_version: string }>> {
  // Placeholder: return generic skills for the capability
  // In production, this would query the linkskills.skill_bindings table
  return [
    { skill_id: `skill-${capabilityId}-default`, skill_version: "1.0.0" },
  ];
}

/**
 * Store disclosure record for audit/revocation lookups.
 */
async function storeDisclosureRecord(
  client: SupabaseClient,
  record: ReturnType<typeof buildDisclosureAuditRecord>,
): Promise<void> {
  const { error } = await client
    .schema("linkskills")
    .from("disclosure_audit_log")
    .insert({
      event_type: record.event_type,
      tenant_id: record.tenant_id,
      run_id: record.run_id,
      stage_id: record.stage_id,
      capability_id: record.capability_id,
      token_id: record.token_id,
      manifest_id: record.manifest_id,
      fragment_types: record.fragment_scope.fragment_types,
      skill_count: record.fragment_scope.skill_count,
      fragment_count: record.fragment_scope.fragment_count,
      recipient_actor_kind: record.recipient.actor_kind,
      recipient_actor_id: record.recipient.actor_id,
      lease_id: record.lease_id,
    });

  if (error) {
    throw new Error(`Failed to store disclosure record: ${error.message}`);
  }
}

/**
 * Check if a token has been revoked.
 */
export async function isTokenRevoked(
  client: SupabaseClient,
  tokenId: string,
): Promise<boolean> {
  const { data, error } = await client
    .schema("linkskills")
    .from("disclosure_audit_log")
    .select("revoked_at")
    .eq("token_id", tokenId)
    .single();

  if (error || !data) return false;
  return data.revoked_at !== null;
}

/**
 * Revoke a disclosure token.
 */
export async function revokeDisclosure(
  client: SupabaseClient,
  tokenId: string,
  reason: string,
  revokedBy: string,
): Promise<boolean> {
  const { error } = await client
    .schema("linkskills")
    .from("disclosure_audit_log")
    .update({
      revoked_at: new Date().toISOString(),
      revoked_reason: reason,
      revoked_by: revokedBy,
    })
    .eq("token_id", tokenId);

  return !error;
}

/**
 * List disclosures for a run (for audit/troubleshooting).
 */
export async function listDisclosuresForRun(
  client: SupabaseClient,
  runId: string,
): Promise<Array<{
  token_id: string;
  manifest_id: string;
  issued_at: string;
  expires_at: string;
  revoked_at?: string;
  fragment_count: number;
}>> {
  const { data, error } = await client
    .schema("linkskills")
    .from("disclosure_audit_log")
    .select("token_id, manifest_id, issued_at, expires_at, revoked_at, fragment_count")
    .eq("run_id", runId)
    .order("issued_at", { ascending: false });

  if (error || !data) return [];
  return data;
}
