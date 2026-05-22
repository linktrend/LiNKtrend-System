import Link from "next/link";
import {
  Activity,
  FlaskConical,
  Route,
  ScrollText,
  Trash2,
  Wrench,
  type LucideIcon,
} from "lucide-react";

import {
  DataTable,
  DataTableBody,
  DataTableEmptyRow,
  DataTableHead,
  DataTableRow,
  DataTableShell,
  DT,
} from "@/components/data-table";
import { SettingCard, VendorOnlyBadge } from "@/components/settings/setting-card";
import { TitledCardHeader } from "@/components/titled-card-header";
import { isBootstrapAdminEmail, isCommandCentreAdmin } from "@/lib/command-centre-access";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { formatUiLabel } from "@/lib/ui-standards";

const PLATFORM_AREAS: {
  href: string;
  title: string;
  description: string;
  actionLabel: string;
  icon: LucideIcon;
  vendorOnly?: boolean;
  summary?: string;
}[] = [
  {
    href: "/settings/gateway",
    title: "Integration Routing",
    description: "Channel and gateway routing configuration for inbound and outbound capabilities.",
    actionLabel: "Manage routing",
    icon: Route,
    vendorOnly: true,
    summary: "Inbound/outbound capability paths",
  },
  {
    href: "/settings/tools",
    title: "Tool Permissions",
    description: "Organisation-scoped defaults for which tools LiNKbots may call.",
    actionLabel: "Manage tool permissions",
    icon: Wrench,
    summary: "Org allowlist and project-agnostic defaults",
  },
  {
    href: "/settings/traces",
    title: "System Logs",
    description: "Trace runs, payloads, and diagnostics for operators.",
    actionLabel: "View system logs",
    icon: ScrollText,
    summary: "Project and automation trace stream",
  },
  {
    href: "/settings/prism",
    title: "Data Cleanup",
    description: "Automated cleanup worker health and recent activity.",
    actionLabel: "Manage data cleanup",
    icon: Trash2,
    summary: "LiNKguard sidecar and cleanup events",
  },
  {
    href: "/devtools/mvo-proof",
    title: "MVO Proof Surfaces",
    description: "Deterministic WebsiteFactory, LEXOS, and LiNKapps proof snapshots for UI testing.",
    actionLabel: "View proof surfaces",
    icon: FlaskConical,
    summary: "Fixture-only demo snapshots",
  },
];

function formatTimestamp(value: unknown): string {
  if (typeof value !== "string" || !value) return "—";
  return value.replace("T", " ").slice(0, 19);
}

export async function SettingsPlatformPanel() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAdmin =
    user?.id != null ? await isCommandCentreAdmin(supabase, { userId: user.id, email: user.email }) : false;
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
      id: String(s.id ?? ""),
      agentDisplay: agentName.get(String(s.agent_id)) ?? String(s.agent_id ?? "—"),
      status: String(s.status ?? "—"),
      lastHeartbeat: formatTimestamp(s.last_heartbeat),
      startedAt: formatTimestamp(s.started_at),
    })) ?? [];

  const activeSessions = sessionRows.filter((row) => row.status === "active" || row.status === "running").length;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {PLATFORM_AREAS.map((item) => {
          const locked = item.vendorOnly === true && !canOpenVendorRouting;
          return (
            <SettingCard
              key={item.href}
              icon={item.icon}
              title={item.title}
              description={item.description}
              actionLabel={item.actionLabel}
              href={locked ? undefined : item.href}
              locked={locked}
              lockedHint="Linktrend vendor operators or workspace Admins can open this area."
              titleAction={item.vendorOnly ? <VendorOnlyBadge /> : undefined}
            >
              {item.summary ? <p className="text-sm text-zinc-600 dark:text-zinc-400">{item.summary}</p> : null}
            </SettingCard>
          );
        })}
      </div>

      <section id="runtime-sessions" className="scroll-mt-8 space-y-4">
        <TitledCardHeader
          icon={Activity}
          title="Runtime sessions"
          description={
            <>
              Raw <code className="rounded bg-zinc-100 px-1 text-xs dark:bg-zinc-800">bot_runtime.worker_sessions</code>{" "}
              stream — {sessionRows.length} recent row{sessionRows.length === 1 ? "" : "s"}
              {activeSessions > 0 ? `, ${activeSessions} active` : ""}. For day-to-day review, use{" "}
              <Link href="/work/sessions" className="font-medium text-sky-700 underline dark:text-sky-400">
                Work → Sessions
              </Link>
              .
            </>
          }
        />

        {err ? (
          <p className="text-sm text-red-600 dark:text-red-400">{err.message}</p>
        ) : (
          <DataTableShell scrollableBody>
            <DataTable>
              <colgroup>
                <col className="w-[20%]" />
                <col className="w-[14%]" />
                <col className="w-[18%]" />
                <col className="w-[18%]" />
                <col className="w-[30%]" />
              </colgroup>
              <DataTableHead>
                <tr>
                  <th className={DT.thTextInset}>{formatUiLabel("LiNKbot")}</th>
                  <th className={DT.thTextInset}>{formatUiLabel("Status")}</th>
                  <th className={DT.thTextInset}>{formatUiLabel("Last heartbeat")}</th>
                  <th className={DT.thTextInset}>{formatUiLabel("Started")}</th>
                  <th className={DT.thTextInset}>{formatUiLabel("Session ID")}</th>
                </tr>
              </DataTableHead>
              <DataTableBody>
                {sessionRows.length === 0 ? (
                  <DataTableEmptyRow colSpan={5}>No worker sessions yet.</DataTableEmptyRow>
                ) : (
                  sessionRows.map((row) => (
                    <DataTableRow key={row.id} multiline>
                      <td className={`${DT.tdClipInset} font-medium text-zinc-900 dark:text-zinc-100`}>
                        <span className={DT.tdTextSpan}>{row.agentDisplay}</span>
                      </td>
                      <td className={DT.tdClipInset}>
                        <span className={`${DT.tdTextSpan} capitalize`}>{row.status}</span>
                      </td>
                      <td className={`${DT.tdClipInset} font-mono text-xs`}>
                        <span className={DT.tdTextSpan}>{row.lastHeartbeat}</span>
                      </td>
                      <td className={`${DT.tdClipInset} font-mono text-xs`}>
                        <span className={DT.tdTextSpan}>{row.startedAt}</span>
                      </td>
                      <td className={`${DT.tdClipInset} font-mono text-xs`}>
                        <span className={DT.tdWrapSpan}>{row.id}</span>
                      </td>
                    </DataTableRow>
                  ))
                )}
              </DataTableBody>
            </DataTable>
          </DataTableShell>
        )}
      </section>
    </div>
  );
}
