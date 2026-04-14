import { EntityTable } from "@/components/entity-table";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function GatewayPage() {
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
      <main>
        <h1 className="text-xl font-semibold text-zinc-900">Gateway</h1>
        <p className="mt-4 text-sm text-red-700">{err.message}</p>
      </main>
    );
  }

  return (
    <main>
      <h1 className="text-xl font-semibold text-zinc-900">Zulip bridge</h1>
      <p className="mt-2 max-w-2xl text-sm text-zinc-600">
        <code className="text-xs">gateway.stream_routing</code> maps Zulip <code className="text-xs">stream_id</code>{" "}
        to a mission. <code className="text-xs">gateway.zulip_message_links</code> stores inbound webhook payloads
        (Zulip application DB stays separate).
      </p>

      <div className="mt-10">
        <EntityTable
          title="Stream routing"
          rows={(routingRes.data ?? []) as Record<string, unknown>[]}
          columns={["zulip_stream_id", "mission_id", "note", "created_at"]}
        />
      </div>

      <div className="mt-10">
        <EntityTable
          title="Message links"
          rows={(linksRes.data ?? []) as Record<string, unknown>[]}
          columns={["zulip_message_id", "stream_id", "topic", "mission_id", "created_at"]}
        />
      </div>
    </main>
  );
}
