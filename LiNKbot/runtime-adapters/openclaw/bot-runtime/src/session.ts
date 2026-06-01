/**
 * Bot Session Lifecycle Management
 *
 * Per CONTRACTS_MVO.md §6.1 - LiNKbot is a delegating shell that:
 * - Accepts stage dispatch from LiNKaios kernel
 * - Returns typed output
 * - MUST NOT write to LiNKbrain memory directly
 * - MUST NOT issue capability leases directly
 * - MUST NOT execute deterministic steps
 */

import { randomUUID } from "crypto";
import {
  BotSessionContext,
  BotSessionContextSchema,
  BotSessionState,
  BotReasonRequest,
  MissionResult,
  FailureReport,
  SessionRefs,
  SkillDisclosureSessionRef,
} from "./types.js";

/**
 * In-memory session store (production uses persistent store)
 */
const sessionStore = new Map<string, BotSessionContext>();

/**
 * Create a new bot session
 */
export function createBotSession(
  tenant_id: string,
  run_id: string,
  stage_id: string,
  role_id: string,
  reasoning_kind: string,
  inputs: Record<string, unknown>,
  model_routing_profile: string
): BotSessionContext {
  const now = new Date().toISOString();
  const session_id = randomUUID();

  const session: BotSessionContext = {
    session_id,
    tenant_id,
    run_id,
    stage_id,
    role_id,
    state: "initializing",
    mission: {
      reasoning_kind,
      inputs,
      model_routing_profile,
    },
    refs: {
      lease_ids: [],
      context_request_id: undefined,
      audit_event_ids: [],
      model_run_id: undefined,
      skill_disclosure_refs: [],
    },
    created_at: now,
    updated_at: now,
  };

  // Validate and store
  const validated = BotSessionContextSchema.parse(session);
  sessionStore.set(session_id, validated);

  return validated;
}

/**
 * Get session by ID
 */
export function getBotSession(session_id: string): BotSessionContext | undefined {
  return sessionStore.get(session_id);
}

/**
 * Update session state
 */
export function updateSessionState(
  session_id: string,
  newState: BotSessionState,
  failure?: FailureReport
): BotSessionContext {
  const session = sessionStore.get(session_id);
  if (!session) {
    throw new Error(`Session not found: ${session_id}`);
  }

  const updated: BotSessionContext = {
    ...session,
    state: newState,
    updated_at: new Date().toISOString(),
    ...(failure && { failure }),
  };

  const validated = BotSessionContextSchema.parse(updated);
  sessionStore.set(session_id, validated);

  return validated;
}

/**
 * Add lease reference to session
 */
export function addSessionLeaseRef(session_id: string, lease_id: string): BotSessionContext {
  const session = sessionStore.get(session_id);
  if (!session) {
    throw new Error(`Session not found: ${session_id}`);
  }

  const currentRefs: SessionRefs = session.refs;
  const updatedRefs: SessionRefs = {
    ...currentRefs,
    lease_ids: [...currentRefs.lease_ids, lease_id],
  };

  const updated: BotSessionContext = {
    ...session,
    refs: updatedRefs,
    updated_at: new Date().toISOString(),
  };

  const validated = BotSessionContextSchema.parse(updated);
  sessionStore.set(session_id, validated);

  return validated;
}

/**
 * Add audit event reference to session
 */
export function addSessionAuditRef(session_id: string, audit_event_id: string): BotSessionContext {
  const session = sessionStore.get(session_id);
  if (!session) {
    throw new Error(`Session not found: ${session_id}`);
  }

  const currentRefs: SessionRefs = session.refs;
  const updatedRefs: SessionRefs = {
    ...currentRefs,
    audit_event_ids: [...currentRefs.audit_event_ids, audit_event_id],
  };

  const updated: BotSessionContext = {
    ...session,
    refs: updatedRefs,
    updated_at: new Date().toISOString(),
  };

  const validated = BotSessionContextSchema.parse(updated);
  sessionStore.set(session_id, validated);

  return validated;
}

/**
 * Add context request reference to session
 */
export function addSessionContextRef(
  session_id: string,
  context_request_id: string
): BotSessionContext {
  const session = sessionStore.get(session_id);
  if (!session) {
    throw new Error(`Session not found: ${session_id}`);
  }

  const currentRefs: SessionRefs = session.refs;
  const updatedRefs: SessionRefs = {
    ...currentRefs,
    context_request_id,
  };

  const updated: BotSessionContext = {
    ...session,
    refs: updatedRefs,
    updated_at: new Date().toISOString(),
  };

  const validated = BotSessionContextSchema.parse(updated);
  sessionStore.set(session_id, validated);

  return validated;
}

