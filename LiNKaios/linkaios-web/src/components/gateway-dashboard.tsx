import { EntityTable } from "@/components/entity-table";
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
        See how chat streams map to projects and recent message links.
      </p>

      <div className="mt-8">
        <EntityTable
          title="Stream routing"
          rows={routingRows as Record<string, unknown>[]}
          columns={["stream", "project", "notes", "created"]}
          columnHeaders={["Stream", "Project", "Notes", "Created"]}
        />
      </div>

      <div className="mt-10">
        <EntityTable
          title="Message links"
          rows={linkRows as Record<string, unknown>[]}
          columns={["stream", "topic", "project", "created"]}
          columnHeaders={["Stream", "Topic", "Project", "Created"]}
        />
      </div>
    </>
  );
}
