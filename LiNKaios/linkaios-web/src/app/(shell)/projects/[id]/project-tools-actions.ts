"use server";

import { revalidatePath } from "next/cache";

import { canWriteCommandCentre, getCommandCentreRoleForUser, isCommandCentreAdmin } from "@/lib/command-centre-access";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

async function gateWriter(): Promise<
  | { supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>; ok: false; error: string }
  | {
      supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>;
      ok: true;
      userId: string;
      role: Awaited<ReturnType<typeof getCommandCentreRoleForUser>>;
    }
> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.id) return { supabase, ok: false, error: "Not signed in." };
  const role = await getCommandCentreRoleForUser(supabase, { userId: user.id, email: user.email });
  if (!canWriteCommandCentre(role)) {
    return { supabase, ok: false, error: "Read-only: command centre writes are not allowed for your role." };
  }
  return { supabase, ok: true, userId: user.id, role };
}

export async function requestProjectToolAdd(projectId: string, toolId: string): Promise<void> {
  if (!UUID_RE.test(projectId) || !UUID_RE.test(toolId)) return;
  const g = await gateWriter();
  if (!g.ok) return;
  const { data: tool, error: tErr } = await g.supabase.schema("linkaios").from("tools").select("id, name").eq("id", toolId).maybeSingle();
  if (tErr || !tool) return;

  const { error: insErr } = await g.supabase.schema("linkaios").from("tool_governance_requests").insert({
    status: "pending",
    request_type: "mission_binding_add",
    mission_id: projectId,
    tool_id: toolId,
    requested_by: g.userId,
  });
  if (insErr) return;

  await g.supabase.schema("linkaios").from("traces").insert({
    mission_id: projectId,
    event_type: "tool.request.created",
    payload: {
      event_type: "tool.request.created",
      tool_name: tool.name,
      tool_id: toolId,
      mission_id: projectId,
      request_type: "mission_binding_add",
      actor_user_id: g.userId,
    },
  });

  revalidatePath(`/projects/${projectId}`);
}

export async function requestProjectToolRemove(projectId: string, toolId: string): Promise<void> {
  if (!UUID_RE.test(projectId) || !UUID_RE.test(toolId)) return;
  const g = await gateWriter();
  if (!g.ok) return;
  const { data: tool, error: tErr } = await g.supabase.schema("linkaios").from("tools").select("id, name").eq("id", toolId).maybeSingle();
  if (tErr || !tool) return;

  const { error: insErr } = await g.supabase.schema("linkaios").from("tool_governance_requests").insert({
    status: "pending",
    request_type: "mission_binding_remove",
    mission_id: projectId,
    tool_id: toolId,
    requested_by: g.userId,
  });
  if (insErr) return;

  await g.supabase.schema("linkaios").from("traces").insert({
    mission_id: projectId,
    event_type: "tool.request.created",
    payload: {
      event_type: "tool.request.created",
      tool_name: tool.name,
      tool_id: toolId,
      mission_id: projectId,
      request_type: "mission_binding_remove",
      actor_user_id: g.userId,
    },
  });

  revalidatePath(`/projects/${projectId}`);
}

export async function approveToolGovernanceRequest(requestId: string): Promise<void> {
  if (!UUID_RE.test(requestId)) return;
  const g = await gateWriter();
  if (!g.ok) return;

  const { data: reqRow } = await g.supabase
    .schema("linkaios")
    .from("tool_governance_requests")
    .select("mission_id")
    .eq("id", requestId)
    .maybeSingle();

  const { error } = await g.supabase.schema("linkaios").rpc("tool_governance_approve", { p_request_id: requestId });
  if (error) return;

  if (reqRow?.mission_id) revalidatePath(`/projects/${reqRow.mission_id}`);
  revalidatePath("/settings/tools");
}

export async function rejectToolGovernanceRequest(requestId: string, reason: string): Promise<void> {
  if (!UUID_RE.test(requestId)) return;
  const g = await gateWriter();
  if (!g.ok) return;

  const { data: reqRow } = await g.supabase
    .schema("linkaios")
    .from("tool_governance_requests")
    .select("mission_id")
    .eq("id", requestId)
    .maybeSingle();

  const { error } = await g.supabase.schema("linkaios").rpc("tool_governance_reject", {
    p_request_id: requestId,
    p_reason: reason || "rejected",
  });
  if (error) return;

  if (reqRow?.mission_id) revalidatePath(`/projects/${reqRow.mission_id}`);
  revalidatePath("/settings/tools");
}

export async function submitProjectHeadForm(formData: FormData): Promise<void> {
  const projectId = String(formData.get("projectId") ?? formData.get("missionId") ?? "");
  const raw = String(formData.get("projectHeadUserId") ?? "").trim();
  const projectHeadUserId = raw === "" ? null : raw;
  await setProjectHead(projectId, projectHeadUserId);
}

export async function setProjectHead(projectId: string, projectHeadUserId: string | null): Promise<void> {
  if (!UUID_RE.test(projectId)) return;
  if (projectHeadUserId != null && !UUID_RE.test(projectHeadUserId)) return;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.id) return;
  const admin = await isCommandCentreAdmin(supabase, { userId: user.id, email: user.email });
  if (!admin) return;

  const { error } = await supabase
    .schema("linkaios")
    .from("projects")
    .update({ project_head_user_id: projectHeadUserId, updated_at: new Date().toISOString() })
    .eq("id", projectId);
  if (error) return;

  revalidatePath(`/projects/${projectId}`);
}

/** @deprecated Use {@link requestProjectToolAdd}. */
export const requestMissionToolAdd = requestProjectToolAdd;
/** @deprecated Use {@link requestProjectToolRemove}. */
export const requestMissionToolRemove = requestProjectToolRemove;
/** @deprecated Use {@link submitProjectHeadForm}. */
export const submitMissionProjectHeadForm = submitProjectHeadForm;
/** @deprecated Use {@link setProjectHead}. */
export const setMissionProjectHead = setProjectHead;
