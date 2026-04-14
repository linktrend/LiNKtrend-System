import { BrandHeading } from "@linktrend/ui";

import { EntityTable } from "@/components/entity-table";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

export default async function Home() {
  const supabase = getSupabaseAdmin();

  const [agentsRes, missionsRes, skillsRes] = await Promise.all([
    supabase.schema("linkaios").from("agents").select("*").order("created_at", { ascending: false }).limit(50),
    supabase.schema("linkaios").from("missions").select("*").order("created_at", { ascending: false }).limit(50),
    supabase.schema("linkaios").from("skills").select("*").order("updated_at", { ascending: false }).limit(50),
  ]);

  const setupError = agentsRes.error || missionsRes.error || skillsRes.error;
  const schemaHint =
    setupError?.code === "PGRST106" || setupError?.message?.includes("schema");

  return (
    <main>
      <BrandHeading>LiNKaios</BrandHeading>
      <p className="mt-4 max-w-xl text-sm leading-relaxed text-zinc-600">
        Command centre — live read from Supabase <code className="text-xs">linkaios</code> schema
        (agents, missions, skills).
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
                <code>gateway</code>, then save. If tables are missing, run{" "}
                <code>services/migrations/ALL_IN_ONE.sql</code> in the SQL Editor first.
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
        <div className="mt-10 grid gap-10 lg:grid-cols-3">
          <EntityTable title="Agents" rows={agentsRes.data ?? []} columns={["display_name", "status", "created_at"]} />
          <EntityTable title="Missions" rows={missionsRes.data ?? []} columns={["title", "status", "created_at"]} />
          <EntityTable title="Skills" rows={skillsRes.data ?? []} columns={["name", "version", "status"]} />
        </div>
      ) : null}
    </main>
  );
}
