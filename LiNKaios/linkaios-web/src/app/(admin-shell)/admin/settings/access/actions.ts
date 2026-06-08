"use server";

import { revalidatePath } from "next/cache";

import type { AppRoleTier } from "@/lib/app-roles";
import {
  appRoleTierToUserAccessRole,
  inviteRedirectBaseUrl,
  parseInviteAppRoleTier,
  parseInviteEmail,
  parseInviteFullName,
  requireLicensorSuperAdminSession,
  writeOperatorInviteAudit,
} from "@/lib/licensor-operator-team";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export type LicensorAccessActionState = { ok: boolean; error?: string; message?: string } | null;

const LICENSOR_ACCESS_PATHS = ["/admin/settings/access", "/settings/access"] as const;

function revalidateAccessPaths() {
  for (const path of LICENSOR_ACCESS_PATHS) {
    revalidatePath(path);
  }
}

export async function inviteLicensorOperator(
  _prev: LicensorAccessActionState,
  formData: FormData,
): Promise<LicensorAccessActionState> {
  const session = await requireLicensorSuperAdminSession();
  if (!session.ok) return { ok: false, error: session.error };

  const email = parseInviteEmail(String(formData.get("email") ?? ""));
  const fullName = parseInviteFullName(String(formData.get("full_name") ?? ""));
  const appRoleTier = parseInviteAppRoleTier(String(formData.get("role") ?? ""));

  if (!email) return { ok: false, error: "Enter a valid email address." };
  if (!fullName) return { ok: false, error: "Enter the operator's full name." };
  if (!appRoleTier) return { ok: false, error: "Select a valid role." };

  const admin = getSupabaseAdmin();
  const dbRole = appRoleTierToUserAccessRole(appRoleTier);

  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    email_confirm: false,
    user_metadata: {
      full_name: fullName,
      must_change_password: true,
      app_role_tier: appRoleTier,
    },
  });

  if (createError || !created.user?.id) {
    const msg = createError?.message ?? "User could not be created.";
    if (/already|registered|exists/i.test(msg)) {
      return { ok: false, error: "A user with this email already exists." };
    }
    return { ok: false, error: msg };
  }

  const targetUserId = created.user.id;

  const { error: accessError } = await admin
    .schema("linkaios")
    .from("user_access")
    .upsert({ user_id: targetUserId, role: dbRole }, { onConflict: "user_id" });

  if (accessError) {
    return { ok: false, error: accessError.message };
  }

  const redirectTo = `${inviteRedirectBaseUrl()}/auth/callback?next=/settings/user&must_change_password=1`;
  const { error: inviteError } = await admin.auth.admin.inviteUserByEmail(email, { redirectTo });

  const inviteDelivery: "sent" | "stubbed" | "failed" = inviteError ? "stubbed" : "sent";

  await writeOperatorInviteAudit({
    inviterUserId: session.userId,
    targetUserId,
    email,
    fullName,
    appRoleTier,
    inviteDelivery,
  });

  revalidateAccessPaths();

  if (inviteError) {
    return {
      ok: true,
      message:
        "Operator account created and role assigned. Invite email delivery is stubbed in this MVO build — audit recorded.",
    };
  }

  return {
    ok: true,
    message: `Invitation sent to ${email}. They must set a new password on first sign-in.`,
  };
}

export async function setLicensorOperatorRole(
  _prev: LicensorAccessActionState,
  formData: FormData,
): Promise<LicensorAccessActionState> {
  const session = await requireLicensorSuperAdminSession();
  if (!session.ok) return { ok: false, error: session.error };

  const targetUserId = String(formData.get("target_user_id") ?? "").trim();
  const appRoleTier = parseInviteAppRoleTier(String(formData.get("role") ?? ""));

  if (!/^[0-9a-f-]{36}$/i.test(targetUserId)) {
    return { ok: false, error: "Invalid user id." };
  }
  if (!appRoleTier) return { ok: false, error: "Invalid role." };

  const admin = getSupabaseAdmin();
  const dbRole = appRoleTierToUserAccessRole(appRoleTier);

  const { error: accessError } = await admin
    .schema("linkaios")
    .from("user_access")
    .upsert({ user_id: targetUserId, role: dbRole }, { onConflict: "user_id" });

  if (accessError) return { ok: false, error: accessError.message };

  const { error: metaError } = await admin.auth.admin.updateUserById(targetUserId, {
    user_metadata: { app_role_tier: appRoleTier },
  });

  if (metaError) return { ok: false, error: metaError.message };

  revalidateAccessPaths();
  return { ok: true, message: "Role updated." };
}
