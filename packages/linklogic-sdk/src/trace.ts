import type { Env } from "@linktrend/shared-config";
import { createSupabaseServiceClient } from "@linktrend/db";

export async function recordTrace(
  env: Env,
  params: {
    eventType: string;
    missionId?: string | null;
    payload?: Record<string, unknown>;
  },
): Promise<void> {
  const client = createSupabaseServiceClient(env);
  await client.schema("linkaios").from("traces").insert({
    event_type: params.eventType,
    mission_id: params.missionId ?? null,
    payload: params.payload ?? {},
  });
}
