import Link from "next/link";

import { EntityTable } from "@/components/entity-table";
import { createSupabaseServerClient } from "@/lib/supabase/server";
export const dynamic = "force-dynamic";

const ADVANCED_LINKS: { href: string; title: string; description: string }[] = [
  {
    href: "/settings/tools",
    title: "Tool permissions",
    description: "Organisation-scoped defaults for which tools LiNKbots may call.",
  },
  {
    href: "/settings/traces",
    title: "System logs",
    description: "Trace runs, payloads, and diagnostics for operators.",
  },
  {
    href: "/settings/prism",
    title: "Data cleanup",
    description: "Automated cleanup worker health and recent activity.",
  },
];

export default async function SettingsAdvancedPage() {
  const supabase = await createSupabaseServerClient();
  const [sessionsRes, agentsRes] = await Promise.all([
    supabase
      .schema("bot_runtime")
      .from("worker_sessions")
      .select("*")
      .order("started_at", { ascending: false })
      .limit(120),
    supabase.schema("linkaios").from("agents").select("id, display_name"),
  ]);

  const err = sessionsRes.error || agentsRes.error;
  const agentName = new Map<string, string>();
  for (const a of agentsRes.data ?? []) {
    if (a.id) agentName.set(String(a.id), typeof a.display_name === "string" ? a.display_name : "LiNKbot");
  }

  const sessionRows =
    sessionsRes.data?.map((s) => ({
      ...s,
      agent_display: agentName.get(String(s.agent_id)) ?? s.agent_id,
    })) ?? [];

  return (
    <div className="space-y-10">
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Advanced</h2>
        <p className="max-w-2xl text-sm text-zinc-600 dark:text-zinc-400">
          Power-operator areas: tool policy, trace diagnostics, cleanup telemetry, and raw runtime session rows.
        </p>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {ADVANCED_LINKS.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="flex h-full flex-col rounded-xl border border-zinc-200 bg-zinc-50/80 p-4 shadow-sm transition hover:border-zinc-300 hover:bg-white dark:border-zinc-800 dark:bg-zinc-900/40 dark:hover:border-zinc-700 dark:hover:bg-zinc-950"
              >
                <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{item.title}</span>
                <span className="mt-2 flex-1 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
                  {item.description}
                </span>
                <span className="mt-4 self-start text-sm font-semibold text-sky-700 dark:text-sky-400">Open →</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section id="runtime-sessions" className="scroll-mt-8 space-y-4">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Runtime sessions (raw)</h2>
        <p className="max-w-2xl text-sm text-zinc-600 dark:text-zinc-400">
          Raw <code className="rounded bg-zinc-100 px-1 text-xs dark:bg-zinc-800">bot_runtime.worker_sessions</code>{" "}
          stream. For day-to-day review, use{" "}
          <Link href="/work/sessions" className="font-medium text-sky-700 underline dark:text-sky-400">
            Work → Sessions
          </Link>
          .
        </p>
        {err ? (
          <p className="text-sm text-red-600 dark:text-red-400">{err.message}</p>
        ) : (
          <EntityTable
            title="Worker sessions (raw)"
            rows={sessionRows}
            columns={["agent_display", "status", "last_heartbeat", "started_at", "id"]}
          />
        )}
      </section>
    </div>
  );
}
