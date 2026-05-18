import { CheckCircle2, Layers, XCircle, AlertTriangle } from "lucide-react";

import { loadModuleStatus } from "@/lib/cockpit";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { EntityTable } from "@/components/entity-table";

export const dynamic = "force-dynamic";

export default async function ModulesPage() {
  const supabase = await createSupabaseServerClient();
  const tenantId = "default";

  const modules = await loadModuleStatus(supabase, tenantId);

  const rows = modules.map((m) => ({
    name: m.module_name,
    kind: m.plugin_kind,
    enabled: m.is_enabled ? "Yes" : "No",
    capabilities: `${m.configured_capabilities.length}/${m.configured_capabilities.length + m.missing_capabilities.length}`,
    health: m.health,
    last_check: m.last_check_at ? new Date(m.last_check_at).toLocaleString() : "—",
  }));

  return (
    <main>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">Module Status</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Tenant-enabled modules and their capability configuration
        </p>
      </div>

      {/* Summary cards */}
      <div className="mb-6 grid gap-4 sm:grid-cols-4">
        <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
            <Layers className="h-4 w-4" />
            Total
          </div>
          <p className="mt-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-100">{modules.length}</p>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
            <CheckCircle2 className="h-4 w-4" />
            Enabled
          </div>
          <p className="mt-2 text-2xl font-semibold text-emerald-600 dark:text-emerald-400">
            {modules.filter((m) => m.is_enabled).length}
          </p>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
            <XCircle className="h-4 w-4" />
            Disabled
          </div>
          <p className="mt-2 text-2xl font-semibold text-zinc-600 dark:text-zinc-400">
            {modules.filter((m) => !m.is_enabled).length}
          </p>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
            <AlertTriangle className="h-4 w-4" />
            Issues
          </div>
          <p className="mt-2 text-2xl font-semibold text-amber-600 dark:text-amber-400">
            {modules.filter((m) => m.health !== "healthy" || m.missing_capabilities.length > 0).length}
          </p>
        </div>
      </div>

      <EntityTable
        title="Modules"
        rows={rows as Record<string, unknown>[]}
        columns={["name", "kind", "enabled", "capabilities", "health", "last_check"]}
        columnHeaders={["Name", "Kind", "Enabled", "Capabilities", "Health", "Last Check"]}
      />
    </main>
  );
}
