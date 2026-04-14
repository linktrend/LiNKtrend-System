import Link from "next/link";

import { BrandHeading } from "@linktrend/ui";

import { EntityTable } from "@/components/entity-table";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function Home() {
  const supabase = await createSupabaseServerClient();

  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const [
    agentsRes,
    missionsRes,
    skillsRes,
    workersRes,
    tracesRes,
    gatewayRes,
    prismRes,
    sweptRes,
  ] = await Promise.all([
    supabase.schema("linkaios").from("agents").select("*").order("created_at", { ascending: false }).limit(20),
    supabase.schema("linkaios").from("missions").select("*").order("updated_at", { ascending: false }).limit(20),
    supabase.schema("linkaios").from("skills").select("*").order("updated_at", { ascending: false }).limit(20),
    supabase
      .schema("bot_runtime")
      .from("worker_sessions")
      .select("id", { count: "exact", head: true })
      .eq("status", "running"),
    supabase
      .schema("linkaios")
      .from("traces")
      .select("id", { count: "exact", head: true })
      .gte("created_at", since),
    supabase
      .schema("gateway")
      .from("zulip_message_links")
      .select("id", { count: "exact", head: true }),
    supabase
      .schema("prism")
      .from("cleanup_events")
      .select("id", { count: "exact", head: true })
      .gte("created_at", since),
    supabase.schema("prism").from("swept_sessions").select("worker_session_id", { count: "exact", head: true }),
  ]);

  const setupError =
    agentsRes.error ||
    missionsRes.error ||
    skillsRes.error ||
    workersRes.error ||
    tracesRes.error ||
    gatewayRes.error ||
    prismRes.error ||
    sweptRes.error;
  const schemaHint =
    setupError?.code === "PGRST106" || setupError?.message?.includes("schema");

  const runningCount = workersRes.count ?? 0;

  return (
    <main>
      <BrandHeading>LiNKaios</BrandHeading>
      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-zinc-600">
        Command centre — signed-in operators read through Row Level Security (migration{" "}
        <code className="text-xs">008_rls_and_prism_swept.sql</code>). Use the nav for full lists and
        drill-down.
      </p>

      {setupError ? (
        <section className="mt-8 max-w-2xl rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
          <p className="font-medium">Database not ready for this view yet</p>
          <p className="mt-2 text-amber-900/90">
            {schemaHint ? (
              <>
                PostgREST does not see the <code>linkaios</code> schema yet. In Supabase:{" "}
                <strong>Project Settings → Data API / API → Exposed schemas</strong>, add{" "}
                <code>linkaios</code>, <code>bot_runtime</code>, <code>prism</code>,{" "}
                <code>gateway</code>, then save. If tables are missing, run migrations (including{" "}
                <code>008</code>) or <code>services/migrations/ALL_IN_ONE.sql</code> in the SQL Editor.
              </>
            ) : (
              <>{setupError.message}</>
            )}
          </p>
          {setupError.code ? (
            <p className="mt-2 font-mono text-xs text-amber-900/80">Code: {setupError.code}</p>
          ) : null}
        </section>
      ) : null}

      {!setupError ? (
        <>
          <section className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Running worker sessions" value={String(runningCount)} href="/workers" />
            <StatCard label="Traces (24h)" value={String(tracesRes.count ?? 0)} href="/traces" />
            <StatCard label="Zulip links (total)" value={String(gatewayRes.count ?? 0)} href="/gateway" />
            <StatCard label="PRISM events (24h)" value={String(prismRes.count ?? 0)} href="/traces" />
            <StatCard
              label="PRISM residue rows (swept_sessions)"
              value={String(sweptRes.count ?? 0)}
              href="/workers"
            />
          </section>

          <div className="mt-12 grid gap-10 lg:grid-cols-3">
            <EntityTable
              title="Agents"
              rows={agentsRes.data ?? []}
              columns={["display_name", "status", "created_at"]}
            />
            <EntityTable
              title="Missions"
              rows={missionsRes.data ?? []}
              columns={["title", "status", "created_at"]}
            />
            <EntityTable
              title="Skills"
              rows={skillsRes.data ?? []}
              columns={["name", "version", "status"]}
            />
          </div>
          <p className="mt-8 text-sm text-zinc-600">
            Open <Link href="/missions">missions</Link>, <Link href="/skills">skills</Link>, or{" "}
            <Link href="/memory">memory</Link> for dedicated views.
          </p>
        </>
      ) : null}
    </main>
  );
}

function StatCard(props: { label: string; value: string; href: string }) {
  return (
    <Link
      href={props.href}
      className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm transition hover:border-zinc-300"
    >
      <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">{props.label}</p>
      <p className="mt-2 text-2xl font-semibold text-zinc-900">{props.value}</p>
    </Link>
  );
}
