"use server";

import { revalidatePath } from "next/cache";

import { isCommandCentreAdmin } from "@/lib/command-centre-access";
import { createSupabaseServerClient } from "@/lib/supabase/server";

async function requireOrgAdminWrite(): Promise<{ ok: true; supabase: Awaited<ReturnType<typeof createSupabaseServerClient>> } | { ok: false }> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.id) return { ok: false };
  const admin = await isCommandCentreAdmin(supabase, { userId: user.id, email: user.email });
  if (!admin) return { ok: false };
  return { ok: true, supabase };
}

export async function addOrgAllowlistTool(toolId: string): Promise<void> {
  const g = await requireOrgAdminWrite();
  if (!g.ok) return;
  await g.supabase.schema("linkaios").from("org_tool_allowlist").upsert({ tool_id: toolId }, { onConflict: "tool_id" });
  revalidatePath("/settings/tools");
}

export async function removeOrgAllowlistTool(toolId: string): Promise<void> {
  const g = await requireOrgAdminWrite();
  if (!g.ok) return;
  await g.supabase.schema("linkaios").from("org_tool_allowlist").delete().eq("tool_id", toolId);
  revalidatePath("/settings/tools");
}

export async function addMissionlessDefaultTool(toolId: string): Promise<void> {
  const g = await requireOrgAdminWrite();
  if (!g.ok) return;
  await g.supabase
    .schema("linkaios")
    .from("org_missionless_default_tools")
    .upsert({ tool_id: toolId }, { onConflict: "tool_id" });
  revalidatePath("/settings/tools");
}

export async function removeMissionlessDefaultTool(toolId: string): Promise<void> {
  const g = await requireOrgAdminWrite();
  if (!g.ok) return;
  await g.supabase.schema("linkaios").from("org_missionless_default_tools").delete().eq("tool_id", toolId);
  revalidatePath("/settings/tools");
}

export async function archiveCatalogTool(toolId: string): Promise<void> {
  const g = await requireOrgAdminWrite();
  if (!g.ok) return;
  await g.supabase.schema("linkaios").from("tools").update({ status: "archived" }).eq("id", toolId);
  revalidatePath("/settings/tools");
}

export async function deleteDraftCatalogTool(toolId: string): Promise<void> {
  const g = await requireOrgAdminWrite();
  if (!g.ok) return;
  await g.supabase.schema("linkaios").from("tools").delete().eq("id", toolId).eq("status", "draft");
  revalidatePath("/settings/tools");
}