/**
 * Add model run ID to session
 */
export function addSessionModelRunId(session_id: string, model_run_id: string): BotSessionContext {
  const session = sessionStore.get(session_id);
  if (!session) {
    throw new Error(`Session not found: ${session_id}`);
  }

  const currentRefs: SessionRefs = session.refs;
  const updatedRefs: SessionRefs = {
    ...currentRefs,
    model_run_id,
  };

  const updated: BotSessionContext = {
    ...session,
    refs: updatedRefs,
    updated_at: new Date().toISOString(),
  };

  const validated = BotSessionContextSchema.parse(updated);
  sessionStore.set(session_id, validated);

  return validated;
}

/**
 * Add a progressive skill disclosure reference to the session.
 *
 * The stored ref intentionally contains only token/manifest and fragment hashes.
 * Skill bodies, previews, examples, and full-source material must never be
 * persisted on the bot worker.
 */
export function addSessionSkillDisclosureRef(
  session_id: string,
  disclosure_ref: SkillDisclosureSessionRef
): BotSessionContext {
  const session = sessionStore.get(session_id);
  if (!session) {
    throw new Error(`Session not found: ${session_id}`);
  }

  const currentRefs: SessionRefs = session.refs;
  const updatedRefs: SessionRefs = {
    ...currentRefs,
    skill_disclosure_refs: [...currentRefs.skill_disclosure_refs, disclosure_ref],
  };

  const updated: BotSessionContext = {
    ...session,
    refs: updatedRefs,
    updated_at: new Date().toISOString(),
  };

  const validated = BotSessionContextSchema.parse(updated);
  sessionStore.set(session_id, validated);

  return validated;
}

/**
 * Scrub temporary skill disclosure references from a live session.
 */
export function scrubSessionSkillDisclosureRefs(session_id: string): BotSessionContext {
  const session = sessionStore.get(session_id);
  if (!session) {
    throw new Error(`Session not found: ${session_id}`);
  }

  const updated: BotSessionContext = {
    ...session,
    refs: {
      ...session.refs,
      skill_disclosure_refs: [],
    },
    updated_at: new Date().toISOString(),
  };

  const validated = BotSessionContextSchema.parse(updated);
  sessionStore.set(session_id, validated);

  return validated;
}

/**
 * Clean up session (LiNKguard will handle full cleanup)
 */
export function cleanupBotSession(session_id: string): boolean {
  const session = sessionStore.get(session_id);
  if (!session) {
    return false;
  }

  // Mark as cleanup state and scrub disclosure metadata before removal.
  updateSessionState(session_id, "cleanup");
  scrubSessionSkillDisclosureRefs(session_id);
  sessionStore.delete(session_id);
  return true;
}

/**
 * List active sessions (for monitoring)
 */
export function listActiveSessions(tenant_id?: string): BotSessionContext[] {
  const sessions = Array.from(sessionStore.values());

  if (tenant_id) {
    return sessions.filter((s) => s.tenant_id === tenant_id);
  }

  return sessions;
}

/**
 * Get session count by state
 */
export function getSessionStats(): Record<string, number> {
  const stats: Record<string, number> = {};

  for (const session of sessionStore.values()) {
    stats[session.state] = (stats[session.state] || 0) + 1;
  }

  return stats;
}

/**
 * Convert session to mission result
 */
export function sessionToMissionResult(
  session: BotSessionContext,
  outputs: Record<string, unknown>,
  success: boolean,
  failure?: FailureReport
): MissionResult {
  const now = new Date().toISOString();
  const createdTime = new Date(session.created_at).getTime();
  const currentTime = new Date().getTime();

  return {
    session_id: session.session_id,
    run_id: session.run_id,
    stage_id: session.stage_id,
    outputs,
    provenance: {
      model_run_id: session.refs.model_run_id || "unknown",
      tokens_in: 0, // Populated by engine adapter
      tokens_out: 0, // Populated by engine adapter
      reasoning_duration_ms: currentTime - createdTime,
      context_refs: session.refs.context_request_id ? [session.refs.context_request_id] : [],
      lease_refs: session.refs.lease_ids,
      audit_refs: session.refs.audit_event_ids,
    },
    completed_at: now,
    success,
    failure,
  };
}

/**
 * Initialize session from BotReasonRequest
 */
export function initializeSessionFromRequest(request: BotReasonRequest): BotSessionContext {
  return createBotSession(
    request.tenant_id,
    request.run_id,
    request.stage_id,
    "unknown", // role_id resolved separately
    request.reasoning_kind,
    request.inputs,
    request.model_routing_profile
  );
}
