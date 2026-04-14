import type { Env } from "@linktrend/shared-config";
import { createSupabaseServiceClient } from "@linktrend/db";
import { log } from "@linktrend/observability";

/** Ensures at least one agent row exists for local worker binding. */
export async function ensureWorkerAgent(
  env: Env,
  params: { service: string; displayName: string },
): Promise<string> {
  const client = createSupabaseServiceClient(env);
  const { data: existing, error: selErr } = await client
    .schema("linkaios")
    .from("agents")
    .select("id")
    .limit(1)
    .maybeSingle();
  if (selErr) throw selErr;
  if (existing?.id) return existing.id as string;

  const { data, error } = await client
    .schema("linkaios")
    .from("agents")
    .insert({ display_name: params.displayName, status: "active" })
    .select("id")
    .single();
  if (error) throw error;
  log("info", "created worker agent", { service: params.service, agentId: data.id });
  return data.id as string;
}

export async function openWorkerSession(
  env: Env,
  params: { service: string; agentId: string; metadata?: Record<string, unknown> },
): Promise<string> {
  const client = createSupabaseServiceClient(env);
  const { data, error } = await client
    .schema("bot_runtime")
    .from("worker_sessions")
    .insert({
      agent_id: params.agentId,
      status: "running",
      last_heartbeat: new Date().toISOString(),
      metadata: { service: params.service, ...(params.metadata ?? {}) },
    })
    .select("id")
    .single();
  if (error) throw error;
  log("info", "worker session opened", { service: params.service, sessionId: data.id });
  return data.id as string;
}

export async function pulseWorkerSession(
  env: Env,
  params: { service: string; sessionId: string },
): Promise<void> {
  const client = createSupabaseServiceClient(env);
  const { error } = await client
    .schema("bot_runtime")
    .from("worker_sessions")
    .update({ last_heartbeat: new Date().toISOString(), status: "running" })
    .eq("id", params.sessionId);
  if (error) {
    log("warn", "heartbeat failed", {
      service: params.service,
      message: error.message,
    });
  }
}

export async function closeWorkerSession(
  env: Env,
  params: { service: string; sessionId: string },
): Promise<void> {
  const client = createSupabaseServiceClient(env);
  const { error } = await client
    .schema("bot_runtime")
    .from("worker_sessions")
    .update({
      status: "stopped",
      ended_at: new Date().toISOString(),
    })
    .eq("id", params.sessionId);
  if (error) {
    log("warn", "close session failed", {
      service: params.service,
      message: error.message,
    });
    return;
  }
  log("info", "worker session closed", { service: params.service, sessionId: params.sessionId });
}
