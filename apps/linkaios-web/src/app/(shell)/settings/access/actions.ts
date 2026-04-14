"use server";

import { revalidatePath } from "next/cache";

import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { isCommandCentreAdmin } from "@/lib/command-centre-access";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type RoleActionState = { ok: boolean; error?: string } | null;

const ROLES = new Set(["admin", "operator", "viewer"] as const);

async function requireAdminSession(): Promise<
  | { ok: true; userId: string }
  | { ok: false; error: string }
> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.id) return { ok: false, error: "Not signed in." };
  const admin = await isCommandCentreAdmin(supabase, { userId: user.id, email: user.email });
  if (!admin) return { ok: false, error: "Admin access required." };
  return { ok: true, userId: user.id };
}

export async function setCommandCentreRole(
  _prev: RoleActionState,
  formData: FormData,
): Promise<RoleActionState> {
  const session = await requireAdminSession();
  if (!session.ok) return { ok: false, error: session.error };

  const targetUserId = String(formData.get("target_user_id") ?? "").trim();
  const role = String(formData.get("role") ?? "").trim();
  if (!/^[0-9a-f-]{36}$/i.test(targetUserId)) {
    return { ok: false, error: "Invalid user id." };
  }
  if (!ROLES.has(role as "admin" | "operator" | "viewer")) {
    return { ok: false, error: "Invalid role." };
  }

  const adminClient = getSupabaseAdmin();
  const { error } = await adminClient
    .schema("linkaios")
    .from("user_access")
    .upsert({ user_id: targetUserId, role }, { onConflict: "user_id" });

  if (error) return { ok: false, error: error.message };
  revalidatePath("/settings/access");
  return { ok: true };
}

export async function clearCommandCentreRole(
  _prev: RoleActionState,
  formData: FormData,
): Promise<RoleActionState> {
  const session = await requireAdminSession();
  if (!session.ok) return { ok: false, error: session.error };

  const targetUserId = String(formData.get("target_user_id") ?? "").trim();
  if (!/^[0-9a-f-]{36}$/i.test(targetUserId)) {
    return { ok: false, error: "Invalid user id." };
  }

  const adminClient = getSupabaseAdmin();
  const { error } = await adminClient
    .schema("linkaios")
    .from("user_access")
    .delete()
    .eq("user_id", targetUserId);

  if (error) return { ok: false, error: error.message };
  revalidatePath("/settings/access");
  return { ok: true };
}
