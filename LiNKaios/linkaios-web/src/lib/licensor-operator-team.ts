import "server-only";

import { writeBrainAuditEvent, type AuditEvent } from "@linktrend/linklogic-sdk";
import { loadEnv } from "@linktrend/shared-config";

import type { AppRoleTier } from "@/lib/app-roles";
import { getAppRoleTierForUser } from "@/lib/command-centre-access";
import { resolveLicensorTenantId } from "@/lib/admin-linkskills-tenant";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type { UserAccessDbRole } from "@/lib/licensor-operator-team-shared";
export {
  appRoleTierToUserAccessRole,
  parseInviteAppRoleTier,
  parseInviteEmail,
  parseInviteFullName,
  resolveAppRoleTierFromAccess,
} from "@/lib/licensor-operator-team-shared";

export type LicensorOperatorRow = {
  userId: string;
  email: string | null;
  fullName: string | null;
  dbRole: import("@/lib/licensor-operator-team-shared").UserAccessDbRole | null;
  appRoleTier: AppRoleTier;
};

export async function requireLicensorSuperAdminSession(): Promise<
  | { ok: true; userId: string; email: string | undefined }
  | { ok: false; error: string }
> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.id) return { ok: false, error: "Not signed in." };

  const tier = await getAppRoleTierForUser(supabase, { userId: user.id, email: user.email });
  if (tier !== "super_admin") {
    return { ok: false, error: "Super Admin access required." };
  }

  return { ok: true, userId: user.id, email: user.email };
}

export function inviteRedirectBaseUrl(): string {
  const env = loadEnv();
  const base = env.LINKTREND_PUBLIC_BASE_URL?.trim() || process.env.LINKTREND_PUBLIC_BASE_URL?.trim();
  return (base || "http://localhost:3000").replace(/\/$/, "");
}

/** Shadow-safe audit for operator invite (finding 73). */
export async function writeOperatorInviteAudit(params: {
  inviterUserId: string;
  targetUserId: string;
  email: string;
  fullName: string;
  appRoleTier: AppRoleTier;
  inviteDelivery: "sent" | "stubbed" | "failed";
  auditEventId?: string;
}): Promise<string | null> {
  const tenantId = (await resolveLicensorTenantId()) ?? "linktrend";
  const eventId = params.auditEventId ?? crypto.randomUUID();

  const event: AuditEvent = {
    event_id: eventId,
    ts: new Date().toISOString(),
    tenant_id: tenantId,
    plane: "linkaios",
    actor: {
      actor_kind: "user",
      actor_id: params.inviterUserId,
    },
    action: "approval.requested",
    subject: {},
    payload: {
      operation: "operator.invite",
      mode: "shadow",
      target_user_id: params.targetUserId,
      email: params.email,
      full_name: params.fullName,
      app_role_tier: params.appRoleTier,
      must_change_password: true,
      invite_delivery: params.inviteDelivery,
    },
    schema_version: "1",
  };

  try {
    const result = await writeBrainAuditEvent(loadEnv(), event);
    return result.event_id;
  } catch (err) {
    console.error("writeOperatorInviteAudit failed:", err);
    return null;
  }
}
