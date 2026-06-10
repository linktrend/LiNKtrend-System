import { GatewayMessageLinksTable } from "@/components/gateway-message-links-table";
import { GatewayStreamRoutingTable } from "@/components/gateway-stream-routing-table";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function fmtTs(v: unknown): string {
  if (v == null) return "—";
  const s = String(v);
  return s.replace("T", " ").slice(0, 19);
}

export async function GatewayDashboard() {
  const supabase = await createSupabaseServerClient();

  const [linksRes, routingRes] = await Promise.all([
    supabase
      .schema("gateway")
      .from("zulip_message_links")
      .select("zulip_message_id, stream_id, topic, mission_id, created_at")
      .order("created_at", { ascending: false })
      .limit(100),
    supabase
      .schema("gateway")
      .from("stream_routing")
      .select("zulip_stream_id, mission_id, note, created_at")
      .order("created_at", { ascending: false })
      .limit(100),
  ]);

  const err = linksRes.error ?? routingRes.error;
  if (err) {
    return (
      <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
        Routing data is not available yet. Try again later, or confirm your account can access this area.
      </p>
    );
  }

  const routingRows = (routingRes.data ?? []).map((r) => ({
    stream: r.zulip_stream_id,
    project: r.mission_id ?? "—",
    notes: r.note ?? "—",
    created: fmtTs(r.created_at),
  }));

  const linkRows = (linksRes.data ?? []).map((r) => ({
    stream: r.stream_id ?? "—",
    topic: r.topic ?? "—",
    project: r.mission_id ?? "—",
    created: fmtTs(r.created_at),
  }));

  return (
    <>
      <p className="mt-2 max-w-2xl text-sm text-zinc-600 dark:text-zinc-400">
        Troubleshooting view for Zulip messaging: each row shows which chat stream is linked to a LiNKaios project, plus
        recent inbound message links. Use this when operators report messages in the wrong stream or a project stream was
        never created.
      </p>

      <div className="mt-8">
        <GatewayStreamRoutingTable rows={routingRows} />
      </div>

      <div className="mt-10">
        <GatewayMessageLinksTable rows={linkRows} />
      </div>
    </>
  );
}
