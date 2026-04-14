import { BrandHeading } from "@linktrend/ui";

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
    <main className="min-h-screen bg-zinc-50 text-zinc-900 p-10">
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

function EntityTable(props: {
  title: string;
  rows: Record<string, unknown>[];
  columns: string[];
}) {
  return (
    <section>
      <h2 className="text-lg font-medium text-zinc-800">{props.title}</h2>
      <p className="text-xs text-zinc-500">{props.rows.length} row(s)</p>
      <div className="mt-2 overflow-x-auto rounded-md border border-zinc-200 bg-white">
        <table className="w-full min-w-[240px] text-left text-xs">
          <thead className="border-b border-zinc-200 bg-zinc-100 text-zinc-600">
            <tr>
              {props.columns.map((c) => (
                <th key={c} className="px-2 py-2 font-medium">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {props.rows.length === 0 ? (
              <tr>
                <td className="px-2 py-3 text-zinc-500" colSpan={props.columns.length}>
                  No rows yet.
                </td>
              </tr>
            ) : (
              props.rows.map((row, i) => (
                <tr key={i} className="border-b border-zinc-100 last:border-0">
                  {props.columns.map((c) => (
                    <td key={c} className="px-2 py-2 text-zinc-800">
                      {formatCell(row[c])}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function formatCell(value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (typeof value === "string") return value;
  return JSON.stringify(value);
}
