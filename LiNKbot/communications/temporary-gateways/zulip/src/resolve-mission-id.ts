import { createSupabaseServiceClient } from "@linktrend/db";
import { log } from "@linktrend/observability";
export async function resolveMissionId(params: {
  client: ReturnType<typeof createSupabaseServiceClient>;
  streamId: number | null;
  overrideMissionId: string | null;
}): Promise<{ missionId: string | null; source: string }> {
  if (params.overrideMissionId) {
    const { data, error } = await params.client
      .schema("linkaios")
      .from("missions")
      .select("id")
      .eq("id", params.overrideMissionId)
      .maybeSingle();
    if (error) {
      log("warn", "gateway mission override lookup failed", {
        service: "zulip-gateway",
        message: error.message,
      });
      return { missionId: null, source: "override_invalid" };
    }
    if (data?.id) return { missionId: String(data.id), source: "query_override" };
    return { missionId: null, source: "override_not_found" };
  }
  if (params.streamId == null) {
    return { missionId: null, source: "no_stream" };
  }
  const { data, error } = await params.client
    .schema("gateway")
    .from("stream_routing")
    .select("mission_id")
    .eq("zulip_stream_id", params.streamId)
    .maybeSingle();
  if (error) {
    log("warn", "gateway stream_routing lookup failed", {
      service: "zulip-gateway",
      message: error.message,
    });
    return { missionId: null, source: "routing_error" };
  }
  if (data?.mission_id) return { missionId: String(data.mission_id), source: "stream_routing" };
  return { missionId: null, source: "no_routing_row" };
}
