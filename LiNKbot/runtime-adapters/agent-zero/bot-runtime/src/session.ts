/**
 * Agent Zero session lifecycle (Wave 2.2).
 */

import { randomUUID } from "node:crypto";

import type { AgentZeroMissionRequest, AgentZeroSessionContext, AgentZeroSessionState } from "./types.js";

const sessionStore = new Map<string, AgentZeroSessionContext>();

export function openAgentZeroSession(request: AgentZeroMissionRequest): AgentZeroSessionContext {
  const now = new Date().toISOString();
  const session: AgentZeroSessionContext = {
    session_id: randomUUID(),
    tenant_id: request.tenant_id,
    run_id: request.run_id,
    stage_id: request.stage_id,
    role_id: request.role_id,
    lane_id: request.lane_id,
    state: "initializing",
    lease_ids: [],
    audit_event_ids: [],
    created_at: now,
    updated_at: now,
  };
  sessionStore.set(session.session_id, session);
  return session;
}

export function getAgentZeroSession(sessionId: string): AgentZeroSessionContext | undefined {
  return sessionStore.get(sessionId);
}

export function updateAgentZeroSessionState(
  sessionId: string,
  state: AgentZeroSessionState,
): AgentZeroSessionContext {
  const session = sessionStore.get(sessionId);
  if (!session) {
    throw new Error(`Agent Zero session not found: ${sessionId}`);
  }
  const updated = { ...session, state, updated_at: new Date().toISOString() };
  sessionStore.set(sessionId, updated);
  return updated;
}

export function addAgentZeroLeaseRef(sessionId: string, leaseId: string): void {
  const session = sessionStore.get(sessionId);
  if (!session) return;
  session.lease_ids.push(leaseId);
  session.updated_at = new Date().toISOString();
}

export function addAgentZeroAuditRef(sessionId: string, eventId: string): void {
  const session = sessionStore.get(sessionId);
  if (!session) return;
  session.audit_event_ids.push(eventId);
  session.updated_at = new Date().toISOString();
}

export function setAgentZeroModelRunId(sessionId: string, modelRunId: string): void {
  const session = sessionStore.get(sessionId);
  if (!session) return;
  session.model_run_id = modelRunId;
  session.updated_at = new Date().toISOString();
}

export function removeAgentZeroSession(sessionId: string): boolean {
  return sessionStore.delete(sessionId);
}

/** Test helper — reset in-memory store. */
export function resetAgentZeroSessionsForTests(): void {
  sessionStore.clear();
}
