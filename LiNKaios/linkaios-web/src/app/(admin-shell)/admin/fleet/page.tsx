import { ShellPageHeader } from "@/components/shell-page-header";
import { StatusPill } from "@/components/ui/status-pill";
import {
  ADMIN_CEO_OPENCLAW_BINDING,
  buildFleetDashboardRows,
  FLEET_V1_RAM_NOTE,
} from "@/lib/admin/fleet-dashboard";

export default function AdminFleetPage() {
  const rows = buildFleetDashboardRows();

  return (
    <div className="space-y-6">
      <ShellPageHeader
        title="Fleet"
        subtitle="OpenClaw profiles, Agent Zero lanes, and runtime health (fleet v1)."
      />
      <div className="rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-950 dark:border-sky-900/50 dark:bg-sky-950/30 dark:text-sky-50">
        <p className="font-semibold">Admin CEO binding</p>
        <p className="mt-1">
          Vendor operator → <code>{ADMIN_CEO_OPENCLAW_BINDING.openclawAgentId}</code> · Zulip{" "}
          {ADMIN_CEO_OPENCLAW_BINDING.zulipStream} ·{" "}
          <a href={ADMIN_CEO_OPENCLAW_BINDING.inboxPath} className="underline">
            Inbox
          </a>
        </p>
      </div>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">{FLEET_V1_RAM_NOTE}</p>
      <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
            <tr>
              <th className="px-4 py-2 font-medium">Runtime id</th>
              <th className="px-4 py-2 font-medium">Kind</th>
              <th className="px-4 py-2 font-medium">Tenant</th>
              <th className="px-4 py-2 font-medium">Suite</th>
              <th className="px-4 py-2 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-zinc-100 dark:border-zinc-800">
                <td className="px-4 py-2 font-mono text-xs">{row.id}</td>
                <td className="px-4 py-2">{row.kind}</td>
                <td className="px-4 py-2">{row.tenant}</td>
                <td className="px-4 py-2">{row.suite ?? "—"}</td>
                <td className="px-4 py-2">
                  <StatusPill label={row.status} tone="neutral" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
