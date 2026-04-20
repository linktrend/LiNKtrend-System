import Link from "next/link";

import { isCommandCentreAdmin } from "@/lib/command-centre-access";
import { createSupabaseServerClient } from "@/lib/supabase/server";

import {
  addMissionlessDefaultTool,
  addOrgAllowlistTool,
  archiveCatalogTool,
  deleteDraftCatalogTool,
  removeMissionlessDefaultTool,
  removeOrgAllowlistTool,
} from "./org-tools-actions";

export const dynamic = "force-dynamic";

type ToolRow = { id: string; name: string; status: string; tool_type: string };

export default async function SettingsToolsPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isAdmin =
    user?.id != null ? await isCommandCentreAdmin(supabase, { userId: user.id, email: user.email }) : false;

  const { data: tools } = await supabase.schema("linkaios").from("tools").select("id, name, status, tool_type").order("name");

  const { data: orgRows } = await supabase.schema("linkaios").from("org_tool_allowlist").select("tool_id");
  const orgSet = new Set((orgRows ?? []).map((r: { tool_id: string }) => r.tool_id));

  const { data: mlRows } = await supabase.schema("linkaios").from("org_missionless_default_tools").select("tool_id");
  const mlSet = new Set((mlRows ?? []).map((r: { tool_id: string }) => r.tool_id));

  const { data: pendingOrg } = await supabase
    .schema("linkaios")
    .from("tool_governance_requests")
    .select("id, request_type, tool_id, status")
    .is("mission_id", null)
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  return (
    <main className="space-y-8">
      <header>
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Tool permissions</h2>
        <p className="mt-2 max-w-2xl text-sm text-zinc-600 dark:text-zinc-400">
          Control which tools are allowed for the organization, which defaults apply when no project is selected, and how
          project-level requests flow. Only <strong>admins</strong> can change org-wide policy.
        </p>
        {!isAdmin ? (
          <p className="mt-3 text-sm text-amber-800">
            Signed in as non-admin — org allowlist controls are read-only. Request an admin role in{" "}
            <Link href="/settings/access" className="underline">
              Access
            </Link>
            .
          </p>
        ) : null}
      </header>

      <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Catalog</h3>
        <ul className="mt-4 divide-y divide-zinc-100 rounded-lg border border-zinc-100">
          {(tools ?? []).map((t: ToolRow) => (
            <li key={t.id} className="flex flex-wrap items-center justify-between gap-2 px-3 py-2.5 text-sm">
              <div>
                <span className="font-medium text-zinc-900">{t.name}</span>
                <span className="ml-2 text-xs text-zinc-500">
                  {t.status} · {t.tool_type}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {orgSet.has(t.id) ? (
                  <form action={removeOrgAllowlistTool.bind(null, t.id)}>
                    <button
                      type="submit"
                      disabled={!isAdmin}
                      className="rounded border border-zinc-300 px-2 py-1 text-xs disabled:opacity-40"
                    >
                      Remove from org allowlist
                    </button>
                  </form>
                ) : (
                  <form action={addOrgAllowlistTool.bind(null, t.id)}>
                    <button
                      type="submit"
                      disabled={!isAdmin || t.status === "archived"}
                      className="rounded bg-zinc-900 px-2 py-1 text-xs text-white disabled:opacity-40"
                    >
                      Allow at org
                    </button>
                  </form>
                )}
                {mlSet.has(t.id) ? (
                  <form action={removeMissionlessDefaultTool.bind(null, t.id)}>
                    <button type="submit" disabled={!isAdmin} className="rounded border px-2 py-1 text-xs disabled:opacity-40">
                      Remove project-agnostic default
                    </button>
                  </form>
                ) : (
                  <form action={addMissionlessDefaultTool.bind(null, t.id)}>
                    <button
                      type="submit"
                      disabled={!isAdmin || !orgSet.has(t.id)}
                      className="rounded border border-emerald-200 px-2 py-1 text-xs text-emerald-900 disabled:opacity-40"
                    >
                      Default without project
                    </button>
                  </form>
                )}
                {t.status !== "archived" && t.status === "approved" ? (
                  <form action={archiveCatalogTool.bind(null, t.id)}>
                    <button type="submit" disabled={!isAdmin} className="rounded border px-2 py-1 text-xs disabled:opacity-40">
                      Archive
                    </button>
                  </form>
                ) : null}
                {t.status === "draft" ? (
                  <form action={deleteDraftCatalogTool.bind(null, t.id)}>
                    <button type="submit" disabled={!isAdmin} className="rounded border border-red-200 px-2 py-1 text-xs text-red-800 disabled:opacity-40">
                      Delete draft
                    </button>
                  </form>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Org-wide pending (no mission)</h3>
        <p className="mt-1 text-xs text-zinc-600">Runtime-block approvals that target org allowlist appear here when created.</p>
        <ul className="mt-3 text-sm text-zinc-700">
          {(pendingOrg ?? []).length === 0 ? (
            <li className="text-zinc-500">None.</li>
          ) : (
            (pendingOrg ?? []).map((p: { id: string; request_type: string }) => (
              <li key={p.id} className="font-mono text-xs">
                {p.id} · {p.request_type}
              </li>
            ))
          )}
        </ul>
        <p className="mt-4 text-xs text-zinc-500">
          Approve org-level requests from the database RPC or extend this page with the same buttons as mission Tools.
        </p>
      </section>
    </main>
  );
}
