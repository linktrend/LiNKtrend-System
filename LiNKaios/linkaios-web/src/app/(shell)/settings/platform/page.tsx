import Link from "next/link";

import { EntityTable } from "@/components/entity-table";
import {
  isBootstrapAdminEmail,
  isCommandCentreAdmin,
} from "@/lib/command-centre-access";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const VENDOR_ONLY_BADGE =
  "inline-flex items-center rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-100";

const PLATFORM_LINKS: {
  href: string;
  title: string;
  description: string;
  vendorOnly?: boolean;
}[] = [
  {
    href: "/settings/gateway",
    title: "Integration routing",
    description: "Channel and gateway routing configuration for inbound/outbound connectors.",
    vendorOnly: true,
  },
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
  {
    href: "/devtools/mvo-proof",
    title: "MVO proof surfaces",
    description: "Deterministic WebsiteFactory, LEXOS, and LiNKapps proof snapshots for UI/UX testing.",
  },
];

export default async function SettingsPlatformPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAdmin =
    user?.id != null
      ? await isCommandCentreAdmin(supabase, { userId: user.id, email: user.email })
      : false;
  const isVendor = isBootstrapAdminEmail(user?.email);
  const canOpenVendorRouting = isAdmin || isVendor;

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
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Platform</h2>
        <p className="max-w-2xl text-sm text-zinc-600 dark:text-zinc-400">
          Power-operator areas: integration routing, tool policy, trace diagnostics, cleanup telemetry, and raw
          runtime session rows.
        </p>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {PLATFORM_LINKS.map((item) => {
            const showVendorBadge = item.vendorOnly === true && !canOpenVendorRouting;
            const card = (
              <div
                className={`flex h-full flex-col rounded-xl border border-zinc-200 bg-zinc-50/80 p-4 shadow-sm transition dark:border-zinc-800 dark:bg-zinc-900/40 ${
                  showVendorBadge
                    ? "opacity-90"
                    : "hover:border-zinc-300 hover:bg-white dark:hover:border-zinc-700 dark:hover:bg-zinc-950"
                }`}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{item.title}</span>
                  {showVendorBadge ? <span className={VENDOR_ONLY_BADGE}>Vendor only</span> : null}
                </div>
                <span className="mt-2 flex-1 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
                  {item.description}
                </span>
                {showVendorBadge ? (
                  <span className="mt-4 self-start text-xs text-zinc-500 dark:text-zinc-400">
                    Linktrend vendor operators or Admins can open this area.
                  </span>
                ) : (
                  <span className="mt-4 self-start text-sm font-semibold text-sky-700 dark:text-sky-400">Open →</span>
                )}
              </div>
            );

            return (
              <li key={item.href}>
                {showVendorBadge ? (
                  card
                ) : (
                  <Link href={item.href} className="block h-full">
                    {card}
                  </Link>
                )}
              </li>
            );
          })}
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
