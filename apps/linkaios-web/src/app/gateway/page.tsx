import { EntityTable } from "@/components/entity-table";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

export default async function GatewayPage() {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .schema("gateway")
    .from("zulip_message_links")
    .select("zulip_message_id, stream_id, topic, mission_id, created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    return (
      <main>
        <h1 className="text-xl font-semibold text-zinc-900">Gateway</h1>
        <p className="mt-4 text-sm text-red-700">{error.message}</p>
      </main>
    );
  }

  return (
    <main>
      <h1 className="text-xl font-semibold text-zinc-900">Zulip bridge</h1>
      <p className="mt-2 max-w-2xl text-sm text-zinc-600">
        Rows in <code className="text-xs">gateway.zulip_message_links</code> (Zulip server DB stays separate).
      </p>
      <div className="mt-8">
        <EntityTable
          title="Message links"
          rows={(data ?? []) as Record<string, unknown>[]}
          columns={["zulip_message_id", "stream_id", "topic", "mission_id", "created_at"]}
        />
      </div>
    </main>
  );
}
