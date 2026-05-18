import { isCommandCentreAdmin } from "@/lib/command-centre-access";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { BUTTON } from "@/lib/ui-standards";

import {
  approveToolGovernanceRequest,
  rejectToolGovernanceRequest,
  requestMissionToolAdd,
  requestMissionToolRemove,
  submitMissionProjectHeadForm,
} from "./mission-tools-actions";

type ToolRow = { id: string; name: string; status: string };
type PendingRow = {
  id: string;
  request_type: string;
  tool_id: string;
  org_admin_approved_by: string | null;
  project_head_approved_by: string | null;
};

export async function MissionToolsSection(props: {
  missionId: string;
  highlightRequestId?: string | null;
  canWrite: boolean;
}) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAdmin = user?.id != null ? await isCommandCentreAdmin(supabase, { userId: user.id, email: user.email }) : false;

  const { data: mission } = await supabase
    .schema("linkaios")
    .from("missions")
    .select("project_head_user_id")
    .eq("id", props.missionId)
    .maybeSingle();

  const isProjectHead = Boolean(user?.id && mission?.project_head_user_id === user.id);

  const { data: mtRows, error: bErr } = await supabase
    .schema("linkaios")
    .from("mission_tools")
    .select("tool_id")
    .eq("mission_id", props.missionId);

  const mtIds = (mtRows ?? []).map((r: { tool_id: string }) => r.tool_id).filter(Boolean);
  const { data: boundTools } =
    mtIds.length > 0
      ? await supabase.schema("linkaios").from("tools").select("id, name, status").in("id", mtIds)
      : { data: [] as ToolRow[] };
  const bound = (boundTools ?? []) as ToolRow[];

  const { data: pendingRaw, error: pErr } = await supabase
    .schema("linkaios")
    .from("tool_governance_requests")
    .select("id, request_type, tool_id, org_admin_approved_by, project_head_approved_by")
    .eq("mission_id", props.missionId)
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  const pending = (pendingRaw ?? []) as PendingRow[];
  const pendingToolIds = [...new Set(pending.map((p) => p.tool_id))];
  const { data: pendingTools } =
    pendingToolIds.length > 0
      ? await supabase.schema("linkaios").from("tools").select("id, name").in("id", pendingToolIds)
      : { data: [] as { id: string; name: string }[] };
  const pendingNameById = new Map((pendingTools ?? []).map((t) => [t.id, t.name]));

  const { data: orgRows } = await supabase.schema("linkaios").from("org_tool_allowlist").select("tool_id");
  const orgIds = new Set((orgRows ?? []).map((r: { tool_id: string }) => r.tool_id));
  const boundIds = new Set(bound.map((t) => t.id));

  const { data: catalog } = await supabase
    .schema("linkaios")
    .from("tools")
    .select("id, name, status")
    .eq("status", "approved")
    .order("name");

  const picker: ToolRow[] = (catalog ?? []).filter(
    (t: ToolRow) => orgIds.has(t.id) && !boundIds.has(t.id) && t.status !== "archived",
  );

  return (
    <div className="space-y-8">
      {isAdmin ? (
        <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Project lead</h2>
          <p className="mt-1 max-w-2xl text-xs text-zinc-600 sm:text-sm">
            Some tool changes need sign-off from this lead as well as an organization admin.
          </p>
          <form action={submitMissionProjectHeadForm} className="mt-4 flex max-w-xl flex-wrap items-end gap-2">
            <input type="hidden" name="missionId" value={props.missionId} />
            <label className="block min-w-[16rem] flex-1 text-xs text-zinc-700">
              Lead sign-in id
              <input
                name="projectHeadUserId"
                type="text"
                defaultValue={mission?.project_head_user_id ?? ""}
                placeholder="User id"
                className="mt-1 w-full rounded-md border border-zinc-300 px-2 py-1.5 text-xs"
              />
            </label>
            <button
              type="submit"
              className="rounded-md bg-zinc-900 px-3 py-2 text-xs font-medium text-white hover:bg-zinc-800"
            >
              Save
            </button>
          </form>
        </section>
      ) : null}

      <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Allowed tools</h2>
        <p className="mt-1 max-w-2xl text-xs text-zinc-600 sm:text-sm">Tools this project may use after approvals complete.</p>
        {bErr ? (
          <p className="mt-3 text-sm text-amber-800 dark:text-amber-200">Allowed tools could not be loaded.</p>
        ) : null}
        <ul className="mt-4 divide-y divide-zinc-100 rounded-lg border border-zinc-100">
          {bound.length === 0 ? (
            <li className="px-3 py-3 text-sm text-zinc-500">No tools bound yet.</li>
          ) : (
            bound.map((t) => (
              <li key={t.id} className="flex flex-wrap items-center justify-between gap-2 px-3 py-2.5 text-sm">
                <span className="font-medium text-zinc-900">{t.name}</span>
                <form action={requestMissionToolRemove.bind(null, props.missionId, t.id)}>
                  <button
                    type="submit"
                    className="rounded-md border border-zinc-300 px-2 py-1 text-xs font-medium text-zinc-800 hover:bg-zinc-50 disabled:opacity-50"
                    disabled={!props.canWrite}
                  >
                    Request remove
                  </button>
                </form>
              </li>
            ))
          )}
        </ul>
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Add tool</h2>
        <p className="mt-1 text-xs text-zinc-600 sm:text-sm">Pick from organization-allowed catalog tools not yet on this project.</p>
        {picker.length === 0 ? (
          <p className="mt-3 text-sm text-zinc-500">No eligible tools to add.</p>
        ) : (
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {picker.map((t) => (
              <li key={t.id} className="flex items-center justify-between gap-2 rounded-lg border border-zinc-100 px-3 py-2">
                <span className="text-sm text-zinc-800">{t.name}</span>
                <form action={requestMissionToolAdd.bind(null, props.missionId, t.id)}>
                  <button
                    type="submit"
                    className="rounded-md bg-zinc-900 px-2 py-1 text-xs font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
                    disabled={!props.canWrite}
                  >
                    Request add
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Pending approvals</h2>
        {pErr ? (
          <p className="mt-3 text-sm text-amber-800 dark:text-amber-200">Pending approvals could not be loaded.</p>
        ) : null}
        <ul className="mt-4 space-y-3">
          {pending.length === 0 ? (
            <li className="text-sm text-zinc-500">No pending requests.</li>
          ) : (
            pending.map((r) => {
              const hl = props.highlightRequestId === r.id;
              const tname = pendingNameById.get(r.tool_id) ?? r.tool_id;
              return (
                <li
                  key={r.id}
                  id={hl ? `request-${r.id}` : undefined}
                  className={
                    "rounded-lg border px-3 py-3 text-sm " +
                    (hl ? "border-amber-300 bg-amber-50" : "border-zinc-100 bg-zinc-50")
                  }
                >
                  <div className="font-medium text-zinc-900">
                    {tname} <span className="font-normal text-zinc-500">· {r.request_type.replace(/_/g, " ")}</span>
                  </div>
                  <p className="mt-1 text-xs text-zinc-500">
                    Org admin: {r.org_admin_approved_by ? "done" : "pending"} · Project head:{" "}
                    {r.project_head_approved_by ? "done" : "pending"}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <form action={approveToolGovernanceRequest.bind(null, r.id)}>
                      <button type="submit" className={BUTTON.approveCompact} disabled={!isAdmin && !isProjectHead}>
                        Approve step
                      </button>
                    </form>
                    <form action={rejectToolGovernanceRequest.bind(null, r.id, "rejected from UI")}>
                      <button type="submit" className={BUTTON.rejectCompact} disabled={!isAdmin && !isProjectHead}>
                        Reject
                      </button>
                    </form>
                  </div>
                </li>
              );
            })
          )}
        </ul>
      </section>
    </div>
  );
}
